import { UploadFile } from "antd";
import { RcFile } from "antd/lib/upload";

export const toBase64 = (file: RcFile): Promise<string | ArrayBuffer | null> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

export const isImage = (file: UploadFile) => file["type"]?.includes("image");

export const allowedExtensions = ["zip", "json", "txt", "image/", "text/plain"];

export const isAllowedExtension = (type: string) => !!allowedExtensions.find((extension) => type.includes(extension));

export const MAX_COUNT_FILES = 10;
