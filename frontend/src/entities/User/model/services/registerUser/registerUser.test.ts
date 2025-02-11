import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { registerUser } from "./registerUser";
import { backPort } from "@/shared/const/back";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";
import Cookies from "js-cookie";

vi.spyOn(Cookies, "set");

describe("registerUser thunk", () => {
  let dispatch: any;
  let getState: any;
  let localStorageSetItem: Mock;
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
    localStorageSetItem = global.localStorage.setItem as Mock;

    vi.clearAllMocks();
  });

  it("should successfully register a user and store tokens", async () => {
    const credentials = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    const fakeUser = {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      roles: ["USER"],
    };

    const fakeRegisterData = {
      user: fakeUser,
      accessToken: "access123",
      refreshToken: "refresh123",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { register: fakeRegisterData } }),
    });

    const action = await registerUser(credentials)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeRegisterData);

    expect(localStorageSetItem).toHaveBeenCalledWith(
      aToken,
      fakeRegisterData.accessToken
    );
    expect(Cookies.set).toHaveBeenCalledWith(
      rToken,
      fakeRegisterData.refreshToken,
      {
        secure: true,
        sameSite: "strict",
        expires: 7,
      }
    );

    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toEqual(backPort);
    expect(options.method).toEqual("POST");
    expect(options.credentials).toEqual("include");
    const body = JSON.parse(options.body);
    expect(body.query).toContain("mutation Register");
    expect(body.variables).toEqual(credentials);
  });

  it("should reject if response is not ok", async () => {
    const credentials = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => "Server error",
    });

    const action = await registerUser(credentials)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Server error");
  });

  it("should reject if JSON contains errors", async () => {
    const credentials = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: "GraphQL error occurred" }],
      }),
    });

    const action = await registerUser(credentials)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("GraphQL error occurred");
  });

  it("should reject if fetch throws an exception", async () => {
    const credentials = {
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      password: "password123",
    };

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const action = await registerUser(credentials)(
      dispatch,
      getState,
      undefined
    );

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error");
  });
});
