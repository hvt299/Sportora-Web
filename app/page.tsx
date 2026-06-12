"use client";

import { useEffect, useState, useMemo } from "react";
import { tournaments } from "@/data/tournaments";
import Countdown from "@/components/Countdown";
import {
  Bell,
  Menu,
  Search,
  Trophy,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { getTournamentLabel, getTournamentStatus } from "@/lib/tournament";

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [index, setIndex] = useState(0);

  // UseMemo giúp tính toán lại danh sách giải đấu
  const filteredEvents = useMemo(() => {
    let groups = tournaments;

    // 1. Lọc theo môn thể thao
    if (selectedSport !== "All") {
      groups = tournaments.filter((g) => g.category === selectedSport);
    }

    // 2. Lọc chặt chẽ thời gian (Chỉ lấy giải đấu TRONG VÒNG 6 THÁNG - cả quá khứ lẫn tương lai)
    return groups.flatMap((group) => group.events).filter((event) => {
      const now = new Date();

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const sixMonthsFuture = new Date();
      sixMonthsFuture.setMonth(now.getMonth() + 6);

      const startDate = new Date(event.startDate);
      // Nếu giải không có ngày kết thúc thì lấy luôn ngày bắt đầu làm chuẩn
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      // LOGIC CHUẨN: Ngày kết thúc không được cũ hơn 6 tháng trước VÀ Ngày bắt đầu không được xa hơn 6 tháng tới
      return endDate >= sixMonthsAgo && startDate <= sixMonthsFuture;
    });
  }, [selectedSport]);

  // Reset lại index về 0 mỗi khi người dùng đổi môn thể thao
  useEffect(() => {
    setIndex(0);
  }, [selectedSport]);

  // Tự động chuyển slide
  useEffect(() => {
    if (filteredEvents.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % filteredEvents.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [filteredEvents.length]);

  const prevEvent = () => {
    if (filteredEvents.length === 0) return;
    setIndex((prev) => (prev === 0 ? filteredEvents.length - 1 : prev - 1));
  };

  const nextEvent = () => {
    if (filteredEvents.length === 0) return;
    setIndex((prev) => (prev + 1) % filteredEvents.length);
  };

  const event = filteredEvents[index];

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-black/70 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4 max-w-350 mx-auto w-full">
          <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-black italic tracking-tighter">SPORTORA</h1>
          </a>

          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="md:hidden text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      {event ? (
        <section
          key={event.id}
          className="relative min-h-[calc(100vh-73px)] bg-center bg-cover overflow-hidden transition-all duration-700 animate-in fade-in zoom-in-95"
          style={{
            backgroundImage: `url(${event.image})`,
          }}
        >
          <div className={`absolute inset-0 bg-linear-to-t ${event.gradient}`} />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)]" />

          <div className="relative z-10 min-h-[calc(100vh-73px)] flex flex-col items-center justify-center px-6 py-16 pb-32">
            <div className="max-w-5xl mx-auto text-center">
              <div className="mb-4">
                <span className="px-4 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-xl text-xs uppercase tracking-[0.25em] font-bold">
                  {getTournamentLabel(event.startDate, event.endDate)}
                </span>
              </div>

              {/* Logo + Tiêu đề (Ép trên 1 dòng ở PC, thu nhỏ size chữ) */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 mb-6 w-full">
                {event.logo && (
                  <img src={event.logo} alt={event.shortName} className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain drop-shadow-2xl shrink-0" />
                )}
                <h2 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-black tracking-tighter drop-shadow-2xl text-center md:text-left md:whitespace-nowrap">
                  {event.name}
                </h2>
              </div>

              <p className="text-slate-300 max-w-2xl mx-auto mb-10 text-sm md:text-base">
                Countdown to greatness. Follow the biggest sporting events around the world.
              </p>

              <Countdown startDate={event.startDate} endDate={event.endDate} />

              {/* Nút Xem chi tiết theo màu */}
              <a
                href={event.path}
                className="mt-10 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black font-bold transition-all hover:text-white group relative overflow-hidden"
                style={{ '--theme-color': event.themeColor } as React.CSSProperties}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: event.themeColor }}></div>
                <Trophy className="w-4 h-4 relative z-10" />
                <span className="relative z-10">Xem chi tiết giải đấu</span>
              </a>
            </div>
          </div>
        </section>
      ) : (
        /* Trạng thái trống */
        <section className="relative min-h-[calc(100vh-73px)] bg-slate-950 flex flex-col items-center justify-center px-6">
          <AlertCircle className="w-16 h-16 text-slate-700 mb-4" />
          <h2 className="text-2xl md:text-4xl font-bold text-slate-500 mb-2 text-center">Chưa có giải đấu nào</h2>
          <p className="text-slate-600 text-center max-w-md">
            Hiện tại bộ môn này không có giải đấu nào nằm trong khoảng 6 tháng gần nhất (vừa qua hoặc sắp tới).
          </p>
        </section>
      )}

      {/* FILTER & NAVIGATION */}
      <section className="px-6 pb-8 bg-black relative z-20">
        <div className="max-w-6xl mx-auto -mt-20">

          {/* 1. SPORT SELECTION TABS (Căn giữa an toàn) */}
          <div className="w-full flex justify-center mb-6">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 px-2 snap-x max-w-full">
              <button
                onClick={() => setSelectedSport("All")}
                className={`shrink-0 snap-start px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedSport === "All"
                  ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  : "bg-black/50 backdrop-blur-md text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900"
                  }`}
              >
                Tất cả
              </button>
              {tournaments.map((group) => (
                <button
                  key={group.category}
                  onClick={() => setSelectedSport(group.category)}
                  className={`shrink-0 snap-start flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedSport === group.category
                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-black/50 backdrop-blur-md text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900"
                    }`}
                >
                  <span className="text-lg">{group.icon}</span>
                  {group.category}
                </button>
              ))}
            </div>
          </div>

          {/* 2. TOURNAMENT NAVIGATION CARDS */}
          {filteredEvents.length > 0 && (
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-4xl border border-slate-800/80 shadow-2xl">
              <button
                onClick={prevEvent}
                className="shrink-0 w-12 h-12 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition flex items-center justify-center hover:scale-105"
              >
                <ChevronLeft className="w-5 h-5 text-slate-300" />
              </button>

              <div className="flex-1 overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    filteredEvents[(index - 1 + filteredEvents.length) % filteredEvents.length],
                    filteredEvents[index],
                    filteredEvents[(index + 1) % filteredEvents.length],
                  ].map((e, idx) => (
                    <div
                      key={`${idx}-${e?.id}`}
                      onClick={() => e && setIndex(filteredEvents.findIndex((item) => item.id === e.id))}
                      className={`rounded-2xl p-5 border cursor-pointer transition-all duration-300 ${e?.id === event?.id
                        ? "bg-slate-900/90 backdrop-blur-sm"
                        : "bg-black/50 border-slate-800/50 hover:border-slate-700 hover:bg-slate-800/80 hidden md:block opacity-60 hover:opacity-100"
                        }`}
                      style={e?.id === event?.id ? {
                        borderColor: e.themeColor,
                        boxShadow: `0 0 20px -5px ${e.themeColor}80`,
                      } : {}}
                    >
                      {e && (
                        <>
                          <div className="flex items-center gap-3 mb-2">
                            {e.logo && <img src={e.logo} alt={e.shortName} className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md" />}
                            <p className="font-bold truncate leading-tight flex-1 text-slate-200" title={e.name}>{e.name}</p>
                          </div>
                          <p className="text-[11px] md:text-xs text-slate-400 font-medium tracking-wide">
                            {getTournamentLabel(e.startDate, e.endDate)}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={nextEvent}
                className="shrink-0 w-12 h-12 rounded-full border border-slate-700 bg-slate-900/80 hover:bg-slate-800 transition flex items-center justify-center hover:scale-105"
              >
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 px-6 py-8 bg-black mt-auto">
        <div className="max-w-350uto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© 2026 Sportora. Countdown to Greatness.</p>

          <div className="flex gap-6">
            <a href="/" className="hover:text-white transition-colors text-white font-bold">Trang chủ</a>
            <a href="/tournaments" className="hover:text-white transition-colors">Giải đấu</a>
            <span className="hover:text-white cursor-pointer transition-colors">Kết nối</span>
          </div>
        </div>
      </footer>
    </main>
  );
}