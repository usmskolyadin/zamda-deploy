import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { setNotifications } from "./slice";

export const initNotifications = createAsyncThunk(
  "notifications/init",
  async (_, { dispatch }) => {
    const data = await apiFetchAuth("/api/notifications/");

    const items = Array.isArray(data)
      ? data
      : data.results;

    dispatch(setNotifications(items));
  }
);
