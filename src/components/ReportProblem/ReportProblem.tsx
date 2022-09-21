import { Form, Modal, UploadFile } from "antd";
import React, { useState } from "react";
import { HttpEndpoint, request } from "../../services/backend";
import { ReportProblemForm } from "./ReportProblemForm";


export interface FormProps {
  body: string;
  from: string;
  upload?: UploadFile[];
}

export const ReportProblem = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm<FormProps>();

  const showModal = () => {
    setIsModalOpen(true);
  };

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
          failedUploadFile?.scrollIntoView({behavior: "smooth"});
        });
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const sendReport = (values: FormProps) => {
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
        {isModalOpen ? <ReportProblemForm {...{ form }} /> : null}
      </Modal>
    </div>
  );
};
