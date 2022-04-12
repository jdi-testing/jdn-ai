import { Divider, Space, Menu, Dropdown } from "antd";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import { BUILD, request } from "../services/backend";
import { reportProblem } from "../services/pageDataHandlers";

import kebab_menu from "../assets/Kebab_menu.svg";
import { selectLocators } from "../store/selectors/locatorSelectors";
import { size } from "lodash";
import { pageType, readmeLinkAddress } from "../utils/constants";
import { selectCurrentPage } from "../store/selectors/mainSelectors";

export const ControlBar = () => {
  const [backendVer, setBackendVer] = useState("");
  const [pluginVer, setPluginVer] = useState("");

  const predictedElements = useSelector(selectLocators);
  const currentPage = useSelector(selectCurrentPage).page;
  const allowRemoveElements = size(predictedElements);

  useEffect(() => {
    const fetchData = async () => {
      const result = await request.get(BUILD);
      setBackendVer(result);
    };

    fetchData();

    const manifest = chrome.runtime.getManifest();
    setPluginVer(manifest.version);
  }, []);

  const handleReportProblem = () => {
    reportProblem(predictedElements);
  };

  const kebabMenu = (
    <Menu>
      <Menu.Item key="0" hidden={currentPage === pageType.locatorsList} onClick={handleReportProblem}>
        Report a problem
      </Menu.Item>
      <Menu.Item key="1">
        <a href={readmeLinkAddress} target="_blank" rel="noreferrer">
          Readme
        </a>
      </Menu.Item>
      {/* <Menu.Item key="3">Upgrade</Menu.Item> */}
    </Menu>
  );

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <Space size={0} direction="horizontal" split={<Divider type="vertical" style={{ backgroundColor: "#fff" }} />}>
          <span className="jdn__header-text">
            <span className="jdn__header-title">JDN</span> v {pluginVer}
          </span>
          <span className="jdn__header-text">Back-end v {backendVer}</span>
        </Space>
      </div>
      <Space size={[30, 0]} className="header__space" >
        <a className="jdn__header-link" href="#" hidden={!allowRemoveElements} onClick={handleReportProblem}>
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
