import { Button, Checkbox, Dropdown, Input, Switch, Typography } from "antd";
import { SwitchChangeEventHandler } from "antd/lib/switch";
import { toLower } from "lodash";
import { Funnel } from "phosphor-react";
import React, { ChangeEvent, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { MenuItem } from "../../common/components/menu/Menu";
import { selectCurrentPageObject } from "../pageObjects/pageObjectSelectors";
import { ElementClass } from "../pageObjects/utils/generationClassesMap";
import { FilterHeader } from "./FilterHeader";
import { selectDetectedClassesFilter } from "./filterSelectors";
import { toggleClassFilter, toggleClassFilterAll } from "./filterSlice";

export const Filter = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState(false);
  const pageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch();

  if (!pageObject) throw new Error("empty page object");
  const classFilter = useSelector(selectDetectedClassesFilter);
  const classFilterArr =
    searchTerm === ""
      ? Object.entries(classFilter)
      : Object.entries(classFilter).filter(([key]) => toLower(key).includes(toLower(searchTerm)));

  const areSelectedAll = useMemo(() => {
    const arr = Object.entries(classFilter);
    return !arr.some(([, value]) => !value);
  }, [classFilter]);

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

  const renderClassList = () => {
    const items: MenuItem[] = classFilterArr.map(([key, value]) => {
      return {
        key,
        label: <Checkbox checked={value}>{key}</Checkbox>,
        onClick: handleFilterChange(key, value),
      };
    });
    return { ...{ items } };
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
      menu={renderClassList()}
      dropdownRender={(menu) => (
        <div className="jdn__filter_dropdown-content">
          <FilterHeader onClickClose={() => setOpen(false)} />
          <div className="jdn__filter_dropdown_control">
            <Input allowClear placeholder="Start typing" value={searchTerm} onChange={handleInputChange} />
          </div>
          <div className="jdn__filter_dropdown_control">
            <Switch size="small" checked={areSelectedAll} onChange={handleSelectAllChange} />
            <Typography.Text> Select all</Typography.Text>
          </div>
          {menu}
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
