"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { Trash2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  onDelete: () => Promise<void> | void;
}

export default function SwipeChatItem({ children, onDelete }: Props) {
  const x = useMotionValue(0);
  const deletingRef = useRef(false);

  const reset = () => {
    animate(x, 0, {
      type: "spring",
      stiffness: 500,
      damping: 40,
    });
  };

  const handleDelete = async () => {
    try {
      await onDelete();
    } finally {
      deletingRef.current = false;
      reset();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mt-3">
      {/* RED BACKGROUND */}
      <div className="absolute inset-1 rounded-2xl bg-red-600 flex items-center justify-end pr-5">
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <Trash2 size={16} />
          Delete
        </div>
      </div>

      {/* SWIPEABLE ITEM */}
      <motion.div
        drag="x"
        style={{ x }}
        dragConstraints={{ left: -140, right: 0 }}
        dragElastic={0.08}
        onDragEnd={(_, info) => {
          if (deletingRef.current) return;

          const shouldDelete = info.offset.x < -110;

          if (shouldDelete) {
            deletingRef.current = true;

            animate(x, -300, {
              duration: 0.2,
              onComplete: handleDelete,
            });
          } else {
            reset();
          }
        }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}