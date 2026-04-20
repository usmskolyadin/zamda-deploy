"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetchAuth } from "@/src/shared/api/auth";
import { useAuth } from "@/src/features/context/auth-context";
import Sidebar from "@/src/widgets/sidebar";
import { FaArrowLeft, FaBell } from "react-icons/fa";
import BackButton from "@/src/widgets/back-button";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { accessToken } = useAuth();
  const router = useRouter();

  const [notification, setNotification] = useState<Notification | null>(null);
  const [loading, setLoading] = useState(true);

  // LOAD NOTIFICATION
  useEffect(() => {
    if (!accessToken || !id) return;

    (async () => {
      try {
        const data = await apiFetchAuth<Notification>(
          `/api/notifications/${id}/`,
          accessToken
        );

        setNotification(data);
      } catch (err) {
        console.error("Failed to load notification", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [accessToken, id]);

  // MARK AS READ ON OPEN
  useEffect(() => {
    if (!accessToken || !id) return;

    (async () => {
      try {
        await apiFetchAuth(`/api/notifications/${id}/mark_read/`, {
          method: "POST",
        });

        setNotification((prev) =>
          prev ? { ...prev, is_read: true } : prev
        );
      } catch (err) {
        console.error("Failed to mark as read", err);
      }
    })();
  }, [accessToken, id]);

  if (!accessToken) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-black">Login required</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-black">Loading…</p>
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Notification not found</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <section className="min-h-screen flex">
        <div className="max-w-screen-xl mx-auto flex w-full px-4 sm:px-6 lg:px-12">

          <Sidebar />

          <div className="flex-1 lg:ml-24 p-4 lg:p-8">

            <div className="flex items-center gap-3 mb-6">

              <BackButton />

              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FaBell className="text-gray-600" />
              </div>

              <div>
                <h1 className="text-xl font-bold text-black">
                  {notification.title}
                </h1>

                <p className="text-xs text-gray-400">
                  {formatDate(notification.created_at)}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 shadow-sm">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {notification.message}
              </p>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Status:{" "}
              <span
                className={
                  notification.is_read ? "text-green-600" : "text-blue-600"
                }
              >
                {notification.is_read ? "Read" : "Unread"}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}