import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserSchema } from "../types/UserSchema";
import { User } from "../types/User";
import Cookies from "js-cookie";
import { accessToken, refreshToken } from "@/shared/const/token";
import { initAuthData } from "../services/initAuthData/initAuthData";
import { loginUser } from "../services/loginUser/loginUser";
import { registerUser } from "../services/registerUser/registerUser";

const initialState: UserSchema = {
  user: null,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
    logoutUser(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem(accessToken);
      Cookies.remove(refreshToken);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to login";
      })
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to register";
      })
      .addCase(initAuthData.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(initAuthData.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(initAuthData.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to initialize authentication";
      });
  },
});

export const { actions: userActions, reducer: userReducer } = userSlice;
