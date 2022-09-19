import { Button, Form, Input, Modal, Upload, UploadFile } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFileStatus } from "antd/lib/upload/interface";
import { UploadSimple } from "phosphor-react";
import React, { useEffect, useState } from "react";
import { pageData } from "../../services/pageDataHandlers";
import { dataToBlob, isImage, toBase64 } from "./utils";

interface FormProps {
  body: string;
  from: string;
  upload?: UploadFile[];
}

export const ReportProblem = () => {
  const [form] = Form.useForm<FormProps>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const defaultFileList = pageData ?
    [
      {
        uid: "1",
        name: "pageData.json",
        status: "done" as UploadFileStatus,
        url: dataToBlob(pageData),
        linkProps: { download: "pageData.json" },
      },
    ] :
    [];

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    form
        .validateFields()
        .then((values) => {
          sendReport(values);
          form.resetFields();
          setIsModalOpen(false);
        })
        .catch((info) => {
          console.log("Validate Failed:", info);
        });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleUploadChange = async (info: UploadChangeParam<UploadFile>) => {
    const newFileList = info.fileList.map(async (_file) => {
      if (info.file.uid === _file.uid && _file.originFileObj) {
        if (isImage(_file)) {
          _file.url = (await toBase64(_file.originFileObj)) as string;
        } else {
          _file.url = dataToBlob(_file.originFileObj);
        }
        _file.linkProps = { download: _file.name };
      }
      return _file;
    });
    Promise.all(newFileList).then((result) => {
      setFileList(result);
    });
  };

  const normFile = (e: Record<string, never>) => {
    if (Array.isArray(e)) {
      return e;
    }

    return e?.fileList;
  };

  const sendReport = (values: FormProps) => {
    const { upload, ...rest } = values;

    const files = upload ? upload.map((file: UploadFile) => file.url) : [];

    const data = {
      files,
      ...rest,
    };
  };

  return (
    <div>
      <a className="jdn__header-link" href="#" onClick={showModal}>
        Report a problem
      </a>
      <Modal
        title="Report a problem"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        style={{ top: "24px" }}
      >
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 20 }}
          {...{ form }}
          initialValues={{ upload: defaultFileList }}
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
            <Upload name="attachments" onChange={handleUploadChange} {...{ fileList, defaultFileList }}>
              <Button icon={<UploadSimple />}>Upload</Button>
            </Upload>
          </Form.Item>
        </Form>
        {/* <input type="file" id="input" multiple></input> */}
      </Modal>
    </div>
  );
};
