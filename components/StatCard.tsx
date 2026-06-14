import React from 'react';

interface StatCardProps {
    statBlock: any;
    type: 'player' | 'team';
    fonts: {
        base: string;
        heading: string;
        subHeading: string;
    };
}

// Từ điển dịch các thông số từ API sang Tiếng Việt
const statTranslations: Record<string, string> = {
    "Top scorer": "Vua phá lưới",
    "Assists": "Kiến tạo",
    "Goals + Assists": "Bàn thắng + Kiến tạo",
    "FotMob rating": "Điểm đánh giá (FotMob)",
    "Minutes played": "Số phút thi đấu",
    "Goals per 90": "Bàn thắng mỗi 90 phút",
    "Expected goals (xG)": "Bàn thắng kỳ vọng (xG)",
    "Expected goals (xG) per 90": "Bàn thắng kỳ vọng (xG) / 90 phút",
    "Expected goals on target (xGOT)": "Bàn thắng kỳ vọng trúng đích (xGOT)",
    "Shots on target per 90": "Sút trúng đích mỗi 90 phút",
    "Shots per 90": "Cú sút mỗi 90 phút",
    "Accurate passes per 90": "Chuyền chính xác mỗi 90 phút",
    "Big chances created": "Tạo cơ hội lớn",
    "Chances created": "Tạo cơ hội",
    "Accurate long balls per 90": "Chuyền dài chính xác / 90 phút",
    "Expected assist (xA)": "Kiến tạo kỳ vọng (xA)",
    "Expected assist (xA) per 90": "Kiến tạo kỳ vọng (xA) / 90 phút",
    "xG + xA per 90": "xG + xA mỗi 90 phút",
    "Successful dribbles per 90": "Qua người thành công / 90 phút",
    "Big chances missed": "Bỏ lỡ cơ hội lớn",
    "Penalties won": "Kiếm được phạt đền",
    "Defensive actions per 90": "Hành động phòng ngự / 90 phút",
    "Tackles per 90": "Tắc bóng mỗi 90 phút",
    "Interceptions per 90": "Cắt bóng mỗi 90 phút",
    "Clearances per 90": "Giải nguy mỗi 90 phút",
    "Blocks per 90": "Chắn bóng mỗi 90 phút",
    "Recoveries per 90": "Thu hồi bóng mỗi 90 phút",
    "Penalties conceded": "Phạm lỗi chịu phạt đền",
    "Possession won final 3rd per 90": "Giành bóng 1/3 sân đối phương / 90 phút",
    "Clean sheets": "Giữ sạch lưới",
    "Save percentage": "Tỷ lệ cứu thua",
    "Saves per 90": "Cứu thua mỗi 90 phút",
    "Goals prevented": "Bàn thắng được ngăn chặn",
    "Goals conceded per 90": "Bàn thua mỗi 90 phút",
    "Fouls committed per 90": "Phạm lỗi mỗi 90 phút",
    "Yellow cards": "Thẻ vàng",
    "Red cards": "Thẻ đỏ",
    "Goals per match": "Bàn thắng mỗi trận",
    "Goals conceded per match": "Bàn thua mỗi trận",
    "Average possession": "Kiểm soát bóng trung bình",
    "Attendance": "Khán giả",
    "Expected goals": "Bàn thắng kỳ vọng",
    "xG difference": "Hiệu số xG",
    "Shots on target per match": "Sút trúng đích mỗi trận",
    "Big chances": "Cơ hội lớn",
    "Accurate passes per match": "Chuyền chính xác mỗi trận",
    "Accurate long balls per match": "Chuyền dài chính xác mỗi trận",
    "Accurate crosses per match": "Tạt bóng chính xác mỗi trận",
    "Penalties awarded": "Được hưởng phạt đền",
    "Touches in opposition box": "Chạm bóng trong vòng cấm đối phương",
    "Corners": "Phạt góc",
    "Set piece goals": "Bàn thắng từ tình huống cố định",
    "xG conceded": "Bàn thua kỳ vọng (xG conceded)",
    "Interceptions per match": "Cắt bóng mỗi trận",
    "Tackles per match": "Tắc bóng mỗi trận",
    "Clearances per match": "Giải nguy mỗi trận",
    "Possession won final 3rd per match": "Giành bóng 1/3 sân đối phương mỗi trận",
    "Set piece goals conceded": "Bàn thua từ tình huống cố định",
    "Saves per match": "Cứu thua mỗi trận",
    "Fouls per match": "Phạm lỗi mỗi trận"
};

export default function StatCard({ statBlock, type, fonts }: StatCardProps) {
    // Nếu có trong từ điển thì lấy tiếng Việt, không thì giữ nguyên tiếng Anh của API
    const translatedHeader = statTranslations[statBlock.header] || statBlock.header;

    return (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-5 hover:border-slate-700 transition">
            <h3 className={`text-lg text-blue-400 mb-4 uppercase tracking-wider ${fonts.subHeading}`}>
                {translatedHeader}
            </h3>
            <div className="space-y-3">
                {statBlock.topThree?.map((item: any, i: number) => {
                    // Hiệu ứng và màu sắc riêng cho Top 1 (Vàng), Top 2 (Bạc), Top 3 (Đồng)
                    const rankColors = [
                        "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] text-2xl scale-110", // Hạng 1
                        "text-slate-300 text-xl", // Hạng 2
                        "text-orange-400 text-xl" // Hạng 3
                    ];
                    const rankClass = rankColors[i] || "text-slate-500 text-base";

                    // Nhấn mạnh background và viền cho Top 1
                    const cardHighlight = i === 0
                        ? "border-yellow-500/30 bg-linear-to-r from-yellow-500/10 to-slate-950/60"
                        : "border-slate-800/50 bg-slate-950/60";

                    return (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-2xl border ${cardHighlight}`}>
                            <div className="flex items-center gap-4">
                                <span className={`font-black w-6 text-center transition-all ${rankClass} ${fonts.heading}`}>
                                    {i + 1}
                                </span>

                                {type === 'player' ? (
                                    <div>
                                        <p className="font-bold text-white text-sm leading-tight">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase mt-0.5">{item.teamName}</p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <img
                                            src={`https://images.fotmob.com/image_resources/logo/teamlogo/${item.teamId || item.id}.png`}
                                            className="w-6 h-6 object-contain"
                                            alt={item.name}
                                        />
                                        <p className="font-bold text-white text-sm">{item.name}</p>
                                    </div>
                                )}
                            </div>
                            <span className={`text-xl text-white ${fonts.heading}`}>
                                {item.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}