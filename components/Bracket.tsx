import BracketNode from "./BracketNode";

type Match = {
    id: number;
    home: string;
    away: string;
    score: string;
};

export default function Bracket() {
    // LEFT SIDE
    const leftRound32: Match[] = Array.from({ length: 8 }).map((_, i) => ({
        id: i,
        home: `Đội ${i * 2 + 1}`,
        away: `Đội ${i * 2 + 2}`,
        score: "? - ?",
    }));

    const leftRound16: Match[] = Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        home: `Đội thắng ${i * 2 + 1}`,
        away: `Đội thắng ${i * 2 + 2}`,
        score: "? - ?",
    }));

    const leftQuarter: Match[] = Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        home: `Đội thắng ${i * 2 + 1}`,
        away: `Đội thắng ${i * 2 + 2}`,
        score: "? - ?",
    }));

    const leftSemi: Match[] = [
        {
            id: 1,
            home: "Đội thắng 1",
            away: "Đội thắng 2",
            score: "? - ?",
        },
    ];

    // RIGHT SIDE
    const rightRound32: Match[] = Array.from({ length: 8 }).map((_, i) => ({
        id: i + 8,
        home: `Đội ${i * 2 + 17}`,
        away: `Đội ${i * 2 + 18}`,
        score: "? - ?",
    }));

    const rightRound16: Match[] = Array.from({ length: 4 }).map((_, i) => ({
        id: i,
        home: `Đội thắng ${i * 2 + 1}`,
        away: `Đội thắng ${i * 2 + 2}`,
        score: "? - ?",
    }));

    const rightQuarter: Match[] = Array.from({ length: 2 }).map((_, i) => ({
        id: i,
        home: `Đội thắng ${i * 2 + 1}`,
        away: `Đội thắng ${i * 2 + 2}`,
        score: "? - ?",
    }));

    const rightSemi: Match[] = [
        {
            id: 1,
            home: "Đội thắng 1",
            away: "Đội thắng 2",
            score: "? - ?",
        },
    ];

    const finalMatch: Match = {
        id: 999,
        home: "Nhà vô địch bên trái",
        away: "Nhà vô địch bên phải",
        score: "? - ?",
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex justify-center items-center min-w-max px-8 py-8">

                {/* LEFT BRACKET */}
                <div className="flex">
                    <BracketColumn
                        matches={leftRound32}
                        round="Vòng 32 đội"
                    />
                    <BracketColumn
                        matches={leftRound16}
                        round="Vòng 16 đội"
                    />
                    <BracketColumn
                        matches={leftQuarter}
                        round="Tứ kết"
                    />
                    <BracketColumn
                        matches={leftSemi}
                        round="Bán kết"
                    />
                </div>

                {/* FINAL */}
                <div className="px-12 flex items-center">
                    <div className="rounded-xl border border-blue-500/40 bg-blue-900/20 p-4">
                        <BracketNode
                            home={finalMatch.home}
                            away={finalMatch.away}
                            score={finalMatch.score}
                            round="Chung kết"
                        />
                    </div>
                </div>

                {/* RIGHT BRACKET */}
                <div className="flex flex-row-reverse">
                    <BracketColumn
                        matches={rightRound32}
                        round="Vòng 32 đội"
                    />
                    <BracketColumn
                        matches={rightRound16}
                        round="Vòng 16 đội"
                    />
                    <BracketColumn
                        matches={rightQuarter}
                        round="Tứ kết"
                    />
                    <BracketColumn
                        matches={rightSemi}
                        round="Bán kết"
                    />
                </div>
            </div>
        </div>
    );
}

function BracketColumn({
    matches,
    round,
}: {
    matches: Match[];
    round: string;
}) {
    return (
        <div className="flex flex-col justify-around gap-6 px-4">
            {matches.map((match) => (
                <BracketNode
                    key={match.id}
                    home={match.home}
                    away={match.away}
                    score={match.score}
                    round={round}
                />
            ))}
        </div>
    );
}