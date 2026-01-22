import { RootState } from "@/src/shared/lib/store";

export const selectNotifications = (state: RootState) =>
  state.notifications.items;
