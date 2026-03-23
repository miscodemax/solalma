"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface Props {
  expiresAt: string; // ISO string
}

function getTimeLeft(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);
  return { h, m, s, totalMs: diff };
}

export default function PromoCountdown({ expiresAt }: Props) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(expiresAt));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(expiresAt));
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  if (!timeLeft)
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
        Offre expirée
      </span>
    );

  const isUrgent = timeLeft.totalMs < 3_600_000; // < 1h

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black border ${
        isUrgent
          ? "bg-red-500 text-white border-red-600 animate-pulse shadow-lg shadow-red-500/30"
          : "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800"
      }`}
    >
      <Clock size={11} />
      <span className="tabular-nums">
        {timeLeft.h > 0 && `${timeLeft.h}h `}
        {String(timeLeft.m).padStart(2, "0")}m{" "}
        {String(timeLeft.s).padStart(2, "0")}s
      </span>
      {isUrgent && <span className="ml-0.5">⚡</span>}
    </div>
  );
}
