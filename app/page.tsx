// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { tournaments } from "@/data/tournaments";
import Countdown from "@/components/Countdown";
import { Bell, Menu, Search, Trophy } from "lucide-react";

export default function HomePage() {
  // flatten events
  const allEvents = tournaments.flatMap(g => g.events);

  const [index, setIndex] = useState(0);

  // auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % allEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [allEvents.length]);

  const event = allEvents[index];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">

      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        {/* Left: Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter italic">
            SPORTORA
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="text-slate-400 hover:text-white transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-slate-400 hover:text-white transition">
            <Bell className="w-5 h-5" />
          </button>
          <button className="md:hidden text-slate-400 hover:text-white transition">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* HERO */}
      <section
        className="relative flex-1 min-h-100 flex items-center justify-center overflow-hidden bg-center bg-cover transition-all duration-700 ease-in-out"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className={`absolute inset-0 bg-linear-to-t ${event.gradient || 'from-black to-transparent'}`} />

        {/* Content: Giữ nguyên logic cũ của bạn, thêm max-w-4xl để kiểm soát độ rộng */}
        <div className="relative z-10 text-center px-6 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 max-w-4xl w-full">
          <h2 className="text-4xl md:text-7xl font-black mb-4 drop-shadow-2xl tracking-tighter">
            {event.name}
          </h2>
          <span className="bg-white/10 backdrop-blur-md px-4 py-1 rounded-full text-sm font-medium border border-white/20 mb-8">
            {event.status}
          </span>

          {/* Đếm ngược: Bỏ div bao bọc có text-5xl không cần thiết để tránh xung đột */}
          <div className="flex justify-center w-full">
            <Countdown targetDate={event.date} />
          </div>

          {/* Nút xem chi tiết - Đặt sau Countdown */}
          <div className="mt-8">
            <a
              href={event.path}
              className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-blue-500 hover:text-white transition-all duration-300"
            >
              <Trophy className="w-4 h-4" />
              Xem chi tiết giải đấu
            </a>
          </div>
        </div>
      </section>

      {/* MINI LIST (scroll ngang) */}
      <section className="px-6 pb-6 flex justify-center">
        <div className="flex gap-4 overflow-x-auto no-scrollbar max-w-full">
          {allEvents.map((e, i) => (
            <div
              key={e.name}
              onClick={() => setIndex(i)}
              className={`min-w-55 p-4 rounded-xl border cursor-pointer transition ${i === index
                ? "bg-blue-500/20 border-blue-400"
                : "bg-slate-900 border-slate-800"
                }`}
            >
              <p className="text-sm font-semibold">{e.name}</p>
              <p className="text-xs text-slate-400">{e.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - Minimalist */}
      <footer className="px-6 py-8 border-t border-slate-900 bg-black">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-xs">

          {/* Thương hiệu & Bản quyền */}
          <p>© 2026 Sportora. Countdown to Greatness.</p>

          {/* Điều hướng nhanh */}
          <div className="flex gap-6">
            <span className="hover:text-white cursor-pointer transition">Lịch thi đấu</span>
            <span className="hover:text-white cursor-pointer transition">Giải đấu</span>
            <span className="hover:text-white cursor-pointer transition">Kết nối</span>
          </div>

        </div>
      </footer>
    </main>
  );
}
