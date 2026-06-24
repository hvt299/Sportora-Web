import { getMatchDetails } from '@/lib/scraper';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

import MatchHero from '@/components/match/MatchHero';
import MatchTimeline from '@/components/match/MatchTimeline';
import MatchLineups from '@/components/match/MatchLineups';
import MatchSidebar from '@/components/match/MatchSidebar';

import { tournamentDetails } from '@/data/tournament-details';

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const matchData = await getMatchDetails(id);

    if (!matchData || !matchData.header) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
                <p>Lỗi tải dữ liệu trận đấu hoặc trận đấu không tồn tại.</p>
                <Link href="/tournaments" className="mt-4 text-blue-500 hover:underline">
                    Quay lại lịch thi đấu
                </Link>
            </div>
        );
    }

    // --- TÌM BỘ FONT VÀ CẤU HÌNH TƯƠNG ỨNG VỚI GIẢI ĐẤU ---
    const matchLeagueId = matchData.general?.parentLeagueId || matchData.general?.leagueId;
    const matchYear = matchData.general?.matchTimeUTCDate
        ? new Date(matchData.general.matchTimeUTCDate).getFullYear().toString()
        : "";

    const foundTournamentKey = Object.keys(tournamentDetails).find((key) => {
        const config = (tournamentDetails[key as keyof typeof tournamentDetails] as any).config;
        return config?.leagueId === matchLeagueId && config?.season?.includes(matchYear);
    }) || "worldCup2026";

    const currentTournament = tournamentDetails[foundTournamentKey as keyof typeof tournamentDetails] as any;

    const fonts = currentTournament.fonts || {
        base: "font-sans",
        heading: "font-black",
        subHeading: "font-bold"
    };

    // LẤY CATEGORY THỂ THAO (Mặc định là football nếu chưa cấu hình)
    const category = currentTournament.config?.category || 'football';

    const homeTeam = matchData.header.teams[0];
    const awayTeam = matchData.header.teams[1];
    const lineup = matchData.content?.lineup;

    return (
        <main className={`min-h-screen bg-black text-white pb-20 ${fonts.base}`}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
                <BackButton />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
                {/* TRUYỀN THÊM CATEGORY */}
                <MatchHero category={category} matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} fonts={fonts} />
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    {/* TRUYỀN THÊM CATEGORY */}
                    <MatchTimeline category={category} matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} />
                    <MatchLineups category={category} lineup={lineup} homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
                <div className="lg:col-span-4">
                    {/* TRUYỀN THÊM CATEGORY */}
                    <MatchSidebar category={category} matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
            </div>
        </main >
    );
}