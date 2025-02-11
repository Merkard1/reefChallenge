import Cookies from "js-cookie";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { User } from "../../types/User";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";
import { backPort } from "@/shared/const/back";

interface RegisterArgs {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export const registerUser = createAsyncThunk<
  { user: User; accessToken: string; refreshToken: string },
  RegisterArgs,
  { rejectValue: string }
>("user/registerUser", async (credentials, { rejectWithValue }) => {
  try {
    const mutation = `
      mutation Register(
        $firstName: String!, 
        $lastName: String!, 
        $email: String!, 
        $password: String!
      ) {
        register(
          firstName: $firstName, 
          lastName: $lastName, 
          email: $email, 
          password: $password
        ) {
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

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      return rejectWithValue(json.errors[0].message);
    }

    const registerData = json.data.register;

    // Store tokens
    localStorage.setItem(aToken, registerData.accessToken);
    Cookies.set(rToken, registerData.refreshToken, {
      secure: true,
      sameSite: "strict",
      expires: 7,
    });

    return registerData;
  } catch (err: any) {
    return rejectWithValue(err.message || "Registration failed");
  }
});
