import React, { ChangeEvent, useMemo, useState } from 'react';
import { Badge, Button, Checkbox, Divider, Dropdown, Input, Switch, Typography } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPageObject } from '../pageObjects/selectors/pageObjects.selectors';
import { ElementClass } from '../locators/types/generationClasses.types';
import { FilterHeader } from './components/FilterHeader';
import { selectDetectedClassesFilter, selectIsDefaultSetOn, selectIsFiltered } from './filter.selectors';
import { toggleClassFilter } from './reducers/toggleClassFilter.thunk';
import { convertFilterToArr, mapJDIclassesToFilter } from './utils/filterSet';
import { FilterIcon } from './components/shared/FilterIcon';
import { AppDispatch, RootState } from '../../app/store/store';
import { areAllValuesFalse } from '../locators/utils/helpers';
import { clearFilters, setDefaultFilterSetOff, setDefaultFilterSetOn, setFilter } from './filter.slice';
import { getLocalStorage, LocalStorageKey } from '../../common/utils/localStorage';
import { defaultFilters } from './utils/defaultFilters';
import { isEmptyObject } from '../../common/utils/isEmptyObject';

export const Filter = () => {
  const pageObject = useSelector(selectCurrentPageObject);
  if (!pageObject) return null;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [open, setOpen] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  const classFilter = useSelector(selectDetectedClassesFilter);

  const classFilterArr = useMemo(() => convertFilterToArr(classFilter, searchTerm), [classFilter, searchTerm]);

  const isFiltered = useSelector(selectIsFiltered);

  const handleFilterChange = (key: string, oldValue: boolean) => () => {
    dispatch(setDefaultFilterSetOff({ pageObjectId: pageObject.id }));
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
    dispatch(clearFilters({ pageObjectId: pageObject.id, library: pageObject.library, isDefaultSetOn: false }));
    dispatch(setDefaultFilterSetOff({ pageObjectId: pageObject.id }));
  };

  const handleToggleFilterOpen = () => {
    setOpen((prev) => !prev);
  };

  const renderFilterButton = useMemo(() => {
    const isFilterClear = areAllValuesFalse(classFilterArr);
    const usedFiltersCount = classFilterArr.filter((subArray) => subArray.includes(true)).length;

    return (
      <div className="jdn__filter_filter-button" onClick={handleToggleFilterOpen}>
        <span className="jdn__filter_filter-button_icon">
          {isFiltered ? (
            <Badge count={isFilterClear ? 0 : usedFiltersCount} color="blue" size="small" offset={[2, 2]}>
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

  const savedFilters = getLocalStorage(LocalStorageKey.Filter);

  const isDefaultSetOn = useSelector((state: RootState) => selectIsDefaultSetOn(state, pageObject.id));

  const defaultSetToggle = () => {
    const prevFilterState = savedFilters;
    const prevDefaultSetToggleState = isDefaultSetOn;
    const library = pageObject.library;
    const isSavedFiltersForCurrentLibrary = prevFilterState[library] && !isEmptyObject(prevFilterState[library]);

    if (prevDefaultSetToggleState) {
      if (isSavedFiltersForCurrentLibrary) {
        dispatch(
          setFilter({ pageObjectId: pageObject.id, JDIclassFilter: prevFilterState[library], isDefaultSetOn: false }),
        );
      } else if (!isSavedFiltersForCurrentLibrary) {
        dispatch(clearFilters({ pageObjectId: pageObject.id, library, isDefaultSetOn: false }));
      }
      dispatch(setDefaultFilterSetOff({ pageObjectId: pageObject.id })); // переключаем тоггл в false
    } else if (!prevDefaultSetToggleState) {
      dispatch(
        setFilter({
          pageObjectId: pageObject.id,
          JDIclassFilter: mapJDIclassesToFilter(library, defaultFilters[library]),
          isDefaultSetOn: true,
        }),
      );
      dispatch(setDefaultFilterSetOn({ pageObjectId: pageObject.id })); // переключаем тоггл в true
    }
  };

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
              <Switch size="small" checked={isDefaultSetOn} onChange={defaultSetToggle} />
              <Typography.Text> Default set</Typography.Text>
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
