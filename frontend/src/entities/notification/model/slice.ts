import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { Notification } from "./types";
import { notificationsApi } from "@/src/shared/api/notifications";

interface State {
  items: Notification[];
  loading: boolean;
}

const initialState: State = {
  items: [],
  loading: false,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetch",
  notificationsApi.fetchAll
);

const slice = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      });
  },
});

export const notificationReducer = slice.reducer;
