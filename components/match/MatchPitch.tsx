"use client";

import { ArrowRightLeft, Activity, Star } from 'lucide-react';

const POS_MAP: Record<number, string> = {
    0: "GK",
    1: "DEF",
    2: "MID",
    3: "ATT"
};

const formatMarketValue = (value?: number) => {
    if (!value) return null;
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`;
    return `€${value}`;
};

export default function MatchPitch({ homeData, awayData, homeTeamBasic, awayTeamBasic }: { homeData: any, awayData: any, homeTeamBasic: any, awayTeamBasic: any }) {
    if (!homeData?.starters || !awayData?.starters) return null;

    // Tìm điểm số cao nhất của mỗi đội trên Sân
    const getHighestRating = (teamData: any) => {
        let max = 0;
        teamData?.starters?.forEach((p: any) => {
            if (p.performance?.rating > max) max = p.performance.rating;
        });
        return max;
    };

    const homeMaxRating = getHighestRating(homeData);
    const awayMaxRating = getHighestRating(awayData);

    const renderPitchPlayer = (p: any, isHome: boolean) => {
        const layout = p.verticalLayout;
        if (!layout) return null;

        const topPos = isHome ? `${100 - (layout.y * 50)}%` : `${layout.y * 50}%`;
        const leftPos = `${layout.x * 100}%`;

        const rating = p.performance?.rating;
        const subOutEvent = p.performance?.substitutionEvents?.find((e: any) => e.type === "subOut");

        // So điểm max để gắn icon
        const maxRating = isHome ? homeMaxRating : awayMaxRating;
        const isHighest = rating && rating === maxRating && rating > 0;

        let badgeStyle = "bg-slate-800 text-slate-300 border-slate-700";
        if (rating >= 8.5) badgeStyle = "bg-purple-500 text-white border-purple-400";
        else if (rating >= 8.0) badgeStyle = "bg-emerald-500 text-white border-emerald-400";
        else if (rating >= 7.0) badgeStyle = "bg-green-500 text-white border-green-400";
        else if (rating >= 6.0) badgeStyle = "bg-yellow-500 text-slate-900 border-yellow-400";
        else if (rating > 0) badgeStyle = "bg-orange-500 text-white border-orange-400";

        const marketValueStr = formatMarketValue(p.marketValue);

        return (
            <div
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 w-16 md:w-24 group cursor-pointer hover:z-20"
                style={{ top: topPos, left: leftPos }}
                title={`${p.name} - ${POS_MAP[p.usualPlayingPositionId] || 'Cầu thủ'}`}
            >
                <div className="relative mb-1">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white bg-slate-800 shadow-[0_4px_10px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center relative">
                        <img
                            src={`https://images.fotmob.com/image_resources/playerimages/${p.id}.png`}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/fallback-player.png'; }}
                        />
                        {subOutEvent && <div className="absolute inset-0 bg-black/50" />}
                    </div>

                    {rating > 0 && (
                        <div className={`absolute -top-1.5 -right-2.5 w-6 h-4 flex items-center justify-center text-[9px] font-black rounded border ${badgeStyle} shadow-sm`}>
                            {rating.toFixed(1)}
                        </div>
                    )}

                    {p.isCaptain && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-600 border border-white text-white flex items-center justify-center text-[8px] font-black shadow-sm" title="Đội trưởng">
                            C
                        </div>
                    )}

                    {subOutEvent && (
                        <div className="absolute -top-1.5 -left-2 bg-slate-900 border border-slate-700 p-0.5 rounded shadow-sm text-red-500 flex items-center justify-center" title={`Thay ra phút ${subOutEvent.time}'`}>
                            <ArrowRightLeft className="w-2.5 h-2.5" />
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-center bg-slate-950/80 px-2 py-0.5 rounded backdrop-blur-sm border border-slate-800/50 shadow-sm max-w-full">
                    <span className="text-[9px] md:text-[10px] text-white font-bold truncate w-full tracking-tight drop-shadow-md flex items-center justify-center gap-1">
                        {p.lastName || p.name.split(' ').pop()}
                        {/* Hiện Ngôi sao cho người cao điểm nhất */}
                        {isHighest && <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400 shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />}
                    </span>
                    {marketValueStr && (
                        <span className="text-[8px] text-emerald-400 font-mono tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity h-0 group-hover:h-auto overflow-hidden">
                            {marketValueStr}
                        </span>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-4 md:p-8">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div className="flex flex-col gap-1 items-start">
                    <div className="flex items-center gap-2">
                        <img src={homeTeamBasic.imageUrl} alt="" className="w-5 h-5 object-contain" />
                        <span className="font-bold text-sm text-slate-200">{homeTeamBasic.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-black">{homeData.formation}</span>
                        {homeData.rating > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3 text-blue-400" /> {homeData.rating.toFixed(1)}</span>}
                    </div>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{awayTeamBasic.name}</span>
                        <img src={awayTeamBasic.imageUrl} alt="" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex items-center gap-2">
                        {awayData.rating > 0 && <span className="text-[10px] text-slate-400 flex items-center gap-1"><Activity className="w-3 h-3 text-amber-400" /> {awayData.rating.toFixed(1)}</span>}
                        <span className="bg-amber-600 text-slate-950 text-[10px] px-1.5 py-0.5 rounded font-black">{awayData.formation}</span>
                    </div>
                </div>
            </div>

            <div className="relative w-full max-w-112.5x-auto aspect-2/3 my-4">

                <div className="absolute inset-0 bg-linear-to-b from-[#1a3d24] via-[#1e4a2a] to-[#1a3d24] border-2 border-white/20 rounded-lg overflow-hidden shadow-2xl pointer-events-none z-0">
                    <div className="absolute inset-2 border border-white/20" />
                    <div className="absolute top-1/2 left-2 right-2 h-px bg-white/20 -translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/2 w-24 h-24 border border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2">
                        <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <div className="absolute top-2 left-1/2 w-[55%] h-[16%] border border-white/20 border-t-0 -translate-x-1/2">
                        <div className="absolute bottom-0 left-1/2 w-16 h-8 border border-white/20 border-b-0 rounded-t-full -translate-x-1/2 translate-y-full opacity-50" />
                        <div className="absolute top-0 left-1/2 w-[45%] h-[40%] border border-white/20 border-t-0 -translate-x-1/2" />
                        <div className="absolute bottom-[30%] left-1/2 w-1 h-1 bg-white/40 rounded-full -translate-x-1/2" />
                    </div>

                    <div className="absolute bottom-2 left-1/2 w-[55%] h-[16%] border border-white/20 border-b-0 -translate-x-1/2">
                        <div className="absolute top-0 left-1/2 w-16 h-8 border border-white/20 border-t-0 rounded-b-full -translate-x-1/2 -translate-y-full opacity-50" />
                        <div className="absolute bottom-0 left-1/2 w-[45%] h-[40%] border border-white/20 border-b-0 -translate-x-1/2" />
                        <div className="absolute top-[30%] left-1/2 w-1 h-1 bg-white/40 rounded-full -translate-x-1/2" />
                    </div>
                </div>

                <div className="absolute inset-0 z-10">
                    {awayData.starters.map((p: any) => renderPitchPlayer(p, false))}
                    {homeData.starters.map((p: any) => renderPitchPlayer(p, true))}
                </div>

                <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col justify-between h-[80%] text-[8px] font-black tracking-widest text-white/10 uppercase pointer-events-none z-0" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                    <span className="rotate-180">Away</span>
                    <span>Home</span>
                </div>
            </div>
        </div>
    );
}