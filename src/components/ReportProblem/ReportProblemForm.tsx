import { Button, Form, Input, Upload, UploadFile } from "antd";
import { FormInstance } from "antd/es/form/Form";
import TextArea from "antd/lib/input/TextArea";
import { UploadChangeParam, UploadFileStatus } from "antd/lib/upload/interface";
import { UploadSimple } from "phosphor-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentPageObject } from "../../store/selectors/pageObjectSelectors";
import { FormProps } from "./ReportProblem";
import { dataToBlob, isAllowedExtension, isImage, toBase64 } from "./utils";

interface Props {
  form: FormInstance<FormProps>;
}

export const ReportProblemForm: React.FC<Props> = ({ form }) => {
  const pageData = useSelector(selectCurrentPageObject)?.pageData;

  const defaultFileList = useMemo(
      () =>
      pageData ?
        [
          {
            uid: "0",
            name: "pageData.json",
            status: "done" as UploadFileStatus,
            url: dataToBlob(pageData),
            linkProps: { download: "pageData.json" },
          },
        ] :
        [],
      [pageData]
  );

  const [fileList, setFileList] = useState<UploadFile[]>(defaultFileList);

  useEffect(() => {
    setFileList(defaultFileList);
  }, [pageData]);

  useEffect(() => {
    const files = document.querySelector(".ant-upload-list");
    if (files) files.scrollTop = files.scrollHeight;
  }, [fileList]);

  const handleUploadChange = async (info: UploadChangeParam<UploadFile>) => {
    const newFileList = info.fileList.map(async (_file) => {
      if (info.file.uid === _file.uid && _file.originFileObj) {
        if ((_file.size || Infinity) / 1024 / 1024 > 2) {
          _file.status = "error";
          _file.response = "Max file size is 2 Mb";
          _file.error = true;
          return _file;
        }

        if (isImage(_file)) {
          _file.url = (await toBase64(_file.originFileObj)) as string;
        } else if (_file.type && isAllowedExtension(_file.type)) {
          _file.url = dataToBlob(_file.originFileObj);
        } else {
          _file.status = "error";
          _file.response = "This file type isn't allowed";
          _file.error = true;
        }
        _file.linkProps = { download: _file.name };
      }
      return _file;
    });

    Promise.all(newFileList).then(setFileList);
  };

  const normFile = (e: Record<string, never>) => {
    if (Array.isArray(e)) return e;

    return e?.fileList;
  };

  return (
    <Form
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
      {...{ form }}
      initialValues={{ upload: fileList }}
    >
      <Form.Item
        label="E-mail"
        name="from"
        rules={[
          {
            required: true,
            message: "Please input your e-mail",
          },
          {
            // eslint-disable-next-line max-len
            pattern: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
            message: "Please input a valid email",
          },
        ]}
      >
        <Input placeholder="Your feedback e-mail" maxLength={28} />
      </Form.Item>
      <Form.Item
        label="Text"
        name="body"
        rules={[{ required: true, message: "Please input your problem description" }]}
      >
        <TextArea rows={5} placeholder="Describe your problem" maxLength={2000} showCount />
      </Form.Item>
      <Form.Item name="upload" label="Upload" valuePropName="fileList" getValueFromEvent={normFile}>
        {/* <Upload name="logo" action="/upload.do" listType="picture"> */}
        <Upload name="attachments" onChange={handleUploadChange} {...{ fileList }}>
          <Button icon={<UploadSimple />}>Upload</Button>
        </Upload>
      </Form.Item>
    </Form>
  );
};
