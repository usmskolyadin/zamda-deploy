"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/src/shared/lib/store";
import { DeleteNotificationButton } from "@/src/features/notifications/delete/ui/DeleteNotificationButton";

export function NotificationsList() {
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );

  if (!notifications.length)
    return <p className="text-black text-lg">No notifications</p>;

  return (
    <div className="flex flex-col gap-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start justify-between bg-gray-100 p-4 rounded-xl gap-3 min-w-0"
        >
          <div className="flex-1 min-w-0">
            <div className="flex justify-between gap-2 min-w-0">
              <h3 className="font-bold text-black truncate">
                {n.title}
              </h3>
            </div>

            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
              {n.message}
            </p>
          </div>

          <div className="flex-shrink-0">
            <DeleteNotificationButton id={n.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
