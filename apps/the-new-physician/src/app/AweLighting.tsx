"use client";

import { useEffect, useState } from "react";

export default function AweLighting() {
  const [opacity, setOpacity] = useState(0.8);

  useEffect(() => {
    const hour = new Date().getHours();
    // Night time: 7 PM to 6 AM is 0.2 opacity. Daytime: 0.8 opacity.
    if (hour >= 19 || hour < 6) {
      setOpacity(0.2);
    } else {
      setOpacity(0.8);
    }
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat mix-blend-lighten pointer-events-none transition-opacity duration-1000" 
      style={{ backgroundImage: "url('/banner.png')", opacity }}
    ></div>
  );
}
