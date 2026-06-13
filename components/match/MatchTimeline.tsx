import { Clock, BarChart2 } from 'lucide-react';

const GOAL_DESC_MAP: Record<string, string> = {
    "Header": "Đánh đầu",
    "Penalty": "Phạt đền",
    "Own goal": "Phản lưới nhà",
    "Free kick": "Đá phạt trực tiếp",
    "Right foot": "Chân phải",
    "Left foot": "Chân trái",
    "RightFoot": "Chân phải",
    "LeftFoot": "Chân trái"
};

export default function MatchTimeline({ events, momentum }: { events: any[], momentum: any[] }) {
    return (
        <div className="space-y-8">
            {/* Momentum Chart */}
            {momentum && momentum.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                        <BarChart2 className="w-5 h-5 text-indigo-500" /> Áp lực trận đấu
                    </h3>
                    <div className="relative w-full h-32 flex flex-col">
                        <div className="absolute inset-y-0 left-0 w-full h-px bg-slate-700 top-1/2 -translate-y-1/2" />
                        <div className="flex-1 flex items-end justify-between gap-px">
                            {momentum.map((m: any, i: number) => (
                                <div key={`h-${i}`} className="flex-1 bg-blue-500 rounded-t-sm transition-all" style={{ height: m.value > 0 ? `${Math.min(m.value, 100)}%` : '0%' }} title={`Phút ${m.minute}: ${m.value}`} />
                            ))}
                        </div>
                        <div className="flex-1 flex items-start justify-between gap-px">
                            {momentum.map((m: any, i: number) => (
                                <div key={`a-${i}`} className="flex-1 bg-amber-500 rounded-b-sm transition-all" style={{ height: m.value < 0 ? `${Math.min(Math.abs(m.value), 100)}%` : '0%' }} title={`Phút ${m.minute}: ${m.value}`} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase mt-3">
                        <span>0'</span><span>Hết H1</span><span>Hết trận</span>
                    </div>
                </div>
            )}

            {/* Timeline */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-8 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                    <Clock className="w-5 h-5 text-teal-500" /> Diễn biến
                </h3>
                {events.length > 0 ? (
                    <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-8.75 before:w-px before:bg-slate-800">
                        {[...events].reverse().map((ev: any, idx: number) => {
                            if (ev.type === "Half") {
                                return (
                                    <div key={idx} className="flex justify-center relative z-10 py-4">
                                        <span className="bg-slate-800 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-slate-700 shadow-md">
                                            {ev.halfStrShort === "HT" ? "Hết H1" : ev.halfStrShort === "FT" ? "Hết trận" : ev.halfStrShort} {ev.homeScore} - {ev.awayScore}
                                        </span>
                                    </div>
                                );
                            }
                            if (ev.type === "AddedTime") {
                                return (
                                    <div key={idx} className="flex justify-center relative z-10 py-2">
                                        <span className="bg-slate-900/80 text-slate-400 text-[10px] uppercase font-bold px-3 py-1 rounded-full border border-slate-800">
                                            +{ev.minutesAddedInput} phút bù giờ
                                        </span>
                                    </div>
                                );
                            }

                            let icon = "⚽";
                            if (ev.type === "Card" && ev.card === "Yellow") icon = "🟨";
                            if (ev.type === "Card" && ev.card === "Red") icon = "🟥";
                            if (ev.type === "Substitution") icon = "🔄";

                            let assistText = ev.assistStr?.replace("assist by", "Kiến tạo bởi") || "";
                            let goalDesc = ev.goalDescription ? (GOAL_DESC_MAP[ev.goalDescription] || ev.goalDescription) : "";

                            return (
                                <div key={idx} className={`flex items-center gap-4 relative z-10 ${ev.isHome ? 'flex-row' : 'flex-row-reverse'}`}>
                                    <div className="w-10 text-xs font-black text-slate-400 text-center shrink-0">{ev.timeStr}'</div>
                                    <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-700 flex items-center justify-center text-sm shadow-md shrink-0">{icon}</div>
                                    <div className={`flex-1 p-3 rounded-2xl border ${ev.isHome ? 'bg-blue-500/10 border-blue-500/20 text-left' : 'bg-amber-500/10 border-amber-500/20 text-right'}`}>
                                        {ev.type === "Substitution" ? (
                                            <div className={`text-sm font-bold text-slate-300 flex flex-col gap-1 ${ev.isHome ? 'items-start' : 'items-end'}`}>
                                                <span className="text-green-400">↑ {ev.swap?.[0]?.name}</span>
                                                <span className="text-red-400">↓ {ev.swap?.[1]?.name}</span>
                                            </div>
                                        ) : (
                                            <div className="text-sm font-bold text-white">
                                                {ev.nameStr || ev.player?.name}
                                                {ev.type === "Goal" && <span className="ml-2 text-xs font-black text-slate-500">({ev.newScore[0]} - {ev.newScore[1]})</span>}
                                                <div className={`text-xs font-normal text-slate-400 mt-1 flex gap-2 ${ev.isHome ? 'justify-start' : 'justify-end'}`}>
                                                    {goalDesc && <span>{goalDesc},</span>}
                                                    {assistText && <span>{assistText}</span>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-slate-500 text-sm text-center py-10">Chưa có sự kiện nào.</p>
                )}
            </div>
        </div>
    );
}