import { apiFetchAuth } from "./auth";

export const notificationsApi = {
  fetchAll: async () => {
    const res = await apiFetchAuth("/api/notifications/");
    return res.results;
  },

  delete: async (id: number) => {
    await apiFetchAuth(`/api/notifications/${id}/`, {
      method: "DELETE",
    });
  },
};
