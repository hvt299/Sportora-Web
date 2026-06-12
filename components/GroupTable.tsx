interface TeamData {
    pos: number;
    team: string;
    logo: string;
    pl: number;
    w: number;
    d: number;
    l: number;
    scoresStr: string;   // Dữ liệu BT-BB
    gd: number;
    pts: number;
    qualColor: string | null; // Mã màu thăng hạng
}

export default function GroupTable({ data, groupName }: { data: TeamData[], groupName: string }) {
    // Tinh chỉnh lại Grid để nhét vừa cột BT-BB (45px) mà không làm vỡ Mobile
    const gridCols = "grid-cols-[28px_1fr_28px_28px_28px_28px_45px_30px_35px]";

    return (
        <div className="w-full overflow-x-auto no-scrollbar">
            {/* Header chuẩn tiếng Việt */}
            <div className={`grid ${gridCols} gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-4 text-center`}>
                <span className="text-left">#</span>
                <span className="text-left">Đội bóng</span>
                <span title="Số trận">ST</span>
                <span title="Thắng">T</span>
                <span title="Hòa">H</span>
                <span title="Thua">B</span>
                <span title="Bàn thắng - Bàn thua">BT-BB</span>
                <span title="Hiệu số">HS</span>
                <span className="text-white" title="Điểm">Đ</span>
            </div>

            {/* Rows */}
            <div className="space-y-1.5">
                {data.map((row) => {
                    // Logic tự động tô màu theo Fotmob
                    let rowStyles = 'bg-slate-900/40 border-transparent text-slate-400';
                    let posStyles = 'text-slate-500 border-transparent';

                    if (row.qualColor === '#2AD572') {
                        // Chắc chắn đi tiếp (Màu xanh lá)
                        rowStyles = 'bg-[#2AD572]/10 border-[#2AD572]/30 text-white';
                        posStyles = 'text-[#2AD572]';
                    } else if (row.qualColor === '#FFD908') {
                        // Có thể đi tiếp (Màu vàng)
                        rowStyles = 'bg-[#FFD908]/10 border-[#FFD908]/30 text-white';
                        posStyles = 'text-[#FFD908]';
                    }

                    return (
                        <div
                            key={row.team}
                            className={`grid ${gridCols} gap-2 items-center px-2 py-3 rounded-lg text-sm transition-colors border-l-2 ${rowStyles}`}
                        >
                            <span className={`font-mono font-bold ${posStyles}`}>{row.pos}</span>

                            <div className="flex items-center gap-3 truncate">
                                <img src={row.logo} alt={row.team} className="w-6 h-6 rounded-full object-cover bg-white" />
                                <span className="font-display-reg truncate text-white">{row.team}</span>
                            </div>

                            <span className="text-center font-mono">{row.pl}</span>
                            <span className="text-center font-mono">{row.w}</span>
                            <span className="text-center font-mono">{row.d}</span>
                            <span className="text-center font-mono">{row.l}</span>
                            <span className="text-center font-mono">{row.scoresStr}</span>
                            {/* Ép hiện dấu + nếu hiệu số dương */}
                            <span className="text-center font-mono">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                            <span className="text-center font-black text-white">{row.pts}</span>
                        </div>
                    );
                })}
            </div>

            {/* Chú thích trạng thái đi tiếp */}
            <div className="mt-5 flex flex-wrap gap-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 pb-2">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2AD572] shadow-[0_0_8px_#2AD572]"></span>
                    Đủ điều kiện đi tiếp
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#FFD908] shadow-[0_0_8px_#FFD908]"></span>
                    Có khả năng đi tiếp
                </div>
            </div>
        </div>
    );
}