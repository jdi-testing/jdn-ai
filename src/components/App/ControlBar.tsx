import { Divider, Space, Menu, Dropdown } from "antd";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React from "react";

import { reportProblem } from "../../services/pageDataHandlers";

import kebab_menu from "../../assets/Kebab_menu.svg";
import { pageType, readmeLinkAddress } from "../../utils/constants";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { RootState } from "../../store/store";
import { isNil } from "lodash";

export const ControlBar = () => {
  const backendVer = useSelector<RootState>((_state) => _state.main.serverVersion);
  const currentPage = useSelector(selectCurrentPage).page;

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;

  const handleReportProblem = () => {
    reportProblem();
  };

  const kebabMenu = (
    <Menu>
      <Menu.Item key="0" hidden={currentPage === pageType.pageObject} onClick={handleReportProblem}>
        Report a problem
      </Menu.Item>
      <Menu.Item key="1">
        <a href={readmeLinkAddress} target="_blank" rel="noreferrer">
          Readme
        </a>
      </Menu.Item>
    </Menu>
  );

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <Space size={0} direction="horizontal" split={<Divider type="vertical" style={{ backgroundColor: "#fff" }} />}>
          <span className="jdn__header-text">
            <span className="jdn__header-title">JDN</span> v {pluginVer}
          </span>
          {!isNil(backendVer) ? <span className="jdn__header-text">{`Back-end v ${backendVer}`}</span> : null}
        </Space>
      </div>
      <Space size={[30, 0]} className="header__space">
        <a
          className="jdn__header-link"
          href="#"
          hidden={currentPage === pageType.pageObject}
          onClick={handleReportProblem}
        >
          Report a problem
        </a>
        <a className="jdn__header-link" href={readmeLinkAddress} target="_blank" rel="noreferrer">
          Readme
        </a>
        {/* <a className="jdn__header-link" href="#">
          Upgrade
        </a> */}
        <a className="jdn__header-kebab">
          <Dropdown overlay={kebabMenu} trigger={["click"]}>
            <Icon component={kebab_menu} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </a>
      </Space>
    </React.Fragment>
  );
};
