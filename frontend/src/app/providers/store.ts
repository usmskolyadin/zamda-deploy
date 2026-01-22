import { notificationsReducer } from "@/src/features/notifications";
import { configureStore } from "@reduxjs/toolkit";

export const store = configureStore({
  reducer: {
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
