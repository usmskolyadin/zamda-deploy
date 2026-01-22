import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsState {
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications(state, action: PayloadAction<Notification[]>) {
      state.items = action.payload;
    },

    destroyNotification(state, action: PayloadAction<number>) {
      state.items = state.items.filter(
        (notification) => notification.id !== action.payload
      );
    },

    markAsRead(state, action: PayloadAction<number>) {
      const notification = state.items.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.is_read = true;
      }
    },
  },
});

export const { setNotifications, destroyNotification, markAsRead } =
  notificationsSlice.actions;

export const notificationsReducer = notificationsSlice.reducer;
