import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../../types/User";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";
import { backPort } from "@/shared/const/back";
interface LoginArgs {
  email: string;
  password: string;
}

export const loginUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  LoginArgs,
  { rejectValue: string }
>("user/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const mutation = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          user {
            id
            firstName
            lastName
            email
            roles
          }
          accessToken
          refreshToken
        }
      }
    `;

    const response = await fetch(backPort, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: mutation,
        variables: credentials,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return rejectWithValue(errorText || "Server returned an error");
    }

    let json;
    try {
      json = await response.json();
    } catch (parseError) {
      return rejectWithValue(
        "Received an empty or invalid JSON response from the server"
      );
    }

    if (json.errors && json.errors.length > 0) {
      return rejectWithValue(json.errors[0].message);
    }

    const loginData = json.data.login;

    // Store tokens
    localStorage.setItem(aToken, loginData.accessToken);
    Cookies.set(rToken, loginData.refreshToken, {
      secure: true,
      sameSite: "strict",
      expires: 7,
    });

    return loginData;
  } catch (err: any) {
    return rejectWithValue(err.message || "Login failed");
  }
});
