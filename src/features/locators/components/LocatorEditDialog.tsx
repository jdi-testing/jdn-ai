import { Col, Form, Input, Select } from "antd";
import Icon from "@ant-design/icons";
import { Rule } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { selectAvailableClasses } from "../../filter/filter.selectors";
import { selectCurrentPageObject, selectLocatorsByPageObject } from "../../pageObjects/pageObject.selectors";
import { ElementClass } from "../types/generationClasses.types";
import { isNameUnique } from "../../pageObjects/utils/pageObject";
import { Locator, LocatorTaskStatus, ValidationErrorType, Validity, ValidationStatus } from "../types/locator.types";
import { defaultLibrary } from "../types/generationClasses.types";
import { changeLocatorAttributes, addLocators, setScrollToLocator } from "../locators.slice";
import { addLocatorsToPageObj } from "../../pageObjects/pageObject.slice";
import { createNewName, getNewLocatorStub } from "../utils/utils";
import { useLocatorValidationEnabled } from "../utils/useLocatorValidationEnabled";
import { createLocatorValidationRules } from "../utils/locatorValidationRules";
import { createNameValidationRules } from "../utils/nameValidationRules";
import WarningFilled from "../assets/warningFilled.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";
import FormItem from "antd/es/form/FormItem";
import { LocatorType, SelectOption } from "../../../common/types/common";
import { getLocator, getXPathByPriority } from "../utils/locatorOutput";
import { sendMessage } from "../../../pageServices/connector";
import { evaluateXpath } from "../utils/utils";
import { generateId, getElementFullXpath, isFilteredSelect } from "../../../common/utils/helpers";

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
  validity,
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

  const isValidationEnabled = useLocatorValidationEnabled();
  const [{ message, validationStatus }, setLocatorValidity] = useState<Validity>(isValidationEnabled ? ({ message: validity?.message || "", validationStatus: ""}) : { message: "", validationStatus: ValidationStatus.WARNING});

  const [isEditedName, setIsEditedName] = useState<boolean>(isCustomName);

  // should be reduced when we'll enable css locators creating
  const getFormLocatorType = () =>
    isCreatingForm ? LocatorType.xPath : locatorType || pageObjectLocatorType || LocatorType.xPath;

  const [formLocatorType, setLocatorType] = useState<LocatorType>(getFormLocatorType());
  const [form] = Form.useForm<FormValues>();
  const initialValues: FormValues = {
    type: type || "",
    name: name || "",
    locator: locator ? getXPathByPriority(locator) : "",
    locatorType: formLocatorType,
  };

  const [isOkButtonDisabled, setIsOkButtonDisabled] = useState<boolean>(true);

  const _isNameUnique = (value: string) => !isNameUnique(locators, element_id, value);

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const locatorValidationRules: Rule[] = createLocatorValidationRules(
    isCreatingForm,
    setLocatorValidity,
    isValidationEnabled,
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
    let newLocator: Locator = getNewLocatorStub(LocatorTaskStatus.SUCCESS, pageObjectId, message, isEditedName, formLocatorType);

    // we need validation here in case if user didn't touch locator field
    await form.validateFields().then(({ name, type, locator}) => newLocator = {
      ...newLocator,
      locator: { ...newLocator.locator, customXpath: locator },
      predicted_label: type.toLowerCase(),
      name,
      type,
    }).catch((err) => console.log(err));

    switch (validationStatus) {
      case ValidationStatus.WARNING:
        newLocator.element_id = `${generateId()}_${pageObjectId}`;
        break;
      case ValidationStatus.ERROR:
        return;
      case ValidationStatus.SUCCESS:
        await evaluateXpath(newLocator.locator.customXpath!)
        .then((response) => JSON.parse(response[0].result))
        .then(({ foundHash, foundElement }) => {
          newLocator = {
            ...newLocator,
            locator: { ...newLocator.locator, fullXpath: getElementFullXpath(foundElement) },
            jdnHash: foundHash,
            element_id: `${foundHash}_${pageObjectId}`,
          };
        }).catch((error: any) => console.log(error));
        break;
      default:
        newLocator.element_id = `${generateId()}_${pageObjectId}`;
        break;
    }

    dispatch(addLocators([newLocator]));
    dispatch(addLocatorsToPageObj([newLocator.element_id]));
    dispatch(setScrollToLocator(newLocator.element_id));

    !validationStatus && sendMessage.addElement(newLocator);

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
            validity: { message },
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

  const renderValidationWarning = () => {
    if (!isValidationEnabled) {
      return (
        <div className="jdn__locatorEdit-warning">
          <Icon component={WarningFilled} className="ant-alert-icon" />
          <Footnote>Validation is possible only on Page Object creation</Footnote>
        </div>
      );
    }
    return null;
  };

  const getBlockTypeOptions = (): SelectOption[] => types.map((_type) => ({ value: _type, label: _type }));

  const hasFormChanged = (currentValues: FormValues) => {
    return !Object.keys(initialValues).some(
      (key) => initialValues[key as keyof FormValues] !== currentValues[key as keyof FormValues]
    );
  };

  const computeIsOkButtonDisabled = () => {
    const hasFormErrors = !!form.getFieldsError(["name", "type", "locator"]).filter(({ errors }) => errors.length).length;
    if (isCreatingForm) {
      return !form.isFieldsTouched(["type", "name"], true) || hasFormErrors;
    }
    const currentValues = form.getFieldsValue(true);
    return hasFormChanged(currentValues);
  }

  const onFieldsChange = () => {
    setIsOkButtonDisabled(computeIsOkButtonDisabled());
  };

  return (
    <DialogWithForm
      modalProps={{
        title: isCreatingForm ? "Create custom locator" : "Edit locator",
        open: isModalOpen,
        onOk: isCreatingForm ? handleCreateCustomLocator : handleEditLocator,
        enableOverlay: isModalOpen,
        setIsModalOpen,
        okButtonProps: {
          disabled: isOkButtonDisabled
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
      <Form.Item name="type" label="Block type" rules={[{
          required: true,
          message: ValidationErrorType.EmptyValue,
        }]}>
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
        <Form.Item
          hidden={formLocatorType !== LocatorType.cssSelector}
        >
          <TextArea
            disabled
            value={getLocator({ ...locator, customXpath: form.getFieldValue("locator") }, LocatorType.cssSelector)}
          />
        </Form.Item>
        <Form.Item
          hidden={formLocatorType === LocatorType.cssSelector}
          name="locator"
          rules={locatorValidationRules}
          validateStatus={validationStatus}
          help={message}
          extra={renderValidationWarning()}
        >
          {/* className: antd's bug with applying class to TextArea*/}
          <TextArea className={validationStatus ? `ant-input-status-${validationStatus}` : ""} />
        </Form.Item>
      </Col>
    </DialogWithForm>
  );
};
