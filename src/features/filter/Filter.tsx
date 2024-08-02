import React, { ChangeEvent, useMemo, useState } from 'react';
import { Badge, Button, Checkbox, Divider, Dropdown, Input, Switch, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPageObject } from '../pageObjects/selectors/pageObjects.selectors';
import { ElementClass } from '../locators/types/generationClasses.types';
import { FilterHeader } from './components/FilterHeader';
import { selectDetectedClassesFilter, selectIsFiltered } from './filter.selectors';
import { toggleClassFilter } from './reducers/toggleClassFilter.thunk';
import { convertFilterToArr } from './utils/filterSet';
import { FilterIcon } from './components/shared/FilterIcon';
import { AppDispatch } from '../../app/store/store';
import { clearAllFilters } from './reducers/clearAllFilters.thunk';

export const Filter = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [open, setOpen] = useState(false);
  const pageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch<AppDispatch>();

  const classFilter = useSelector(selectDetectedClassesFilter);
  // const areSelectedAll = useSelector(selectIfSelectedAll);
  // const handleSelectAllChange: SwitchChangeEventHandler = (checked) => {
  //   if (!pageObject) return;
  //   dispatch(
  //     toggleClassFilterAll({
  //       pageObjectId: pageObject.id,
  //       library: pageObject.library,
  //       value: checked,
  //     }),
  //   );
  // };
  // <Switch size="small" checked={areSelectedAll} onChange={handleSelectAllChange} />
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
      }),
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

  const clearAllFilers: React.MouseEventHandler<HTMLElement> = () => {
    if (!pageObject) return;
    dispatch(clearAllFilters({ pageObjectId: pageObject.id, library: pageObject.library }));
  };

  const handleToggleFilterOpen = () => {
    setOpen((prev) => !prev);
  };

  const renderFilterButton = useMemo(() => {
    const usedFiltersCount = classFilterArr.filter((subArray) => subArray.includes(false)).length;
    console.log('usedFiltersCount: ', usedFiltersCount);

    return (
      <div className="jdn__filter_filter-button" onClick={handleToggleFilterOpen}>
        <span className="jdn__filter_filter-button_icon">
          {isFiltered ? (
            <Badge count={usedFiltersCount} color="blue" size="small" offset={[2, 2]}>
              <FilterIcon />
            </Badge>
          ) : (
            <FilterIcon />
          )}
        </span>
        Filter
      </div>
    );
  }, [isFiltered, classFilterArr]);

  const handleCloseFilter = () => {
    setOpen(false);
  };

  const isDefaultSetTurnOn = false;

  return (
    <Dropdown
      menu={menuItems}
      dropdownRender={(menu) => (
        <div className="jdn__filter_dropdown-content">
          <FilterHeader onClickClose={handleCloseFilter} />
          <Divider style={{ margin: 0 }} />
          <div className="jdn__filter_dropdown_control">
            <Input allowClear placeholder="Start typing" value={searchTerm} onChange={handleInputChange} />
          </div>
          <div className="jdn__filter_dropdown_scroll">
            <div className="jdn__filter_dropdown_control">
              <Switch size="small" checked={isDefaultSetTurnOn} onChange={() => console.log('Default set toggle')} />
              <Typography.Text>Default set</Typography.Text>
            </div>
            {menu}
            <div className="jdn__filter_dropdown_control">
              <Button type="link" onClick={clearAllFilers}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
      trigger={['click']}
      getPopupContainer={(triggerNode) => triggerNode}
      overlayClassName="jdn__filter_dropdown"
      {...{ open }}
    >
      {renderFilterButton}
    </Dropdown>
  );
};
