"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { tournaments } from "@/data/tournaments";
import Countdown from "@/components/Countdown";
import {
  Bell, Menu, Search, Trophy, ChevronLeft, ChevronRight, AlertCircle, CalendarDays, PanelLeftClose, PanelRightClose, Clock, CheckCircle2,
  ArrowRight
} from "lucide-react";
import { getTournamentLabel } from "@/lib/tournament";

const getCategoryIcon = (category: string, className: string = "w-4 h-4") => {
  switch (category) {
    case "Bóng đá":
      return <Trophy className={className} />;
    default:
      return <Trophy className={className} />;
  }
};

function CompactCountdown({ startDate, endDate }: { startDate: string; endDate?: string }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = Date.now();
      const start = new Date(startDate).getTime();
      const end = endDate ? new Date(endDate).getTime() : start;

      if (now < start) {
        setIsLive(false);
        const diff = start - now;
        setTimeLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        });
      } else if (now <= end) {
        setIsLive(true);
        const diff = end - now;
        setTimeLeft({
          d: Math.floor(diff / 86400000),
          h: Math.floor((diff % 86400000) / 3600000),
          m: Math.floor((diff % 3600000) / 60000),
          s: Math.floor((diff % 60000) / 1000),
        });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return (
    <div className="flex items-center gap-1 mt-2 text-[10px] font-mono tracking-tighter">
      <span className={`px-1.5 py-0.5 rounded font-bold ${isLive ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
        {isLive ? 'CÒN LẠI' : 'BẮT ĐẦU SAU'}:
      </span>
      <div className="bg-black/50 px-1 rounded border border-white/10 text-slate-300">{timeLeft.d}d</div>:
      <div className="bg-black/50 px-1 rounded border border-white/10 text-slate-300">{String(timeLeft.h).padStart(2, '0')}h</div>:
      <div className="bg-black/50 px-1 rounded border border-white/10 text-slate-300">{String(timeLeft.m).padStart(2, '0')}m</div>:
      <div className="bg-black/50 px-1 rounded border border-white/10 text-slate-300 w-5 text-center">{String(timeLeft.s).padStart(2, '0')}s</div>
    </div>
  );
}

export default function HomePage() {
  const [selectedSport, setSelectedSport] = useState<string>("All");
  const [index, setIndex] = useState(0);

  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.innerWidth > 1024) {
      setLeftOpen(true);
      setRightOpen(true);
    }
  }, []);

  useEffect(() => {
    const autoScroll = (ref: React.RefObject<HTMLDivElement | null>) => {
      if (ref.current && !ref.current.matches(':hover')) {
        ref.current.scrollBy({ top: 1, behavior: 'auto' });
        if (ref.current.scrollTop + ref.current.clientHeight >= ref.current.scrollHeight - 1) {
          ref.current.scrollTop = 0;
        }
      }
    };

    const interval = setInterval(() => {
      autoScroll(leftScrollRef);
      autoScroll(rightScrollRef);
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const { centerEvents, leftEvents, rightEvents } = useMemo(() => {
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const SIX_MONTHS = 180 * 24 * 60 * 60 * 1000;

    let groups = tournaments;
    if (selectedSport !== "All") {
      groups = tournaments.filter((g) => g.category === selectedSport);
    }

    const allEvents = groups.flatMap((group) => group.events);

    const center: any[] = [];
    const left: any[] = [];
    const right: any[] = [];

    allEvents.forEach((event) => {
      const start = new Date(event.startDate).getTime();
      const end = event.endDate ? new Date(event.endDate).getTime() : start;

      if (now >= start && now <= end) {
        center.push({ ...event, uiStatus: 'live' });
      } else if (now < start) {
        if (start - now <= SEVEN_DAYS) {
          center.push({ ...event, uiStatus: 'upcoming-hot' });
        } else if (start - now <= SIX_MONTHS) {
          left.push({ ...event, uiStatus: 'upcoming' });
        }
      } else if (now > end) {
        if (now - end <= SIX_MONTHS) {
          right.push({ ...event, uiStatus: 'finished' });
        }
      }
    });

    center.sort((a, b) => {
      if (a.uiStatus !== b.uiStatus) return a.uiStatus === 'live' ? -1 : 1;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });
    left.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    right.sort((a, b) => new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime());

    return { centerEvents: center, leftEvents: left, rightEvents: right };
  }, [selectedSport]);

  useEffect(() => { setIndex(0); }, [selectedSport]);

  useEffect(() => {
    if (centerEvents.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % centerEvents.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [centerEvents.length]);

  const prevEvent = () => setIndex((prev) => (prev === 0 ? centerEvents.length - 1 : prev - 1));
  const nextEvent = () => setIndex((prev) => (prev + 1) % centerEvents.length);

  const activeEvent = centerEvents[index];
  const formatDate = (dateStr: string) => dateStr ? dateStr.split('T')[0].split('-').reverse().join('/') : '';

  return (
    <main className="min-h-dvh bg-black text-white flex flex-col overflow-hidden relative">

      {/* LỚP PHỦ MÀN HÌNH MỜ KHI MỞ SIDEBAR TRÊN ĐIỆN THOẠI */}
      {(leftOpen || rightOpen) && (
        <div
          className="fixed top-18.25 inset-x-0 bottom-0 bg-black/80 z-30 lg:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={() => { setLeftOpen(false); setRightOpen(false); }}
        />
      )}

      {/* HEADER */}
      <header className="absolute top-0 w-full z-50 border-b border-slate-800 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 w-full">
          <a href="/" className="flex items-center gap-2 md:gap-3 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 p-1.5 md:p-2 rounded-xl">
              <Trophy className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h1 className="text-lg md:text-xl font-black italic tracking-tighter">SPORTORA</h1>
          </a>

          <div className="flex items-center gap-3 md:gap-4">
            <button className="text-slate-400 hover:text-white transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <a href="/tournaments" className="text-slate-400 hover:text-white transition-colors hidden md:block text-sm font-bold uppercase">
              Giải đấu
            </a>
            <button className="md:hidden text-slate-400 hover:text-white transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* VÙNG TRUNG TÂM (CENTER) */}
      <div className="flex-1 relative w-full h-[calc(100dvh-73px)] mt-18.25">

        {/* BỘ LỌC THỂ THAO NỔI (Đưa vào giữa để không tràn viền) */}
        <div className="absolute top-4 left-0 w-full z-20 flex justify-center px-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 px-1 max-w-full w-max">
            <button
              onClick={() => setSelectedSport("All")}
              className={`shrink-0 px-4 py-1.5 rounded-full font-bold text-[11px] md:text-xs transition-all border shadow-lg whitespace-nowrap ${selectedSport === "All" ? "bg-white text-black border-white" : "bg-black/60 backdrop-blur-md text-slate-400 border-slate-700 hover:text-white"}`}
            >
              Tất cả
            </button>
            {tournaments.map((group) => (
              <button
                key={group.category}
                onClick={() => setSelectedSport(group.category)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-[11px] md:text-xs transition-all border shadow-lg whitespace-nowrap ${selectedSport === group.category ? "bg-white text-black border-white" : "bg-black/60 backdrop-blur-md text-slate-400 border-slate-700 hover:text-white"}`}
              >
                {getCategoryIcon(group.category, "w-3.5 h-3.5")} {group.category}
              </button>
            ))}
          </div>
        </div>

        {activeEvent ? (
          <section
            key={activeEvent.id}
            className="absolute inset-0 bg-center bg-cover transition-all duration-1000 animate-in fade-in zoom-in-95"
            style={{ backgroundImage: `url(${activeEvent.image})` }}
          >
            <div className={`absolute inset-0 bg-linear-to-t ${activeEvent.gradient}`} />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25),transparent_70%)]" />

            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 pb-24 pt-24 md:pb-20 md:pt-16">
              <div className="max-w-4xl mx-auto text-center w-full">
                <div className="mb-4 md:mb-6 flex justify-center">
                  <span className={`px-4 py-1 md:py-1.5 rounded-full border text-[10px] md:text-xs uppercase tracking-widest font-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] ${activeEvent.uiStatus === 'live' ? 'bg-red-500/20 border-red-500/50 text-red-400' : 'bg-amber-500/20 border-amber-500/50 text-amber-400'}`}>
                    {activeEvent.uiStatus === 'live' ? <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> : <Clock className="w-3.5 h-3.5" />}
                    {activeEvent.uiStatus === 'live' ? "Đang diễn ra" : "Tâm điểm sắp tới"}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-6 mb-6 md:mb-8 w-full">
                  {activeEvent.logo && (
                    <div className="bg-white/10 backdrop-blur-sm p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/20 shadow-2xl shrink-0">
                      <img src={activeEvent.logo} alt={activeEvent.shortName} className="w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 object-contain drop-shadow-2xl" />
                    </div>
                  )}
                  <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter drop-shadow-2xl text-center md:text-left leading-tight line-clamp-3">
                    {activeEvent.name}
                  </h2>
                </div>

                {/* ĐẾM NGƯỢC CHÍNH */}
                <div className="mb-8 md:mb-10 flex flex-col items-center">
                  <span className="text-[9px] md:text-xs uppercase tracking-widest font-bold text-slate-300 mb-2 md:mb-3 bg-black/40 px-4 py-1 rounded-full border border-white/10 shadow-sm">
                    {activeEvent.uiStatus === 'live' ? "Kết thúc sau:" : "Bắt đầu sau:"}
                  </span>
                  <Countdown startDate={activeEvent.startDate} endDate={activeEvent.endDate} />
                </div>

                <a
                  href={activeEvent.path}
                  className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-3.5 rounded-full bg-white text-black font-black transition-all hover:scale-105 group relative overflow-hidden text-[11px] md:text-sm uppercase tracking-widest shadow-xl shadow-white/10"
                  style={{ '--theme-color': activeEvent.themeColor } as React.CSSProperties}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundColor: activeEvent.themeColor }}></div>
                  <ArrowRight className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 group-hover:text-white">Truy cập giải đấu</span>
                </a>
              </div>
            </div>

            {/* Pagination Nút Bấm Center */}
            {centerEvents.length > 1 && (
              <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
                <button onClick={prevEvent} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"><ChevronLeft className="w-4 h-4 md:w-5 md:h-5" /></button>
                <div className="flex gap-1.5 bg-black/50 p-1.5 md:p-2 rounded-full backdrop-blur-md border border-white/10">
                  {centerEvents.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-white' : 'w-2 bg-white/30'}`} />
                  ))}
                </div>
                <button onClick={nextEvent} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-all"><ChevronRight className="w-4 h-4 md:w-5 md:h-5" /></button>
              </div>
            )}
          </section>
        ) : (
          <section className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center px-6 text-center">
            <AlertCircle className="w-16 h-16 md:w-20 md:h-20 text-slate-800 mb-6" />
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-slate-500 mb-3">Không có tâm điểm</h2>
            <p className="text-slate-600 max-w-md text-xs md:text-sm font-medium">
              Hiện không có giải đấu nào thuộc bộ môn này đang diễn ra hoặc chuẩn bị khởi tranh trong vòng 7 ngày tới.
            </p>
          </section>
        )}
      </div>

      {/* CỘT TRÁI (SẮP DIỄN RA) */}
      <button
        onClick={() => setLeftOpen(!leftOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-30 bg-blue-600/80 hover:bg-blue-500 backdrop-blur-md p-2 rounded-r-xl border border-l-0 border-white/20 shadow-[5px_0_15px_rgba(0,0,0,0.5)] transition-all duration-500 ${leftOpen ? 'opacity-0 pointer-events-none -translate-x-full' : 'left-0'}`}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className={`fixed top-18.25 bottom-0 left-0 w-[85vw] max-w-[320px] lg:w-80 bg-slate-950/95 backdrop-blur-2xl z-40 border-r border-slate-800/80 shadow-[10px_0_30px_rgba(0,0,0,0.7)] transition-transform duration-500 flex flex-col ${leftOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 md:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-linear-to-r from-blue-900/20 to-transparent">
          <h3 className="font-black text-blue-400 uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
            <CalendarDays className="w-4 h-4" /> Sắp diễn ra
          </h3>
          <button onClick={() => setLeftOpen(false)} className="text-slate-500 hover:text-white transition"><PanelLeftClose className="w-5 h-5" /></button>
        </div>

        <div ref={leftScrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {leftEvents.length > 0 ? leftEvents.map((e) => (
            <a href={e.path} key={e.id} className="group block bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-colors relative">
              <div className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity" style={{ backgroundImage: `url(${e.image})` }} />
              <div className="relative p-4">
                <div className="flex gap-3 items-center mb-2">
                  {e.logo && <img src={e.logo} alt="" className="w-8 h-8 object-contain bg-white/10 rounded-md p-1 shrink-0" />}
                  <h4 className="font-bold text-sm truncate text-white leading-tight">{e.name}</h4>
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  {formatDate(e.startDate)} {e.endDate ? `- ${formatDate(e.endDate)}` : ''}
                </div>
                <CompactCountdown startDate={e.startDate} endDate={e.endDate} />
              </div>
            </a>
          )) : (
            <div className="text-center py-10 text-slate-600 text-xs font-medium">Chưa có giải đấu nào sắp diễn ra</div>
          )}
        </div>
      </div>

      {/* CỘT PHẢI (VỪA KẾT THÚC) */}
      <button
        onClick={() => setRightOpen(!rightOpen)}
        className={`fixed top-1/2 -translate-y-1/2 z-30 bg-emerald-600/80 hover:bg-emerald-500 backdrop-blur-md p-2 rounded-l-xl border border-r-0 border-white/20 shadow-[-5px_0_15px_rgba(0,0,0,0.5)] transition-all duration-500 ${rightOpen ? 'opacity-0 pointer-events-none translate-x-full' : 'right-0'}`}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>

      <div className={`fixed top-18.25 bottom-0 right-0 w-[85vw] max-w-[320px] lg:w-80 bg-slate-950/95 backdrop-blur-2xl z-40 border-l border-slate-800/80 shadow-[-10px_0_30px_rgba(0,0,0,0.7)] transition-transform duration-500 flex flex-col ${rightOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 md:p-5 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-linear-to-l from-emerald-900/20 to-transparent">
          <button onClick={() => setRightOpen(false)} className="text-slate-500 hover:text-white transition"><PanelRightClose className="w-5 h-5" /></button>
          <h3 className="font-black text-emerald-500 uppercase tracking-widest text-xs md:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Vừa kết thúc
          </h3>
        </div>

        <div ref={rightScrollRef} className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {rightEvents.length > 0 ? rightEvents.map((e) => (
            <a href={e.path} key={e.id} className="group block bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 transition-colors relative grayscale-[0.3] hover:grayscale-0">
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity" style={{ backgroundImage: `url(${e.image})`, maskImage: 'linear-gradient(to right, transparent, black)' }} />
              <div className="relative p-4">
                <div className="flex gap-3 items-center mb-2">
                  {e.logo && <img src={e.logo} alt="" className="w-8 h-8 object-contain bg-white/5 rounded-md p-1 shrink-0" />}
                  <h4 className="font-bold text-sm truncate text-slate-300 group-hover:text-white leading-tight">{e.name}</h4>
                </div>
                <div className="text-[10px] text-slate-500 font-medium bg-slate-900 px-2 py-1 rounded inline-block border border-slate-800 mt-2">
                  Diễn ra: {formatDate(e.startDate)} {e.endDate ? `- ${formatDate(e.endDate)}` : ''}
                </div>
              </div>
            </a>
          )) : (
            <div className="text-center py-10 text-slate-600 text-xs font-medium">Chưa có giải đấu nào kết thúc gần đây</div>
          )}
        </div>
      </div>

    </main>
  );
}