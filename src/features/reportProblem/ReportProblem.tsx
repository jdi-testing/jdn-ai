import { Button, Form, Input, Modal, Tooltip, Upload, UploadFile } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { UploadChangeParam } from "antd/lib/upload";
import { RcFile, UploadFileStatus } from "antd/lib/upload/interface";
import { UploadSimple, Warning } from "phosphor-react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectCurrentPage } from "../../app/mainSelectors";
import { PageType } from "../../app/mainSlice.types";
import { DialogWithForm } from "../../common/components/DialogWithForm";
import { HttpEndpoint, request } from "../../services/backend";
import { ValidationErrorType } from "../locators/locatorSlice.types";
import { selectCurrentPageObject } from "../pageObjects/pageObjectSelectors";
import { isAllowedExtension, isImage, toBase64 } from "./utils";

const { error } = Modal;

export interface ReportFormProps {
  body: string;
  from: string;
  upload?: UploadFile[];
}

export const ReportProblem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [serverPingInProcess, setServerPingInProcess] = useState(false);
  const [form] = Form.useForm<ReportFormProps>();
  const pageData = useSelector(selectCurrentPageObject)?.pageData;
  const currentPage = useSelector(selectCurrentPage).page;

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    const defaultFileList = async () =>
      pageData && currentPage === PageType.LocatorsList ?
        [
          {
            uid: "0",
            name: "pageData.json",
            status: "done" as UploadFileStatus,
            url: (await toBase64(new Blob([pageData]) as RcFile)) as string | undefined,
            linkProps: { download: "pageData.json" },
          },
        ] :
        [];
    defaultFileList().then(setFileList);
  }, [currentPage, pageData]);

  useEffect(() => {
    const files = document.querySelector(".ant-upload-list");
    if (files) files.scrollTop = files.scrollHeight;
  }, [fileList]);

  const showExceprionConfirm = () =>
    error({
      title: "Report is not available",
      content: (
        <React.Fragment>
          Mail server is not accessible from your location and problem report can&apos;t be created automatically.
          Please send an email{" "}
          <a href="mailto:SupportJDI@epam.com" data-turbo-frame="">
            SupportJDI@epam.com
          </a>{" "}
          by yourself.
        </React.Fragment>
      ),
    });

  const handleOk = () => {
    form
        .validateFields()
        .then((values) => {
        // have no idea how make antd validate uploads properly
          if (values.upload?.find((file) => file.status === "error")) throw new Error("invalid uploads");
          sendReport(values);
          form.resetFields();
          setFileList([]);
          setIsModalOpen(false);
        })
        .catch(() => {
          const failedUploadFile = document.querySelector(".ant-upload-list-item-error");
          failedUploadFile?.scrollIntoView({ behavior: "smooth" });
        });
  };

  const showModal = () => {
    setServerPingInProcess(true);
    request
        .get(HttpEndpoint.PING_SMTP)
        .then((response) => {
          if (response === 1) {
            setServerPingInProcess(false);
            setIsModalOpen(true);
          } else showExceprionConfirm();
        })
        .catch(() => showExceprionConfirm())
        .finally(() => setServerPingInProcess(false));
  };

  const sendReport = (values: ReportFormProps) => {
    const { upload, ...rest } = values;

    const attachments = upload ?
      upload.map((file: UploadFile) => ({
        file_content: file.url?.replace(/data:(image|text|application)\/.+;base64,/, ""),
        filename: file.name,
      })) :
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
        if (_file.size !== 0 && (_file.size || Infinity) / 1024 / 1024 > 2) {
          _file.status = "error";
          _file.response = "Max file size is 2 Mb";
          _file.error = true;
          return _file;
        }

        if (isImage(_file) || (_file.type && isAllowedExtension(_file.type))) {
          _file.url = (await toBase64(_file.originFileObj)) as string;
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
    <div className="jdn__reportProblem">
      <Tooltip title="Report a problem" placement="bottomRight" align={{ offset: [12, 0] }}>
        <Button
          onClick={showModal}
          type="link"
          loading={serverPingInProcess}
          className="ant-btn ant-btn-link ant-btn-icon-only"
          icon={<Warning size={14} color="#8C8C8C" />}
        ></Button>
      </Tooltip>
      {isModalOpen ? (
        <DialogWithForm
          modalProps={{
            title: "Report a problem",
            open: isModalOpen,
            onOk: handleOk,
            setIsModalOpen,
            cancelCallback: () => setFileList([]),
            className: "jdn__reportProblem_modal",
          }}
          formProps={{
            form,
          }}
        >
          <Form.Item
            label="E-mail"
            name="from"
            rules={[
              {
                required: true,
                message: ValidationErrorType.EmptyValue,
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
          <Form.Item
            name="upload"
            label="Upload"
            valuePropName="upload"
            getValueFromEvent={normFile}
            extra={
              <React.Fragment>
                Extensions: image/*, *.zip, *.rar, *.json, *.txt<br />
                File size maximum 2Mb, 10 files in total, total size
                maximum 10Mb
              </React.Fragment>
            }
          >
            <Upload name="attachments" onChange={handleUploadChange} {...{ fileList }}>
              <Button
                icon={
                  <span role="img" className="anticon anticon-upload">
                    <UploadSimple />
                  </span>
                }
              >
                Upload
              </Button>
            </Upload>
          </Form.Item>
        </DialogWithForm>
      ) : null}
    </div>
  );
};
