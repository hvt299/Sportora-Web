"use client";

import { useEffect, useRef, useState } from 'react';
import { tournaments } from "@/data/tournaments";
import { getTournamentLabel } from "@/lib/tournament";
import * as LucideIcons from "lucide-react";
import {
    Search, Bell, Menu, CalendarDays, ArrowRight,
    ChevronLeft, ChevronRight, LayoutGrid, LayoutList, Trophy
} from "lucide-react";

// --- HÀM RENDER ICON ĐỘNG TỪ CHUỖI CỦA TOURNAMENTS.TS ---
const DynamicIcon = ({ name, className = "w-4 h-4" }: { name: string, className?: string }) => {
    const IconComponent = (LucideIcons as any)[name] || Trophy;
    return <IconComponent className={className} />;
};

// Hàm nhóm theo Franchise (Dành cho chế độ Row)
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

// Thuật toán sắp xếp chung: Đang diễn ra -> Sắp diễn ra -> Đã kết thúc
const sortEvents = (a: any, b: any) => {
    const labelA = getTournamentLabel(a.startDate, a.endDate);
    const labelB = getTournamentLabel(b.startDate, b.endDate);

    const priority: Record<string, number> = {
        "Đang diễn ra": 1,
        "Sắp diễn ra": 2,
        "Đã kết thúc": 3
    };

    const weightA = priority[labelA] || 4;
    const weightB = priority[labelB] || 4;

    // 1. Phân loại theo trạng thái trước (Đang diễn ra -> Sắp diễn ra -> Đã kết thúc)
    if (weightA !== weightB) return weightA - weightB;

    // 2. Nếu cùng trạng thái, sắp xếp theo thời gian logic nhất
    if (labelA === "Đã kết thúc") {
        // Nếu đã kết thúc: Xếp giải vừa mới kết thúc lên trước (Giảm dần theo endDate hoặc startDate)
        const timeA = new Date(a.endDate || a.startDate).getTime();
        const timeB = new Date(b.endDate || b.startDate).getTime();
        return timeB - timeA;
    } else {
        // Nếu Đang diễn ra hoặc Sắp diễn ra: Xếp giải đá sớm nhất lên trước (Tăng dần theo startDate)
        const timeA = new Date(a.startDate).getTime();
        const timeB = new Date(b.startDate).getTime();
        return timeA - timeB;
    }
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0].split('-').reverse().join('/');
};

// Component Đếm ngược
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

// Component Thẻ giải đấu (Dùng chung cho Grid và Row)
function TournamentCard({ event, onClick, isSliderItem = false }: { event: any, onClick?: (e: React.MouseEvent) => void, isSliderItem?: boolean }) {
    const label = getTournamentLabel(event.startDate, event.endDate);
    const isFinished = label === "Đã kết thúc";
    const isOngoing = label === "Đang diễn ra";

    return (
        <a
            href={event.path}
            onClick={onClick}
            className={`group relative h-52 md:h-56 shrink-0 rounded-2xl overflow-hidden border flex flex-col justify-between transition-all duration-300
                ${isSliderItem ? "w-[75vw] sm:w-64 md:w-72 snap-center" : "w-full"}
                ${isOngoing
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
}

// Component Hàng cuộn ngang
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
            scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
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

    const sortedEvents = [...events].sort(sortEvents);

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
                        <button onClick={() => scroll('left')} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={() => scroll('right')} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95">
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
                {sortedEvents.map((event) => (
                    <TournamentCard
                        key={event.id}
                        event={event}
                        isSliderItem={true}
                        onClick={(e) => { if (isDragged) e.preventDefault(); }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function TournamentsPage() {
    const [selectedSport, setSelectedSport] = useState<string>("All");

    // --- STATE ĐIỀU KHIỂN BỘ LỌC VÀ GIAO DIỆN ---
    const [hideFinished, setHideFinished] = useState(false);
    const [viewMode, setViewMode] = useState<'row' | 'grid'>('row');

    // --- THÊM ĐOẠN NÀY: LOGIC KÉO VUỐT CHO THANH FILTER THỂ THAO ---
    const filterScrollRef = useRef<HTMLDivElement>(null);
    const [isDraggingFilter, setIsDraggingFilter] = useState(false);
    const [isDraggedFilter, setIsDraggedFilter] = useState(false);
    const [startXFilter, setStartXFilter] = useState(0);
    const [scrollLeftFilter, setScrollLeftFilter] = useState(0);

    const handleFilterMouseDown = (e: React.MouseEvent) => {
        if (!filterScrollRef.current) return;
        setIsDraggingFilter(true);
        setIsDraggedFilter(false);
        setStartXFilter(e.pageX - filterScrollRef.current.offsetLeft);
        setScrollLeftFilter(filterScrollRef.current.scrollLeft);
    };

    const handleFilterMouseLeaveOrUp = () => {
        setIsDraggingFilter(false);
        setTimeout(() => setIsDraggedFilter(false), 50);
    };

    const handleFilterMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingFilter || !filterScrollRef.current) return;
        e.preventDefault();
        setIsDraggedFilter(true); // Đánh dấu là đang kéo (không phải click)
        const x = e.pageX - filterScrollRef.current.offsetLeft;
        const walk = (x - startXFilter) * 1.5;
        filterScrollRef.current.scrollLeft = scrollLeftFilter - walk;
    };

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

                {/* --- KHU VỰC ĐIỀU KHIỂN: BỘ LỌC + KIỂU HIỂN THỊ --- */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-10 border-b border-slate-900 pb-4">

                    {/* Filter Thể thao */}
                    <div
                        ref={filterScrollRef}
                        onMouseDown={handleFilterMouseDown}
                        onMouseLeave={handleFilterMouseLeaveOrUp}
                        onMouseUp={handleFilterMouseLeaveOrUp}
                        onMouseMove={handleFilterMouseMove}
                        className={`flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2 px-1 w-full xl:w-auto transition-all select-none ${isDraggingFilter ? "cursor-grabbing" : "cursor-grab"}`}
                    >
                        <button
                            onClick={(e) => {
                                if (isDraggedFilter) { e.preventDefault(); return; }
                                setSelectedSport("All");
                            }}
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
                                onClick={(e) => {
                                    if (isDraggedFilter) { e.preventDefault(); return; }
                                    setSelectedSport(group.category);
                                }}
                                className={`shrink-0 flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all border ${selectedSport === group.category
                                    ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                                    : "bg-black/50 backdrop-blur-md text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900"
                                    }`}
                            >
                                <DynamicIcon name={group.icon} className="w-4 h-4" />
                                {group.category}
                            </button>
                        ))}
                    </div>

                    {/* Filter Ẩn Hiện & Nút Grid/Row */}
                    <div className="flex items-center gap-3 shrink-0 w-full xl:w-auto justify-end">
                        <button
                            onClick={() => setHideFinished(!hideFinished)}
                            className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wide transition-all border ${hideFinished
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            {hideFinished ? "Hiển thị tất cả giải đấu" : "Ẩn các giải đã kết thúc"}
                        </button>

                        <div className="flex bg-slate-900/50 p-1 rounded-full border border-slate-800">
                            <button
                                onClick={() => setViewMode('row')}
                                className={`p-1.5 rounded-full transition-colors ${viewMode === 'row' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                                title="Giao diện cuộn ngang"
                            >
                                <LayoutList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-full transition-colors ${viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-white'}`}
                                title="Giao diện lưới"
                            >
                                <LayoutGrid className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RENDER NỘI DUNG GIẢI ĐẤU --- */}
                {filteredGroups.length > 0 ? (
                    filteredGroups.map((sportCategory, idx) => {
                        // Áp dụng bộ lọc Ẩn/Hiện
                        const displayEvents = hideFinished
                            ? sportCategory.events.filter(e => getTournamentLabel(e.startDate, e.endDate) !== 'Đã kết thúc')
                            : sportCategory.events;

                        if (displayEvents.length === 0) return null;

                        return (
                            <section key={idx} className="mb-12 md:mb-16">
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3 text-white">
                                    <span className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 shadow-inner">
                                        <DynamicIcon name={sportCategory.icon} className="w-6 h-6 text-blue-400" />
                                    </span>
                                    {sportCategory.category}
                                </h2>

                                {/* TÙY BIẾN HIỂN THỊ THEO VIEWMODE */}
                                {viewMode === 'row' ? (
                                    <div className="space-y-8">
                                        {Object.entries(groupEventsByFranchise(displayEvents)).map(([franchiseName, events]) => (
                                            <FranchiseRow key={franchiseName} franchiseName={franchiseName} events={events} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
                                        {[...displayEvents].sort(sortEvents).map(event => (
                                            <TournamentCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                )}
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