import React from "react";
import * as reactRedux from 'react-redux';
import "@testing-library/jest-dom";
import { jest } from "@jest/globals";
import { render, cleanup } from "@testing-library/react";

import { selectPageObjects } from "../../store/selectors/pageObjectSelectors";
import * as pageObjectSelectors from "../../store/selectors/pageObjectSelectors";
import * as pageObjects from "../__mocks__/pageObjects.mock.json";
import { PageObjList } from "../../components/PageObjects/PageObjList";
import { identificationStatus } from "../../utils/constants";

describe("pageObjectList component", () => {
  const useSelectorMock = jest.spyOn(reactRedux, "useSelector");
  const useDispatchMock = jest.spyOn(reactRedux, "useDispatch");

  const mockSelectors = (selector, store) => {
    if (selector === selectPageObjects) {
      return [pageObjects[0]];
    }
    return selector(store);
  };

  beforeEach(() => {
    useDispatchMock.mockImplementation(() => () => {});
    useSelectorMock.mockImplementation((selector) => mockSelectors(selector, mockStore));

    jest.spyOn(pageObjectSelectors, "selectConfirmedLocators").mockImplementation(() => []);
  });

  afterEach(() => {
    useDispatchMock.mockClear();
    useSelectorMock.mockClear();
    cleanup();
  });

  const mockStore = {
    main: {
      allowIdentifyElements: true,
    },
    pageObject: {
      currentPageObject: "1111",
    },
    locators: {
      status: identificationStatus.success,
      ids: [],
      entities: {},
    }
  };

  test("renders empty page object", () => {
    const { container } = render(<PageObjList />);
    expect(container).toMatchSnapshot();
  });
});
