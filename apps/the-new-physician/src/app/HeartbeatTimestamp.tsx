"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function HeartbeatTimestamp() {
  const [time, setTime] = useState("");
  const [connections, setConnections] = useState(142);

  useEffect(() => {
    setTime(new Date().toISOString().split("T")[1].split(".")[0] + " UTC");
    const interval = setInterval(() => {
      setTime(new Date().toISOString().split("T")[1].split(".")[0] + " UTC");
      // Occasionally fluctuate connections
      if (Math.random() > 0.7) {
        setConnections(prev => prev + Math.floor(Math.random() * 5) - 2);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className="flex items-center gap-2 text-xs font-mono opacity-60">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
      Global Node Status: Active | Last Sync: {time} | Active Connections: {connections}
    </div>
  );
}
