import React from "react";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Collapse } from "antd";

import { PageObjListHeader } from "./PageObjListHeader";

import CaretDownSvg from "../../assets/caret-down.svg";
import PageSvg from "../../assets/page.svg";
import { selectPageObjects } from "../../store/selectors/pageObjectSelectors";

export const PageObjList = () => {
  const pageObjects = useSelector(selectPageObjects);

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader />
      <div className="jdn__locatorsList-content">
        <Collapse
          className="jdn__collapse"
          expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} />}
        >
          {/* {renderPanel()} */}
          {pageObjects.map(({ id, name }) => (
            <Collapse.Panel
              key={id}
              header={
                <React.Fragment>
                  <Icon component={PageSvg} className="jdn__locatorsList-status" />
                  {name}
                </React.Fragment>
              }
              className="jdn__collapse-panel"
            >
              {"Locators list 1"}
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};
