import { Users, Shield } from 'lucide-react';

export default function MatchLineups({ lineup, homeTeam, awayTeam }: { lineup: any, homeTeam: any, awayTeam: any }) {
    if (!lineup) return null;

    // Helper render row cầu thủ
    const renderSubRow = (p: any) => {
        if (!p) return <li className="h-8 opacity-0 pointer-events-none" aria-hidden="true"></li>;

        const subInEvent = p.performance?.substitutionEvents?.find((e: any) => e.type === "subIn");
        return (
            <li className="text-xs flex items-center justify-between group h-8">
                <div className="flex items-center gap-3 w-full">
                    {p.performance?.rating ? (
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-[10px] shrink-0 ${p.performance.rating >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>{p.performance.rating}</span>
                    ) : (
                        <span className="w-6 h-6 rounded bg-slate-800/50 shrink-0" />
                    )}
                    <span className="text-slate-500 font-mono w-4 text-right shrink-0">{p.shirtNumber}</span>
                    <span className="text-slate-200 font-medium truncate">{p.name}</span>
                </div>
                {subInEvent && (
                    <div className="flex items-center gap-1.5 bg-slate-800/50 px-2 py-0.5 rounded text-[10px] text-slate-400 font-bold shrink-0 ml-2">
                        <span className="text-green-400">↑</span> {subInEvent.time}´
                    </div>
                )}
            </li>
        );
    };

    // BẢO VỆ DỮ LIỆU: Nếu không có mảng subs (trận chưa đá), mặc định là mảng rỗng []
    const homeSubs = lineup.homeTeam.subs || [];
    const awaySubs = lineup.awayTeam.subs || [];

    // Bóc tách & đệm mảng Đã Vào Sân cho bằng nhau
    const homeUsed = homeSubs.filter((p: any) => p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
    const awayUsed = awaySubs.filter((p: any) => p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
    const maxUsed = Math.max(homeUsed.length, awayUsed.length);
    const homeUsedPadded = Array.from({ length: maxUsed }).map((_, i) => homeUsed[i] || null);
    const awayUsedPadded = Array.from({ length: maxUsed }).map((_, i) => awayUsed[i] || null);

    // Bóc tách & đệm mảng Chờ Dự Bị cho bằng nhau
    const homeBench = homeSubs.filter((p: any) => !p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
    const awayBench = awaySubs.filter((p: any) => !p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
    const maxBench = Math.max(homeBench.length, awayBench.length);
    const homeBenchPadded = Array.from({ length: maxBench }).map((_, i) => homeBench[i] || null);
    const awayBenchPadded = Array.from({ length: maxBench }).map((_, i) => awayBench[i] || null);

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                <Users className="w-5 h-5 text-indigo-500" /> Đội hình thi đấu {lineup.lineupType === "predicted" && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded ml-2 font-bold uppercase tracking-widest">(Dự kiến)</span>}
            </h3>

            <div className="grid grid-cols-2 gap-4 md:gap-8">
                {/* Đội nhà */}
                <div>
                    <div className="mb-4 pb-2 border-b border-blue-900/50">
                        <h4 className="font-bold text-blue-400 text-lg truncate">{homeTeam.name}</h4>
                        <p className="text-xs text-slate-400">Đội hình: {lineup.homeTeam.formation}</p>
                    </div>
                    {/* Đá chính */}
                    <ul className="space-y-3 mb-6">
                        {lineup.homeTeam.starters?.map((p: any) => (
                            <li key={p.id} className="text-sm flex items-center gap-3">
                                {p.performance?.rating ? (
                                    <span className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 ${p.performance.rating >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>{p.performance.rating}</span>
                                ) : <span className="w-7 h-7 rounded bg-slate-800/50 shrink-0" />}
                                <span className="text-slate-500 w-4 text-right font-mono text-xs">{p.shirtNumber}</span>
                                <span className="font-medium text-slate-200 truncate">{p.name}</span>
                                {p.isCaptain && <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded ml-auto">C</span>}
                            </li>
                        ))}
                    </ul>

                    {/* Đã vào sân */}
                    {maxUsed > 0 && (
                        <div className="mb-4">
                            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Đã vào sân</h5>
                            <ul className="space-y-2">{homeUsedPadded.map((p, i) => <div key={i}>{renderSubRow(p)}</div>)}</ul>
                        </div>
                    )}

                    {/* Chờ dự bị */}
                    {maxBench > 0 && (
                        <div>
                            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Dự bị</h5>
                            <ul className="space-y-2">{homeBenchPadded.map((p, i) => <div key={i}>{renderSubRow(p)}</div>)}</ul>
                        </div>
                    )}

                    {/* HLV */}
                    <div className="text-sm border-t border-slate-800 mt-6 pt-4 flex items-center gap-2 text-slate-300">
                        <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-bold text-white truncate">{lineup.homeTeam.coach?.name || 'Đang cập nhật'}</span>
                    </div>
                </div>

                {/* Đội khách */}
                <div>
                    <div className="mb-4 pb-2 border-b border-amber-900/50">
                        <h4 className="font-bold text-amber-400 text-lg truncate">{awayTeam.name}</h4>
                        <p className="text-xs text-slate-400">Đội hình: {lineup.awayTeam.formation}</p>
                    </div>
                    {/* Đá chính */}
                    <ul className="space-y-3 mb-6">
                        {lineup.awayTeam.starters?.map((p: any) => (
                            <li key={p.id} className="text-sm flex items-center gap-3">
                                {p.performance?.rating ? (
                                    <span className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs shrink-0 ${p.performance.rating >= 7 ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300'}`}>{p.performance.rating}</span>
                                ) : <span className="w-7 h-7 rounded bg-slate-800/50 shrink-0" />}
                                <span className="text-slate-500 w-4 text-right font-mono text-xs">{p.shirtNumber}</span>
                                <span className="font-medium text-slate-200 truncate">{p.name}</span>
                                {p.isCaptain && <span className="text-[10px] bg-amber-600 text-black px-1.5 py-0.5 rounded font-bold ml-auto">C</span>}
                            </li>
                        ))}
                    </ul>

                    {/* Đã vào sân */}
                    {maxUsed > 0 && (
                        <div className="mb-4">
                            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Đã vào sân</h5>
                            <ul className="space-y-2">{awayUsedPadded.map((p, i) => <div key={i}>{renderSubRow(p)}</div>)}</ul>
                        </div>
                    )}

                    {/* Chờ dự bị */}
                    {maxBench > 0 && (
                        <div>
                            <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">Dự bị</h5>
                            <ul className="space-y-2">{awayBenchPadded.map((p, i) => <div key={i}>{renderSubRow(p)}</div>)}</ul>
                        </div>
                    )}

                    {/* HLV */}
                    <div className="text-sm border-t border-slate-800 mt-6 pt-4 flex items-center gap-2 text-slate-300">
                        <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="font-bold text-white truncate">{lineup.awayTeam.coach?.name || 'Đang cập nhật'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}