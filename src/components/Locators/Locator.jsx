import { Button, Checkbox, Dropdown, Menu, Spin, Tooltip, Typography } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React, { memo, useRef, useState } from "react";
import Text from "antd/lib/typography/Text";

import { getLocator } from "../../services/pageObject";
import { getTypesMenuOptions } from "../../utils/generationClassesMap";
import { copyToClipboard, getLocatorString } from "../../utils/helpers";
import { isProgressStatus } from "../../services/locatorGenerationController";
import { locatorTaskStatus, VALIDATION_ERROR_TYPE, pageType, copyTitle } from "../../utils/constants";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../store/thunks/stopGeneration";
import {
  toggleDeleted,
  toggleElementGeneration,
  setChildrenGeneration,
  setScrollToLocator,
} from "../../store/slices/locatorsSlice";
import { isLocatorIndeterminate, areChildrenChecked } from "../../store/selectors/locatorSelectors";

import CheckedEdited from "../../assets/checked-edited.svg";
import EllipsisSvg from "../../assets/ellipsis.svg";
import PauseOutlinedSvg from "../../assets/pause-outlined.svg";
import PauseSvg from "../../assets/pause.svg";
import PencilSvg from "../../assets/pencil.svg";
import PlaySvg from "../../assets/play.svg";
import RestoreSvg from "../../assets/restore.svg";
import TrashBinSvg from "../../assets/trash-bin.svg";
import WarningEditedSvg from "../../assets/warning-edited.svg";
import CopySvg from "../../assets/copy.svg";
import ErrorSvg from "../../assets/error-outlined.svg";

export const VALIDATION_ERROR_MESSAGES = {
  [VALIDATION_ERROR_TYPE.DUPLICATED_LOCATOR]: "The locator for this element already exists.", // warn
  [VALIDATION_ERROR_TYPE.EMPTY_VALUE]: "The locator was not found on the page.",
  [VALIDATION_ERROR_TYPE.MULTIPLE_ELEMENTS]: " elements were found with this locator.", // warn
  [VALIDATION_ERROR_TYPE.NEW_ELEMENT]: "The locator leads to a new element on the page after editing.", // success
  [VALIDATION_ERROR_TYPE.NOT_FOUND]: "The locator was not found on the page.", // warn
};

const isEdited = (element) => element.locator.customXpath;
const isValidLocator = ({ validity }) =>
  !validity?.locator.length || validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT;

// eslint-disable-next-line react/display-name
export const Locator = memo(({ element, currentPage, scroll, library }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(copyTitle.Copy);
  const [menuVisible, setMenuVisible] = useState(false);

  const dispatch = useDispatch();

  const { element_id, type, name, locator, generate, validity } = element;

  const ref = useRef(null);

  const isLocatorInProgress = isProgressStatus(locator.taskStatus);

  const indeterminate = useSelector((state) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state) => areChildrenChecked(state, element_id));

  if (scroll && generate) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    dispatch(setScrollToLocator(null));
  }

  const handleOnChange = () => {
    if (!generate) {
      dispatch(toggleElementGeneration(element_id));
    } else {
      if (allChildrenChecked) {
        dispatch(toggleElementGeneration(element_id));
        dispatch(setChildrenGeneration({ locator: element, generate: false }));
      } else {
        dispatch(setChildrenGeneration({ locator: element, generate: true }));
      }
    }
  };

  const handleEditClick = () => {
    chrome.storage.sync.set({
      OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types: getTypesMenuOptions(library) },
    });
  };

  const getTooltipText = () => {
    return VALIDATION_ERROR_MESSAGES[validity?.locator] || "Edited";
  };

  const renderIcon = () => {
    const startedIcon = <Spin size="small" />;
    const revokedIcon = <Icon component={PauseOutlinedSvg} className="jdn__locatorsList-status" />;
    const failureIcon = <Icon component={ErrorSvg} className="jdn__locatorsList-status" />;

    const successEditedIcon = (
      <Tooltip title={getTooltipText()}>
        <Icon component={CheckedEdited} className="jdn__locatorsList-status" />
      </Tooltip>
    );
    const warningEditedIcon = (
      <Tooltip title={getTooltipText()}>
        <Icon component={WarningEditedSvg} className="jdn__locatorsList-status" />
      </Tooltip>
    );

    switch (element.locator.taskStatus) {
      case locatorTaskStatus.SUCCESS: {
        if (isEdited(element)) {
          return isValidLocator(element) ? successEditedIcon : warningEditedIcon;
        } else {
          break;
        }
      }
      case locatorTaskStatus.STARTED:
      case locatorTaskStatus.PENDING:
        return startedIcon;
      case locatorTaskStatus.REVOKED:
        return revokedIcon;
      case locatorTaskStatus.FAILURE:
        return failureIcon;
      default:
        break;
    }
  };

  const handleCopy = () => {
    const locatorString = getLocatorString(element);
    copyToClipboard(locatorString);
    setTooltipTitle(copyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === copyTitle.Copied) setTooltipTitle(copyTitle.Copy);
  };

  const renderColorizedString = () => {
    return (
      <span>
        @UI(
        <span className="jdn__xpath_item-locator">&quot;{getLocator(locator)}&quot;</span>)
        <br />
        <span className="jdn__xpath_item-type">public</span>
        <span>&nbsp;{type}&nbsp;</span>
        {name}
      </span>
    );
  };

  const renderMenu = () => {
    if (element.deleted) {
      return (
        <Menu>
          <Menu.Item key="5" icon={<RestoreSvg />} onClick={() => dispatch(toggleDeleted(element.element_id))}>
            Restore
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="0" icon={<PencilSvg />} onClick={handleEditClick}>
            Edit
          </Menu.Item>
          {isLocatorInProgress ? (
            <Menu.Item key="1" icon={<PauseSvg />} onClick={() => dispatch(stopGeneration(element.element_id))}>
              Stop generation
            </Menu.Item>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.REVOKED ? (
            <Menu.Item key="2" icon={<PlaySvg />} onClick={() => dispatch(rerunGeneration([element]))}>
              Rerun
            </Menu.Item>
          ) : null}
          <Menu.Item key="3" icon={<TrashBinSvg />} onClick={() => dispatch(toggleDeleted(element.element_id))}>
            <Typography.Text type="danger">Delete</Typography.Text>
          </Menu.Item>
        </Menu>
      );
    }
  };

  return (
    <div ref={ref} data-id={element_id} className="jdn__xpath_container">
      {currentPage === pageType.locatorsList ? (
        <div className="jdn__xpath_locators">
          <Checkbox checked={generate} indeterminate={indeterminate} onClick={handleOnChange}></Checkbox>
          <Text className="jdn__xpath_item">
            {renderIcon()}
            {renderColorizedString()}
          </Text>
          <Tooltip placement="bottom" title={copyTooltipTitle}>
            <Button
              type="text"
              onClick={handleCopy}
              onMouseEnter={handleMouseEnter}
              className="jdn__buttons"
              icon={<Icon component={CopySvg} />}
            />
          </Tooltip>
          <a onClick={() => setMenuVisible(true)} onMouseLeave={() => setMenuVisible(false)}>
            <Dropdown overlay={renderMenu()} visible={menuVisible}>
              <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
            </Dropdown>
          </a>
        </div>
      ) : (
        <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
      )}
    </div>
  );
});
