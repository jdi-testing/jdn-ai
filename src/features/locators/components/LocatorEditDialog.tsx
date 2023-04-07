import { Col, Form, Input, Select } from "antd";
import Icon from "@ant-design/icons";
import WarningFilled from "../assets/warningFilled.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { Rule } from "antd/lib/form";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { selectAvailableClasses } from "../../filter/filter.selectors";
import { selectCurrentPageObject, selectLocatorsByPageObject } from "../../pageObjects/pageObject.selectors";
import { ElementClass } from "../types/generationClasses.types";
import { isNameUnique } from "../../pageObjects/utils/pageObject";
import {
  Locator,
  LocatorValidationWarnings,
  LocatorValidationErrorType,
  ValidationStatus,
} from "../types/locator.types";
import { defaultLibrary } from "../types/generationClasses.types";
import { changeLocatorAttributes, addLocators, setScrollToLocator } from "../locators.slice";
import { addLocatorsToPageObj } from "../../pageObjects/pageObject.slice";
import { createNewName } from "../utils/utils";
import { createLocatorValidationRules } from "../utils/locatorValidationRules";
import { createNameValidationRules } from "../utils/nameValidationRules";
import FormItem from "antd/es/form/FormItem";
import { LocatorType, SelectOption } from "../../../common/types/common";
import { getLocator } from "../utils/locatorOutput";
import { sendMessage } from "../../../pageServices/connector";
import { evaluateXpath, getLocatorValidationStatus } from "../utils/utils";
import { generateId, getElementFullXpath, isFilteredSelect } from "../../../common/utils/helpers";
import { newLocatorStub } from "../utils/constants";

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

  // should be reduced when we'll enable css locators creating
  const getFormLocatorType = () =>
    isCreatingForm ? LocatorType.xPath : locatorType || pageObjectLocatorType || LocatorType.xPath;

  const [formLocatorType, setLocatorType] = useState<LocatorType>(getFormLocatorType());
  const [form] = Form.useForm<FormValues>();
  const initialValues: FormValues = {
    type,
    name: name || "",
    locator: locator.output ?? "",
    locatorType: formLocatorType,
  };

  const [isOkButtonDisabled, setIsOkButtonDisabled] = useState<boolean>(true);

  const _isNameUnique = (value: string) => !isNameUnique(locators, element_id, value);

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const locatorValidationRules: Rule[] = createLocatorValidationRules(
    isCreatingForm,
    setValidationMessage,
    locators,
    jdnHash
  );

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
      locatorType: formLocatorType,
    };

    const isLocatorFieldTouched = form.isFieldTouched("locator");
    // in case if user didn't touch locator field to avoid forceUpdate
    const locatorMessage = isLocatorFieldTouched ? validationMessage : LocatorValidationWarnings.NotFound;

    await form
      .validateFields()
      .then(({ name, type, locator }) => {
        newLocator = {
          ...newLocator,
          locator: { ...newLocator.locator, customXpath: locator },
          predicted_label: type.toLowerCase(),

          message: locatorMessage,
          name,
          type,
        };
      })
      .catch((err) => console.log(err));

    switch (getLocatorValidationStatus(locatorMessage)) {
      case ValidationStatus.WARNING:
        newLocator.element_id = `${generateId()}_${pageObjectId}`;
        break;
      case ValidationStatus.SUCCESS:
        await evaluateXpath(newLocator.locator.customXpath!, jdnHash)
          .then((response) => JSON.parse(response))
          .then(async ({ foundHash, foundElement }) => ({
            fullXpath: await getElementFullXpath(foundElement),
            foundHash,
            foundElement,
          }))
          .then(({ fullXpath, foundHash, foundElement }) => {
            newLocator = {
              ...newLocator,
              elemText: foundElement.textContent,
              locator: { ...newLocator.locator, fullXpath },
              jdnHash: foundHash,
              element_id: `${foundHash}_${pageObjectId}`,
            };
          })
          .catch((error: any) => console.log(error));
        break;
      default:
        newLocator.element_id = `${generateId()}_${pageObjectId}`;
        break;
    }

    dispatch(addLocators([newLocator]));
    dispatch(addLocatorsToPageObj([newLocator.element_id]));
    dispatch(setScrollToLocator(newLocator.element_id));

    isLocatorFieldTouched && sendMessage.addElement(newLocator);

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleEditLocator = () => {
    form
      .validateFields()
      .then((values) => {
        dispatch(
          changeLocatorAttributes({
            ...values,
            element_id,
            library,
            message: validationMessage,
            isCustomName: isEditedName,
          })
        );
      })
      .catch((error) => console.log(error))
      .finally(() => {
        form.resetFields();
        setIsModalOpen(false);
      });
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

  const onFieldsChange = () => {
    setIsOkButtonDisabled(computeIsOkButtonDisabled());
  };

  const renderValidationWarning = () => (
    <div className="jdn__locatorEdit-warning">
      <Icon component={WarningFilled} className="ant-alert-icon" />
      <Footnote>If you leave this field empty, the locator will be invalid</Footnote>
    </div>
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
      }}
      formProps={{
        form,
        initialValues,
        onFieldsChange,
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
          onChange={setLocatorType}
          options={[
            {
              value: LocatorType.xPath,
              label: LocatorType.xPath,
            },
            {
              value: LocatorType.cssSelector,
              label: LocatorType.cssSelector,
              disabled: isCreatingForm, // should be enable when we'll decide to enable css locators creating
            },
          ]}
        />
      </FormItem>
      <Col push={4}>
        {/* should be reworked to one form when we'll decide to enable css locators editing */}
        <Form.Item hidden={formLocatorType !== LocatorType.cssSelector}>
          <Input.TextArea
            disabled
            value={getLocator({ ...locator, customXpath: form.getFieldValue("locator") }, LocatorType.cssSelector)}
          />
        </Form.Item>
        <Form.Item
          hidden={formLocatorType === LocatorType.cssSelector}
          name="locator"
          rules={locatorValidationRules}
          validateStatus={getLocatorValidationStatus(validationMessage)}
          help={validationMessage}
          extra={renderValidationWarning()}
        >
          <Input.TextArea />
        </Form.Item>
      </Col>
    </DialogWithForm>
  );
};
