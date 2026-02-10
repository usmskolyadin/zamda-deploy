"use client"
import Link from "next/link";
import Image from "next/image";
import { FaArrowRight, FaStar } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useAuth } from "@/src/features/context/auth-context";
import { apiFetchAuth } from "@/src/shared/api/auth";
import Sidebar from "@/src/widgets/sidebar";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/src/shared/lib/store";
import { initNotifications } from "@/src/features/notifications/delete/model/init";
import { NotificationsList } from "@/src/widgets/notifications/NotificationsList";

interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function Notifications() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initNotifications());
  }, [dispatch]);

  return (
    <div className=" w-full">
      <section className="bg-[#ffffff]  pb-16 p-4 min-h-screen">
        
        <div className="max-w-screen-xl lg:flex mx-auto">
          <Sidebar />
          <div className=" lg:w-3/4 lg:ml-24">
            <div className="lg:flex">
                <h1 className="w-2/3 text-black font-bold lg:text-4xl text-3xl lg:py-4 lg:py-1 py-4">Notifications</h1>
            </div>
                <div>
            </div>
            <div className="flex flex-col">
              <NotificationsList />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
