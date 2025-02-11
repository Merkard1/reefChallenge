import { createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { backPort } from "@/shared/const/back";
import {
  accessToken as aToken,
  refreshToken as rToken,
} from "@/shared/const/token";
import { User, userActions } from "@/entities/User";
import { attemptRefresh } from "../../api/attemptRefresh";

export const initAuthData = createAsyncThunk<
  User | null,
  void,
  { rejectValue: string }
>("user/initAuthData", async (_, { dispatch, rejectWithValue }) => {
  try {
    let storedAccessToken = localStorage.getItem(aToken);

    if (!storedAccessToken) {
      const storedRefreshToken = Cookies.get(rToken);
      if (storedRefreshToken) {
        const refreshOk = await attemptRefresh();
        if (!refreshOk) {
          dispatch(userActions.logoutUser());
          return null;
        }
        storedAccessToken = localStorage.getItem(aToken);
      } else {
        return null;
      }
    }

    const meQuery = `
      query Me {
        me {
          id
          firstName
          lastName
          email
          roles
        }
      }
    `;

    let response = await fetch(backPort, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${storedAccessToken}`,
      },
      credentials: "include",
      body: JSON.stringify({ query: meQuery }),
    });

    if (response.status === 401) {
      const refreshOk = await attemptRefresh();
      if (!refreshOk) {
        dispatch(userActions.logoutUser());
        return null;
      }
      const newAccessToken = localStorage.getItem(aToken);
      response = await fetch(backPort, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
        },
        credentials: "include",
        body: JSON.stringify({ query: meQuery }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to fetch user");
    }

    const meJson = await response.json();
    if (meJson.errors && meJson.errors.length > 0) {
      throw new Error(meJson.errors[0].message);
    }

    const user = meJson.data?.me;
    if (!user) {
      dispatch(userActions.logoutUser());
      return null;
    }

    dispatch(userActions.setUser(user));
    return user;
  } catch (err: any) {
    dispatch(userActions.logoutUser());
    return rejectWithValue(err.message);
  }
});
