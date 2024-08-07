// ToDo: fix TS, remove the comment when there is time in the sprint
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Space } from 'antd';
import Icon from '@ant-design/icons';
import WarningFilled from '../assets/warning-filled.svg';
import { FieldData } from 'rc-field-form/lib/interface';
import { Footnote } from '../../../common/components/footnote/Footnote';
import { Rule } from 'antd/lib/form';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store/store';
import { DialogWithForm } from '../../../common/components/DialogWithForm';
import { selectAvailableClasses } from '../../filter/filter.selectors';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { defaultLibrary, ElementClass } from '../types/generationClasses.types';
import { isNameUnique } from '../../pageObjects/utils/pageObject';
import {
  ILocator,
  LocatorValidationErrors,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
} from '../types/locator.types';
import { createNewName, getLocatorValidationStatus, getLocatorValueOnTypeSwitch } from '../utils/utils';
import { createLocatorValidationRules } from '../utils/locatorValidationRules';
import { createNameValidationRules } from '../utils/nameValidationRules';
import { AnnotationType, FrameworkType, LocatorType, SelectOption } from '../../../common/types/common';
import { isFilteredSelect } from '../../../common/utils/helpers';
import { CALCULATING, newLocatorStub } from '../utils/constants';
import { addCustomLocator } from '../reducers/addCustomLocator.thunk';
import { selectPresentLocatorsByPO } from '../selectors/locatorsByPO.selectors';
import { LocatorMessageForDuplicate } from './LocatorMessageForDuplicate';
import { createLocatorTypeOptions, ILocatorTypeOptions } from '../utils/createLocatorTypeOptions';
import { validateLocator } from '../utils/locatorValidation';
import { annotationTypeOptions } from './utils';
import { changeLocatorElement } from '../reducers/changeLocatorElement.thunk';
import { changeLocatorAttributes } from '../locators.slice';
import { selectNotShownElementIds } from '../../../services/pageDocument/pageDocument.selectors';

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

export const LocatorEditDialog: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  isCreatingForm = false,
  elementId,
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
  const dispatch = useDispatch<AppDispatch>();
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
  const _isNameUnique = (value: string) => !isNameUnique(locators, elementId, value);

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const closeDialog = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const notShownElementIds = useSelector(selectNotShownElementIds);

  const [textareaValue, setTextareaValue] = useState('');

  const handleTypeChangeBySelect = (value: string, option: { desc: React.SetStateAction<string> }) => {
    console.log('handleTypeChangeBySelect ', option.desc);
    setTextareaValue(option.desc);
    form.setFieldValue('locator', option.desc);

    if (isEditedName) return;

    const newName = createNewName(
      { elementId, isCustomName, type, name, elemId, elemName, elemText } as ILocator,
      value,
      library,
      locators,
    );
    form.setFieldValue('name', newName);
  };

  const getLocatorValidationRules: () => Rule[] = () =>
    createLocatorValidationRules(
      isCreatingForm,
      form.getFieldValue('locatorType') || defaultLocatorType,
      setValidationMessage,
      setValidationErrorOptions,
      locators,
      jdnHash,
      elementId,
      notShownElementIds,
    );

  const [locatorValidationRules, setLocatorValidationRules] = useState<Rule[]>(getLocatorValidationRules());

  const handleNameChange = () => {
    setIsEditedName(true);
  };

  const isLocatorFieldTouched = form.isFieldTouched('locator');

  const handleCreateCustomLocator = async () => {
    // in case if user didn't touch locator field to avoid forceUpdate
    const locatorMessage = isLocatorFieldTouched ? validationMessage : LocatorValidationWarnings.NotFound;
    const fieldsValue = await form.validateFields();

    const formData = {
      name: fieldsValue.name,
      elementClass: fieldsValue.type,
      locatorValue: fieldsValue.locator,
      locatorType: fieldsValue.locatorType,
      annotationType: fieldsValue.annotationType,
    };

    const newLocatorData: ILocator & { locatorFormValue: string } = {
      ...newLocatorStub,
      pageObj: pageObjectId,
      isCustomName: isEditedName,
      predicted_label: type.toLowerCase(),
      annotationType: formData.annotationType,
      locatorType: formData.locatorType,
      message: locatorMessage,
      name: formData.name,
      type: formData.elementClass,
      locatorFormValue: formData.locatorValue,
    };

    if (formData.locatorType === LocatorType.xPath) {
      newLocatorData.locatorValue.xPath = formData.locatorValue;
    }

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
      elementId,
      library,
      message: validationMessage,
      isCustomName: isEditedName,
      isCustomLocator: true,
    };

    // we need this check for the case when user edits custom invalid locator, that doesn't have jdnHash
    if ((!validationMessage.length && !jdnHash) || validationMessage === LocatorValidationWarnings.NewElement) {
      await dispatch(changeLocatorElement(updatedLocator));
    } else {
      dispatch(changeLocatorAttributes({ ...updatedLocator, isCurrentFrameworkVividus }));
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
    isCreatingForm && (!isLocatorFieldTouched || validationMessage === LocatorValidationWarnings.EmptyValue) ? (
      <div className="jdn__locatorEdit-warning">
        <Icon component={WarningFilled} className="ant-alert-icon" />
        <Footnote>If you leave this field empty, the locator will be invalid</Footnote>
      </div>
    ) : null;

  const onLocatorTypeChange = async (newLocatorType: LocatorType) => {
    setLocatorValidationRules(getLocatorValidationRules());

    const previousLocatorValue = form.getFieldValue('locator');

    if (previousLocatorValue !== '') {
      const newLocatorValue = await getLocatorValueOnTypeSwitch(
        newLocatorType,
        validationMessage,
        elementId,
        jdnHash,
        locatorValue,
        form,
      );
      form.setFieldValue('locator', newLocatorValue);
    }
  };

  const onFieldsChange = async (changedValues: FieldData[]) => {
    const isLocatorTypeChanged = changedValues.some((value) => value.name.toString().includes('locatorType'));
    if (isLocatorTypeChanged) {
      const newLocatorType = changedValues.find((value) => value.name.toString().includes('locatorType'))?.value;
      await onLocatorTypeChange(newLocatorType);
    }
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

  const staticLocatorTypeOptions = Object.values(LocatorType)
    .filter((value) => value !== LocatorType.dataAttributes)
    .map((value) => ({
      label: value,
      value: value,
    }));
  const [locatorTypeOptions, setLocatorTypeOptions] = useState<ILocatorTypeOptions[]>([]);

  useEffect(() => {
    if (!isCreatingForm) {
      const fetchLocatorTypeOptions = async () => {
        try {
          const options = await createLocatorTypeOptions(locatorValue, isCurrentFrameworkVividus);
          setLocatorTypeOptions(options);
        } catch (error) {
          console.error('Error: can`t get options for locator:', error);
        }
      };

      void fetchLocatorTypeOptions();
    } else {
      setLocatorTypeOptions(staticLocatorTypeOptions);
    }
  }, [locatorValue, locators, elementId]);

  const handleLocatorDropdownOnChange = async (_: any, option: { desc: React.SetStateAction<string> }) => {
    setTextareaValue(option.desc);
    setValidationMessage('');

    try {
      const locatorTypeFromForm = await form.getFieldValue('locatorType');
      const locatorValueFromForm = await form.getFieldValue('locator');

      const updatedValidationMessage: LocatorValidationErrorType = await validateLocator(
        locatorValueFromForm,
        locatorTypeFromForm,
        jdnHash,
        locators,
        elementId,
        notShownElementIds,
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
        title: isCreatingForm ? 'Create' : 'Edit locator',
        open: isModalOpen,
        onOk: isCreatingForm ? handleCreateCustomLocator : handleEditLocator,
        enableOverlay: isModalOpen,
        setIsModalOpen,
        okButtonProps: {
          disabled: isOkButtonDisabled,
        },
        width: 580,
        okText: isCreatingForm ? 'Add to the list' : 'OK',
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
          onChange={handleTypeChangeBySelect}
          showSearch
          filterOption={(input, option) => isFilteredSelect(input, option)}
          options={getBlockTypeOptions()}
        />
      </Form.Item>
      <Form.Item name="annotationType" className="input input__annotation-type" label="Locator">
        <Select disabled={isCurrentFrameworkVividus} options={annotationTypeOptions} />
      </Form.Item>
      <Form.Item
        name="locatorType"
        className="input input__locator-type"
        wrapperCol={{ span: 24, xs: { offset: 0 }, sm: { offset: 4 } }}
      >
        <Select
          onChange={handleLocatorDropdownOnChange}
          popupClassName="custom-divider-for-dropdown"
          virtual={false}
          options={locatorTypeOptions}
          optionRender={(option) => (
            <Space>
              {option.data.label}
              <span style={{ color: 'rgba(0, 0, 0, 0.45)' }}>{option.data.desc}</span>
            </Space>
          )}
        />
      </Form.Item>
      <Form.Item
        wrapperCol={{ span: 24, xs: { offset: 0 }, sm: { offset: 4 } }}
        name="locator"
        rules={locatorValidationRules}
        validateStatus={getLocatorValidationStatus(validationMessage)}
        help={renderValidationMessage()}
        extra={renderValidationWarning()}
      >
        <Input.TextArea
          value={textareaValue}
          spellCheck={false}
          disabled={isLocatorDisabled}
          autoSize
          className="input input__textarea"
        />
      </Form.Item>
    </DialogWithForm>
  );
};
