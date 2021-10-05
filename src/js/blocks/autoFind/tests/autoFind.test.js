import React from "react";
import { AutoFindProvider, autoFindStatus, useAutoFind } from "../autoFindProvider/AutoFindProvider";

import { act } from "react-dom/test-utils";
import { render, unmountComponentAtNode } from "react-dom";
import * as pageDataHandlers from "../utils/pageDataHandlers";
import { connector } from "../utils/connector";
import {
  abovePerception,
  generationData,
  interactedGenerationData,
  mockResponseData,
  perceptiontreshold,
  perceptiontresholdLow,
  predictedAfterInteraction,
  updatedElements,
} from "./mockedData";

/* global jest*/

const MainModel = {};

describe("AutoFind Identify functionality", () => {
  let container;

  const TestComponent = () => {
    const [
      { status, predictedElements, pageElements, availableForGeneration },
      { identifyElements, onChangePerception },
    ] = useAutoFind();

    return (
      <React.Fragment>
        <button id="identify" onClick={identifyElements}></button>
        <button id="perception" onClick={() => onChangePerception(perceptiontreshold)}></button>
        <button id="perceptionLow" onClick={() => onChangePerception(perceptiontresholdLow)}></button>
        <div id="status">{status}</div>
        <div id="predictedElements">{JSON.stringify(predictedElements)}</div>
        <div id="pageElements">{pageElements}</div>
        <div id="availableForGeneration">{JSON.stringify(availableForGeneration)}</div>
      </React.Fragment>
    );
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);

    render(
        <AutoFindProvider mainModel={MainModel}>
          <TestComponent></TestComponent>
        </AutoFindProvider>,
        container
    );

    jest.clearAllMocks();
    jest.spyOn(connector, "getTab").mockReturnValue(
        (() => {
          connector.tab = { id: "42" };
        })()
    );
    jest.spyOn(pageDataHandlers, "getElements").mockImplementation((callback) => callback([mockResponseData, 234]));
    jest
        .spyOn(pageDataHandlers, "highlightElements")
        .mockImplementation((arg1, successCallback, arg3) => successCallback());
    jest
        .spyOn(pageDataHandlers, "requestGenerationData")
        .mockImplementation((elements, {}, callback) => callback({ generationData, unreachableNodes: [] }));
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  test("predicted elements are received, updated properly and passed to component", async () => {
    const button = container.querySelector("#identify");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#status").textContent).toBe(autoFindStatus.success);
    expect(container.querySelector("#pageElements").textContent).toBe("234");
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(updatedElements));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(JSON.stringify(generationData));
  });

  test("elements under perception treshold are unavailable at first call", async () => {
    const perception = container.querySelector("#perception");
    perception.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    const identify = container.querySelector("#identify");
    await act(async () => {
      identify.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(updatedElements));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(JSON.stringify(abovePerception));
  });

  test("elements under perception treshold are unavailable after change", async () => {
    const identify = container.querySelector("#identify");
    await act(async () => {
      identify.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const perception = container.querySelector("#perception");
    act(() => {
      perception.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(updatedElements));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(JSON.stringify(abovePerception));
  });

  test("elements are available after change treshold to lower", async () => {
    const perception = container.querySelector("#perception");
    act(() => {
      perception.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    const identify = container.querySelector("#identify");
    await act(async () => {
      identify.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(updatedElements));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(JSON.stringify(abovePerception));
    const perceptionLow = container.querySelector("#perceptionLow");
    act(() => {
      perceptionLow.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(updatedElements));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(JSON.stringify(generationData));
  });

  test("toggled and hidden elements are unavailable for generation", async () => {
    jest
        .spyOn(pageDataHandlers, "getElements")
        .mockImplementation((callback) => callback([predictedAfterInteraction, 234]));
    const button = container.querySelector("#identify");
    await act(async () => {
      button.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.querySelector("#status").textContent).toBe(autoFindStatus.success);
    expect(container.querySelector("#predictedElements").textContent).toBe(JSON.stringify(predictedAfterInteraction));
    expect(container.querySelector("#availableForGeneration").textContent).toBe(
        JSON.stringify(interactedGenerationData)
    );
  });
});
