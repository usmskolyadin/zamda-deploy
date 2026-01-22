"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/src/shared/lib/store";
import { DeleteNotificationButton } from "@/src/features/notifications/delete/ui/DeleteNotificationButton";

export function NotificationsList() {
  const notifications = useSelector(
    (state: RootState) => state.notifications.items
  );

  if (!notifications.length) return <p className="text-black text-lg">No notifications</p>;


  return (
    <div className="flex flex-col gap-4">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start justify-between bg-gray-100 p-4 rounded-xl"
        >
          <div className="flex-1 mr-4 break-words break-all">
            <div className="flex justify-between">
              <h3 className="font-bold text-black break-words break-all">{n.title}</h3>
            </div>
            <p className="text-sm text-gray-900 break-words break-all">
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
