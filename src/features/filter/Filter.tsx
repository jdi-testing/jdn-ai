import React, { ChangeEvent, useMemo, useState } from "react";
import { Badge, Button, Checkbox, Divider, Dropdown, Input, Switch, Typography } from "antd";
import { SwitchChangeEventHandler } from "antd/lib/switch";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentPageObject } from "../pageObjects/selectors/pageObjects.selectors";
import { ElementClass } from "../locators/types/generationClasses.types";
import { FilterHeader } from "./components/FilterHeader";
import { selectDetectedClassesFilter, selectIfSelectedAll, selectIsFiltered } from "./filter.selectors";
import { toggleClassFilter } from "./reducers/toggleClassFilter.thunk";
import { toggleClassFilterAll } from "./reducers/toggleClassFilterAll.thunk";
import { convertFilterToArr } from "./utils/filterSet";
import { FilterIcon } from "./components/shared/FilterIcon";
import { AppDispatch } from "../../app/store/store";

export const Filter = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [open, setOpen] = useState(false);
  const pageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch<AppDispatch>();

  const classFilter = useSelector(selectDetectedClassesFilter);
  const areSelectedAll = useSelector(selectIfSelectedAll);
  const classFilterArr = useMemo(() => convertFilterToArr(classFilter, searchTerm), [classFilter, searchTerm]);

  const isFiltered = useSelector(selectIsFiltered);

  const handleFilterChange = (key: string, oldValue: boolean) => () => {
    if (!pageObject) return;
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
    if (!pageObject) return;
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

  const renderFilterButton = useMemo(
    () => (
      <Button
        className="jdn__filter_filter-button"
        type="link"
        icon={
          isFiltered ? (
            <Badge dot={true} color="blue" offset={[1, 4]}>
              <FilterIcon />
            </Badge>
          ) : (
            <FilterIcon />
          )
        }
      />
    ),

    [isFiltered]
  );

  return (
    <Dropdown
      menu={menuItems}
      dropdownRender={(menu) => (
        <div className="jdn__filter_dropdown-content">
          <FilterHeader onClickClose={() => setOpen(false)} />
          <Divider style={{ margin: 0 }} />
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
      {renderFilterButton}
    </Dropdown>
  );
};
