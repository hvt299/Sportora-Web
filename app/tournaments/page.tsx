"use client";

import { useEffect, useRef, useState } from 'react';
import { tournaments } from "@/data/tournaments";
import { getTournamentLabel } from "@/lib/tournament";
import { Trophy, Search, Bell, Menu, CalendarDays, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";

// Hàm map Icon
const getCategoryIcon = (category: string, className: string = "w-4 h-4") => {
    switch (category) {
        case "Bóng đá": return <Trophy className={className} />;
        default: return <Trophy className={className} />;
    }
};

const groupEventsByFranchise = (events: any[]) => {
    const grouped: Record<string, any[]> = {};
    events.forEach((event) => {
        const franchiseName = event.name.replace(/\s*\d{2,4}(\/\d{2})?$/, "").trim();
        if (!grouped[franchiseName]) {
            grouped[franchiseName] = [];
        }
        grouped[franchiseName].push(event);
    });
    return grouped;
};

const getDaysLeft = (startDate: string) => {
    if (!startDate) return 0;
    const diff = new Date(startDate).getTime() - new Date().getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
};

function MiniCountdown({ startDate, endDate }: { startDate: string; endDate?: string }) {
    const [status, setStatus] = useState<'upcoming' | 'live' | 'finished'>('upcoming');
    const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const start = new Date(startDate).getTime();
            const end = endDate ? new Date(endDate).getTime() : start;

            if (now < start) {
                setStatus('upcoming');
                const diff = start - now;
                setTimeLeft({
                    d: Math.floor(diff / 86400000),
                    h: Math.floor((diff % 86400000) / 3600000),
                    m: Math.floor((diff % 3600000) / 60000),
                    s: Math.floor((diff % 60000) / 1000),
                });
            } else if (now <= end) {
                setStatus('live');
                const diff = end - now;
                setTimeLeft({
                    d: Math.floor(diff / 86400000),
                    h: Math.floor((diff % 86400000) / 3600000),
                    m: Math.floor((diff % 3600000) / 60000),
                    s: Math.floor((diff % 60000) / 1000),
                });
            } else {
                setStatus('finished');
            }
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startDate, endDate]);

    if (status === 'finished') return null;

    return (
        <div className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-tight">
            <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/20 text-white">{timeLeft.d}d</div>
            <span className="text-slate-500 opacity-50">:</span>
            <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/20 text-white">{String(timeLeft.h).padStart(2, '0')}h</div>
            <span className="text-slate-500 opacity-50">:</span>
            <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/20 text-white">{String(timeLeft.m).padStart(2, '0')}m</div>
            <span className="text-slate-500 opacity-50">:</span>
            <div className="bg-black/60 px-1.5 py-0.5 rounded border border-white/20 text-white w-6.5 text-center">{String(timeLeft.s).padStart(2, '0')}s</div>
        </div>
    );
}

function FranchiseRow({ franchiseName, events }: { franchiseName: string, events: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragged, setIsDragged] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current && scrollRef.current.firstElementChild) {
            const cardWidth = scrollRef.current.firstElementChild.getBoundingClientRect().width;
            const scrollAmount = cardWidth + 16;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollRef.current) return;
        setIsDragging(true);
        setIsDragged(false);
        setStartX(e.pageX - scrollRef.current.offsetLeft);
        setScrollLeft(scrollRef.current.scrollLeft);
    };

    const handleMouseLeaveOrUp = () => {
        setIsDragging(false);
        setTimeout(() => setIsDragged(false), 50);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollRef.current) return;
        e.preventDefault();
        setIsDragged(true);
        const x = e.pageX - scrollRef.current.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return dateStr.split('T')[0].split('-').reverse().join('/');
    };

    const sortedEvents = [...events].sort((a, b) => {
        const labelA = getTournamentLabel(a.startDate, a.endDate);
        const labelB = getTournamentLabel(b.startDate, b.endDate);

        const priority: Record<string, number> = {
            "Đang diễn ra": 1,
            "Sắp diễn ra": 2,
            "Đã kết thúc": 3
        };

        const weightA = priority[labelA] || 4;
        const weightB = priority[labelB] || 4;

        if (weightA !== weightB) return weightA - weightB;
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return (
        <div className="border-t border-slate-900 pt-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full block"></span>
                    {franchiseName}
                </h3>

                <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500 bg-slate-900/50 px-2.5 py-1 rounded-full hidden sm:block">
                        {sortedEvents.length} giải đấu
                    </span>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                ref={scrollRef}
                className={`flex gap-4 overflow-x-auto pb-6 -mx-6 px-6 md:mx-0 md:px-0 transition-all scrollbar-hide ${isDragging ? "cursor-grabbing snap-none" : "cursor-grab snap-x snap-mandatory"}`}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeaveOrUp}
                onMouseUp={handleMouseLeaveOrUp}
                onMouseMove={handleMouseMove}
            >
                {sortedEvents.map((event) => {
                    const label = getTournamentLabel(event.startDate, event.endDate);
                    const isFinished = label === "Đã kết thúc";
                    const isOngoing = label === "Đang diễn ra";

                    return (
                        <a
                            key={event.id}
                            href={event.path}
                            onClick={(e) => {
                                if (isDragged) e.preventDefault();
                            }}
                            className={`group relative w-[75vw] sm:w-64 md:w-72 h-52 md:h-56 shrink-0 rounded-2xl overflow-hidden border snap-center flex flex-col justify-between transition-all duration-300 ${isOngoing
                                ? "border-red-500/50 hover:border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                                : isFinished
                                    ? "border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600 grayscale-[0.3]"
                                    : "border-slate-700/50 hover:border-blue-500/50"
                                }`}
                            style={{ '--theme-color': event.themeColor } as React.CSSProperties}
                        >
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 pointer-events-none"
                                style={{ backgroundImage: `url(${event.image})` }}
                            />
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/80 to-black/30 pointer-events-none" />
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                style={{ backgroundImage: `linear-gradient(to top, ${event.themeColor}60, transparent)` }}
                            />

                            <div className="relative p-4 flex justify-between items-start z-10 pointer-events-none">
                                {event.logo ? (
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg p-1.5 border border-white/10 shadow-sm">
                                        <img src={event.logo} alt={event.shortName} draggable={false} className="w-full h-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                                        <Trophy className="w-5 h-5 text-slate-300" />
                                    </div>
                                )}

                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border shadow-sm ${isOngoing ? "bg-red-500/20 text-red-400 border-red-500/30" :
                                    isFinished ? "bg-slate-800/80 text-slate-400 border-slate-700/50" :
                                        "bg-blue-500/20 text-blue-400 border-blue-500/30"
                                    }`}>
                                    {isOngoing && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>}
                                    {label}
                                </div>
                            </div>

                            <div className="relative p-4 z-10 w-full pointer-events-none flex flex-col gap-2">
                                <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tight leading-tight text-white line-clamp-2">
                                    {event.name}
                                </h4>

                                <div className="flex items-center gap-1.5 text-slate-300 text-[10px] md:text-xs font-medium">
                                    <CalendarDays className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                    <span className="truncate">
                                        {formatDate(event.startDate)} {event.endDate ? `- ${formatDate(event.endDate)}` : ''}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    {!isFinished ? (
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[8px] uppercase tracking-widest font-bold text-slate-400">
                                                {isOngoing ? "Kết thúc sau" : "Bắt đầu sau"}
                                            </span>
                                            <MiniCountdown startDate={event.startDate} endDate={event.endDate} />
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Đã kết thúc</span>
                                    )}

                                    <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0 mt-auto ${isFinished ? 'text-slate-500' : 'text-white'}`} />
                                </div>
                            </div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}

export default function TournamentsPage() {
    const [selectedSport, setSelectedSport] = useState<string>("All");

    const filteredGroups = selectedSport === "All"
        ? tournaments
        : tournaments.filter(g => g.category === selectedSport);

    return (
        <main className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
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

            <div className="flex-1 max-w-350 mx-auto w-full px-6 py-8 md:py-12">
                <div className="mb-8 md:mb-12 text-center md:text-left">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-1 md:mb-2 block">
                        Khám phá thế giới thể thao
                    </span>
                    <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter drop-shadow-lg">
                        Hệ Thống Giải Đấu
                    </h1>
                </div>

                <div className="w-full flex mb-10 border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 px-1 max-w-full">
                        <button
                            onClick={() => setSelectedSport("All")}
                            className={`shrink-0 px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedSport === "All"
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
                                className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedSport === group.category
                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                    : "bg-black/50 backdrop-blur-md text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900"
                                    }`}
                            >
                                {getCategoryIcon(group.category, "w-5 h-5")}
                                {group.category}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredGroups.length > 0 ? (
                    filteredGroups.map((sportCategory, idx) => {
                        const groupedEvents = groupEventsByFranchise(sportCategory.events);

                        return (
                            <section key={idx} className="mb-12 md:mb-16">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 text-white">
                                    <span className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                                        {getCategoryIcon(sportCategory.category, "w-6 h-6 text-blue-400")}
                                    </span>
                                    {sportCategory.category}
                                </h2>

                                <div className="space-y-8">
                                    {Object.entries(groupedEvents).map(([franchiseName, events]) => (
                                        <FranchiseRow key={franchiseName} franchiseName={franchiseName} events={events} />
                                    ))}
                                </div>
                            </section>
                        );
                    })
                ) : (
                    <div className="py-20 text-center text-slate-500 font-medium">
                        Không có dữ liệu cho môn thể thao này.
                    </div>
                )}
            </div>

            <footer className="border-t border-slate-900 px-6 py-6 bg-black mt-auto">
                <div className="max-w-350 mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© 2026 Sportora. Countdown to Greatness.</p>

                    <div className="flex gap-6">
                        <a href="/" className="hover:text-white transition-colors">Trang chủ</a>
                        <a href="/tournaments" className="hover:text-white transition-colors text-white font-bold">Giải đấu</a>
                        <span className="hover:text-white cursor-pointer transition-colors">Kết nối</span>
                    </div>
                </div>
            </footer>
        </main>
    );
}