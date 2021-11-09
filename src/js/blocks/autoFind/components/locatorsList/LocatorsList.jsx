import React, { useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filter, size } from "lodash";

import { Checkbox, Collapse, Spin, notification, Button } from "antd";
import Icon from "@ant-design/icons";
import { Progress } from 'antd';
import { locatorProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { LocatorListHeader } from "./LocatorListHeader";

import CaretDownSvg from "../../../../../icons/caret-down.svg";
import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import InvisibleSvg from "../../../../../icons/invisible.svg";
import { Locator } from "./Locator";
import {
  pushNotification,
  stopXpathGeneration,
  toggleDeleted,
  toggleElementGeneration,
} from "../../redux/predictionSlice";
import { selectLocatorsByProbability } from "../../redux/selectors";
import { runXpathGeneration } from "../../redux/thunks";

export const LocatorsList = () => {
  const dispatch = useDispatch();

  const state = useSelector((state) => state);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const xpathStatus = useSelector((state) => state.main.xpathStatus);
  const notifications = useSelector((state) => state.main.notifications);
  const [notificationMessage, setNotificationMessage] = React.useState("");
  // const [notificationKey, setNotificationKey] = React.useState("");
  // let notificationKey;
  // let key;

  const byProbability = selectLocatorsByProbability(state);

  const close = () => {
    notification.destroy();
    toggleDeletedGroup(deleted, true);
  };

  useEffect(() => {
    const lastIndex = notifications.length-1;
    if ( lastIndex !== -1 ) {
      if (notifications[lastIndex].message === 'DELETED' ) {
        if (notifications[lastIndex].data.length > 1) {
          setNotificationMessage(`${notifications[lastIndex].data.length} locators deleted successfully!`);
        } else {
          setNotificationMessage('The locator deleted successfully!');
        }
      }
      if (notifications[lastIndex].message === 'RESTORED' ) {
        if (notifications[lastIndex].data.length > 1) {
          setNotificationMessage(`${notifications[lastIndex].data.length} locators restored successfully!`);
        } else {
          setNotificationMessage('The locator restored successfully!');
        }
      }
    }
  }, [notifications]);


  useEffect(()=>{
    if (notificationMessage.length !== 0 ) {
      openNotification();
    }
  },[notificationMessage]);

  const cancelNotification = () => {
    notification.open({
      message: "Action canceled.",
      duration: 7,
      getContainer: () => document.body.querySelector(".jdn__notification"),
    });
  };

  const openNotification = () => {
    notification.destroy();
    // setKey(`open${Date.now()}`);
    const btn = (
      // <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={() => notification.close(key)}>
      <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={close}>
        Cancel
      </Button>
    );
    notification.open({
      message: notificationMessage,
      duration: 7,
      getContainer: () => document.body.querySelector(".jdn__notification"),
      btn,
      // notificationKey,
      // key,
      // onClose: close,
    });
  };

  const waiting = useMemo(
      () =>
        byProbability.filter(
            (el) =>
              (locatorProgressStatus.hasOwnProperty(el.locator.taskStatus) ||
            el.locator.taskStatus === locatorTaskStatus.REVOKED ||
            el.locator.taskStatus === locatorTaskStatus.FAILURE) &&
          !el.deleted
        ),
      [byProbability]
  );
  const generated = useMemo(
      () => byProbability.filter((el) => el.locator.taskStatus === locatorTaskStatus.SUCCESS && !el.deleted),
      [byProbability]
  );
  const deleted = useMemo(() => byProbability.filter((el) => el.deleted), [byProbability]);

  const waitingSelected = filter(waiting, "generate");
  const generatedSelected = filter(generated, "generate");
  const deletedSelected = filter(deleted, "generate");

  const toggleLocatorsGroup = (locatorsGroup) => {
    locatorsGroup.forEach((locator) => {
      dispatch(toggleElementGeneration(locator.element_id));
    });
  };

  const toggleDeletedGroup = (locatorsGroup, areDeleted) => {
    locatorsGroup.forEach((locator) => {
      dispatch(toggleDeleted(locator.element_id));
    });
    const message = areDeleted ? "DELETED" : "RESTORED";
    dispatch(pushNotification({ message, data: locatorsGroup }));
    // openNotification();
  };

  const stopXpathGroupGeneration = (locatorsGroup) => {
    locatorsGroup.forEach((locator) => {
      dispatch(stopXpathGeneration(locator.element_id));
    });
  };

  const runXpathGenerationHandler = (locatorsGroup) => {
    dispatch(runXpathGeneration(locatorsGroup));
  };

  const renderGroupHeader = (title, locatorsGroup, selectedGroup, iconComponent) => {
    const handleCheckboxChange = ({ target }) => {
      const group = filter(locatorsGroup, (loc) => loc.generate !== target.checked);
      toggleLocatorsGroup(group);
    };

    return (
      <React.Fragment>
        <Checkbox
          checked={size(locatorsGroup) && size(selectedGroup) === size(locatorsGroup)}
          indeterminate={size(selectedGroup) && size(locatorsGroup) > size(selectedGroup)}
          onChange={handleCheckboxChange}
          onClick={(event) => event.stopPropagation()}
        ></Checkbox>
        {iconComponent}
        {title}
      </React.Fragment>
    );
  };

  const renderList = (elements) => {
    return elements.map((element) => {
      return (
        <Locator
          key={element.element_id}
          {...{ element, xpathConfig, stopXpathGeneration, runXpathGenerationHandler }}
        />
      );
    });
  };

  const readinessPercentage = useMemo(() => {
    const readyCount = size(generated);
    const total = size(byProbability);
    if (!total && !readyCount) {
      return 0;
    }
    const result = readyCount / total;
    return result.toFixed(2) * 100;
  }, [byProbability, generated]);

  return (
    <div className="jdn__locatorsList">
      <LocatorListHeader
        {...{
          generatedSelected,
          waitingSelected,
          deletedSelected,
          toggleLocatorsGroup,
          toggleDeletedGroup,
          runXpathGenerationHandler,
          stopXpathGroupGeneration,
        }}
      />
      <div className="jdn__locatorsList-content">
        <Collapse expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} />}>
          <Collapse.Panel
            key="1"
            style={{ display: !size(generated) ? "none" : "block" }}
            header={renderGroupHeader(
                `Generated (${size(generated)})`,
                generated,
                generatedSelected,
                <Icon component={CheckedkSvg} className="jdn__locatorsList-status" />
            )}
          >
            {renderList(generated)}
          </Collapse.Panel>
          <Collapse.Panel
            key="2"
            style={{ display: !size(waiting) ? "none" : "block" }}
            header={renderGroupHeader(
                `Waiting for generation (${size(waiting)})`,
                waiting,
                waitingSelected,
                <Spin size="small" />
            )}
          >
            {renderList(waiting)}
          </Collapse.Panel>
          <Collapse.Panel
            key="3"
            style={{ display: !size(deleted) ? "none" : "block" }}
            header={renderGroupHeader(
                `Deleted (${size(deleted)})`,
                deleted,
                deletedSelected,
                <Icon component={InvisibleSvg} className="jdn__locatorsList-status" />
            )}
          >
            {renderList(deleted)}
          </Collapse.Panel>
        </Collapse>
        <div className="jdn__notification-container">
          <div className="jdn__notification"/>
          <div className="jdn__locatorsList-progress">
            <Progress
              percent={readinessPercentage}
              status="active"
              showInfo={false}
              strokeColor="#1582D8"
              trailColor="black"
              strokeLinecap="square"
              strokeWidth={5}
            />
            <p className="jdn__locatorsList-progress-text">
              {size(waiting) ? xpathStatus : `Locators generation is successfully completed`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
