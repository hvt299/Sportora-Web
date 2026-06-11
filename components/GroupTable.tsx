interface TeamData {
    pos: number;
    team: string;
    logo: string;
    pl: number;
    w: number;
    d: number;
    l: number;
    gd: string;
    pts: number;
    qualify: boolean;
}

export default function GroupTable({ data, groupName }: { data: TeamData[], groupName: string }) {
    // Grid: 30px (Pos) - 1fr (Team) - 35px cho 6 cột chỉ số (40px*6) - 50px (PTS)
    const gridCols = "grid-cols-[30px_1fr_40px_40px_40px_40px_40px_50px]";
    const isBest3rdTable = groupName?.includes("Best");

    return (
        <div className="w-full overflow-x-auto">
            {/* Header khớp 100% với yêu cầu */}
            <div className={`grid ${gridCols} gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-4 text-center`}>
                <span className="text-left">#</span>
                <span className="text-left">Đội bóng</span>
                <span>PL</span>
                <span>W</span>
                <span>D</span>
                <span>L</span>
                <span>GD</span>
                <span className="text-white">PTS</span>
            </div>

            {/* Rows */}
            <div className="space-y-1">
                {data.map((row) => (
                    <div
                        key={row.team}
                        className={`grid ${gridCols} gap-2 items-center px-2 py-3 rounded-lg text-sm transition-colors border ${
                            // Điều kiện mới: Nếu là bảng thường (top 2) HOẶC là bảng Best 3rd (top 8)
                            ((isBest3rdTable && row.pos <= 8) || (!isBest3rdTable && row.pos <= 2))
                                ? 'bg-blue-900/20 border-blue-500/30' // Dùng chung màu xanh
                                : 'bg-slate-900/40 border-transparent'
                            }`}
                    >
                        <span className={`font-mono ${(isBest3rdTable && row.pos <= 8) || (!isBest3rdTable && row.pos <= 2)
                                ? 'text-blue-500'
                                : 'text-slate-600'
                            }`}>
                            {row.pos}
                        </span>

                        <div className="flex items-center gap-3 truncate">
                            <img src={row.logo} alt={row.team} className="w-6 h-6 rounded-full object-cover" />
                            <span className="font-display-reg truncate">{row.team}</span>
                        </div>

                        <span className="text-center text-slate-400 font-mono">{row.pl}</span>
                        <span className="text-center font-mono">{row.w}</span>
                        <span className="text-center font-mono">{row.d}</span>
                        <span className="text-center font-mono">{row.l}</span>
                        <span className="text-center font-mono">{row.gd}</span>
                        <span className="text-center font-black text-white">{row.pts}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}