import { Form, Input, Select } from "antd";
import { Rule, RuleObject } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { selectAvailableClasses } from "../../filter/filterSelectors";
import { ElementClass, ElementLibrary } from "../../pageObjects/utils/generationClassesMap";
import { isNameUnique, isStringMatchesReservedWord } from "../../pageObjects/utils/pageObject";
import { selectLocators } from "../locatorSelectors";
import { Locator, ValidationErrorType } from "../locatorSlice.types";
import { changeLocatorAttributes } from "../locatorsSlice";
import { createNewName, equalHashes, evaluateXpath, getLocator, isValidJavaVariable } from "./utils";

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
  const [locatorValidity, setLocatorValidity] = useState<string>(validity?.locator || "");
  const [isEditedName, setIsEditedName] = useState<boolean>(Boolean(isCustomName));

  const locators = useSelector(selectLocators);
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

  const nameValidationRules: Rule[] = [
    {
      required: true,
      message: ValidationErrorType.EmptyValue,
    },
    () => ({
      validator(_: RuleObject, value: string) {
        if (!value.length) return Promise.resolve();
        if (!isValidJavaVariable(value) || isStringMatchesReservedWord(value)) {
          return Promise.reject(new Error(ValidationErrorType.InvalidName));
        } else if (_isNameUnique(value)) {
          return Promise.reject(new Error(ValidationErrorType.DuplicatedName));
        } else return Promise.resolve();
      },
    }),
  ];

  const locatorValidationRules: Rule[] = [
    () => ({
      validator(_: RuleObject, value: string) {
        if (!value.length) {
          setLocatorValidity(ValidationErrorType.EmptyValue);
          return Promise.resolve();
        }
        return evaluateXpath(value).then((response) => {
          const result = response[0].result;
          let length;
          let foundHash;

          if (result !== ValidationErrorType.NotFound) {
            length = JSON.parse(result).length;
            foundHash = JSON.parse(result).foundHash;
          }

          if (result === ValidationErrorType.NotFound || length === 0) {
            setLocatorValidity(ValidationErrorType.NotFound);
          } else if (length > 1) {
            setLocatorValidity(ValidationErrorType.MultipleElements);
          } else if (length === 1) {
            if (foundHash !== jdnHash) {
              if (equalHashes(foundHash, locators).length) setLocatorValidity(ValidationErrorType.DuplicatedLocator);
              else setLocatorValidity(ValidationErrorType.NewElement);
            } else {
              setLocatorValidity("");
            }
          }
        });
      },
    }),
  ];

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

  return (
    <DialogWithForm
      modalProps={{
        title: "Edit locator",
        open: isModalOpen,
        onOk: handleOk,
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
        <Select onChange={handleTypeChange}>
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
      >
        {/* antd's bug with applying class to TextArea*/}
        <TextArea className={locatorValidity.length ? "ant-input-status-warning" : ""} />
      </Form.Item>
    </DialogWithForm>
  );
};
