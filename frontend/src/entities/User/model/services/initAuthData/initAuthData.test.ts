import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { initAuthData } from "./initAuthData";
import { User, userActions } from "@/entities/User";
import Cookies from "js-cookie";
import { attemptRefresh } from "../../api/attemptRefresh";

vi.mock("js-cookie", async () => {
  const actual = await vi.importActual("js-cookie");
  return {
    __esModule: true,
    default: {
      ...actual,
      get: vi.fn(),
      set: vi.fn(),
    },
  };
});

vi.mock("../../api/attemptRefresh", () => ({
  attemptRefresh: vi.fn(),
}));

describe("initAuthData thunk", () => {
  let dispatch: any;
  let getState: any;
  let localStorageGetItem: Mock;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();
    global.fetch = vi.fn();
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as any;
    localStorageGetItem = global.localStorage.getItem as Mock;

    (Cookies.get as Mock).mockClear();
    (attemptRefresh as Mock).mockClear();
    vi.clearAllMocks();
  });

  it("should fetch user successfully when token is available", async () => {
    const fakeToken = "validToken";
    localStorageGetItem.mockReturnValue(fakeToken);

    const fakeUser = {
      id: "1",
      firstName: "Alice",
      lastName: "Wonder",
      email: "alice@example.com",
      roles: ["USER"],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ data: { me: fakeUser } }),
    });

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeUser);
    expect(dispatch).toHaveBeenCalledWith(
      userActions.setUser(fakeUser as User)
    );
  });

  it("should refresh token and fetch user if token is missing but refresh token exists", async () => {
    localStorageGetItem
      .mockReturnValueOnce(null)
      .mockReturnValueOnce("refreshedToken");
    (Cookies.get as Mock).mockReturnValue("refreshToken");

    (attemptRefresh as Mock).mockResolvedValue(true);

    const fakeUser = {
      id: "2",
      firstName: "Bob",
      lastName: "Builder",
      email: "bob@example.com",
      roles: ["ADMIN"],
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ data: { me: fakeUser } }),
    });

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(attemptRefresh).toHaveBeenCalledTimes(1);
    expect(localStorageGetItem).toHaveBeenCalledTimes(2);
    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeUser);
    expect(dispatch).toHaveBeenCalledWith(
      userActions.setUser(fakeUser as User)
    );
  });

  it("should return null if no token and no refresh token", async () => {
    localStorageGetItem.mockReturnValue(null);
    (Cookies.get as Mock).mockReturnValue(undefined);

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(action.payload).toBeNull();
    expect(dispatch).not.toHaveBeenCalledWith(userActions.logoutUser());
  });

  it("should dispatch logout and return null if token expired and refresh fails", async () => {
    const fakeToken = "validToken";
    localStorageGetItem.mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 401,
      ok: false,
      text: async () => "",
    });

    (attemptRefresh as Mock).mockResolvedValue(false);

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(attemptRefresh).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(userActions.logoutUser());
    expect(action.payload).toBeNull();
  });

  it("should refresh token and refetch user if initial fetch returns 401", async () => {
    const fakeToken = "oldToken";
    localStorageGetItem
      .mockReturnValueOnce(fakeToken)
      .mockReturnValueOnce("newToken");

    (global.fetch as unknown as Mock)
      .mockResolvedValueOnce({
        status: 401,
        ok: false,
        text: async () => "",
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: async () => ({
          data: {
            me: {
              id: "3",
              firstName: "Carol",
              lastName: "Danvers",
              email: "carol@example.com",
              roles: ["USER"],
            },
          },
        }),
      });

    (attemptRefresh as Mock).mockResolvedValue(true);

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(attemptRefresh).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(
      userActions.setUser({
        id: "3",
        firstName: "Carol",
        lastName: "Danvers",
        email: "carol@example.com",
        roles: ["USER"],
      })
    );
    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual({
      id: "3",
      firstName: "Carol",
      lastName: "Danvers",
      email: "carol@example.com",
      roles: ["USER"],
    });
  });

  it("should dispatch logout and reject if fetch returns non-ok response", async () => {
    const fakeToken = "validToken";
    localStorageGetItem.mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 400,
      ok: false,
      text: async () => "Bad Request",
    });

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(userActions.logoutUser());
    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Bad Request");
  });

  it("should dispatch logout and reject if JSON includes errors", async () => {
    const fakeToken = "validToken";
    localStorageGetItem.mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ errors: [{ message: "GraphQL error" }] }),
    });

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(userActions.logoutUser());
    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("GraphQL error");
  });

  it("should dispatch logout and return null if no user is returned", async () => {
    const fakeToken = "validToken";
    localStorageGetItem.mockReturnValue(fakeToken);

    (global.fetch as unknown as Mock).mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => ({ data: { me: null } }),
    });

    const action = await initAuthData()(dispatch, getState, undefined);

    expect(dispatch).toHaveBeenCalledWith(userActions.logoutUser());
    expect(action.payload).toBeNull();
  });
});
