interface BracketNodeProps {
    home: string;
    away: string;
    score: string;
    round: string;
    isWinner?: 'home' | 'away' | null;
}

export default function BracketNode({
    home,
    away,
    score,
    round,
    isWinner
}: BracketNodeProps) {

    const [hScore = "-", aScore = "-"] =
        (score || "")
            .split("-")
            .map(s => s.trim());

    return (
        // Thêm z-10 để luôn nổi hơn đường nối (connector)
        <div className="relative z-10 bg-slate-900/70 p-3 rounded-lg border border-slate-800 hover:border-blue-500/60 transition-all w-52 shrink-0">

            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
                {round}
            </p>

            {/* HOME */}
            <div className={`flex justify-between items-center mb-1 transition ${isWinner === 'home' ? 'text-white' : 'text-slate-400'}`}>
                {/* Thay max-w-30 bằng max-w-[120px] để an toàn */}
                <span className={`text-[11px] truncate max-w-30 ${isWinner === 'home' ? 'font-bold' : ''}`}>
                    {home}
                </span>
                <span className={`font-mono font-bold ${isWinner === 'home' ? 'text-blue-400' : ''}`}>
                    {hScore}
                </span>
            </div>

            {/* AWAY */}
            <div className={`flex justify-between items-center transition ${isWinner === 'away' ? 'text-white' : 'text-slate-400'}`}>
                <span className={`text-[11px] truncate max-w-30 ${isWinner === 'away' ? 'font-bold' : ''}`}>
                    {away}
                </span>
                <span className={`font-mono font-bold ${isWinner === 'away' ? 'text-blue-400' : ''}`}>
                    {aScore}
                </span>
            </div>
        </div>
    );
}