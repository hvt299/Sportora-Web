"use client";

import { PlayCircle, Star, Loader2, CircleDot, Square, Calendar, MapPin, User } from 'lucide-react';
import { fotmobStatusMap } from '../../football/FootballMatchCard';
import { formatMatchMinute, translateTeamName } from '@/lib/scraper';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FootballHero({ matchData, homeTeam, awayTeam, fonts, category }: { matchData: any, homeTeam: any, awayTeam: any, fonts?: { base: string; heading: string; subHeading: string }, category?: string }) {
    const currentFonts = fonts || {
        base: "font-sans",
        heading: "font-black",
        subHeading: "font-bold"
    };
    const status = matchData.header.status;
    const infoBox = matchData.content?.matchFacts?.infoBox;
    const highlights = matchData.content?.matchFacts?.highlights;
    const potm = matchData.content?.matchFacts?.playerOfTheMatch;

    const superLive = matchData.content?.superlive;
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const router = useRouter();
    useEffect(() => {
        if (status.finished || status.cancelled) return;
        const interval = setInterval(() => { router.refresh(); }, 15000);
        return () => clearInterval(interval);
    }, [router, status.finished, status.cancelled]);

    const isFinished = status.finished;
    const isCancelled = status.cancelled;
    const isLive = status.started && !status.finished && !status.cancelled;
    const reasonShort = status.reason?.short || "";

    let displayStatus = "Chưa diễn ra";
    let statusColor = "text-blue-400";
    let showPulse = false;

    // XỬ LÝ TRẠNG THÁI TRẬN ĐẤU CHUẨN XÁC HƠN
    if (isLive) {
        const liveTime = formatMatchMinute(status) || status.scoreStr?.split(" - ")[0] || "";
        displayStatus = fotmobStatusMap[liveTime] || liveTime || "ĐANG DIỄN RA";
        statusColor = "text-red-400";
        showPulse = true;
    } else if (isCancelled || ["Canc", "Postp", "Abd"].includes(reasonShort)) {
        displayStatus = fotmobStatusMap[reasonShort] || "Bị hoãn / Hủy";
        statusColor = "text-slate-400";
    } else if (isFinished) {
        // Đã kết thúc thì chặn luôn không hiển thị "Luân lưu" trống không
        if (reasonShort === "Pen") {
            displayStatus = "Kết thúc (Luân lưu)";
        } else if (reasonShort === "AET") {
            displayStatus = "Kết thúc (Hiệp phụ)";
        } else {
            displayStatus = "Kết thúc";
        }
        statusColor = "text-slate-300";
    }

    let displayTime = "";
    if (infoBox?.['Match Date']?.utcTime) {
        const d = new Date(infoBox['Match Date'].utcTime);
        const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'numeric', year: 'numeric' });
        displayTime = `${timeStr} • ${dateStr}`;
    }

    const getTeamSummaryEvents = (goalsObj: any, cardsObj: any) => {
        const evs = [...Object.values(goalsObj || {}).flat(), ...Object.values(cardsObj || {}).flat()] as any[];
        return evs.sort((a, b) => a.time - b.time);
    };
    const homeSummaryEvents = getTeamSummaryEvents(matchData.header.events?.homeTeamGoals, matchData.header.events?.homeTeamRedCards);
    const awaySummaryEvents = getTeamSummaryEvents(matchData.header.events?.awayTeamGoals, matchData.header.events?.awayTeamRedCards);

    const homeNameTranslated = translateTeamName(homeTeam?.name);
    const awayNameTranslated = translateTeamName(awayTeam?.name);

    const checkIsTBD = (name: string) => {
        if (!name) return true;
        const lower = name.toLowerCase().trim();

        // 1. Chứa các từ khóa chắc chắn là đội bóng ảo chờ kết quả
        if (lower.includes('chưa xác định') || lower.includes('tbd') || lower.includes('thắng') || lower.includes('thua')) {
            return true;
        }

        // 2. Bắt đầu bằng chữ Nhất, Nhì, Ba đi kèm DẤU CÁCH (VD: "Nhất A", "Nhì B", "Ba ABCDF")
        // Dùng startsWith để TUYỆT ĐỐI không bắt nhầm Barcelona, Bayern Munich hay Basel...
        if (lower.startsWith('nhất ') || lower.startsWith('nhì ') || lower.startsWith('ba ')) {
            return true;
        }

        // 3. Bắt các mã rỗng 2 ký tự của Fotmob (VD: "1a", "2b", "3c")
        // TUYỆT ĐỐI không dùng /^[0-9]/ để không bắt nhầm 1. FC Köln, 1. FSV Mainz 05, 1899 Hoffenheim...
        if (/^[1-3][a-z]$/i.test(lower)) {
            return true;
        }

        return false;
    };

    const isHomeTBD = checkIsTBD(homeNameTranslated);
    const isAwayTBD = checkIsTBD(awayNameTranslated);

    const renderLogo = (team: any, isTBD: boolean, teamNameTranslated: string) => {
        if (isTBD || !team?.imageUrl) {
            return (
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl text-slate-500 font-bold mb-4 drop-shadow-2xl">?</div>
            );
        }
        return (
            <img
                src={team.imageUrl}
                alt={teamNameTranslated}
                className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-2xl mb-4 bg-white/5 rounded-full p-2"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement?.insertAdjacentHTML('afterbegin', '<div class="w-20 h-20 md:w-32 md:h-32 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl text-slate-500 font-bold mb-4 drop-shadow-2xl">?</div>');
                }}
            />
        );
    };

    // HÀM HELPER ĐỂ KÝ HIỆU PEN HOẶC PHẢN LƯỚI NHÀ
    const renderGoalAnnotation = (ev: any) => {
        if (ev.type !== "Goal") return null;
        const isPen = ev.goalDescription === "Penalty" || ev.suffix === "Pen";
        const isOG = ev.ownGoal || ev.goalDescription === "Own goal" || ev.suffix === "OG";

        if (isOG) return <span className="text-[10px] text-red-400 font-bold ml-1 tracking-tighter">(OG)</span>;
        if (isPen) return <span className="text-[10px] text-blue-400 font-bold ml-1 tracking-tighter">(PEN)</span>;
        return null;
    };

    return (
        <>
            <section className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 md:p-10 relative overflow-hidden flex flex-col items-center shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />

                {/* THÔNG TIN CHUNG VỚI LUCIDE ICONS */}
                <div className="flex flex-col items-center gap-2 mb-6 z-10 text-slate-400 text-xs md:text-sm font-medium">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" /> <span className="capitalize">{displayTime}</span></div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-emerald-400" /> Địa điểm: {infoBox?.Stadium?.name || 'Đang cập nhật'}</span>
                        <span className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-400" /> Trọng tài chính: {infoBox?.Referee?.text || 'Đang cập nhật'}</span>
                    </div>
                </div>

                <div className="bg-black/50 border border-slate-700 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 z-10 flex items-center gap-2 shadow-lg">
                    {showPulse && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                    <span className={`${statusColor} text-xs font-bold uppercase tracking-widest`}>
                        {displayStatus}
                    </span>
                </div>

                <div className="flex items-start justify-between w-full max-w-4xl relative z-10">
                    {/* ĐỘI NHÀ */}
                    <div className="flex flex-col items-center flex-1 w-1/3">
                        {renderLogo(homeTeam, isHomeTBD, homeNameTranslated)}
                        <h2 className="text-xl md:text-4xl font-black italic tracking-tighter text-center leading-none">{homeNameTranslated}</h2>
                        {(!isHomeTBD && homeTeam?.fifaRank) && <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2">FIFA #{homeTeam.fifaRank}</span>}

                        <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-slate-300">
                            {homeSummaryEvents.map((ev, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <span className="text-right flex items-center justify-end">
                                        <span>{ev.nameStr}</span>
                                        {renderGoalAnnotation(ev)}
                                        <span className="text-slate-500 font-medium ml-1.5">{ev.timeStr}'</span>
                                    </span>
                                    {ev.type === "Goal" && <CircleDot className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />}
                                    {ev.type === "Card" && ev.card === "Red" && <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TỈ SỐ */}
                    <div className="flex flex-col items-center justify-center px-4 md:px-8 shrink-0 min-w-max pt-2">
                        <div className={`relative text-5xl md:text-7xl ${currentFonts.heading} tracking-tighter whitespace-nowrap text-center leading-none flex flex-col items-center`}>
                            <div className="bg-linear-to-b from-white to-slate-400 text-transparent bg-clip-text leading-none inline-block px-2">
                                <span className="block leading-none pb-1">
                                    {status.scoreStr || "? - ?"}
                                </span>
                            </div>

                            {/* HIỂN THỊ TỈ SỐ LUÂN LƯU (NẾU CÓ) */}
                            {status.reason?.penalties?.length === 2 && (
                                <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1 flex items-center gap-2 shadow-lg">
                                    <span className="text-[10px] uppercase tracking-widest text-amber-500 font-black">PEN</span>
                                    <span className="text-sm md:text-base text-amber-400 font-black tracking-widest">
                                        {status.reason.penalties[0]} - {status.reason.penalties[1]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ĐỘI KHÁCH */}
                    <div className="flex flex-col items-center flex-1 w-1/3">
                        {renderLogo(awayTeam, isAwayTBD, awayNameTranslated)}
                        <h2 className="text-xl md:text-4xl font-black italic tracking-tighter text-center leading-none">{awayNameTranslated}</h2>
                        {(!isAwayTBD && awayTeam?.fifaRank) && <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2">FIFA #{awayTeam.fifaRank}</span>}

                        <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-slate-300">
                            {awaySummaryEvents.map((ev, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    {ev.type === "Goal" && <CircleDot className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />}
                                    {ev.type === "Card" && ev.card === "Red" && <Square className="w-3.5 h-3.5 text-red-500 fill-red-500" />}
                                    <span className="text-left flex items-center justify-start">
                                        <span className="text-slate-500 font-medium mr-1.5">{ev.timeStr}'</span>
                                        <span>{ev.nameStr}</span>
                                        {renderGoalAnnotation(ev)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MVP */}
                {potm && potm.name && (
                    <div className="mt-8 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2.5 flex items-center gap-3 z-10 shadow-lg backdrop-blur-md">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <div className="text-xs text-slate-300">
                            Cầu thủ xuất sắc nhất: <span className="font-bold text-white">{potm.name.fullName}</span> <span className="text-slate-500">({potm.teamName})</span>
                        </div>
                        <span className="bg-amber-500 text-black font-black text-xs px-2 py-0.5 rounded">{potm.rating?.num}</span>
                    </div>
                )}
            </section>

            {/* VIDEO HIGHLIGHT HOẶC OPTA SUPERLIVE */}
            {(highlights?.url) ? (
                <section className="mt-8">
                    <a
                        href={highlights.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block relative w-full rounded-4xl overflow-hidden border border-slate-800 bg-slate-900 aspect-video md:aspect-32/9"
                    >
                        <img
                            src={highlights.image}
                            alt="Highlights"
                            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-xl" />
                            <span className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-md">
                                Xem video Highlight chính thức ({highlights.source})
                            </span>
                        </div>
                    </a>
                </section>
            ) : (superLive?.showSuperLive && superLive?.superLiveUrl && isLive) ? (
                <section className="mt-8 relative w-full rounded-4xl overflow-hidden border border-blue-900/30 bg-slate-950 shadow-2xl">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-950/40 via-slate-950 to-black pointer-events-none" />
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/80 z-20 backdrop-blur-md">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">
                                Đang tải Opta Live...
                            </span>
                        </div>
                    )}
                    <div className="relative w-full" style={{ height: "600px" }}>
                        <iframe
                            title="superLive"
                            src={`${superLive.superLiveUrl}&a=false&breakpointMin=290&dark=true&hl=vi&gdpr=0&gdpr_consent=`}
                            width="100%"
                            height="600"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
                            className={`relative z-10 w-full transition-all duration-700 ${iframeLoaded ? "opacity-95" : "opacity-0"} mix-blend-screen brightness-90 contrast-125`}
                            style={{ border: "none", width: "calc(100% + 17px)", clipPath: "inset(0 17px 0 0)" }}
                            onLoad={() => setIframeLoaded(true)}
                        />
                    </div>
                    <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </section>
            ) : null}
        </>
    );
}