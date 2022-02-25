import React from "react";
import { Provider } from "react-redux";
import { render, unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import { PageObjList } from "../../components/pageObjectPage/pageObjList";
import { store } from "../../store/store";
import { jest } from "@jest/globals";

xdescribe("application launch", () => {
  let container = null;

  const TestComponent = () => (
    <Provider {...{ store }}>
      <PageObjList />
    </Provider>
  );

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    jest.mock("@ant-design/icons");
  });

  afterEach(() => {
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test("placeholder is shown for empty PO list", () => {
    act(() => {
      render(<TestComponent />, container);
    });
    expect(container.textContent).toContain("There are no created page objects.");
  });
});
