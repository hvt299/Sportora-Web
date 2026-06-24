interface BracketNodeProps {
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    score: string | null;
    time: string | null;
    round: string;
    isFinal?: boolean;
    isHomeWinner?: boolean; // Nhận cờ thắng từ API
    isAwayWinner?: boolean; // Nhận cờ thắng từ API
}

export default function BracketNode({
    home, away, homeLogo, awayLogo, score, time, round, isFinal, isHomeWinner, isAwayWinner
}: BracketNodeProps) {

    let hScore = "-";
    let aScore = "-";
    if (score) {
        // Tách chuỗi điểm đơn giản, luân lưu sẽ gom về phần Away (VD: 1 - 1 (5 - 4) -> Home: 1, Away: 1 (5 - 4))
        const parts = score.split("-").map(s => s.trim());
        if (parts.length >= 2) {
            hScore = parts[0];
            aScore = parts.slice(1).join("-").trim();
        }
    }

    const checkIsTBD = (name: string): boolean => {
        if (!name) return true;
        const lower = name.toLowerCase();
        return (
            lower.includes('thắng') || lower.includes('thua') || lower.includes('nhất') ||
            lower.includes('nhì') || lower.includes('ba') || lower.includes('chưa xác định') ||
            !!name.match(/^[0-9]/) || name === "TBD" || name === "?"
        );
    };

    const isHomeTBD = checkIsTBD(home);
    const isAwayTBD = checkIsTBD(away);

    return (
        <div className={`relative z-10 bg-slate-900/80 p-2 rounded-lg border transition-all w-44 shrink-0 ${isFinal ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-slate-800 hover:border-blue-500/60'}`}>
            <div className="flex justify-between items-center mb-1.5 border-b border-slate-700 pb-1">
                <p className={`text-[8px] font-black uppercase tracking-widest truncate max-w-[60%] ${isFinal ? 'text-yellow-500' : 'text-slate-500'}`}>
                    {round}
                </p>
                {!score && time && (
                    <p className="text-[8px] font-bold text-blue-400 whitespace-nowrap">
                        {time}
                    </p>
                )}
            </div>

            {/* ĐỘI NHÀ */}
            <div className={`flex justify-between items-center mb-1.5 transition-all duration-300 ${isAwayWinner ? 'opacity-40 grayscale text-slate-500' : 'text-white'}`}>
                <div className="flex items-center gap-1.5 truncate">
                    {!isHomeTBD && homeLogo ? (
                        <img
                            src={homeLogo} alt={home} className="w-3.5 h-3.5 rounded-full object-cover bg-white"
                            onError={(e) => e.currentTarget.outerHTML = '<div class="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>'}
                        />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>
                    )}
                    <span className={`text-[10px] truncate max-w-22.5 ${isHomeWinner ? 'font-black' : 'font-bold'}`}>{home}</span>
                </div>
                <span className={`font-mono text-[11px] font-bold ${score ? (isHomeWinner ? 'text-blue-400' : (isAwayWinner ? 'text-slate-500' : 'text-blue-400')) : 'text-slate-600'}`}>
                    {score ? hScore : "-"}
                </span>
            </div>

            {/* ĐỘI KHÁCH */}
            <div className={`flex justify-between items-center transition-all duration-300 ${isHomeWinner ? 'opacity-40 grayscale text-slate-500' : 'text-white'}`}>
                <div className="flex items-center gap-1.5 truncate">
                    {!isAwayTBD && awayLogo ? (
                        <img
                            src={awayLogo} alt={away} className="w-3.5 h-3.5 rounded-full object-cover"
                            onError={(e) => e.currentTarget.outerHTML = '<div class="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>'}
                        />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>
                    )}
                    <span className={`text-[10px] truncate max-w-22.5 ${isAwayWinner ? 'font-black' : 'font-bold'}`}>{away}</span>
                </div>
                <span className={`font-mono text-[11px] font-bold ${score ? (isAwayWinner ? 'text-blue-400' : (isHomeWinner ? 'text-slate-500' : 'text-blue-400')) : 'text-slate-600'}`}>
                    {score ? aScore : "-"}
                </span>
            </div>
        </div>
    );
}