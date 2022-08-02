import { Divider, Space, Menu, Dropdown } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React, { useState, useEffect } from "react";

import { BUILD, request, SESSION_ID } from "../services/backend";
import { reportProblem } from "../services/pageDataHandlers";

import kebab_menu from "../assets/Kebab_menu.svg";
import { BACKEND_STATUS, pageType, readmeLinkAddress } from "../utils/constants";
import { selectCurrentPage } from "../store/selectors/mainSelectors";
import { setBackendAvailable } from "../store/slices/mainSlice";

export const ControlBar = () => {
  const [backendVer, setBackendVer] = useState(null);
  const [pluginVer, setPluginVer] = useState("");

  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage).page;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await request.get(BUILD);
        setBackendVer(result);
        dispatch(setBackendAvailable(BACKEND_STATUS.ACCESSED));
        const session_id = await request.get(SESSION_ID);
        chrome.storage.sync.set({ JDN_SESSION_ID: session_id });
      } catch (error) {
        dispatch(setBackendAvailable(BACKEND_STATUS.ACCESS_FAILED));
      }
    };

    fetchData();

    const manifest = chrome.runtime.getManifest();
    setPluginVer(manifest.version);
  }, []);

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
