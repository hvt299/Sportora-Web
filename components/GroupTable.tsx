interface TeamData {
    pos: number;
    team: string;
    logo: string;
    pl: number;
    w: number;
    d: number;
    l: number;
    scoresStr: string;
    gd: number;
    pts: number;
    qualColor: string | null;
}

export default function GroupTable({ data, groupName }: { data: TeamData[], groupName?: string }) {
    const gridCols = "grid-cols-[28px_1fr_28px_28px_28px_28px_45px_30px_35px]";

    // Lọc ra các màu thực sự được sử dụng trong bảng này
    const usedColors = Array.from(new Set(data.map(row => row.qualColor).filter(Boolean))) as string[];

    // Tự động phân loại chú thích dựa trên tên bảng đấu
    const getLegendText = (color: string, name: string = '') => {
        // Nhận diện giải Cúp: Tên bảng thường rất ngắn (1-2 ký tự như "A", "B") hoặc có chứa từ khóa
        const isCup = name.length <= 2 || /bảng|group|hạng 3/i.test(name);

        if (isCup) {
            switch (color.toUpperCase()) {
                case '#2AD572': return 'Đủ điều kiện đi tiếp';
                case '#FFD908': return 'Có khả năng đi tiếp / Play-off';
                case '#0046A7': return 'Chuyển xuống giải cấp thấp hơn';
                case '#FF4646': return 'Bị loại';
                default: return 'Vị trí đặc biệt';
            }
        } else {
            // Dành cho các giải VĐQG (League) như Premier League, La Liga...
            switch (color.toUpperCase()) {
                case '#2AD572': return 'Vô địch / Thăng hạng / Cúp C1 (Champions League)';
                case '#0046A7': return 'Cúp C2 (Europa League)';
                case '#02CCF0': return 'Cúp C3 (Conference League)';
                case '#FFD908': return 'Vòng Play-off';
                case '#FF4646': return 'Nhóm xuống hạng';
                default: return 'Vị trí đặc biệt';
            }
        }
    };

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            {/* ĐÃ XÓA: Phần tiêu đề h3 gây dư thừa chữ "A" hoặc "Premier League" ở đây */}

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
                    return (
                        <div
                            key={row.team}
                            className={`grid ${gridCols} gap-2 items-center px-2 py-3 rounded-lg text-sm transition-colors border-l-2`}
                            style={{
                                backgroundColor: row.qualColor ? `${row.qualColor}1A` : 'rgba(15, 23, 42, 0.4)',
                                borderColor: row.qualColor ? `${row.qualColor}4D` : 'transparent',
                                color: row.qualColor ? '#ffffff' : '#94a3b8'
                            }}
                        >
                            <span
                                className="font-mono font-bold"
                                style={{ color: row.qualColor || '#64748b' }}
                            >
                                {row.pos}
                            </span>

                            <div className="flex items-center gap-3 truncate">
                                <img src={row.logo} alt={row.team} className="w-6 h-6 rounded-full object-cover bg-white" />
                                <span className="font-display-reg truncate text-white">{row.team}</span>
                            </div>

                            <span className="text-center font-mono">{row.pl}</span>
                            <span className="text-center font-mono">{row.w}</span>
                            <span className="text-center font-mono">{row.d}</span>
                            <span className="text-center font-mono">{row.l}</span>
                            <span className="text-center font-mono">{row.scoresStr}</span>
                            <span className="text-center font-mono">{row.gd > 0 ? `+${row.gd}` : row.gd}</span>
                            <span className="text-center font-black text-white">{row.pts}</span>
                        </div>
                    );
                })}
            </div>

            {/* Legend - Chú thích */}
            {usedColors.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-5 text-[10px] font-bold uppercase tracking-widest text-slate-500 px-2 pb-2 border-t border-slate-800 pt-4">
                    {usedColors.map((color) => (
                        <div key={color} className="flex items-center gap-2">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                            />
                            {getLegendText(color, groupName)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}