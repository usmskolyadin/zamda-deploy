import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiFetchAuth } from "@/src/shared/api/auth";

export const deleteNotification = createAsyncThunk(
  "notifications/delete",
  async (id: number) => {
    const res = await apiFetchAuth(`/api/notifications/${id}/`, {
      method: "DELETE",
    });

    if (res instanceof Response) {
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
      }
    }

    return id;
  }
);