import { Button, Checkbox, Dropdown, Input, Switch, Typography } from "antd";
import { SwitchChangeEventHandler } from "antd/lib/switch";
import { Funnel } from "phosphor-react";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentPageObject } from "../pageObjects/pageObject.selectors";
import { ElementClass } from "../locators/types/generationClassesMap";
import { FilterHeader } from "./components/FilterHeader";
import { selectDetectedClassesFilter, selectIfSelectedAll } from "./filter.selectors";
import { toggleClassFilter, toggleClassFilterAll } from "./filter.slice";
import { convertFilterToArr } from "./utils/filterSet";

export const Filter = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState(false);
  const pageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch();

  if (!pageObject) throw new Error("empty page object");

  const classFilter = useSelector(selectDetectedClassesFilter);
  const areSelectedAll = useSelector(selectIfSelectedAll);
  const classFilterArr = useMemo(() => convertFilterToArr(classFilter, searchTerm), [classFilter, searchTerm]);

  const handleFilterChange = (key: string, oldValue: boolean) => () => {
    dispatch(
      toggleClassFilter({
        pageObjectId: pageObject.id,
        library: pageObject.library,
        jdiClass: key as ElementClass,
        value: !oldValue,
      })
    );
  };

  const menuItems = {
    items: classFilterArr.map(([key, value]) => {
      return {
        key,
        label: (
          <Checkbox checked={value} onChange={handleFilterChange(key, value)}>
            {key}
          </Checkbox>
        ),
      };
    }),
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectAllChange: SwitchChangeEventHandler = (checked) => {
    dispatch(
      toggleClassFilterAll({
        pageObjectId: pageObject.id,
        library: pageObject.library,
        value: checked,
      })
    );
  };

  const handleOpenChange = (flag: boolean) => {
    setOpen(flag);
  };

  return (
    <Dropdown
      menu={menuItems}
      dropdownRender={(menu) => (
        <div className="jdn__filter_dropdown-content">
          <FilterHeader onClickClose={() => setOpen(false)} />
          <div className="jdn__filter_dropdown_control">
            <Input allowClear placeholder="Start typing" value={searchTerm} onChange={handleInputChange} />
          </div>
          <div className="jdn__filter_dropdown_scroll">
            <div className="jdn__filter_dropdown_control">
              <Switch size="small" checked={areSelectedAll} onChange={handleSelectAllChange} />
              <Typography.Text> Select all</Typography.Text>
            </div>
            {menu}
          </div>
        </div>
      )}
      trigger={["click"]}
      getPopupContainer={(triggerNode) => triggerNode}
      overlayClassName="jdn__filter_dropdown"
      onOpenChange={handleOpenChange}
      {...{ open }}
    >
      <Button className="jdn__filter_filter-button" type="link" icon={<Funnel size={14} color="#8C8C8C" />} />
    </Dropdown>
  );
};
