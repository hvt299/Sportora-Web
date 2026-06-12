interface BracketNodeProps {
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    score: string | null;
    time: string | null;
    round: string;
    isFinal?: boolean;
}

export default function BracketNode({
    home, away, homeLogo, awayLogo, score, time, round, isFinal
}: BracketNodeProps) {

    let hScore = "-";
    let aScore = "-";
    if (score) {
        const parts = score.split("-").map(s => s.trim());
        if (parts.length === 2) {
            hScore = parts[0];
            aScore = parts[1];
        }
    }

    const isHomeTBD = home.toLowerCase().includes('thắng') || home.toLowerCase().includes('thua') || home.match(/^[0-9]/) || home === "TBD";
    const isAwayTBD = away.toLowerCase().includes('thắng') || away.toLowerCase().includes('thua') || away.match(/^[0-9]/) || away === "TBD";

    return (
        // Đã thu nhỏ xuống w-44 (176px) và giảm p-3 xuống p-2 để layout cân đối, không bị khổng lồ
        <div className={`relative z-10 bg-slate-900/80 p-2 rounded-lg border transition-all w-44 shrink-0 ${isFinal ? 'border-yellow-500/50' : 'border-slate-800 hover:border-blue-500/60'}`}>
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
            <div className="flex justify-between items-center mb-1.5 text-white">
                <div className="flex items-center gap-1.5 truncate">
                    {!isHomeTBD && homeLogo ? (
                        <img src={homeLogo} alt={home} className="w-3.5 h-3.5 rounded-full object-cover bg-white" />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>
                    )}
                    <span className="text-[10px] font-bold truncate max-w-22.5">{home}</span>
                </div>
                <span className={`font-mono font-bold text-[11px] ${score ? 'text-blue-400' : 'text-slate-600'}`}>
                    {score ? hScore : "-"}
                </span>
            </div>

            {/* ĐỘI KHÁCH */}
            <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-1.5 truncate">
                    {!isAwayTBD && awayLogo ? (
                        <img src={awayLogo} alt={away} className="w-3.5 h-3.5 rounded-full object-cover bg-white" />
                    ) : (
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-700 flex items-center justify-center text-[6px] font-bold text-slate-400 border border-slate-600">?</div>
                    )}
                    <span className="text-[10px] font-bold truncate max-w-22.5">{away}</span>
                </div>
                <span className={`font-mono font-bold text-[11px] ${score ? 'text-blue-400' : 'text-slate-600'}`}>
                    {score ? aScore : "-"}
                </span>
            </div>
        </div>
    );
}