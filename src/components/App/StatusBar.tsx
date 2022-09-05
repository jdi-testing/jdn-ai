import { Space, Dropdown } from "antd";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React from "react";

import { reportProblem } from "../../services/pageDataHandlers";

import kebab_menu from "../../assets/Kebab_menu.svg";
import { pageType, readmeLinkAddress } from "../../utils/constants";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { RootState } from "../../store/store";
import { isNil } from "lodash";
import { Menu, MenuItem } from "../common/Menu";

export const StatusBar = () => {
  const backendVer = useSelector<RootState>(
    (_state) => _state.main.serverVersion
  );
  const currentPage = useSelector(selectCurrentPage).page;

  const manifest = chrome.runtime.getManifest();
  const pluginVer = manifest.version;

  const handleReportProblem = () => {
    reportProblem();
  };

  const kebabMenu = () => {
    const items: MenuItem[] = [
      {
        key: "0",
        onClick: undefined,
        label: (
          <a href={readmeLinkAddress} target="_blank" rel="noreferrer">
            Readme
          </a>
        ),
      },
    ];

    if (currentPage !== pageType.pageObject) {
      items.push({
        key: "1",
        onClick: handleReportProblem,
        label: "Report a problem",
      });
    }

    return <Menu {...{ items }} />;
  };

  return (
    <React.Fragment>
      <div className="jdn__header-version">
        <span>{`JDN v ${pluginVer} ${
          !isNil(backendVer) ? `Back-end v ${backendVer}` : null
        }`}</span>
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
        <a
          className="jdn__header-link"
          href={readmeLinkAddress}
          target="_blank"
          rel="noreferrer"
        >
          Readme
        </a>
        {/* <a className="jdn__header-link" href="#">
          Upgrade
        </a> */}
        <span className="jdn__header-kebab">
          <Dropdown
            overlay={kebabMenu}
            trigger={["click"]}
            arrow={{ pointAtCenter: true }}
          >
            <Icon component={kebab_menu} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </span>
      </Space>
    </React.Fragment>
  );
};
