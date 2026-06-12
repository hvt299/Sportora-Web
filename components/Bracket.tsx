import BracketNode from "./BracketNode";
import { Trophy } from "lucide-react";

export type BracketMatch = {
    id: string | number;
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    score: string | null;
    time: string | null;
};

export interface BracketData {
    roundOf32: BracketMatch[];
    roundOf16: BracketMatch[];
    quarterFinals: BracketMatch[];
    semiFinals: BracketMatch[];
    thirdPlace: BracketMatch | null;
    final: BracketMatch | null;
    winner: string | null;
}

export default function Bracket({ data }: { data: BracketData }) {
    const splitData = (arr: BracketMatch[]) => {
        if (!arr || arr.length === 0) return [[], []];
        const mid = Math.ceil(arr.length / 2);
        return [arr.slice(0, mid), arr.slice(mid)];
    };

    const [leftRound32, rightRound32] = splitData(data.roundOf32);
    const [leftRound16, rightRound16] = splitData(data.roundOf16);
    const [leftQuarter, rightQuarter] = splitData(data.quarterFinals);
    const [leftSemi, rightSemi] = splitData(data.semiFinals);

    const finalMatch = data.final || { id: 999, home: "TBD", away: "TBD", score: null, time: null };
    const thirdPlaceMatch = data.thirdPlace;

    return (
        <div className="overflow-x-auto overflow-y-hidden w-full scrollbar-thin scrollbar-thumb-sky-900 scrollbar-track-slate-900/50">
            {/* Sử dụng items-stretch và bỏ min-h cứng để các khối kết nối liền mạch */}
            <div className="flex justify-start md:justify-center items-stretch min-w-max px-4 py-8 mx-auto gap-3 md:gap-6">

                {/* NHÁNH TRÁI */}
                <div className="flex items-stretch gap-3 md:gap-6">
                    {leftRound32.length > 0 && <BracketColumn matches={leftRound32} round="Vòng 32 đội" />}
                    {leftRound16.length > 0 && <BracketColumn matches={leftRound16} round="Vòng 16 đội" />}
                    {leftQuarter.length > 0 && <BracketColumn matches={leftQuarter} round="Tứ kết" />}
                    {leftSemi.length > 0 && <BracketColumn matches={leftSemi} round="Bán kết" />}
                </div>

                {/* TRUNG TÂM (CHUNG KẾT & HẠNG 3) */}
                <div className="px-4 flex flex-col items-center justify-center gap-8 py-10">
                    {data.winner && (
                        <div className="flex flex-col items-center animate-bounce-slow mb-4">
                            <Trophy className="w-16 h-16 md:w-20 md:h-20 text-yellow-400 mb-2 drop-shadow-[0_0_20px_rgba(250,204,21,0.7)]" />
                            <h3 className="font-display-black italic text-lg md:text-2xl uppercase tracking-tighter text-yellow-500">
                                NHÀ VÔ ĐỊCH
                            </h3>
                            <p className="font-display-black text-2xl md:text-5xl uppercase text-white drop-shadow-lg tracking-tighter">
                                {data.winner}
                            </p>
                        </div>
                    )}

                    <div className="rounded-xl border-2 border-yellow-500/50 bg-yellow-900/20 p-2 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                        <BracketNode {...finalMatch} round="Chung kết" isFinal={true} />
                    </div>

                    {thirdPlaceMatch && (
                        <div className="rounded-xl border border-orange-500/40 bg-orange-900/20 p-2 mt-4 shadow-[0_0_20px_rgba(249,115,22,0.15)] relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black border border-orange-500/40 text-orange-400 text-[9px] px-3 py-0.5 rounded-full whitespace-nowrap font-bold uppercase">
                                Hạng 3
                            </div>
                            <BracketNode {...thirdPlaceMatch} round="Tranh hạng ba" />
                        </div>
                    )}
                </div>

                {/* NHÁNH PHẢI (flex-row-reverse) */}
                <div className="flex flex-row-reverse items-stretch gap-3 md:gap-6">
                    {rightRound32.length > 0 && <BracketColumn matches={rightRound32} round="Vòng 32 đội" />}
                    {rightRound16.length > 0 && <BracketColumn matches={rightRound16} round="Vòng 16 đội" />}
                    {rightQuarter.length > 0 && <BracketColumn matches={rightQuarter} round="Tứ kết" />}
                    {rightSemi.length > 0 && <BracketColumn matches={rightSemi} round="Bán kết" />}
                </div>

            </div>
        </div>
    );
}

function BracketColumn({ matches, round }: { matches: BracketMatch[]; round: string; }) {
    return (
        // flex-col justify-around kết hợp với items-stretch giúp giãn khoảng cách đều
        <div className="flex flex-col justify-around gap-2 border-r border-slate-900/50 pr-3 md:pr-6 last:border-0 last:pr-0">
            {matches.map((match) => (
                <div key={match.id} className="transition-all duration-300 hover:scale-105 my-1">
                    <BracketNode {...match} round={round} />
                </div>
            ))}
        </div>
    );
}