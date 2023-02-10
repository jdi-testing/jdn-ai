import { Form, Input, Select } from "antd";
import Icon from "@ant-design/icons";
import { Rule } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { selectAvailableClasses } from "../../filter/filter.selectors";
import { selectLocatorsByPageObject } from "../../pageObjects/pageObject.selectors";
import { ElementClass, ElementLibrary } from "../types/generationClassesMap";
import { isNameUnique } from "../../pageObjects/utils/pageObject";
import { Locator } from "../types/locator.types";
import { changeLocatorAttributes } from "../locators.slice";
import { createNewName, getLocator } from "../utils/utils";
import { useLocatorValidationEnabled } from "../utils/useLocatorValidationEnabled";
import { createLocatorValidationRules } from "../utils/locatorValidationRules";
import { createNameValidationRules } from "../utils/nameValidationRules";

import WarningFilled from "../assets/warningFilled.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";

interface Props extends Locator {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  library: ElementLibrary;
}

interface EditFormProps {
  name: string;
  type: ElementClass;
  locator: string;
}

export const LocatorEditDialog: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  element_id,
  isCustomName,
  name,
  type,
  locator,
  library,
  jdnHash,
  validity,
  elemId,
  elemName,
  elemText,
}) => {
  const isValidationEnabled = useLocatorValidationEnabled();
  const [locatorValidity, setLocatorValidity] = useState<string>(isValidationEnabled ? validity?.locator || "" : "");
  const [isEditedName, setIsEditedName] = useState<boolean>(Boolean(isCustomName));

  const locators = useSelector(selectLocatorsByPageObject);
  const types = useSelector((_state: RootState) => selectAvailableClasses(_state));

  const [form] = Form.useForm<EditFormProps>();
  const dispatch = useDispatch();

  const _isNameUnique = (value: string) => !isNameUnique(locators, element_id, value);

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

  const nameValidationRules: Rule[] = createNameValidationRules(_isNameUnique);

  const locatorValidationRules: Rule[] = createLocatorValidationRules(
    setLocatorValidity,
    isValidationEnabled,
    locators,
    jdnHash
  );

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
        form.resetFields();
        setIsModalOpen(false);
      })
      .catch((error) => console.log(error));
  };

  const renderValidationWarning = () =>
    !isValidationEnabled ? (
      <div className="jdn__locatorEdit-warning">
        <Icon component={WarningFilled} className="ant-alert-icon" />
        <Footnote>Validation is possible only on Page Object creation</Footnote>
      </div>
    ) : null;

  return (
    <DialogWithForm
      modalProps={{
        title: "Edit locator",
        open: isModalOpen,
        onOk: handleOk,
        enableOverlay: isModalOpen,
        setIsModalOpen,
      }}
      formProps={{
        form,
        initialValues: { type, name, locator: getLocator(locator) },
      }}
    >
      <Form.Item name="name" label="Name:" rules={nameValidationRules}>
        <Input onChange={handleNameChange} />
      </Form.Item>
      <Form.Item name="type" label="Block type:">
        <Select
          onChange={handleTypeChange}
          showSearch
          filterOption={(input, option) =>
            (option?.value?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
          }
        >
          {types.map((_type) => (
            <Select.Option key={_type} value={_type}>
              {_type}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="locator"
        label="Locator:"
        rules={locatorValidationRules}
        validateStatus={locatorValidity ? "warning" : ""}
        help={locatorValidity}
        extra={renderValidationWarning()}
      >
        {/* antd's bug with applying class to TextArea*/}
        <TextArea className={locatorValidity.length ? "ant-input-status-warning" : ""} />
      </Form.Item>
    </DialogWithForm>
  );
};
