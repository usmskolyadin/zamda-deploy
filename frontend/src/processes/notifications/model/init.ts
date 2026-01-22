import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { setNotifications } from "@/src/features/notifications";

export const initNotifications = createAsyncThunk(
  "notifications/init",
  async (_, { dispatch }) => {
    const data = await apiFetchAuth("/api/notifications/");

    console.log("API notifications:", data);

    dispatch(setNotifications(data.results));
  }
);
