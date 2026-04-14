import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { markAllAsRead, setNotifications } from "./slice";

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

export const markAllNotificationsRead = createAsyncThunk(
  "notifications/markAllRead",
  async (_, { dispatch }) => {
    await apiFetchAuth("/api/notifications/read_all/", {
      method: "POST",
    });

    dispatch(markAllAsRead());
  }
);