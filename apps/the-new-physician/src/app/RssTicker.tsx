"use client";

import { useEffect, useState } from "react";

export default function RssTicker() {
  const [latestArticle, setLatestArticle] = useState<{ title: string; link: string; readTime?: number } | null>(null);

  useEffect(() => {
    async function loadRss() {
      try {
        const rssUrl = "https://medium.com/feed/@saggarsonny";
        const proxyUrl = "https://api.rss2json.com/v1/api.json?rss_url=";
        const res = await fetch(proxyUrl + encodeURIComponent(rssUrl));
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
          const item = data.items[0];
          const textContent = item.content.replace(/<[^>]+>/g, ""); // Strip HTML
          const words = textContent.split(/\s+/).length;
          const readTime = Math.ceil(words / 200);

          setLatestArticle({
            title: item.title,
            link: item.link,
            readTime: readTime,
          });
        }
      } catch (e) {
        console.error("Ticker fetch error", e);
      }
    }
    loadRss();
  }, []);

  if (!latestArticle) return null;

  return (
    <a
      href={latestArticle.link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 max-w-[350px] bg-[#0a0a0a]/85 backdrop-blur-md border border-[#D4AF37]/30 px-5 py-3 rounded-xl text-white text-sm font-medium shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:border-[#D4AF37] transition-all duration-300"
    >
      <span className="bg-[#D4AF37] text-black font-bold text-xs px-2 py-1 rounded tracking-wider">
        LATEST
      </span>
      <span className="truncate whitespace-nowrap overflow-hidden">
        {latestArticle.title}
      </span>
      {latestArticle.readTime && (
        <span className="opacity-60 text-xs ml-2 whitespace-nowrap">
          {latestArticle.readTime} Min Read
        </span>
      )}
    </a>
  );
}
