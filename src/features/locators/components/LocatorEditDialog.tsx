import { Form, Input, Select } from "antd";
import Icon from "@ant-design/icons";
import WarningFilled from "../assets/warning-filled.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { Rule } from "antd/lib/form";
import { FieldData } from "rc-field-form/lib/interface";
import React, { useContext, useState, MouseEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { selectAvailableClasses } from "../../filter/filter.selectors";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";
import { ElementClass } from "../types/generationClasses.types";
import { isNameUnique } from "../../pageObjects/utils/pageObject";
import {
  Locator,
  LocatorValidationWarnings,
  LocatorValidationErrors,
  LocatorValidationErrorType,
} from "../types/locator.types";
import { defaultLibrary } from "../types/generationClasses.types";
import { changeLocatorAttributes, setActiveSingle, setScrollToLocator } from "../locators.slice";
import {
  createNewName,
  isValidLocator,
  getLocatorValidationStatus,
  getLocatorValueOnTypeSwitch,
  evaluateCssSelector,
  evaluateXpath,
  checkDuplicates,
} from "../utils/utils";
import { createLocatorValidationRules } from "../utils/locatorValidationRules";
import { createNameValidationRules } from "../utils/nameValidationRules";
import FormItem from "antd/es/form/FormItem";
import { LocatorType, SelectOption } from "../../../common/types/common";
import { isFilteredSelect } from "../../../common/utils/helpers";
import { newLocatorStub } from "../utils/constants";
import { changeLocatorElement } from "../reducers/changeLocatorElement.thunk";
import { addCustomLocator } from "../reducers/addCustomLocator.thunk";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";
import { OnbrdStep } from "../../onboarding/types/constants";
import { selectLocatorsByPageObject } from "../selectors/locatorsByPO.selectors";

interface Props extends Locator {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  isCreatingForm?: boolean;
}

interface FormValues {
  name: string;
  type: ElementClass;
  locatorType: LocatorType;
  locator: string;
}

export const LocatorEditDialog: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  isCreatingForm = false,
  element_id,
  isCustomName = true,
  name,
  type,
  locator,
  jdnHash,
  message,
  elemId,
  elemName,
  elemText,
  locatorType,
}) => {
  const dispatch = useDispatch();
  const locators = useSelector(selectLocatorsByPageObject);
  const types = useSelector((_state: RootState) => selectAvailableClasses(_state));
  const pageObjectLocatorType = useSelector(selectCurrentPageObject)?.locatorType;
  const pageObjectId = useSelector(selectCurrentPageObject)!.id;
  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  const [validationMessage, setValidationMessage] = useState<LocatorValidationErrorType>(message || "");
  const [isEditedName, setIsEditedName] = useState<boolean>(isCustomName);

  const { updateRef } = useContext(OnboardingContext);

  const [form] = Form.useForm<FormValues>();
  const defaultLocatorType = locatorType || pageObjectLocatorType || LocatorType.xPath;
  const initialValues: FormValues = {
    type,
    name: name || "",
    locator: locator.output ?? "",
    locatorType: defaultLocatorType,
  };

  const [isOkButtonDisabled, setIsOkButtonDisabled] = useState<boolean>(true);

  const _isNameUnique = (value: string) => !isNameUnique(locators, element_id, value);

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const _locatorValidationRules: () => Rule[] = () =>
    createLocatorValidationRules(
      isCreatingForm,
      form.getFieldValue("locatorType") || defaultLocatorType,
      setValidationMessage,
      locators,
      jdnHash,
      element_id
    );
  const [locatorValidationRules, setLocatorValidationRules] = useState<Rule[]>(_locatorValidationRules());

  const handleTypeChange = (value: string) => {
    if (isEditedName) return;

    const newName = createNewName(
      { element_id, isCustomName, type, name, elemId, elemName, elemText } as Locator,
      value,
      library,
      locators
    );
    form.setFieldValue("name", newName);
  };

  const handleNameChange = () => {
    setIsEditedName(true);
  };

  const handleCreateCustomLocator = async () => {
    let newLocator: Locator = {
      ...newLocatorStub,
      pageObj: pageObjectId,
      isCustomName: isEditedName,
    };

    const isLocatorFieldTouched = form.isFieldTouched("locator");
    // in case if user didn't touch locator field to avoid forceUpdate
    const locatorMessage = isLocatorFieldTouched ? validationMessage : LocatorValidationWarnings.NotFound;

    const { name, type, locator, locatorType } = await form.validateFields();
    const isCSSLocator = locatorType === LocatorType.cssSelector;
    newLocator = {
      ...newLocator,
      locator: { ...newLocator.locator, ...{ [isCSSLocator ? "cssSelector" : "xPath"]: locator } },
      predicted_label: type.toLowerCase(),
      locatorType,
      message: locatorMessage,
      name,
      type,
    };

    dispatch(addCustomLocator({ newLocator, pageObjectId }));

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleEditLocator = async () => {
    const { name, type, locator, locatorType } = await form.validateFields();
    const updatedLocator = {
      name,
      type,
      locator,
      locatorType,
      element_id,
      library,
      message: validationMessage,
      isCustomName: isEditedName,
      isCustomLocator: true,
    };

    validationMessage !== LocatorValidationWarnings.NewElement && jdnHash
      ? dispatch(changeLocatorAttributes(updatedLocator))
      : dispatch(changeLocatorElement(updatedLocator));

    form.resetFields();
    setIsModalOpen(false);
  };

  const getBlockTypeOptions = (): SelectOption[] => types.map((_type) => ({ value: _type, label: _type }));

  const hasFormChanged = () => {
    const currentValues: FormValues = form.getFieldsValue(true);
    return !Object.keys(initialValues).some(
      (key) => initialValues[key as keyof FormValues] !== currentValues[key as keyof FormValues]
    );
  };

  const computeIsOkButtonDisabled = () => {
    const hasFormErrors = !!form.getFieldsError(["name", "type", "locator"]).filter(({ errors }) => errors.length)
      .length;
    if (isCreatingForm) {
      return !form.isFieldsTouched(["type", "name"], true) || hasFormErrors;
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
    setLocatorValidationRules(_locatorValidationRules());

    const newLocatorType = form.getFieldValue("locatorType");
    const newLocator = form.getFieldValue("locator");

    if (newLocator !== "") {
      const newLocatorValue = await getLocatorValueOnTypeSwitch(
        newLocatorType,
        validationMessage,
        element_id,
        jdnHash,
        locator,
        form
      );
      form.setFieldValue("locator", newLocatorValue);
    }
  };

  const onFieldsChange = async (changedValues: FieldData[]) => {
    const isLocatorTypeChanged = changedValues.some((value) => value.name.toString().includes("locatorType"));
    isLocatorTypeChanged && onLocatorTypeChange();
    const isOkButtonDisabled = computeIsOkButtonDisabled();
    setIsOkButtonDisabled(isOkButtonDisabled);
    updateRef(OnbrdStep.EditLocator, undefined, isOkButtonDisabled ? undefined : handleCreateCustomLocator);
  };

  const navigateToOriginalLocator = async (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const _locator = form.getFieldValue("locator");
    form.resetFields();
    setIsModalOpen(false);

    let locatorValue;
    locatorType === LocatorType.cssSelector
      ? (locatorValue = await evaluateCssSelector(_locator, element_id, jdnHash))
      : (locatorValue = await evaluateXpath(_locator, element_id, jdnHash));

    const { element_id: _element_id, foundHash } = JSON.parse(locatorValue);
    const duplicates = checkDuplicates(foundHash, locators, _element_id);
    if (duplicates.length) {
      dispatch(setActiveSingle(duplicates[0]));
      dispatch(setScrollToLocator(duplicates[0].element_id));
    }
  };

  const getMessageForDuplicate = () => (
    <span>
      Duplicate locator detected. Please, edit or{" "}
      <span className="jdn__locatorEdit-navigation" onClick={navigateToOriginalLocator}>
        refer to the original locator
      </span>{" "}
      for further actions.
    </span>
  );

  return (
    <DialogWithForm
      modalProps={{
        title: isCreatingForm ? "Create custom locator" : "Edit locator",
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
        className: "jdn__locatorEdit",
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
      <FormItem name="locatorType" label="Locator" style={{ marginBottom: "8px" }}>
        <Select
          disabled={!isValidLocator(validationMessage)}
          options={[
            {
              value: LocatorType.xPath,
              label: LocatorType.xPath,
            },
            {
              value: LocatorType.cssSelector,
              label: LocatorType.cssSelector,
            },
          ]}
        />
      </FormItem>
      <Form.Item
        wrapperCol={{ span: 24, xs: { offset: 0 }, sm: { offset: 4 } }}
        name="locator"
        rules={locatorValidationRules}
        validateStatus={getLocatorValidationStatus(validationMessage)}
        help={
          validationMessage === LocatorValidationErrors.DuplicatedLocator ? getMessageForDuplicate() : validationMessage
        }
        extra={renderValidationWarning()}
      >
        <Input.TextArea
          autoSize
          // expands textarea to view port height
          style={{ maxHeight: `calc(100vh - 396px)`, overflowY: "scroll" }}
        />
      </Form.Item>
    </DialogWithForm>
  );
};
