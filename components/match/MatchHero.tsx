import { PlayCircle } from 'lucide-react';

export default function MatchHero({ matchData, homeTeam, awayTeam }: { matchData: any, homeTeam: any, awayTeam: any }) {
    const status = matchData.header.status;
    const isFinished = status.finished;
    const infoBox = matchData.content?.matchFacts?.infoBox;
    const highlights = matchData.content?.matchFacts?.highlights;

    // Trích xuất sự kiện Goal & Red Card
    const getTeamSummaryEvents = (goalsObj: any, cardsObj: any) => {
        const evs = [...Object.values(goalsObj || {}).flat(), ...Object.values(cardsObj || {}).flat()] as any[];
        return evs.sort((a, b) => a.time - b.time);
    };
    const homeSummaryEvents = getTeamSummaryEvents(matchData.header.events?.homeTeamGoals, matchData.header.events?.homeTeamRedCards);
    const awaySummaryEvents = getTeamSummaryEvents(matchData.header.events?.awayTeamGoals, matchData.header.events?.awayTeamRedCards);

    return (
        <>
            <section className="bg-slate-900/50 border border-slate-800 rounded-4xl p-6 md:p-10 relative overflow-hidden flex flex-col items-center shadow-2xl">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)] pointer-events-none" />

                <div className="text-slate-400 text-xs md:text-sm font-medium mb-6 text-center z-10 flex flex-col items-center gap-1">
                    <span>{infoBox?.['Match Date']?.utcTime ? new Date(infoBox['Match Date'].utcTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : ''}</span>
                    <span>{infoBox?.Stadium?.name} • Trọng tài: {infoBox?.Referee?.text}</span>
                </div>

                <div className="bg-black/50 border border-slate-700 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 z-10 flex items-center gap-2">
                    {isFinished ? (
                        <span className="text-slate-300 text-xs font-bold uppercase tracking-widest">{status.reason?.long || "Full time"}</span>
                    ) : (
                        <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /><span className="text-red-400 text-xs font-bold uppercase tracking-widest">{status.reason?.short || "LIVE"}</span></>
                    )}
                </div>

                <div className="flex items-start justify-between w-full max-w-4xl relative z-10">
                    <div className="flex flex-col items-center flex-1 w-1/3">
                        <img src={homeTeam.imageUrl} alt={homeTeam.name} className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-2xl mb-4" />
                        <h2 className="text-xl md:text-4xl font-black italic tracking-tighter text-center leading-none">{homeTeam.name}</h2>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2">FIFA #{homeTeam.fifaRank}</span>
                        <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-slate-300">
                            {homeSummaryEvents.map((ev, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    <span className="text-right">{ev.nameStr} {ev.timeStr}'</span>
                                    {ev.type === "Goal" && <span className="text-blue-400">⚽</span>}
                                    {ev.type === "Card" && ev.card === "Red" && <span className="text-red-500">🟥</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* FIX TỈ SỐ - CHỐNG CẮT CHỮ HOÀN TOÀN */}
                    <div className="flex flex-col items-center justify-center px-4 md:px-8 shrink-0">
                        <div className="relative text-5xl md:text-7xl font-display-black tracking-tighter whitespace-nowrap text-center leading-none py-6">

                            {/* gradient wrapper (KHÔNG clip trực tiếp text) */}
                            <div className="bg-linear-to-b from-white to-slate-400 text-transparent bg-clip-text leading-none inline-block px-2">
                                <span className="block leading-none pb-1">
                                    {status.scoreStr || "? - ?"}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="flex flex-col items-center flex-1 w-1/3">
                        <img src={awayTeam.imageUrl} alt={awayTeam.name} className="w-20 h-20 md:w-32 md:h-32 object-contain drop-shadow-2xl mb-4" />
                        <h2 className="text-xl md:text-4xl font-black italic tracking-tighter text-center leading-none">{awayTeam.name}</h2>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mt-2">FIFA #{awayTeam.fifaRank}</span>
                        <div className="mt-4 flex flex-col items-center gap-1.5 text-xs text-slate-300">
                            {awaySummaryEvents.map((ev, i) => (
                                <div key={i} className="flex items-center gap-1.5">
                                    {ev.type === "Goal" && <span className="text-amber-400">⚽</span>}
                                    {ev.type === "Card" && ev.card === "Red" && <span className="text-red-500">🟥</span>}
                                    <span className="text-left">{ev.nameStr} {ev.timeStr}'</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Video Highlight */}
            {highlights && highlights.url && (
                <section className="mt-8">
                    <a href={highlights.url} target="_blank" rel="noopener noreferrer" className="group block relative w-full rounded-4xl overflow-hidden border border-slate-800 bg-slate-900 aspect-21/9 md:aspect-32/9">
                        <img src={highlights.image} alt="Highlights" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700" />
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            <PlayCircle className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-xl" />
                            <span className="text-sm font-bold uppercase tracking-widest text-white drop-shadow-md">Xem video Highlight chính thức ({highlights.source})</span>
                        </div>
                    </a>
                </section>
            )}
        </>
    );
}