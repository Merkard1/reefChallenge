/// <reference types="vitest" />

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { loginUser } from "./loginUser"; // Adjust path as needed.
import { backPort } from "@/shared/const/back";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";
import Cookies from "js-cookie";

// Properly mock js‑cookie.
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

describe("loginUser thunk", () => {
  let dispatch: any;
  let getState: any;
  let localStorageSetItem: Mock;
  let localStorageGetItem: Mock;

  beforeEach(() => {
    dispatch = vi.fn();
    getState = vi.fn();

    // Stub global.fetch.
    global.fetch = vi.fn();

    // Stub localStorage.
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
    } as any;
    localStorageGetItem = global.localStorage.getItem as Mock;
    localStorageSetItem = global.localStorage.setItem as Mock;

    // No need to reassign Cookies.set manually if the mock is set up correctly.
    vi.clearAllMocks();
  });

  it("should successfully login and store tokens", async () => {
    const credentials = { email: "user@example.com", password: "password123" };

    const fakeUser = {
      id: "1", // User IDs as strings.
      firstName: "John",
      lastName: "Doe",
      email: "user@example.com",
      roles: ["USER"],
    };

    const fakeLoginData = {
      user: fakeUser,
      accessToken: "access123",
      refreshToken: "refresh123",
    };

    // Simulate a successful fetch response.
    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: { login: fakeLoginData } }),
    });

    const action = await loginUser(credentials)(dispatch, getState, undefined);

    expect(action.type).toContain("/fulfilled");
    expect(action.payload).toEqual(fakeLoginData);

    // Verify that tokens are stored.
    expect(localStorageSetItem).toHaveBeenCalledWith(
      aToken,
      fakeLoginData.accessToken
    );
    expect(Cookies.set).toHaveBeenCalledWith(
      rToken,
      fakeLoginData.refreshToken,
      {
        secure: true,
        sameSite: "strict",
        expires: 7,
      }
    );

    // Verify the fetch call.
    const [url, options] = (global.fetch as unknown as Mock).mock.calls[0];
    expect(url).toEqual(backPort);
    expect(options.method).toBe("POST");
    expect(options.credentials).toBe("include");
    const body = JSON.parse(options.body);
    expect(body.query).toContain("mutation Login");
    expect(body.variables).toEqual(credentials);
  });

  // Additional tests for rejected cases…
  it("should reject if response is not ok", async () => {
    const credentials = { email: "user@example.com", password: "password123" };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: false,
      text: async () => "Server error",
    });

    const action = await loginUser(credentials)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Server error");
  });

  it("should reject if response JSON parsing fails", async () => {
    const credentials = { email: "user@example.com", password: "password123" };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => {
        throw new Error("Invalid JSON");
      },
    });

    const action = await loginUser(credentials)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual(
      "Received an empty or invalid JSON response from the server"
    );
  });

  it("should reject if JSON contains errors", async () => {
    const credentials = { email: "user@example.com", password: "password123" };

    (global.fetch as unknown as Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        errors: [{ message: "Invalid credentials" }],
      }),
    });

    const action = await loginUser(credentials)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Invalid credentials");
  });

  it("should reject if fetch throws an exception", async () => {
    const credentials = { email: "user@example.com", password: "password123" };

    (global.fetch as unknown as Mock).mockRejectedValue(
      new Error("Network error")
    );

    const action = await loginUser(credentials)(dispatch, getState, undefined);

    expect(action.type).toContain("/rejected");
    expect(action.payload).toEqual("Network error");
  });
});
