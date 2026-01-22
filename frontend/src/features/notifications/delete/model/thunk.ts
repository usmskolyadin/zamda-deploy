import { createAsyncThunk } from "@reduxjs/toolkit";
import { notificationsApi } from "@/src/shared/api/notifications";

export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id: number) => {
    await notificationsApi.delete(id);
    return id;
  }
);
