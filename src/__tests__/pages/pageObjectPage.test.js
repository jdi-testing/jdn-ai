import React from "react";
import "@testing-library/jest-dom";

import { cleanup, render, screen, waitForElementToBeRemoved } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { jest } from "@jest/globals";

import { store } from "../../store/store";
import { PageObjList } from "../../components/PageObjects/PageObjList";
import * as pageObject from "../../services/pageObject";

describe("application launch", () => {
  const TestComponent = () => (
    <Provider {...{ store }}>
      <PageObjList />
    </Provider>
  );

  beforeAll(() => {
    jest.mock("@ant-design/icons");
    jest.spyOn(pageObject, "getPageAttributes").mockImplementation(() => [
      {
        result: {
          title: "HomePage",
          url: "https://jdi-testing.github.io/jdi-light/contacts.html",
        },
      },
    ]);
  });

  afterEach(() => cleanup());

  test("renders properly for empty PO list", () => {
    const { container } = render(<TestComponent />);
    expect(container).toMatchSnapshot();
  });

  test("new PO is added by clicking button", async () => {
    render(<TestComponent />);
    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByRole("button"));
    await waitForElementToBeRemoved(() => screen.getByText("There are no created page objects."));
    const items = await screen.findAllByText(/HomePage/);
    expect(items).toHaveLength(2);
  });
});
