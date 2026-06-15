"use client";

import { Users, Shield, ArrowRightLeft, Star } from 'lucide-react';
import MatchPitch from './MatchPitch';

const POS_MAP: Record<number, string> = {
    0: "Thủ môn",
    1: "Hậu vệ",
    2: "Tiền vệ",
    3: "Tiền đạo"
};

export const formatMarketValue = (value?: number) => {
    if (!value) return null;
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
};

export default function MatchLineups({ lineup, homeTeam, awayTeam }: { lineup: any, homeTeam: any, awayTeam: any }) {
    if (!lineup) return null;

    // Tìm điểm số cao nhất của mỗi đội
    const getHighestRating = (teamInfo: any) => {
        let max = 0;
        const allPlayers = [...(teamInfo?.starters || []), ...(teamInfo?.subs || [])];
        allPlayers.forEach(p => {
            if (p.performance?.rating > max) max = p.performance.rating;
        });
        return max;
    };

    const homeMaxRating = getHighestRating(lineup.homeTeam);
    const awayMaxRating = getHighestRating(lineup.awayTeam);

    const renderPlayerRow = (p: any, index: number, isSub: boolean = false, isHome: boolean = true) => {
        if (!p) return <li key={`empty-${index}`} className="h-11 opacity-0 pointer-events-none" aria-hidden="true"></li>;

        const subInEvent = isSub ? p.performance?.substitutionEvents?.find((e: any) => e.type === "subIn") : null;
        const rating = p.performance?.rating;
        const maxRating = isHome ? homeMaxRating : awayMaxRating;

        const isHighest = rating && rating === maxRating && rating > 0;

        let badgeStyle = "bg-slate-800 text-slate-300";
        if (rating >= 8.5) badgeStyle = "bg-purple-500/20 text-purple-400";
        else if (rating >= 8.0) badgeStyle = "bg-emerald-500/20 text-emerald-400";
        else if (rating >= 7.0) badgeStyle = "bg-green-500/20 text-green-400";
        else if (rating >= 6.0) badgeStyle = "bg-yellow-500/20 text-yellow-400";
        else if (rating > 0) badgeStyle = "bg-orange-500/20 text-orange-400";

        const marketValueStr = formatMarketValue(p.marketValue);

        return (
            <li key={p.id} className={`text-xs flex items-center justify-between py-2.5 px-2 border-b border-slate-800/50 last:border-0 transition-colors ${isHighest ? 'bg-slate-800/60' : 'hover:bg-slate-800/20'}`}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {rating ? (
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[11px] shrink-0 transition-all ${badgeStyle}`}>
                            {rating.toFixed(1)}
                        </span>
                    ) : (
                        <span className="w-8 h-8 rounded-lg bg-slate-800/50 shrink-0 flex items-center justify-center text-[10px] text-slate-600">-</span>
                    )}
                    <span className="text-slate-500 font-mono w-4 text-right shrink-0">{p.shirtNumber}</span>

                    <div className="flex flex-col truncate gap-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium truncate leading-tight ${isHighest ? 'text-white font-bold' : 'text-slate-200'}`}>
                                {p.name}
                            </span>
                            {/* Nút sao Vàng cho người xuất sắc nhất */}
                            {isHighest && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}

                            {p.isCaptain && (
                                <span className="text-[9px] bg-blue-600 text-white px-1.5 rounded font-black shrink-0 shadow-sm">
                                    C
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest leading-tight">
                                {POS_MAP[p.usualPlayingPositionId] || "Cầu thủ"}
                            </span>
                            {marketValueStr && (
                                <span className="text-[9px] text-emerald-500/80 bg-emerald-500/10 px-1 rounded font-mono border border-emerald-500/20">
                                    {marketValueStr}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {subInEvent && (
                    <div className="flex items-center gap-1 bg-slate-800/50 px-2 py-1 rounded-md text-[10px] text-slate-300 font-bold shrink-0 ml-2 border border-slate-700/50">
                        <ArrowRightLeft className="w-3 h-3 text-emerald-400" /> {subInEvent.time}'
                    </div>
                )}
            </li>
        );
    };

    const processSubs = (teamData: any) => {
        const subs = teamData.subs || [];
        const used = subs.filter((p: any) => p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
        const bench = subs.filter((p: any) => !p.performance?.substitutionEvents?.some((e: any) => e.type === "subIn"));
        return { used, bench };
    };

    const homeData = processSubs(lineup.homeTeam);
    const awayData = processSubs(lineup.awayTeam);

    const maxUsed = Math.max(homeData.used.length, awayData.used.length);
    const maxBench = Math.max(homeData.bench.length, awayData.bench.length);

    const padArray = (arr: any[], length: number) => Array.from({ length }).map((_, i) => arr[i] || null);

    return (
        <div className="space-y-8">
            <MatchPitch
                homeData={lineup.homeTeam}
                awayData={lineup.awayTeam}
                homeTeamBasic={homeTeam}
                awayTeamBasic={awayTeam}
            />

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-4">
                    <Users className="w-5 h-5 text-indigo-500" /> Danh sách thi đấu {lineup.lineupType === "predicted" && <span className="text-[10px] text-amber-500 bg-amber-500/10 px-2 py-1 rounded ml-2 font-bold uppercase tracking-widest">(Dự kiến)</span>}
                </h3>

                <div className="grid grid-cols-2 gap-4 md:gap-8">
                    {/* ĐỘI NHÀ */}
                    <div className="flex flex-col h-full">
                        <div>
                            <div className="mb-4 pb-2 border-b border-blue-900/50">
                                <h4 className="font-bold text-blue-400 text-lg truncate">{homeTeam.name}</h4>
                            </div>
                            <ul className="mb-6">
                                {lineup.homeTeam.starters?.map((p: any, i: number) => renderPlayerRow(p, i, false, true))}
                            </ul>

                            {maxUsed > 0 && (
                                <div className="mb-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1 mx-2 mt-1">Đã vào sân</h5>
                                    <ul className="space-y-0">{padArray(homeData.used, maxUsed).map((p, i) => renderPlayerRow(p, i, true, true))}</ul>
                                </div>
                            )}

                            {maxBench > 0 && (
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1 mx-2">Dự bị</h5>
                                    <ul className="space-y-0 opacity-80">{padArray(homeData.bench, maxBench).map((p, i) => renderPlayerRow(p, i, false, true))}</ul>
                                </div>
                            )}
                        </div>

                        {/* Ép thẻ HLV xuống dưới cùng để luôn ngang hàng 2 bên */}
                        <div className="mt-auto text-sm bg-slate-950 rounded-xl p-3 pt-3 mx-2 flex items-center gap-2 border border-slate-800">
                            <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-slate-400">HLV:</span> <span className="font-bold text-white truncate uppercase tracking-wide">{lineup.homeTeam.coach?.name || 'Đang cập nhật'}</span>
                        </div>
                    </div>

                    {/* ĐỘI KHÁCH */}
                    <div className="flex flex-col h-full">
                        <div>
                            <div className="mb-4 pb-2 border-b border-amber-900/50">
                                <h4 className="font-bold text-amber-400 text-lg truncate">{awayTeam.name}</h4>
                            </div>
                            <ul className="mb-6">
                                {lineup.awayTeam.starters?.map((p: any, i: number) => renderPlayerRow(p, i, false, false))}
                            </ul>

                            {maxUsed > 0 && (
                                <div className="mb-4 bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1 mx-2 mt-1">Đã vào sân</h5>
                                    <ul className="space-y-0">{padArray(awayData.used, maxUsed).map((p, i) => renderPlayerRow(p, i, true, false))}</ul>
                                </div>
                            )}

                            {maxBench > 0 && (
                                <div>
                                    <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1 mx-2">Dự bị</h5>
                                    <ul className="space-y-0 opacity-80">{padArray(awayData.bench, maxBench).map((p, i) => renderPlayerRow(p, i, false, false))}</ul>
                                </div>
                            )}
                        </div>

                        {/* Ép thẻ HLV xuống dưới cùng để luôn ngang hàng 2 bên */}
                        <div className="mt-auto text-sm bg-slate-950 rounded-xl p-3 pt-3 mx-2 flex items-center gap-2 border border-slate-800">
                            <Shield className="w-4 h-4 text-slate-500 shrink-0" />
                            <span className="text-slate-400">HLV:</span> <span className="font-bold text-white truncate uppercase tracking-wide">{lineup.awayTeam.coach?.name || 'Đang cập nhật'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}