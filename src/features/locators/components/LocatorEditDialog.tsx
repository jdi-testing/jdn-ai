import React, { useEffect, useState } from 'react';
import { Form, Input, Select } from 'antd';
import Icon from '@ant-design/icons';
import WarningFilled from '../assets/warning-filled.svg';
import { FieldData } from 'rc-field-form/lib/interface';
import { Footnote } from '../../../common/components/footnote/Footnote';
import { Rule } from 'antd/lib/form';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../app/store/store';
import { DialogWithForm } from '../../../common/components/DialogWithForm';
import { selectAvailableClasses } from '../../filter/filter.selectors';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { ElementClass, defaultLibrary } from '../types/generationClasses.types';
import { isNameUnique } from '../../pageObjects/utils/pageObject';
import {
  ILocator,
  LocatorValidationWarnings,
  LocatorValidationErrors,
  LocatorValidationErrorType,
} from '../types/locator.types';

import { changeLocatorAttributes } from '../locators.slice';
import { createNewName, getLocatorValidationStatus, getLocatorValueOnTypeSwitch } from '../utils/utils';
import { createLocatorValidationRules } from '../utils/locatorValidationRules';
import { createNameValidationRules } from '../utils/nameValidationRules';
import FormItem from 'antd/es/form/FormItem';
import { LocatorType, SelectOption, AnnotationType, FrameworkType } from '../../../common/types/common';
import { isFilteredSelect } from '../../../common/utils/helpers';
import { CALCULATING, newLocatorStub } from '../utils/constants';
import { changeLocatorElement } from '../reducers/changeLocatorElement.thunk';
import { addCustomLocator } from '../reducers/addCustomLocator.thunk';
import { selectPresentLocatorsByPO } from '../selectors/locatorsByPO.selectors';
import { LocatorMessageForDuplicate } from './LocatorMessageForDuplicate';
import { ILocatorTypeOptions, createLocatorTypeOptions } from '../utils/createLocatorTypeOptions';
import { validateLocator } from '../utils/locatorValidation';

interface Props extends ILocator {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  isCreatingForm?: boolean;
}

export interface FormValues {
  name: string;
  type: ElementClass;
  locatorType: LocatorType;
  annotationType: AnnotationType;
  locator: string;
}

// ToDo move to utils
const annotationTypeOptions: { value: AnnotationType; label: AnnotationType }[] = Object.values(AnnotationType).map(
  (type) => {
    return {
      value: type,
      label: type,
    };
  },
);

export const LocatorEditDialog: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  isCreatingForm = false,
  element_id,
  isCustomName = true,
  name,
  type,
  locatorValue,
  jdnHash,
  message,
  elemId,
  elemName,
  elemText,
  locatorType,
  annotationType,
}) => {
  const dispatch = useAppDispatch();
  const locators: ILocator[] = useSelector(selectPresentLocatorsByPO);
  const types = useSelector((_state: RootState) => selectAvailableClasses(_state));
  // ToDo refactoring needed for selectors: undefined as return is harm practice:
  const pageObjectFramework = useSelector(selectCurrentPageObject)?.framework;
  const pageObjectLocatorType = useSelector(selectCurrentPageObject)?.locatorType;
  const pageObjectAnnotationType = useSelector(selectCurrentPageObject)?.annotationType;
  const pageObjectId = useSelector(selectCurrentPageObject)!.id;
  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  const [validationMessage, setValidationMessage] = useState<LocatorValidationErrorType>(message || '');
  const [validationErrorOptions, setValidationErrorOptions] = useState<{ duplicates?: ILocator[] }>({});
  const [isEditedName, setIsEditedName] = useState<boolean>(isCustomName);

  const [form] = Form.useForm<FormValues>();
  const isCurrentFrameworkVividus = pageObjectFramework === FrameworkType.Vividus;
  // ToDo rewrite all related logic and tests for defaultLocatorType: string (because it's string)
  const defaultLocatorType: LocatorType = locatorType || pageObjectLocatorType || LocatorType.xPath;
  const defaultAnnotationType = annotationType || pageObjectAnnotationType || AnnotationType.UI;
  const initialValues: FormValues = {
    type,
    name: name || '',
    locator: locatorValue?.output ?? '',
    locatorType: defaultLocatorType,
    annotationType: defaultAnnotationType,
  };

  const [isOkButtonDisabled, setIsOkButtonDisabled] = useState<boolean>(true);
  // ToDo: fix legacy:
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const _isNameUnique = (value: string) => !isNameUnique(locators, element_id, value);

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const closeDialog = () => {
    form.resetFields();
    setIsModalOpen(false);
  };
  const getLocatorValidationRules: () => Rule[] = () =>
    createLocatorValidationRules(
      isCreatingForm,
      form.getFieldValue('locatorType') || defaultLocatorType,
      setValidationMessage,
      setValidationErrorOptions,
      locators,
      jdnHash,
      element_id,
    );
  const [locatorValidationRules, setLocatorValidationRules] = useState<Rule[]>(getLocatorValidationRules());

  const handleTypeChange = (value: string) => {
    if (isEditedName) return;

    const newName = createNewName(
      { element_id, isCustomName, type, name, elemId, elemName, elemText } as ILocator,
      value,
      library,
      locators,
    );
    form.setFieldValue('name', newName);
  };

  const handleNameChange = () => {
    setIsEditedName(true);
  };

  const handleCreateCustomLocator = async () => {
    const isLocatorFieldTouched = form.isFieldTouched('locator');
    // in case if user didn't touch locator field to avoid forceUpdate
    const locatorMessage = isLocatorFieldTouched ? validationMessage : LocatorValidationWarnings.NotFound;

    const {
      name: locatorFormName,
      type: locatorFormElementClass,
      locator: locatorFormValue,
      locatorType: locatorFormType,
      annotationType: locatorFormAnnotationType,
    } = await form.validateFields();

    const newLocatorData: ILocator & { locatorFormValue: string } = {
      ...newLocatorStub,
      pageObj: pageObjectId,
      isCustomName: isEditedName,
      predicted_label: type.toLowerCase(),
      annotationType: locatorFormAnnotationType,
      locatorType: locatorFormType,
      message: locatorMessage,
      name: locatorFormName,
      type: locatorFormElementClass,
      locatorFormValue,
    };

    await dispatch(addCustomLocator({ newLocatorData }));
    closeDialog();
  };

  const handleEditLocator = async () => {
    // ToDo: fix legacy
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const { name, type, locator: locatorValue, locatorType, annotationType } = await form.validateFields();
    const updatedLocator = {
      name,
      type,
      locatorValue,
      annotationType,
      locatorType,
      element_id,
      library,
      message: validationMessage,
      isCustomName: isEditedName,
      isCustomLocator: true,
    };

    // we need this check for the case when user edits custom invalid locator, that doesn't have jdnHash
    if ((!validationMessage.length && !jdnHash) || validationMessage === LocatorValidationWarnings.NewElement) {
      await dispatch(changeLocatorElement(updatedLocator));
    } else {
      dispatch(changeLocatorAttributes(updatedLocator));
    }

    closeDialog();
  };

  const getBlockTypeOptions = (): SelectOption[] => types.map((_type) => ({ value: _type, label: _type }));

  const hasFormChanged = () => {
    const currentValues: FormValues = form.getFieldsValue(true);
    return !Object.keys(initialValues).some(
      (key) => initialValues[key as keyof FormValues] !== currentValues[key as keyof FormValues],
    );
  };

  const computeIsOkButtonDisabled = () => {
    const hasFormErrors = !!form.getFieldsError(['name', 'type', 'locator']).filter(({ errors }) => errors.length)
      .length;
    if (isCreatingForm) {
      return !form.isFieldsTouched(['type', 'name'], true) || hasFormErrors;
    }
    return hasFormErrors || hasFormChanged();
  };

  const renderValidationWarning = () =>
    isCreatingForm ? (
      <div className="jdn__locatorEdit-warning">
        <Icon component={WarningFilled} className="ant-alert-icon" />
        <Footnote>If you leave this field empty, the locator will be invalid</Footnote>
      </div>
    ) : null;

  const onLocatorTypeChange = async () => {
    setLocatorValidationRules(getLocatorValidationRules());
    const newLocatorType = form.getFieldValue('locatorType');
    const newLocator = form.getFieldValue('locator');

    if (newLocator !== '') {
      const newLocatorValue = await getLocatorValueOnTypeSwitch(
        newLocatorType,
        validationMessage,
        element_id,
        jdnHash,
        locatorValue,
        form,
      );
      form.setFieldValue('locator', newLocatorValue);
    }
  };

  const onFieldsChange = async (changedValues: FieldData[]) => {
    const isLocatorTypeChanged = changedValues.some((value) => value.name.toString().includes('locatorType'));
    if (isLocatorTypeChanged) await onLocatorTypeChange();
    setIsOkButtonDisabled(computeIsOkButtonDisabled());
  };

  const renderValidationMessage = () => {
    return validationMessage === LocatorValidationErrors.DuplicatedLocator ? (
      <LocatorMessageForDuplicate closeDialog={closeDialog} duplicates={validationErrorOptions?.duplicates} />
    ) : (
      validationMessage
    );
  };

  const isLocatorDisabled = form.getFieldValue('locator') === CALCULATING;

  const [locatorTypeOptions, setLocatorTypeOptions] = useState<ILocatorTypeOptions[]>([]);
  useEffect(() => {
    const fetchLocatorTypeOptions = async () => {
      try {
        const options = await createLocatorTypeOptions(locatorValue);
        setLocatorTypeOptions(options);
      } catch (error) {
        console.error('Error: can`t get options for locator:', error);
      }
    };

    void fetchLocatorTypeOptions();
  }, [locatorValue, locators, element_id]);

  const handleLocatorDropdownOnChange = async () => {
    setValidationMessage('');

    try {
      const locatorTypeFromForm = await form.getFieldValue('locatorType');
      const locatorValueFromForm = await form.getFieldValue('locator');

      const updatedValidationMessage: LocatorValidationErrorType = await validateLocator(
        locatorValueFromForm,
        locatorTypeFromForm,
        jdnHash,
        locators,
        element_id,
        isCreatingForm,
      );

      setValidationMessage(updatedValidationMessage);
    } catch (error) {
      const newValidationMessage = error.message;
      setValidationMessage(newValidationMessage);
    }
  };

  return (
    <DialogWithForm
      onboardingRefProps={{
        onNextClickHandler: handleCreateCustomLocator,
        isOkButtonDisabled: isOkButtonDisabled,
      }}
      modalProps={{
        title: isCreatingForm ? 'Create custom locator' : 'Edit locator',
        open: isModalOpen,
        onOk: isCreatingForm ? handleCreateCustomLocator : handleEditLocator,
        enableOverlay: isModalOpen,
        setIsModalOpen,
        okButtonProps: {
          disabled: isOkButtonDisabled,
        },
        width: 580,
      }}
      formProps={{
        form,
        initialValues,
        onFieldsChange,
        className: 'jdn__locatorEdit',
      }}
    >
      <Form.Item name="name" label="Name" rules={nameValidationRules}>
        <Input onChange={handleNameChange} />
      </Form.Item>
      <Form.Item
        name="type"
        label="Block type"
        rules={[
          {
            required: true,
            message: LocatorValidationWarnings.EmptyValue,
          },
        ]}
      >
        <Select
          onChange={handleTypeChange}
          showSearch
          filterOption={(input, option) => isFilteredSelect(input, option)}
          options={getBlockTypeOptions()}
        />
      </Form.Item>
      <FormItem name="locatorType" label="Locator" style={{ marginBottom: '8px' }}>
        <Select
          onChange={handleLocatorDropdownOnChange}
          options={locatorTypeOptions}
          popupClassName="custom-divider-for-dropdown"
          virtual={false}
        />
      </FormItem>
      <FormItem
        wrapperCol={{ span: 24, xs: { offset: 0 }, sm: { offset: 4 } }}
        name="annotationType"
        style={{ marginBottom: '8px' }}
      >
        <Select disabled={isCurrentFrameworkVividus} options={annotationTypeOptions} />
      </FormItem>
      <Form.Item
        wrapperCol={{ span: 24, xs: { offset: 0 }, sm: { offset: 4 } }}
        name="locator"
        rules={locatorValidationRules}
        validateStatus={getLocatorValidationStatus(validationMessage)}
        help={renderValidationMessage()}
        extra={renderValidationWarning()}
      >
        <Input.TextArea
          disabled={isLocatorDisabled}
          autoSize
          // expands textarea to view port height
          style={{ maxHeight: `calc(100vh - 396px)`, overflowY: 'scroll' }}
        />
      </Form.Item>
    </DialogWithForm>
  );
};
