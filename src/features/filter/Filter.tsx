import { Button, Checkbox, Dropdown } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { Menu, MenuItem } from "../../common/components/menu/Menu";
import { selectCurrentPageObject } from "../pageObjects/pageObjectSelectors";
import { ElementClass } from "../pageObjects/utils/generationClassesMap";
import { selectClassFiltefByPO } from "./filterSelectors";
import { toggleClassFilter } from "./filterSlice";

export const Filter = () => {
  const pageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch();

  if (!pageObject) throw new Error("empty page object");

  const classFilter = useSelector((state: RootState) => selectClassFiltefByPO(state, pageObject.id));

  const onClick = (key: string, oldValue: boolean) => () => {
    dispatch(
        toggleClassFilter({
          pageObjectId: pageObject.id,
          library: pageObject.library,
          jdiClass: key as ElementClass,
          value: !oldValue,
        })
    );
  };

  const renderClassList = () => {
    const items: MenuItem[] = Object.entries(classFilter).map(([key, value]) => {
      return {
        key,
        label: <Checkbox checked={value}>{key}</Checkbox>,
        onClick: onClick(key, value),
      };
    });
    return <Menu {...{ items }} />;
  };

  return (
    <Dropdown overlay={renderClassList()} trigger={["click"]}>
      <Button>Filter</Button>
    </Dropdown>
  );
};
