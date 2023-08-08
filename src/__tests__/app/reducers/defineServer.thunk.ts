import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import { defineServer } from "../../../app/reducers/defineServer.thunk";
import { request } from "../../../services/backend";

const middlewares = [thunk];

jest.mock("../../../app/utils/compatibleVersions");

describe("defineServer", () => {
  const mockStore = configureMockStore(middlewares);

  const cleanActions = (actions: any[]) =>
    actions.map((action) => {
      // eslint-disable-next-line
      const { meta, ...rest } = action;
      return rest;
    });

  const cleanErroredActions = (actions: any[]) =>
    actions.map((action) => {
      // eslint-disable-next-line
      const { meta, payload, error, ...rest } = action;
      // eslint-disable-next-line
      const { stack, name, ...restError } = error || {};
      return { ...rest, ...(error && Object.entries(error) ? { error: restError } : {}) };
    });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("dispatches the correct actions for ver. 0.2.37 with local server", async () => {
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    jest
      .spyOn(request, "get")
      .mockImplementationOnce(() => Promise.resolve({ data: "0.2.37", config: { baseURL: "http://localhost:5050" } }));

    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/fulfilled",
        payload: {
          data: "0.2.37",
          config: { baseURL: "http://localhost:5050" },
        },
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanActions(store.getActions())).toEqual(expectedActions);
  });

  test("dispatches the correct actions for ver. 0.2.37 with remote server", async () => {
    jest
      .spyOn(request, "get")
      .mockImplementationOnce(() =>
        Promise.resolve({ data: "0.2.37", config: { baseURL: "http://10.253.219.156:80" } })
      );
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));

    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/fulfilled",
        payload: {
          data: "0.2.37",
          config: { baseURL: "http://10.253.219.156:80" },
        },
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanActions(store.getActions())).toEqual(expectedActions);
  });

  test("dispatches error when remote build ver is 0.2.100 (higher than compatible)", async () => {
    jest
      .spyOn(request, "get")
      .mockImplementationOnce(() =>
        Promise.resolve({ data: "0.2.100", config: { baseURL: "http://10.253.219.156:80" } })
      );
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/fulfilled",
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanErroredActions(store.getActions())).toEqual(expectedActions);
  });

  test("dispatches error when local ver is 0.2.20 (lower than compatible)", async () => {
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    jest
      .spyOn(request, "get")
      .mockImplementationOnce(() => Promise.resolve({ data: "0.2.20", config: { baseURL: "http://localhost:5050" } }));
    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/rejected",
        error: { message: "Local server version need to be updated." },
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanErroredActions(store.getActions())).toEqual(expectedActions);
  });

  test("dispatches error when local ver is 0.3.50 (higher than compatible)", async () => {
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    jest
      .spyOn(request, "get")
      .mockImplementationOnce(() => Promise.resolve({ data: "0.3.50", config: { baseURL: "http://localhost:5050" } }));
    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/rejected",
        error: { message: "Plugin version need to be updated." },
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanErroredActions(store.getActions())).toEqual(expectedActions);
  });

  test("dispatches network error when can't get any of versions", async () => {
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    jest.spyOn(request, "get").mockImplementationOnce(() => Promise.reject({}));
    const expectedActions = [
      { type: "main/defineServer/pending" },
      {
        type: "main/defineServer/rejected",
        error: { message: "Access failed" },
      },
    ];
    const store = mockStore({});
    // @ts-ignore
    await store.dispatch(defineServer());
    expect(request.get).toHaveBeenCalledTimes(2); // Make sure the 'get' method is called twice
    expect(cleanErroredActions(store.getActions())).toEqual(expectedActions);
  });
});
