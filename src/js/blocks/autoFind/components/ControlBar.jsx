import { Divider, Space, Menu, Dropdown } from "antd";
import React, { useState, useEffect } from "react";
import { useAutoFind } from "../autoFindProvider/AutoFindProvider";
import { BUILD, request } from "../utils/backend";
import { reportProblem } from "../utils/pageDataHandlers";
import kebab_menu from "../../../../icons/Kebab_menu.svg";
import Icon from "@ant-design/icons";

export const ControlBar = () => {
  const [backendVer, setBackendVer] = useState("");
  const [pluginVer, setPluginVer] = useState("");
  const [{ predictedElements, allowRemoveElements }] = useAutoFind();

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
    <Menu className="jdn__header-kebab">
      <Menu.Item key="0" hidden={!allowRemoveElements} onClick={handleReportProblem} className="jdn__header-kebab-links" >
        Report a problem
      </Menu.Item>
      <Menu.Item key="1" className="jdn__header-kebab-links" >
        <a href="https://github.com/jdi-testing/jdn" target="_blank" rel="noreferrer" >Readme</a>
      </Menu.Item>
      <Menu.Item key="3" className="jdn__header-kebab-links" >Upgrade</Menu.Item>
    </Menu>
  );


  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <Space
          size={0}
          direction="horizontal"
          split={<Divider type="vertical" style={{ backgroundColor: "#fff" }} />}
        >
          <span className="jdn__header-text"><span className="jdn__header-title">JDN</span> v {pluginVer}</span>
          <span className="jdn__header-text">Back-end v {backendVer}</span>
        </Space>
      </div>
      <Space size={[30, 0]}>
        <a className="jdn__header-link" href="#" hidden={!allowRemoveElements} onClick={handleReportProblem}>
          Report a problem
        </a>
        <a className="jdn__header-link" href="https://github.com/jdi-testing/jdn" target="_blank" rel="noreferrer">
          Readme
        </a>
        <a className="jdn__header-link" href="#">
          Upgrade
        </a>
        <a className="jdn__header-kebab" >
          <Dropdown overlay={kebabMenu} trigger={['click']}>
            <Icon component={kebab_menu} onClick={(e) => e.preventDefault()}/>
          </Dropdown>
        </a>
      </Space>
    </React.Fragment>
  );
};
