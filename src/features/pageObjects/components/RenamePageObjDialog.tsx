import { Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { Rule } from 'antd/lib/form';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DialogWithForm } from '../../../common/components/DialogWithForm';
import { PageObjValidationErrorType } from '../utils/constants';
import { selectPageObjects } from '../selectors/pageObjects.selectors';
import { changeName } from '../pageObject.slice';
import { PageObjectId } from '../types/pageObjectSlice.types';
import { isPONameUnique } from '../utils/pageObject';

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
      message: PageObjValidationErrorType.EmptyValue,
    },
    {
      pattern: /^[A-Z][a-zA-Z0-9_$]*$/,
      message: PageObjValidationErrorType.InvalidJavaClass,
    },
    {
      max: 60,
      message: PageObjValidationErrorType.LongName,
    },
    () => ({
      validator(_: Rule, value: string) {
        if (value.length && !isPONameUnique(pageObjects, value)) {
          return Promise.reject(new Error(PageObjValidationErrorType.DuplicatedPageObjName));
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
        title: 'Rename page object',
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
