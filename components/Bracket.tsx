import BracketNode from "./BracketNode";

export type BracketMatch = {
    id: string | number;
    home: string;
    away: string;
    score: string;
};

export interface BracketData {
    roundOf32: BracketMatch[];
    roundOf16: BracketMatch[];
    quarterFinals: BracketMatch[];
    semiFinals: BracketMatch[];
    final: BracketMatch | null;
}

export default function Bracket({ data }: { data: BracketData }) {
    // Hàm tự động bổ đôi mảng cho Nhánh Trái và Nhánh Phải
    const splitData = (arr: BracketMatch[]) => {
        if (!arr || arr.length === 0) return [[], []]
        const mid = Math.ceil(arr.length / 2)
        return [arr.slice(0, mid), arr.slice(mid)]
    };

    const [leftRound32, rightRound32] = splitData(data.roundOf32)
    const [leftRound16, rightRound16] = splitData(data.roundOf16)
    const [leftQuarter, rightQuarter] = splitData(data.quarterFinals)
    const [leftSemi, rightSemi] = splitData(data.semiFinals)

    const finalMatch = data.final || {
        id: 999,
        home: "TBD",
        away: "TBD",
        score: "? - ?"
    }

    return (
        <div className="overflow-x-auto no-scrollbar w-full">
            {/* Định nghĩa chiều cao cố định cho khu vực Bracket (h-[640px]) để justify-around phân rã khoảng cách chuẩn */}
            <div className="flex justify-center items-center min-w-max px-8 py-4 h-170">

                {/* NHÁNH TRÁI (LEFT SIDE) */}
                <div className="flex h-full items-center">
                    {leftRound32.length > 0 && <BracketColumn matches={leftRound32} round="Vòng 32 đội" />}
                    {leftRound16.length > 0 && <BracketColumn matches={leftRound16} round="Vòng 16 đội" />}
                    {leftQuarter.length > 0 && <BracketColumn matches={leftQuarter} round="Tứ kết" />}
                    {leftSemi.length > 0 && <BracketColumn matches={leftSemi} round="Bán kết" />}
                </div>

                {/* TRẬN CHUNG KẾT (CENTER) */}
                <div className="px-6 flex items-center h-full justify-center">
                    <div className="rounded-xl border border-blue-500/40 bg-blue-900/20 p-5 shadow-[0_0_30px_rgba(59,130,246,0.2)] animate-pulse">
                        <BracketNode
                            home={finalMatch.home}
                            away={finalMatch.away}
                            score={finalMatch.score}
                            round="Chung kết"
                        />
                    </div>
                </div>

                {/* NHÁNH PHẢI (RIGHT SIDE - Lật ngược thứ tự cột bằng flex-row-reverse) */}
                <div className="flex flex-row-reverse h-full items-center">
                    {rightRound32.length > 0 && <BracketColumn matches={rightRound32} round="Vòng 32 đội" />}
                    {rightRound16.length > 0 && <BracketColumn matches={rightRound16} round="Vòng 16 đội" />}
                    {rightQuarter.length > 0 && <BracketColumn matches={rightQuarter} round="Tứ kết" />}
                    {rightSemi.length > 0 && <BracketColumn matches={rightSemi} round="Bán kết" />}
                </div>

            </div>
        </div>
    );
}

// Component Cột chứa các trận đấu
function BracketColumn({ matches, round }: { matches: BracketMatch[]; round: string; }) {
    return (
        // Quan trọng: h-full (chiều cao 100%) kết hợp với flex-col justify-around 
        // giúp các vòng ít trận tự động giãn cách đều, đối xứng hoàn hảo với vòng nhiều trận.
        <div className="flex flex-col justify-around h-full py-2 px-4 border-r border-slate-900/50 last:border-0">
            {matches.map((match) => (
                <div key={match.id} className="flex items-center justify-center transition-all duration-300 hover:scale-105">
                    <BracketNode
                        home={match.home}
                        away={match.away}
                        score={match.score}
                        round={round}
                    />
                </div>
            ))}
        </div>
    );
}