import { MatchItem } from "@/lib/scraper";

export default function MatchCard({
    home, away, homeLogo, awayLogo, score, time, status, live, minute
}: MatchItem) {
    return (
        <div className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer">
            {/* Đội nhà */}
            <div className="w-[30%] flex items-center justify-end gap-3 text-right">
                <span className="font-display-reg text-sm md:text-base hidden sm:block truncate">{home}</span>
                <span className="font-display-reg text-sm sm:hidden block truncate">{home.substring(0, 3).toUpperCase()}</span>
                {homeLogo ? (
                    <img src={homeLogo} alt={home} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800" />
                )}
            </div>

            {/* Trung tâm: Tỉ số / Thời gian / Trạng thái */}
            <div className="w-[40%] flex flex-col items-center justify-center px-2">
                {live ? (
                    <>
                        <div className="flex items-center gap-1.5 text-red-500 font-bold mb-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                            <span className="text-sm">{minute || 'LIVE'}</span>
                        </div>
                        <div className="font-display-black text-2xl md:text-3xl tracking-tighter">
                            {score}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-red-400 mt-1">{status}</div>
                    </>
                ) : (
                    <>
                        {score !== null ? (
                            <div className="font-display-black text-2xl md:text-3xl tracking-tighter">
                                {score}
                            </div>
                        ) : (
                            <div className="font-display-reg text-lg text-blue-400 mb-1">
                                {time}
                            </div>
                        )}
                        <div className={`text-[10px] uppercase font-bold mt-1 ${status === 'Kết thúc' ? 'text-slate-500' : 'text-slate-400'}`}>
                            {status}
                        </div>
                    </>
                )}
            </div>

            {/* Đội khách */}
            <div className="w-[30%] flex items-center justify-start gap-3">
                {awayLogo ? (
                    <img src={awayLogo} alt={away} className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover bg-white" />
                ) : (
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-800" />
                )}
                <span className="font-display-reg text-sm md:text-base hidden sm:block truncate">{away}</span>
                <span className="font-display-reg text-sm sm:hidden block truncate">{away.substring(0, 3).toUpperCase()}</span>
            </div>
        </div>
    );
}