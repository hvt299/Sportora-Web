"use client";

import { formatMatchMinute, MatchItem } from "@/lib/scraper";
import Link from "next/link";

// Map trạng thái chuẩn của Fotmob sang Tiếng Việt
export const fotmobStatusMap: Record<string, string> = {
    "HT": "Nghỉ giữa hiệp",
    "FT": "Kết thúc",
    "AET": "Kết thúc (Hiệp phụ)",
    "Pen": "Luân lưu",
    "Canc": "Đã hủy",
    "Postp": "Bị hoãn",
    "Abd": "Bị hủy",
    "TBD": "Chưa xác định"
};

export default function MatchCard({
    id, home, away, homeLogo, awayLogo, score, time, status, live, minute, rawPeriod, rawStatus, fonts
}: MatchItem & { fonts?: { base: string; heading: string; subHeading: string } }) {

    const currentFonts = fonts || {
        base: "font-sans",
        heading: "font-black",
        subHeading: "font-bold"
    };

    const checkIsTBD = (name: string) => {
        if (!name) return true;
        const lower = name.toLowerCase();
        return lower.includes('thắng') || lower.includes('thua') || lower.includes('nhất') || lower.includes('nhì') || lower.includes('ba') || lower.includes('chưa xác định') || name.match(/^[0-9]/) || name === "TBD";
    };

    const isHomeTBD = checkIsTBD(home);
    const isAwayTBD = checkIsTBD(away);

    // =========================================================================
    // THUẬT TOÁN TÍNH THỜI GIAN
    // =========================================================================
    let displayMinute = minute || "LIVE";

    if (live && rawStatus) {
        const liveTime = rawStatus.liveTime;
        const reasonShort = rawStatus.reason?.short;

        // Lọc sạch 100% ký tự ẩn (zero-width) và dấu nháy rác từ API
        let shortStr = liveTime?.short || reasonShort || displayMinute || "";
        shortStr = shortStr.replace(/[\u200E\u200F\u202A-\u202E]/g, "").replace(/['’]/g, "").trim();

        const basePeriod = liveTime?.basePeriod;
        const addedTime = liveTime?.addedTime;
        const longStr = liveTime?.long;

        let finalStr = shortStr;

        if (shortStr.includes('+')) {
            const parts = shortStr.split('+');
            finalStr = `${parts[0].trim()}' + ${parts[1].trim()}'`;
        }
        else if (/^\d+$/.test(shortStr)) {
            const currentMin = parseInt(shortStr);
            if (basePeriod && currentMin > basePeriod) {
                let extra = currentMin - basePeriod;
                if (longStr && longStr.includes(':')) {
                    const longMin = parseInt(longStr.split(':')[0]);
                    if (!isNaN(longMin) && longMin >= basePeriod) extra = longMin - basePeriod;
                }
                finalStr = `${basePeriod}' + ${extra}'`;
            } else if (basePeriod && currentMin === basePeriod) {
                finalStr = `${basePeriod}'`;
            } else {
                finalStr = `${currentMin}'`;
            }
        }
        else if (shortStr) {
            finalStr = shortStr;
        }

        // BÂY GIỜ CHẮC CHẮN ĐÃ CÓ ADDED TIME TỪ TRONG SCRAPER TRUYỀN RA!
        if (addedTime !== undefined && addedTime !== null && addedTime > 0) {
            finalStr += ` (+${addedTime}')`;
        }

        displayMinute = fotmobStatusMap[finalStr] || finalStr || "LIVE";
    }

    // XỬ LÝ HIỂN THỊ TRẠNG THÁI KẾT THÚC/HOÃN
    let displayStatus = fotmobStatusMap[rawPeriod || ""] || status;
    if (rawStatus?.finished) {
        if (rawPeriod === "Pen") displayStatus = "Kết thúc (Luân lưu)";
        else if (rawPeriod === "AET") displayStatus = "Kết thúc (Hiệp phụ)";
        else displayStatus = "Kết thúc";
    }

    return (
        <Link href={`/match/${id}`} className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer">
            <div className="w-[30%] flex items-center justify-end gap-3 text-right">
                <span className={`${currentFonts.subHeading} text-sm md:text-base hidden sm:block truncate`}>{home}</span>
                <span className={`${currentFonts.subHeading} text-sm sm:hidden block truncate`}>{home.substring(0, 3).toUpperCase()}</span>
                {(!isHomeTBD && homeLogo) ? (
                    <img src={homeLogo} alt={home} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500 font-bold">?</div>
                )}
            </div>

            <div className="w-[40%] flex flex-col items-center justify-center px-2">
                {live ? (
                    <>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold mb-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping shrink-0"></span>
                            <span className="text-[10px] md:text-sm text-center whitespace-nowrap">{displayMinute}</span>
                        </div>
                        <div className={`${currentFonts.heading} text-2xl md:text-3xl tracking-tighter`}>{score}</div>
                        <div className="text-[10px] uppercase font-bold text-red-400 mt-1">{status}</div>
                    </>
                ) : (
                    <>
                        {score !== null ? (
                            <div className={`${currentFonts.heading} text-2xl md:text-3xl tracking-tighter`}>{score}</div>
                        ) : (
                            <div className={`${currentFonts.subHeading} text-lg text-blue-400 mb-1`}>{time}</div>
                        )}
                        <div className={`text-[10px] uppercase font-bold mt-1 ${displayStatus.includes('Kết thúc') ? 'text-slate-500' : 'text-slate-400'}`}>{displayStatus}</div>
                    </>
                )}
            </div>

            <div className="w-[30%] flex items-center justify-start gap-3">
                {(!isAwayTBD && awayLogo) ? (
                    <img src={awayLogo} alt={away} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white/5 drop-shadow-2xl" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500 font-bold">?</div>
                )}
                <span className={`${currentFonts.subHeading} text-sm md:text-base hidden sm:block truncate`}>{away}</span>
                <span className={`${currentFonts.subHeading} text-sm sm:hidden block truncate`}>{away.substring(0, 3).toUpperCase()}</span>
            </div>
        </Link>
    );
}