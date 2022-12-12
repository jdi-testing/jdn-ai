import { Form, Input } from "antd";
import { useForm } from "antd/es/form/Form";
import { Rule } from "antd/lib/form";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { DialogWithForm } from "../../../common/components/DialogWithForm";
import { ValidationErrorType } from "../../locators/locatorSlice.types";
import { selectPageObjects } from "../pageObjectSelectors";
import { changeName } from "../pageObjectSlice";
import { PageObjectId } from "../pageObjectSlice.types";
import { isPONameUnique } from "../utils/pageObject";

interface Props {
  isModalOpen: boolean;
  setIsModalOpen: (val: boolean) => void;
  pageObjId: PageObjectId;
  name: string;
}

export const RenamePageObjectDialog: React.FC<Props> = ({ isModalOpen, setIsModalOpen, name, pageObjId }) => {
  const pageObjects = useSelector(selectPageObjects);
  const [form] = useForm();
  const dispatch = useDispatch();

  const nameValidityRules: Rule[] = [
    {
      required: true,
      message: ValidationErrorType.EmptyValue,
    },
    {
      pattern: /^[A-Z][a-zA-Z0-9_$]*$/,
      message: ValidationErrorType.InvalidJavaClass,
    },
    {
      max: 60,
      message: ValidationErrorType.LongName,
    },
    () => ({
      validator(_: Rule, value: string) {
        if (value.length && !isPONameUnique(pageObjects, pageObjId, value)) {
          return Promise.reject(new Error(ValidationErrorType.DuplicatedPageObjName));
        } else return Promise.resolve();
      },
    }),
  ];

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        dispatch(changeName({ id: pageObjId, ...values }));
        form.resetFields();
        setIsModalOpen(false);
      })
      .catch((error) => console.log(error));
  };

  return (
    <DialogWithForm
      modalProps={{
        title: "Rename page object",
        open: isModalOpen,
        setIsModalOpen,
        onOk: handleOk,
      }}
      formProps={{
        form,
        initialValues: { name },
      }}
    >
      <Form.Item name="name" label="Name:" rules={nameValidityRules}>
        <Input />
      </Form.Item>
    </DialogWithForm>
  );
};
