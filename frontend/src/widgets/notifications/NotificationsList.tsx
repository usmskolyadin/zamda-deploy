"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FaBell, FaCheckCircle } from "react-icons/fa";

import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";

import {
  setNotifications,
  markAllAsRead,
} from "@/src/features/notifications/delete/model/slice";
import { useAppDispatch, useAppSelector } from "@/src/shared/lib/hooks";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleString([], {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function NotificationsList() {
  const { accessToken } = useAuth();
  const dispatch = useAppDispatch();

  const items = useAppSelector(
    (state) => state.notifications.items
  );

  // INIT LOAD
  useEffect(() => {
    if (!accessToken) return;

    (async () => {
      try {
        const data = await apiFetchAuth<any>(
          "/api/notifications/",
          accessToken
        );

        dispatch(setNotifications(data.results ?? data));
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    })();
  }, [accessToken, dispatch]);

  // MARK ALL READ
  const handleMarkAllRead = async () => {
    try {
      await apiFetchAuth("/api/notifications/read_all/", {
        method: "POST",
      });

      dispatch(markAllAsRead());
    } catch (err) {
      console.error("Failed to mark all read", err);
    }
  };

  if (!items.length) {
    return (
      <div className="text-gray-500">
        No notifications
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      <button
        onClick={handleMarkAllRead}
        className="text-sm hover:underline cursor-pointer text-blue-600 mb-2 self-end"
      >
        Mark all as read
      </button>

      {items.map((n) => (
        <Link
          key={n.id}
          href={`/notifications/${n.id}`}
          className="block"
        >
          <div
            className={`
              flex items-start justify-between gap-4
              rounded-2xl p-4
              border transition shadow-sm
              ${
                n.is_read
                  ? "bg-gray-100 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }
              hover:bg-gray-200
            `}
          >
            {/* LEFT */}
            <div className="flex gap-3 min-w-0">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${
                    n.is_read
                      ? "bg-gray-200"
                      : "bg-blue-100"
                  }
                `}
              >
                <FaBell
                  className={
                    n.is_read
                      ? "text-gray-500"
                      : "text-blue-600"
                  }
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-black font-semibold truncate">
                    {n.title}
                  </h3>

                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                  )}
                </div>

                <p className="text-gray-600 text-sm truncate">
                  {n.message}
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col items-end gap-2 shrink-0">
              <span className="text-[11px] text-gray-400">
                {formatDate(n.created_at)}
              </span>

              {n.is_read && (
                <FaCheckCircle className="text-green-500 text-sm" />
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}