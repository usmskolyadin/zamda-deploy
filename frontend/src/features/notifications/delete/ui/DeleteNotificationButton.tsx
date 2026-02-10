"use client";
import { useDispatch } from "react-redux";
import { deleteNotification } from "../model/thunk";
import { destroyNotification } from "../model/slice"; // редьюсер
import { AppDispatch } from "@/src/shared/lib/store";
import { TrashIcon } from "lucide-react";

export function DeleteNotificationButton({ id }: { id: number }) {
  const dispatch = useDispatch<AppDispatch>();

  const handleDelete = async () => {
    try {
      await dispatch(deleteNotification(id)).unwrap(); 
      dispatch(destroyNotification(id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="cursor-pointer text-red-500 text-sm hover:underline"
    >
      <TrashIcon />
    </button>
  );
}
