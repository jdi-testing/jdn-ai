import { Form, Input, Select } from "antd";
import { Rule, RuleObject } from "antd/lib/form";
import TextArea from "antd/lib/input/TextArea";
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLocators } from "../../../store/selectors/locatorSelectors";
import { ElementId, LocatorValue, ValidationErrorType, Validity } from "../../../store/slices/locatorSlice.types";
import { changeLocatorAttributes } from "../../../store/slices/locatorsSlice";
import { DialogWithForm } from "../../common/DialogWithForm";
import { ElementLabel, ElementLibrary, getTypesMenuOptions } from "../../PageObjects/utils/generationClassesMap";
import { isNameUnique, isStringMatchesReservedWord } from "../../PageObjects/utils/pageObject";
import { equalHashes, evaluateXpath, getLocator, isValidJavaVariable } from "./utils";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  element_id: ElementId;
  type: ElementLabel;
  name: string;
  locator: LocatorValue;
  library: ElementLibrary;
  jdnHash: string;
  validity?: Validity;
}

interface EditFormProps {
  name: string;
  type: ElementLabel;
  locator: string;
}

export const LocatorEditDialog: React.FC<Props> = ({
  isModalOpen,
  setIsModalOpen,
  element_id,
  name,
  type,
  locator,
  library,
  jdnHash,
  validity,
}) => {
  const [locatorValidity, setLocatorValidity] = useState<string>(validity?.locator || "");

  const locators = useSelector(selectLocators);
  const types = useMemo(() => getTypesMenuOptions(library), [library]);

  const [form] = Form.useForm<EditFormProps>();
  const dispatch = useDispatch();

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
        } else if (!isNameUnique(locators, element_id, value)) {
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
          dispatch(changeLocatorAttributes({ ...values, element_id, library, validity: { locator: locatorValidity } }));
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
        <Input />
      </Form.Item>
      <Form.Item name="type" label="Block type:">
        <Select>
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
