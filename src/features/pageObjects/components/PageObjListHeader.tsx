import React, { FC, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Modal, Row, Space, Tooltip } from 'antd';
import { CaretDown, Plus, Trash } from '@phosphor-icons/react';

import { pushNotification } from '../../../app/main.slice';
import { size } from 'lodash';
import { selectPageObjects } from '../selectors/pageObjects.selectors';

import { removeAll as removeAllLocators } from '../../locators/locators.slice';
import { removeAll as removeAllPageObjects } from '../pageObject.slice';
import { removeAll as removeAllFilters } from '../../filter/filter.slice';
import { AppDispatch, RootState } from '../../../app/store/store';
import { selectLocatorsToGenerate } from '../../locators/selectors/locators.selectors';
import { generateAndDownloadZip } from '../utils/projectTemplate';
import { OnboardingStep } from '../../onboarding/constants';
import { checkLocatorsValidity } from '../../locators/reducers/checkLocatorValidity.thunk';
import { useAddPageObject } from '../utils/useAddPageObject';
import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { PageObject } from '../types/pageObjectSlice.types';
import classNames from 'classnames';
import '../../../common/styles/headerCollapse.less';

const { confirm } = Modal;

interface Props {
  template?: Blob;
  toggleExpand: () => void;
  setActivePanel: (pageObjectId: string[] | undefined) => void;
  isExpanded: boolean;
}

export const PageObjListHeader: FC<Props> = ({ template, toggleExpand, isExpanded, setActivePanel }) => {
  const state = useSelector((rootState) => rootState) as RootState;
  const pageObjects = useSelector(selectPageObjects);
  const locatorsToGenerate = useSelector(selectLocatorsToGenerate);
  const enableDownload = useMemo(() => !!size(locatorsToGenerate), [locatorsToGenerate]);
  const hasDraftPageObject: PageObject | undefined = pageObjects.find((pageObject) => !pageObject.locators?.length);

  const dispatch = useDispatch<AppDispatch>();

  const handleAddPageObject = useAddPageObject(setActivePanel, hasDraftPageObject);

  const handleDownload = () => {
    dispatch(pushNotification({ action: { type: 'downloadTemplate' } }));
    if (template) generateAndDownloadZip(state, template);
  };

  const handleRemoveAll = () => {
    const isOnePO = size(pageObjects) === 1;
    confirm({
      title: isOnePO ? 'Delete Page Object?' : 'Delete all Page Objects?',
      content: isOnePO
        ? 'This Page Object will be deleted and you can lose all your data'
        : 'All Page Objects will be deleted and you can lose all your data',
      okText: isOnePO ? 'Delete' : 'Delete all',
      okButtonProps: {
        type: 'primary',
        danger: true,
      },
      onOk: () => {
        dispatch(removeAllLocators());
        dispatch(removeAllPageObjects());
        dispatch(removeAllFilters());
      },
    });
  };

  const downloadRef = useRef<HTMLButtonElement | null>(null);
  const newPOButtonRef = useRef<HTMLButtonElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();

  useEffect(() => {
    if (newPOButtonRef.current) {
      updateStepRefs(OnboardingStep.NewPageObject, newPOButtonRef, handleAddPageObject);
    }
  }, [pageObjects, newPOButtonRef.current]);

  useEffect(() => {
    if (downloadRef.current) {
      updateStepRefs(OnboardingStep.DownloadPO, downloadRef, () => dispatch(checkLocatorsValidity()));
    }
  }, [enableDownload]);

  const isHeaderCollapseDisabled = !pageObjects.length;
  const isHeaderCollapseExpanded = isHeaderCollapseDisabled ? false : isExpanded;
  const headerCollapseClassName = classNames(
    'jdn__items-list_header-collapse',
    { disabled: isHeaderCollapseDisabled },
    { expanded: isHeaderCollapseExpanded },
  );

  return (
    <Row className="jdn__items-list_header" justify="space-between">
      <CaretDown
        className={headerCollapseClassName}
        size={14}
        onClick={isHeaderCollapseDisabled ? () => {} : toggleExpand}
      />
      <Space direction="horizontal" size={8}>
        {size(pageObjects) ? (
          <Tooltip placement="bottom" title="Delete all">
            <Button
              danger
              size="small"
              onClick={handleRemoveAll}
              className="button--remove"
              data-testid="remove-button"
              icon={<Trash color="#D82C15" size={16} />}
            />
          </Tooltip>
        ) : null}
        {enableDownload ? (
          <Button ref={downloadRef} size="small" onClick={handleDownload}>
            Download all as .zip
          </Button>
        ) : null}
        <Button
          ref={newPOButtonRef}
          type="primary"
          size="small"
          onClick={handleAddPageObject}
          disabled={!!hasDraftPageObject}
          icon={<Plus size={16} color={hasDraftPageObject ? '#00000040' : '#fff'} />}
        >
          Page Object
        </Button>
      </Space>
    </Row>
  );
};
