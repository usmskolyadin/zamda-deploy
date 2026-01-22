import { configureStore } from "@reduxjs/toolkit";
import { notificationsReducer } from "@/src/features/notifications/delete/model/slice";

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer, // ← ключ важен
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
