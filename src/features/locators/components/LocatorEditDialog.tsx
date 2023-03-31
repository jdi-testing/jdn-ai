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
import { Locator, LocatorTaskStatus } from "../types/locator.types";
import { defaultLibrary } from "../types/generationClasses.types";
import { changeLocatorAttributes, addLocators, setScrollToLocator } from "../locators.slice";
import { addLocatorsToPageObj } from "../../pageObjects/pageObject.slice";
import { createNewName } from "../utils/utils";
import { useLocatorValidationEnabled } from "../utils/useLocatorValidationEnabled";
import { createLocatorValidationRules } from "../utils/locatorValidationRules";
import { createNameValidationRules } from "../utils/nameValidationRules";

import WarningFilled from "../assets/warningFilled.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";
import FormItem from "antd/es/form/FormItem";
import { LocatorType } from "../../../common/types/locatorType";
import { getLocator, getXPathByPriority } from "../utils/locatorOutput";

import { sendMessage } from "../../../pageServices/connector";
import { evaluateXpath } from "../utils/utils";

import { generateId, getElementFullXpath } from "../../../common/utils/helpers";

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
  const isValidationEnabled = useLocatorValidationEnabled();
  const [locatorValidity, setLocatorValidity] = useState<string>(isValidationEnabled ? validity?.locator || "" : "");
  const [isEditedName, setIsEditedName] = useState<boolean>(Boolean(isCustomName));

  const locators = useSelector(selectLocatorsByPageObject);
  const types = useSelector((_state: RootState) => selectAvailableClasses(_state));
  const pageObjectLocatorType = useSelector(selectCurrentPageObject)?.locatorType;
  const pageObjectId = useSelector(selectCurrentPageObject)!.id;
  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;
  // should be reduced when we'll enable css locators creating
  const getFormLocatorType = () =>
    isCreatingForm ? LocatorType.xPath : locatorType || pageObjectLocatorType || LocatorType.xPath;

  const [formLocatorType, setLocatorType] = useState<LocatorType>(getFormLocatorType());

  const [form] = Form.useForm<FormValues>();
  const dispatch = useDispatch();

  const initialValues = {
    type: type || "",
    name: name || "",
    locator: locator ? getXPathByPriority(locator) : "",
    locatorType: getFormLocatorType(),
  };

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
    let newLocator: Locator = {
      elemAriaLabel: "",
      elemId: "",
      elemName: "",
      elemText: "",
      element_id: "",
      jdnHash: "",
      parent_id: "",
      locator: {
        customXpath: "",
        fullXpath: "",
        taskStatus: LocatorTaskStatus.SUCCESS,
      },
      name: "",
      pageObj: pageObjectId,
      predicted_label: "",
      validity: { locator: locatorValidity },
      isCustomName: isEditedName,
      // library, check me
      type: "UIElement",
      generate: true,
    };

    await form.validateFields().then(({ name, type, locator }) => {
      newLocator = {
        ...newLocator,
        locator: { ...newLocator.locator, customXpath: locator },
        predicted_label: type.toLowerCase(),
        name,
        type,
      };
    });

    if (locatorValidity) {
      // another scenario if MultipleElements
      newLocator.element_id = `${generateId()}_${pageObjectId}`;
    } else {
      await evaluateXpath(newLocator.locator.customXpath!)
        .then((response) => JSON.parse(response[0].result))
        .then(({ foundHash, foundElement }) => {
          newLocator = {
            ...newLocator,
            locator: { ...newLocator.locator, fullXpath: getElementFullXpath(foundElement) },
            jdnHash: foundHash,
            element_id: `${foundHash}_${pageObjectId}`,
          };
        })
        .catch((error: any) => console.log(error));
    }

    dispatch(addLocators([newLocator]));
    dispatch(addLocatorsToPageObj([newLocator.element_id]));
    dispatch(setScrollToLocator(newLocator.element_id));

    !locatorValidity && sendMessage.addElement(newLocator);

    form.resetFields();
    setIsModalOpen(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        dispatch(
          changeLocatorAttributes({
            ...values,
            element_id,
            library,
            validity: { locator: locatorValidity },
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
    if (isCreatingForm && isValidationEnabled) {
      return (
        <div className="jdn__locatorEdit-warning">
          <Icon component={WarningFilled} className="ant-alert-icon" />
          <Footnote>If you leave this field empty, the locator will be invalid</Footnote>
        </div>
      );
    } else if (!isValidationEnabled) {
      return (
        <div className="jdn__locatorEdit-warning">
          <Icon component={WarningFilled} className="ant-alert-icon" />
          <Footnote>Validation is possible only on Page Object creation</Footnote>
        </div>
      );
    } else return null;
  };

  return (
    <DialogWithForm
      modalProps={{
        title: isCreatingForm ? "Create custom locator" : "Edit locator",
        open: isModalOpen,
        onOk: isCreatingForm ? handleCreateCustomLocator : handleOk,
        enableOverlay: isModalOpen,
        setIsModalOpen,
      }}
      formProps={{
        form,
        initialValues,
      }}
    >
      <Form.Item name="name" label="Name" rules={nameValidationRules}>
        <Input onChange={handleNameChange} />
      </Form.Item>
      <Form.Item name="type" label="Block type" required={isCreatingForm}>
        <Select
          onChange={handleTypeChange}
          showSearch
          filterOption={(input, option) =>
            (option?.value?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
          }
          options={types.map((_type) => ({ value: _type, label: _type }))}
        />
      </Form.Item>
      {/* change margin to css */}
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
          validateStatus={locatorValidity ? "warning" : ""}
          help={locatorValidity}
          hidden={formLocatorType !== LocatorType.cssSelector}
        >
          <TextArea
            disabled
            className={locatorValidity.length ? "ant-input-status-warning" : ""}
            value={getLocator({ ...locator, customXpath: form.getFieldValue("locator") }, LocatorType.cssSelector)}
          />
        </Form.Item>
        <Form.Item
          hidden={formLocatorType === LocatorType.cssSelector}
          name="locator"
          rules={locatorValidationRules}
          validateStatus={locatorValidity ? "warning" : ""}
          help={locatorValidity}
          extra={renderValidationWarning()}
        >
          {/* className: antd's bug with applying class to TextArea*/}
          <TextArea className={locatorValidity.length ? "ant-input-status-warning" : ""} />
        </Form.Item>
      </Col>
    </DialogWithForm>
  );
};
