import { copyToClipboard } from "../../../common/utils/copyToClipboard";

describe("copyToClipboard", () => {
  const clipboardMock = {
    writeText: jest.fn(() => Promise.resolve()),
  };

  beforeAll(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: clipboardMock,
    });
  });

  afterEach(() => {
    clipboardMock.writeText.mockClear();
  });

  it("should copy a string value to the clipboard", async () => {
    const value = "Test Value";
    await copyToClipboard(value);

    expect(clipboardMock.writeText).toHaveBeenCalledWith(value);
  });

  it("should copy an array of strings to the clipboard", async () => {
    const value = ["Line 1", "Line 2", "Line 3"];
    const expectedValue = value.join("\n");
    await copyToClipboard(value);

    expect(clipboardMock.writeText).toHaveBeenCalledWith(expectedValue);
  });

  it("should handle clipboard write error and use deprecatedCopyToClipboard", async () => {
    const value = "Test Value";
    clipboardMock.writeText.mockRejectedValue("Clipboard Error");
    global.console.warn = jest.fn();

    await copyToClipboard(value);

    expect(clipboardMock.writeText).toHaveBeenCalledWith(value);
    expect(global.console.warn).toHaveBeenCalledWith("Error copying text to clipboard:", "Clipboard Error");
  });
});
