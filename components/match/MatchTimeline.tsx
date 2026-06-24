import { Clock, BarChart2, CircleDot, Square, ArrowRightLeft, Flag, Bandage, Target, CheckCircle, XCircle, Monitor } from 'lucide-react';

const GOAL_DESC_MAP: Record<string, string> = {
    "Header": "Đánh đầu",
    "Penalty": "Phạt đền",
    "Own goal": "Phản lưới nhà",
    "Free kick": "Đá phạt trực tiếp",
    "Right foot": "Chân phải",
    "Left foot": "Chân trái",
    "RightFoot": "Chân phải",
    "LeftFoot": "Chân trái",
    "Missed penalty": "Đá hỏng phạt đền",
};

const VAR_DESC_MAP: Record<string, string> = {
    "Goal ruled out": "Hủy bàn thắng",
    "foul": "Phạm lỗi",
    "offside": "Việt vị",
    "handball": "Chạm tay",
    "Penalty awarded": "Cho hưởng phạt đền",
    "Penalty cancelled": "Hủy phạt đền",
    "Card upgrade": "Nâng thành thẻ đỏ",
    "Card cancelled": "Hủy thẻ",
    "Goal confirmed": "Công nhận bàn thắng",
    "Missed penalty - to be retaken": "Đá hỏng phạt đền - Cho đá lại"
};

const renderEventIcon = (type: string, cardType?: string, isHome?: boolean) => {
    // Xác định màu theo đội
    const teamColor = isHome === true ? "text-blue-400 fill-blue-400/30" : isHome === false ? "text-amber-400 fill-amber-400/30" : "text-slate-400";
    const iconColor = isHome === true ? "text-blue-400" : isHome === false ? "text-amber-400" : "text-slate-400";

    switch (type) {
        case "Goal": return <CircleDot className={`w-3 h-3 ${teamColor}`} />;
        case "Substitution": return <ArrowRightLeft className={`w-3 h-3 ${iconColor}`} />;
        // Các sự kiện đặc thù giữ màu riêng (Đỏ, Vàng, Tím)
        case "Card":
            if (cardType === "Red") return <Square className="w-3 h-3 text-red-500 fill-red-500" />;
            return <Square className="w-3 h-3 text-yellow-500 fill-yellow-500" />;
        case "VAR": return <Monitor className="w-3 h-3 text-purple-400" />;
        case "MissedPenalty": return <XCircle className="w-3 h-3 text-red-500" />;
        default: return <CircleDot className={`w-3 h-3 ${teamColor}`} />;
    }
};

export default function MatchTimeline({ matchData, homeTeam, awayTeam }: { matchData: any, homeTeam: any, awayTeam: any }) {
    const events = matchData.content?.matchFacts?.events?.events || [];
    const penaltyShootoutEvents = matchData.content?.matchFacts?.events?.penaltyShootoutEvents || [];
    const rawMomentum = matchData.content?.momentum?.main?.data || [];

    const hasPenalties = penaltyShootoutEvents.length > 0;
    const importantEvents = events.filter((e: any) => e.type === "Goal" || (e.type === "Card" && e.card === "Red") || e.type === "RedCard" || e.type === "VAR");

    // Đồng bộ biểu đồ áp lực với thời gian thực của trận đấu
    const maxMinute = Math.max(90, rawMomentum.reduce((max: number, m: any) => Math.max(max, m.minute), 0));
    const hasExtraTime = maxMinute > 100 || events.some((e: any) => e.time > 95 && e.type !== "PenaltyShootout");

    // Đệm thêm các phút trống nếu trận đấu đang diễn ra để layout tỷ lệ % luôn đúng
    const momentumBars = Array.from({ length: maxMinute }).map((_, i) => {
        const min = i + 1;
        return rawMomentum.find((m: any) => m.minute === min) || { minute: min, value: 0 };
    });

    const pct = (min: number) => `${(min / maxMinute) * 100}%`;

    // THUẬT TOÁN GỘP SỰ KIỆN CÙNG THỜI GIAN VÀ CÙNG LOẠI
    const groupedEvents: any[] = [];
    events.forEach((ev: any) => {
        if (["Half", "AddedTime", "PenaltyShootout"].includes(ev.type)) {
            groupedEvents.push({ type: "Special", data: ev });
            return;
        }

        const lastGroup = groupedEvents[groupedEvents.length - 1];
        if (lastGroup && lastGroup.type === "MatchEvent" && lastGroup.timeStr === ev.timeStr && lastGroup.eventType === ev.type) {
            if (ev.isHome) lastGroup.homeEvents.push(ev);
            else lastGroup.awayEvents.push(ev);
        } else {
            groupedEvents.push({
                type: "MatchEvent",
                timeStr: ev.timeStr,
                eventType: ev.type,
                homeEvents: ev.isHome ? [ev] : [],
                awayEvents: !ev.isHome ? [ev] : [],
                sampleEvent: ev
            });
        }
    });

    const renderEventDetail = (ev: any, isHome: boolean, index: number) => {
        if (ev.type === "Substitution") {
            return (
                <div key={index} className="text-sm font-bold text-slate-300 flex flex-col gap-1.5">
                    <span className={`flex items-center gap-1.5 text-green-400 ${isHome ? 'justify-end' : 'justify-start'}`}>
                        {isHome ? <><span className="truncate">{ev.swap?.[0]?.name}</span> <ArrowRightLeft className="w-3 h-3 shrink-0" /></> : <><ArrowRightLeft className="w-3 h-3 shrink-0" /> <span className="truncate">{ev.swap?.[0]?.name}</span></>}
                    </span>
                    <span className={`flex items-center gap-1.5 text-red-400 ${isHome ? 'justify-end' : 'justify-start'}`}>
                        {isHome ? (
                            <>
                                {ev.injuredPlayerOut && <span title="Chấn thương"><Bandage className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>}
                                <span className="truncate">{ev.swap?.[1]?.name}</span> <ArrowRightLeft className="w-3 h-3 shrink-0" />
                            </>
                        ) : (
                            <>
                                <ArrowRightLeft className="w-3 h-3 shrink-0" /> <span className="truncate">{ev.swap?.[1]?.name}</span>
                                {ev.injuredPlayerOut && <span title="Chấn thương"><Bandage className="w-3.5 h-3.5 text-rose-500 shrink-0" /></span>}
                            </>
                        )}
                    </span>
                </div>
            );
        }

        const assistText = ev.assistStr?.replace("assist by", "Kiến tạo bởi") || "";
        const goalDesc = ev.goalDescription ? (GOAL_DESC_MAP[ev.goalDescription] || ev.goalDescription) : "";
        let combinedDesc = [goalDesc, assistText].filter(Boolean).join(", ");

        // Xử lý chuỗi text cho sự kiện VAR và Đá hỏng phạt đền
        if (ev.type === "VAR" && ev.VAR?.decision?.value) {
            combinedDesc = ev.VAR.decision.value.map((v: string) => VAR_DESC_MAP[v] || v).join(" - ");
        } else if (ev.type === "MissedPenalty") {
            combinedDesc = "Đá hỏng phạt đền";
        }

        return (
            <div key={index} className="text-sm font-bold text-white flex flex-col">
                <div className={`flex items-center gap-2 ${isHome ? 'justify-end' : 'justify-start'}`}>
                    {isHome && ev.type === "Goal" && <span className="text-xs font-black text-slate-900 bg-yellow-500 px-1.5 py-0.5 rounded ml-1">{ev.newScore[0]} - {ev.newScore[1]}</span>}
                    {ev.nameStr || ev.player?.name}
                    {!isHome && ev.type === "Goal" && <span className="text-xs font-black text-slate-900 bg-yellow-500 px-1.5 py-0.5 rounded mr-1">{ev.newScore[0]} - {ev.newScore[1]}</span>}
                </div>
                {combinedDesc && (
                    <div className={`text-[11px] font-normal text-slate-300 mt-1 flex gap-2 ${isHome ? 'justify-end' : 'justify-start'}`}>
                        {combinedDesc}
                    </div>
                )}
            </div>
        );
    };

    // Chuẩn bị dữ liệu cho UI Penalty Shootout
    const homePenalties = penaltyShootoutEvents.filter((e: any) => e.isHome);
    const awayPenalties = penaltyShootoutEvents.filter((e: any) => !e.isHome);
    const totalRounds = Math.max(5, homePenalties.length, awayPenalties.length);

    const renderPenaltyBoxes = (teamPenalties: any[]) => {
        return (
            <div className="flex gap-2">
                {Array.from({ length: totalRounds }).map((_, i) => {
                    const pen = teamPenalties[i];
                    let boxStyle = "bg-slate-800 text-slate-500 border-slate-700"; // Chưa sút

                    if (pen) {
                        if (pen.type === "Goal") {
                            boxStyle = "bg-emerald-500 text-white border-emerald-400"; // Vào
                        } else {
                            boxStyle = "bg-red-500 text-white border-red-400"; // Trượt
                        }
                    }

                    return (
                        <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-black border ${boxStyle}`}>
                            {i + 1}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8">

            {/* LOẠT SÚT LUÂN LƯU (Penalty Shootout UI MỚI) */}
            {hasPenalties && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-amber-500/5 pointer-events-none" />

                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-amber-500 border-b border-slate-800 pb-4 relative z-10">
                        <Target className="w-5 h-5" /> Penalty-shootout
                    </h3>

                    {/* Bảng tóm tắt (Overview) */}
                    <div className="flex flex-col gap-4 relative z-10 mb-8 p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate w-24 md:w-32">{homeTeam.name}</span>
                            {renderPenaltyBoxes(homePenalties)}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-white truncate w-24 md:w-32">{awayTeam.name}</span>
                            {renderPenaltyBoxes(awayPenalties)}
                        </div>
                    </div>

                    {/* Danh sách chi tiết từng lượt sút */}
                    <ul className="flex flex-col gap-3 relative z-10">
                        {penaltyShootoutEvents.map((ev: any, i: number) => {
                            const isGoal = ev.type === "Goal";
                            const scoreStr = ev.penShootoutScore ? `(${ev.penShootoutScore[0]} - ${ev.penShootoutScore[1]})` : "";

                            return (
                                <li key={i} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/50 px-4 py-3 rounded-xl hover:bg-slate-800/80 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1 h-6 rounded-full ${ev.isHome ? 'bg-blue-500' : 'bg-amber-500'}`} />
                                        <span className="font-bold text-slate-200 flex items-center gap-2">
                                            {ev.player?.name || ev.nameStr}
                                            <span className="text-slate-400 text-xs font-mono tracking-widest bg-slate-950/50 px-2 py-0.5 rounded">
                                                {scoreStr}
                                            </span>
                                        </span>
                                    </div>
                                    <div className="shrink-0">
                                        {isGoal ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* BIỂU ĐỒ ĐỘNG LỰC TRẬN ĐẤU (Match Momentum Chart) */}
            {momentumBars.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> BIỂU ĐỒ ĐỘNG LỰC TRẬN ĐẤU
                    </h3>
                    {/* KHÔNG DÙNG overflow-hidden ở thẻ cha để các icon không bị cắt mất */}
                    <div className="relative w-full h-32 flex flex-col mt-8 mb-6">

                        {/* 1. LỚP NỀN LƯỚI Ô VUÔNG (Nằm dưới cùng, bọc viền và ẩn tràn riêng lẻ) */}
                        <div className="absolute inset-0 border border-slate-800/50 rounded-sm overflow-hidden bg-slate-950/30 z-0 pointer-events-none">
                            <div
                                className="absolute inset-0 opacity-30"
                                style={{
                                    backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)',
                                    backgroundSize: '12px 12px'
                                }}
                            />
                        </div>

                        {/* 2. Trục ngang 0 */}
                        <div className="absolute inset-y-0 left-0 w-full h-0.5 bg-slate-600 top-1/2 -translate-y-1/2 z-0" />

                        {/* 3. CÁC ĐƯỜNG NÉT ĐỨT MỐC THỜI GIAN CHÍNH (Đậm hơn một chút) */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            {[15, 30, 45, 60, 75, 90, 97, 105, 112].map((min) => {
                                if (min >= maxMinute) return null;
                                return (
                                    <div
                                        key={min}
                                        className="absolute top-0 bottom-0 border-l border-dashed border-slate-500/50"
                                        style={{ left: pct(min) }}
                                    />
                                );
                            })}
                        </div>

                        <div className="flex-1 flex items-end justify-between gap-px z-10">
                            {momentumBars.map((m: any, i: number) => (
                                <div key={`h-${i}`} className="flex-1 bg-blue-500 rounded-t-sm transition-all" style={{ height: m.value > 0 ? `${Math.min(m.value, 100)}%` : '0%' }} title={`Phút ${m.minute}: ${m.value}`} />
                            ))}
                        </div>
                        <div className="flex-1 flex items-start justify-between gap-px z-10">
                            {momentumBars.map((m: any, i: number) => (
                                <div key={`a-${i}`} className="flex-1 bg-amber-500 rounded-b-sm transition-all" style={{ height: m.value < 0 ? `${Math.min(Math.abs(m.value), 100)}%` : '0%' }} title={`Phút ${m.minute}: ${m.value}`} />
                            ))}
                        </div>

                        {/* Ghim sự kiện nổi hẳn lên trên/dưới */}
                        {importantEvents.map((ev: any, i: number) => {
                            const leftPerc = Math.max(0, Math.min(100, (ev.time / maxMinute) * 100));
                            const isGoal = ev.type === "Goal";
                            const isHomeEvent = ev.isHome;
                            const verticalPos = isHomeEvent ? "top-0 -translate-y-[80%]" : "bottom-0 translate-y-[80%]";

                            return (
                                <div key={`pin-${i}`} className={`absolute ${verticalPos} -translate-x-1/2 z-20`} style={{ left: `${leftPerc}%` }}>
                                    <div className={`bg-slate-950 rounded-full p-0.75 shadow-lg border ${isHomeEvent ? 'border-blue-500/50' : 'border-amber-500/50'}`}>
                                        {/* Tái sử dụng hàm renderEventIcon để đồng bộ màu */}
                                        {renderEventIcon(ev.type, ev.card, isHomeEvent)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Chú thích mốc thời gian căn theo tỷ lệ chính xác */}
                    <div className="relative w-full h-4 mt-4 text-[10px] text-slate-500 font-bold uppercase">
                        <span className="absolute left-0 translate-x-0">Đầu trận</span>
                        <span className="absolute -translate-x-1/2 hidden sm:block" style={{ left: pct(15) }}>15'</span>
                        <span className="absolute -translate-x-1/2 hidden sm:block" style={{ left: pct(30) }}>30'</span>
                        <span className="absolute -translate-x-1/2" style={{ left: pct(45) }}>Hết H1</span>
                        <span className="absolute -translate-x-1/2 hidden sm:block" style={{ left: pct(60) }}>60'</span>
                        <span className="absolute -translate-x-1/2 hidden sm:block" style={{ left: pct(75) }}>75'</span>

                        {hasExtraTime ? (
                            <>
                                <span className="absolute -translate-x-1/2" style={{ left: pct(90) }}>Hết H2</span>
                                {maxMinute >= 97 && <span className="absolute -translate-x-1/2 hidden md:block" style={{ left: pct(97) }}>97'</span>}
                                {maxMinute >= 105 && <span className="absolute -translate-x-1/2" style={{ left: pct(105) }}>Hết HP1</span>}
                                {maxMinute >= 112 && <span className="absolute -translate-x-1/2 hidden md:block" style={{ left: pct(112) }}>112'</span>}
                                <span className="absolute right-0 translate-x-0">{hasPenalties ? "Hết HP" : "Hết trận"}</span>
                            </>
                        ) : (
                            <span className="absolute right-0 translate-x-0">Hết trận</span>
                        )}
                    </div>
                </div>
            )}

            {/* DIỄN BIẾN CHÍNH (Timeline) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                    <Clock className="w-5 h-5 text-teal-500" /> Diễn biến chính
                </h3>
                {groupedEvents.length > 0 ? (
                    <div className="relative flex flex-col w-full py-2">
                        {/* Trục giữa */}
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-800 -translate-x-1/2 z-0" />

                        <div className="flex flex-col gap-8 w-full">
                            {groupedEvents.map((group: any, idx: number) => {

                                // Xử lý các node Đặc biệt (Hết hiệp, Bù giờ, Luân lưu)
                                if (group.type === "Special") {
                                    const ev = group.data;

                                    if (ev.type === "PenaltyShootout") {
                                        return (
                                            <div key={idx} className="flex justify-center relative z-10 py-2">
                                                <span className="bg-amber-600/20 text-amber-500 text-xs font-black px-4 py-1.5 rounded-full border border-amber-500/50 flex items-center gap-2 uppercase tracking-widest shadow-lg">
                                                    Luân lưu {ev.penaltyScore?.[0]} - {ev.penaltyScore?.[1]}
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (ev.type === "Half") {
                                        let label = ev.halfStrShort;
                                        if (label === "HT") label = "Hết H1";
                                        else if (label === "FT") label = hasExtraTime ? "Hết H2" : "Hết trận";
                                        else if (label === "AET") label = "Hết hiệp phụ";

                                        return (
                                            <div key={idx} className="flex justify-center relative z-10 py-1">
                                                <span className="bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-slate-700 shadow-md flex items-center gap-2">
                                                    <Flag className="w-3 h-3 text-slate-400" />
                                                    {label} {ev.homeScore} - {ev.awayScore}
                                                </span>
                                            </div>
                                        );
                                    }

                                    if (ev.type === "AddedTime") {
                                        return (
                                            <div key={idx} className="flex justify-center relative z-10">
                                                <span className="bg-slate-950 text-slate-400 text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-slate-500" /> +{ev.minutesAddedInput} phút bù giờ
                                                </span>
                                            </div>
                                        );
                                    }
                                    return null;
                                }

                                // Xử lý các Cột mốc Sự kiện thường
                                const { timeStr, eventType, homeEvents, awayEvents, sampleEvent } = group;

                                return (
                                    <div key={idx} className="flex w-full items-center relative z-10 min-h-10">

                                        {/* Đội nhà (Bên trái) */}
                                        <div className="w-1/2 pr-6 md:pr-10 flex flex-col justify-center text-right">
                                            {homeEvents.length > 0 && (
                                                <div className={`flex flex-col gap-4 ml-auto max-w-full ${eventType === 'Substitution' ? '' : 'bg-blue-600/20 border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.1)] p-3 rounded-2xl'}`}>
                                                    {homeEvents.map((ev: any, i: number) => renderEventDetail(ev, true, i))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Tọa độ Thời gian Gộp (Trục giữa) */}
                                        <div className="absolute left-1/2 -translate-x-1/2 min-w-8 w-auto px-2 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-[11px] font-black text-slate-300 shadow-md z-20 whitespace-nowrap">
                                            {timeStr}'
                                            <div className="absolute -top-1 -right-1.5 bg-slate-900 rounded-full border border-slate-700 shadow-sm p-0.5">
                                                {/* Bổ sung thêm isHome để tô màu icon */}
                                                {renderEventIcon(eventType, sampleEvent.card, sampleEvent.isHome)}
                                            </div>
                                        </div>

                                        {/* Đội khách (Bên phải) */}
                                        <div className="w-1/2 pl-6 md:pl-10 flex flex-col justify-center text-left">
                                            {awayEvents.length > 0 && (
                                                <div className={`flex flex-col gap-4 mr-auto max-w-full ${eventType === 'Substitution' ? '' : 'bg-amber-500/10 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)] p-3 rounded-2xl'}`}>
                                                    {awayEvents.map((ev: any, i: number) => renderEventDetail(ev, false, i))}
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-10">Chưa có sự kiện nào.</p>
                )}
            </div>
        </div>
    );
}