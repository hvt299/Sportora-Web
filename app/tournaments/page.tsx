"use client";

import { useRef } from 'react';
import { tournaments } from "@/data/tournaments";
import { getTournamentLabel } from "@/lib/tournament";
import { Trophy, Search, Bell, Menu, CalendarDays, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";

// Hàm gom nhóm các mùa giải vào chung 1 giải đấu gốc
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

// Hàm tính số ngày còn lại
const getDaysLeft = (startDate: string) => {
    if (!startDate) return 0;
    const diff = new Date(startDate).getTime() - new Date().getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 3600 * 24));
};

// Component hiển thị từng hàng giải đấu (Có nút cuộn trái phải)
function FranchiseRow({ franchiseName, events }: { franchiseName: string, events: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Xử lý sự kiện bấm nút cuộn
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            // Lấy độ rộng của 1 card (khoảng 400px) + gap (24px)
            const scrollAmount = window.innerWidth < 768 ? 344 : 424;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth' // Cuộn mượt mà
            });
        }
    };

    const sortedEvents = [...events].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    return (
        <div className="border-t border-slate-900 pt-8">
            {/* Header của Giải đấu gốc */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">
                    <span className="w-2 h-8 bg-blue-500 rounded-full block"></span>
                    {franchiseName}
                </h3>

                {/* Khu vực nút điều hướng */}
                <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full hidden sm:block">
                        {sortedEvents.length} mùa giải
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition active:scale-95"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-600 transition active:scale-95"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Danh sách thẻ (Đã tắt cuộn tay, chỉ dùng nút bấm) */}
            <div
                ref={scrollRef}
                className="flex gap-6 overflow-hidden pb-8 -mx-6 px-6 md:mx-0 md:px-0"
            >
                {sortedEvents.map((event) => {
                    const label = getTournamentLabel(event.startDate, event.endDate);
                    const isFinished = label === "Đã kết thúc";
                    const isOngoing = label === "Đang diễn ra";
                    const daysLeft = getDaysLeft(event.startDate);

                    return (
                        <a
                            key={event.id}
                            href={event.path}
                            className="group relative min-w-[320px] md:min-w-100 h-120 rounded-4xl overflow-hidden border border-slate-800 hover:border-slate-500 snap-center flex flex-col justify-end transition-all shrink-0 shadow-xl shadow-black/50"
                            style={{ '--theme-color': event.themeColor } as React.CSSProperties}
                        >
                            {/* Background Image với hiệu ứng zoom */}
                            <div
                                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                style={{ backgroundImage: `url(${event.image})` }}
                            />
                            {/* Overlay tối để dễ đọc chữ */}
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent opacity-90" />
                            {/* Lớp gradient màu chủ đạo khi hover */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                style={{ backgroundImage: `linear-gradient(to top, ${event.themeColor}80, transparent)` }}
                            />

                            {/* TOP: Logo & Trạng thái */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
                                {event.logo ? (
                                    <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-lg">
                                        <img src={event.logo} alt={event.shortName} className="w-full h-full object-contain drop-shadow-md" />
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                                        <Trophy className="w-6 h-6 text-slate-400" />
                                    </div>
                                )}

                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border shadow-lg ${isOngoing ? "bg-red-500/20 text-red-300 border-red-500/30" :
                                    isFinished ? "bg-slate-500/80 text-slate-200 border-slate-400/30" :
                                        "bg-blue-500/20 text-blue-300 border-blue-500/30"
                                    }`}>
                                    {label}
                                </span>
                            </div>

                            {/* BOTTOM: Thông tin chi tiết */}
                            <div className="relative p-6 md:p-8 z-10 w-full">
                                <h4 className="text-2xl font-black italic uppercase tracking-tighter mb-3 drop-shadow-lg leading-none text-white">
                                    {event.name}
                                </h4>

                                {/* Ngày tháng (Đã xử lý chống lỗi crash) */}
                                <div className="flex items-center gap-3 text-slate-300 text-sm font-medium mb-6">
                                    <CalendarDays className="w-4 h-4 text-slate-400" />
                                    <span>
                                        {event.startDate ? event.startDate.split('T')[0].split('-').reverse().join('/') : ''}
                                        {event.endDate ? ` - ${event.endDate.split('T')[0].split('-').reverse().join('/')}` : ''}
                                    </span>
                                </div>

                                {/* Button & Mini Countdown */}
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex items-center justify-between group-hover:bg-white/20 group-hover:border-white/40 transition-all">
                                        <span className="text-sm font-bold text-white">
                                            {isFinished ? "Xem lại kết quả" : isOngoing ? "Theo dõi trực tiếp" : "Xem chi tiết"}
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                                    </div>

                                    {/* Số ngày đếm ngược */}
                                    {!isFinished && !isOngoing && daysLeft > 0 && (
                                        <div className="shrink-0 bg-black/50 backdrop-blur-md border border-slate-700 rounded-2xl p-3 flex flex-col items-center justify-center min-w-17.5">
                                            <Clock className="w-4 h-4 text-blue-400 mb-1" />
                                            <span className="text-xs text-slate-400 font-bold uppercase">Còn</span>
                                            <span className="text-lg font-black text-white leading-none">{daysLeft}</span>
                                        </div>
                                    )}
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
    return (
        <main className="min-h-screen bg-black text-white flex flex-col overflow-x-hidden">
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

            {/* CONTENT */}
            <div className="flex-1 max-w-350 mx-auto w-full px-6 py-12">
                <div className="mb-16">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block">
                        Khám phá thế giới thể thao
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold italic uppercase tracking-tighter drop-shadow-lg">
                        Hệ Thống Giải Đấu
                    </h1>
                </div>

                {/* Lặp qua từng môn thể thao */}
                {tournaments.map((sportCategory, idx) => {
                    const groupedEvents = groupEventsByFranchise(sportCategory.events);

                    return (
                        <section key={idx} className="mb-20">
                            {/* Tiêu đề môn thể thao */}
                            <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-tighter mb-10 flex items-center gap-4 text-white">
                                <span className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                                    {sportCategory.icon}
                                </span>
                                {sportCategory.category}
                            </h2>

                            <div className="space-y-16">
                                {/* Dùng Component con FranchiseRow để Render từng nhóm giải và có nút trượt */}
                                {Object.entries(groupedEvents).map(([franchiseName, events]) => (
                                    <FranchiseRow key={franchiseName} franchiseName={franchiseName} events={events} />
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* FOOTER */}
            <footer className="border-t border-slate-900 px-6 py-8 bg-black mt-auto">
                <div className="max-w-350uto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
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