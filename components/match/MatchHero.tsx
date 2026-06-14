"use client";

import { PlayCircle, Star, Loader2 } from 'lucide-react';
import { fotmobStatusMap } from '../MatchCard';
import { formatMatchMinute, translateTeamName } from '@/lib/scraper';
import { useState } from 'react';

export default function MatchHero({ matchData, homeTeam, awayTeam }: { matchData: any, homeTeam: any, awayTeam: any }) {
    const status = matchData.header.status;
    const infoBox = matchData.content?.matchFacts?.infoBox;
    const highlights = matchData.content?.matchFacts?.highlights;
    const potm = matchData.content?.matchFacts?.playerOfTheMatch;

    // Superlive Data (Dữ liệu Opta)
    const superLive = matchData.content?.superlive;
    const [iframeLoaded, setIframeLoaded] = useState(false);

    // --- 1. XỬ LÝ TRẠNG THÁI TRẬN ĐẤU ---
    const isFinished = status.finished;
    const isCancelled = status.cancelled;
    const isLive = status.started && !status.finished && !status.cancelled;
    const reasonShort = status.reason?.short || "";

    let displayStatus = "Chưa diễn ra";
    let statusColor = "text-blue-400";
    let showPulse = false;

    if (isLive) {
        // Lấy số phút đã được format sạch sẽ (VD: "45'+4", "32'")
        const liveTime = formatMatchMinute(status) || status.scoreStr?.split(" - ")[0] || "";

        displayStatus = fotmobStatusMap[liveTime] || liveTime || "ĐANG DIỄN RA";
        statusColor = "text-red-400";
        showPulse = true;
    } else if (isCancelled || ["Canc", "Postp", "Abd"].includes(reasonShort)) {
        displayStatus = fotmobStatusMap[reasonShort] || "Bị hoãn / Hủy";
        statusColor = "text-slate-400";
    } else if (isFinished) {
        displayStatus = fotmobStatusMap[reasonShort] || "Kết thúc";
        statusColor = "text-slate-300";
    }

    // --- 2. FORMAT THỜI GIAN TIẾNG VIỆT ---
    let displayTime = "";
    if (infoBox?.['Match Date']?.utcTime) {
        const d = new Date(infoBox['Match Date'].utcTime);
        const timeStr = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'numeric', year: 'numeric' });
        displayTime = `${timeStr} • ${dateStr}`;
    }

    // --- 3. HELPER TÌM SỰ KIỆN GHI BÀN / THẺ ĐỎ ---
    const getTeamSummaryEvents = (goalsObj: any, cardsObj: any) => {
        const evs = [...Object.values(goalsObj || {}).flat(), ...Object.values(cardsObj || {}).flat()] as any[];
        return evs.sort((a, b) => a.time - b.time);
    };
    const homeSummaryEvents = getTeamSummaryEvents(matchData.header.events?.homeTeamGoals, matchData.header.events?.homeTeamRedCards);
    const awaySummaryEvents = getTeamSummaryEvents(matchData.header.events?.awayTeamGoals, matchData.header.events?.awayTeamRedCards);

    // --- 4. ĐỒNG BỘ DỊCH TÊN ĐỘI BÓNG ---
    const homeNameTranslated = translateTeamName(homeTeam?.name);
    const awayNameTranslated = translateTeamName(awayTeam?.name);

    // --- 5. TBD CHECK & XỬ LÝ ẢNH MẶC ĐỊNH ---
    const checkIsTBD = (name: string): boolean => {
        if (!name) return true;
        const lower = name.toLowerCase();
        return lower.includes('thắng') ||
            lower.includes('thua') ||
            lower.includes('nhất') ||
            lower.includes('nhì') ||
            lower.includes('ba') ||
            lower.includes('chưa xác định') ||
            !!name.match(/^[0-9]/) ||
            name === "TBD" ||
            name === "?";
    };

    const isHomeTBD = checkIsTBD(homeNameTranslated);
    const isAwayTBD = checkIsTBD(awayNameTranslated);

    const renderLogo = (team: any, isTBD: boolean, teamNameTranslated: string) => {
        if (isTBD || !team?.imageUrl) {
            return (
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl text-slate-500 font-bold mb-4 drop-shadow-2xl">
                    ?
                </div>
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

    return (
        <>
            <section className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 md:p-10 relative overflow-hidden flex flex-col items-center shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />

                <div className="text-slate-400 text-xs md:text-sm font-medium mb-6 text-center z-10 flex flex-col items-center gap-1">
                    <span className="capitalize">{displayTime}</span>
                    <span>{infoBox?.Stadium?.name} • Trọng tài: {infoBox?.Referee?.text}</span>
                </div>

                <div className="bg-black/50 border border-slate-700 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 z-10 flex items-center gap-2">
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
                                    <span className="text-right">{ev.nameStr} {ev.timeStr}'</span>
                                    {ev.type === "Goal" && <span className="text-blue-400">⚽</span>}
                                    {ev.type === "Card" && ev.card === "Red" && <span className="text-red-500">🟥</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TỈ SỐ */}
                    <div className="flex flex-col items-center justify-center px-4 md:px-8 shrink-0 min-w-max">
                        <div className="relative text-5xl md:text-7xl font-display-black tracking-tighter whitespace-nowrap text-center leading-none py-6">
                            <div className="bg-linear-to-b from-white to-slate-400 text-transparent bg-clip-text leading-none inline-block px-2">
                                <span className="block leading-none pb-1">
                                    {status.scoreStr || "? - ?"}
                                </span>
                            </div>
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
                                    {ev.type === "Goal" && <span className="text-amber-400">⚽</span>}
                                    {ev.type === "Card" && ev.card === "Red" && <span className="text-red-500">🟥</span>}
                                    <span className="text-left">{ev.nameStr} {ev.timeStr}'</span>
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
                    <a href={highlights.url} target="_blank" rel="noopener noreferrer" className="group block relative w-full rounded-4xl overflow-hidden border border-slate-800 bg-slate-900 aspect-21/9 md:aspect-32/9">
                        <img src={highlights.image} alt="Highlights" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-xl" />
                            <span className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-md">Xem video Highlight chính thức ({highlights.source})</span>
                        </div>
                    </a>
                </section>
            ) : (superLive?.showSuperLive && superLive?.superLiveUrl && isLive) ? (
                <section className="mt-8 w-full rounded-4xl overflow-hidden border border-slate-800 bg-slate-900/50 relative shadow-2xl min-h-100">
                    {/* Skeleton Loading State */}
                    {!iframeLoaded && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-900/80 z-10 backdrop-blur-sm">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 animate-pulse">Đang tải sơ đồ Opta Live...</span>
                        </div>
                    )}

                    <div
                        className="relative w-full overflow-hidden"
                        style={{ height: "600px" }}
                    >
                        {/* Iframe Opta Live */}
                        <iframe
                            title="superLive"
                            src={`${superLive.superLiveUrl}&a=false&breakpointMin=290&dark=true&hl=vi&gdpr=0&gdpr_consent=`}
                            width="100%"
                            height="600"
                            sandbox="allow-scripts allow-same-origin allow-popups allow-modals allow-forms allow-popups-to-escape-sandbox allow-downloads allow-top-navigation-by-user-activation"
                            className={`transition-opacity duration-1000 ${iframeLoaded ? "opacity-100" : "opacity-0"
                                }`}
                            style={{
                                border: "none",
                                width: "calc(100% + 17px)",
                                clipPath: "inset(0 17px 0 0)",
                            }}
                            onLoad={() => setIframeLoaded(true)}
                        />
                    </div>
                </section>
            ) : null}
        </>
    );
}