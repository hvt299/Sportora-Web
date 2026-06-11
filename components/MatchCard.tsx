interface MatchCardProps {
    home: string;
    away: string;
    homeLogo: string; // Thêm logo
    awayLogo: string; // Thêm logo
    score?: string | null;
    time: string;
    status: string;
}

export default function MatchCard({ home, away, homeLogo, awayLogo, score, time, status }: MatchCardProps) {
    const statusColors = {
        LIVE: "text-red-500 animate-pulse",
        FT: "text-slate-500",
        Upcoming: "text-slate-600",
    };

    return (
        <div className="group flex items-center justify-between p-4 bg-slate-900/40 border border-slate-800 rounded-2xl hover:border-blue-500/50 hover:bg-slate-900 transition-all cursor-pointer">
            {/* Đội nhà */}
            <div className="w-1/3 flex items-center justify-end gap-2">
                <span className="font-display-reg text-sm md:text-base">{home}</span>
                {homeLogo && (
                    <img src={homeLogo} alt={home} className="w-6 h-6 rounded-full object-cover" />
                )}
            </div>

            {/* Trung tâm: Tỉ số hoặc Thời gian */}
            <div className="w-1/3 text-center px-2">
                {score ? (
                    <div className="font-display-black text-lg italic tracking-tighter">
                        {score}
                    </div>
                ) : (
                    <div className="font-display-reg text-sm text-blue-400">
                        {time}
                    </div>
                )}
                <div className={`text-[9px] font-black uppercase mt-1 ${statusColors[status as keyof typeof statusColors] || 'text-slate-600'}`}>
                    {status}
                </div>
            </div>

            {/* Đội khách */}
            <div className="w-1/3 flex items-center justify-start gap-2">
                {awayLogo && (
                    <img src={awayLogo} alt={away} className="w-6 h-6 rounded-full object-cover" />
                )}
                <span className="font-display-reg text-sm md:text-base">{away}</span>
            </div>
        </div>
    );
}