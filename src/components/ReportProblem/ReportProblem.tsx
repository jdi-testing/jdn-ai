import { Button, Form, Input, Upload, UploadFile } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFileStatus } from "antd/lib/upload/interface";
import { UploadSimple } from "phosphor-react";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { HttpEndpoint, request } from "../../services/backend";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { selectCurrentPageObject } from "../../store/selectors/pageObjectSelectors";
import { PageType } from "../../store/slices/mainSlice.types";
import { DialogWithForm } from "../common/DialogWithForm";
import { dataToBlob, isImage, toBase64, isAllowedExtension } from "./utils";

export interface ReportFormProps {
  body: string;
  from: string;
  upload?: UploadFile[];
}

export const ReportProblem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<ReportFormProps>();
  const pageData = useSelector(selectCurrentPageObject)?.pageData;
  const currentPage = useSelector(selectCurrentPage).page;

  const defaultFileList = useMemo(
      () =>
      pageData && currentPage === PageType.LocatorsList ?
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
    const files = document.querySelector(".ant-upload-list");
    if (files) files.scrollTop = files.scrollHeight;
  }, [fileList]);

  const handleOk = () => {
    form
        .validateFields()
        .then((values) => {
        // have no idea how make antd validate uploads properly
          if (values.upload?.find((file) => file.status === "error")) throw new Error("invalid uploads");
          sendReport(values);
          form.resetFields();
          setIsModalOpen(false);
        })
        .catch(() => {
          const failedUploadFile = document.querySelector(".ant-upload-list-item-error");
          failedUploadFile?.scrollIntoView({ behavior: "smooth" });
        });
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const sendReport = (values: ReportFormProps) => {
    const { upload, ...rest } = values;

    const attachments = upload ?
      upload.map((file: UploadFile) => ({ file_content: file.url, filename: file.name })) :
      [];

    request.post(HttpEndpoint.REPORT_PROBLEM, {
      attachments,
      subject: "Report problem",
      ...rest,
    });
  };

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
    <div>
      <a className="jdn__header-link" href="#" onClick={showModal}>
        Report a problem
      </a>
      <DialogWithForm
        open={isModalOpen}
        modalProps={{
          title: "Report a problem",
          open: isModalOpen,
          onOk: handleOk,
          setIsModalOpen,
        }}
        formProps={{
          form,
          initialValues: { upload: fileList },
        }}
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
              pattern: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z](?:[a-z]*[a-z])?/,
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
        <Form.Item name="upload" label="Upload" valuePropName="upload" getValueFromEvent={normFile}>
          {/* <Upload name="logo" action="/upload.do" listType="picture"> */}
          <Upload name="attachments" onChange={handleUploadChange} {...{ fileList, defaultFileList }}>
            <Button icon={<UploadSimple />}>Upload</Button>
          </Upload>
        </Form.Item>
      </DialogWithForm>
    </div>
  );
};
