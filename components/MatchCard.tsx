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

    // Fallback an toàn nếu không có fonts truyền vào
    const currentFonts = fonts || {
        base: "font-sans",
        heading: "font-black",
        subHeading: "font-bold"
    };

    // Nhận diện đội chưa xác định (Thắng, Thua, Nhất, Nhì, Ba, TBD)
    const checkIsTBD = (name: string) => {
        if (!name) return true;
        const lower = name.toLowerCase();
        return lower.includes('thắng') ||
            lower.includes('thua') ||
            lower.includes('nhất') ||
            lower.includes('nhì') ||
            lower.includes('ba') ||
            lower.includes('chưa xác định') ||
            name.match(/^[0-9]/) ||
            name === "TBD";
    };

    const isHomeTBD = checkIsTBD(home);
    const isAwayTBD = checkIsTBD(away);

    // Xử lý hiển thị phút live (Sử dụng rawStatus để tính phút bù giờ chi tiết như MatchHero)
    const detailedMinute = formatMatchMinute(rawStatus) || minute || "";
    const displayMinute = fotmobStatusMap[detailedMinute] || detailedMinute || 'LIVE';

    // Xử lý hiển thị trạng thái kết thúc/hoãn (Dùng rawPeriod của Fotmob)
    const displayStatus = fotmobStatusMap[rawPeriod || ""] || status;

    return (
        <Link href={`/match/${id}`} className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer">
            {/* Đội nhà */}
            <div className="w-[30%] flex items-center justify-end gap-3 text-right">
                <span className={`${currentFonts.subHeading} text-sm md:text-base hidden sm:block truncate`}>{home}</span>
                <span className={`${currentFonts.subHeading} text-sm sm:hidden block truncate`}>{home.substring(0, 3).toUpperCase()}</span>
                {(!isHomeTBD && homeLogo) ? (
                    <img src={homeLogo} alt={home} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500 font-bold">?</div>
                )}
            </div>

            {/* Trung tâm: Tỉ số / Thời gian / Trạng thái */}
            <div className="w-[40%] flex flex-col items-center justify-center px-2">
                {live ? (
                    <>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold mb-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <span className="text-[10px] md:text-sm text-center">{displayMinute}</span>
                        </div>
                        <div className={`${currentFonts.heading} text-2xl md:text-3xl tracking-tighter`}>
                            {score}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-red-400 mt-1">{status}</div>
                    </>
                ) : (
                    <>
                        {score !== null ? (
                            <div className={`${currentFonts.heading} text-2xl md:text-3xl tracking-tighter`}>
                                {score}
                            </div>
                        ) : (
                            <div className={`${currentFonts.subHeading} text-lg text-blue-400 mb-1`}>
                                {time}
                            </div>
                        )}
                        <div className={`text-[10px] uppercase font-bold mt-1 ${displayStatus === 'Kết thúc' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {displayStatus}
                        </div>
                    </>
                )}
            </div>

            {/* Đội khách */}
            <div className="w-[30%] flex items-center justify-start gap-3">
                {(!isAwayTBD && awayLogo) ? (
                    <img src={awayLogo} alt={away} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-500 font-bold">?</div>
                )}
                <span className={`${currentFonts.subHeading} text-sm md:text-base hidden sm:block truncate`}>{away}</span>
                <span className={`${currentFonts.subHeading} text-sm sm:hidden block truncate`}>{away.substring(0, 3).toUpperCase()}</span>
            </div>
        </Link>
    );
}