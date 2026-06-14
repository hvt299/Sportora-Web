import { getMatchDetails } from '@/lib/scraper';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

import MatchHero from '@/components/match/MatchHero';
import MatchTimeline from '@/components/match/MatchTimeline';
import MatchLineups from '@/components/match/MatchLineups';
import MatchSidebar from '@/components/match/MatchSidebar';

// Thêm dòng này để import cấu hình giải đấu
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

    // --- TÌM BỘ FONT TƯƠNG ỨNG VỚI GIẢI ĐẤU ---
    // 1. Ưu tiên lấy parentLeagueId (VD: 77 của World Cup), nếu không có mới lấy leagueId
    const matchLeagueId = matchData.general?.parentLeagueId || matchData.general?.leagueId;

    // 2. Lấy năm của trận đấu để phân biệt các mùa giải (VD: 2022 và 2026)
    const matchYear = matchData.general?.matchTimeUTCDate
        ? new Date(matchData.general.matchTimeUTCDate).getFullYear().toString()
        : "";

    // 3. Quét danh sách: Phải khớp cả LeagueID VÀ Mùa giải (season)
    const foundTournamentKey = Object.keys(tournamentDetails).find((key) => {
        const config = (tournamentDetails[key as keyof typeof tournamentDetails] as any).config;
        return config?.leagueId === matchLeagueId && config?.season?.includes(matchYear);
    }) || "worldCup2026"; // Fallback mặc định

    // Lấy biến fonts ra
    const currentTournament = tournamentDetails[foundTournamentKey as keyof typeof tournamentDetails] as any;

    const fonts = currentTournament.fonts || {
        base: "font-sans",
        heading: "font-black",
        subHeading: "font-bold"
    };

    const homeTeam = matchData.header.teams[0];
    const awayTeam = matchData.header.teams[1];
    const events = matchData.content?.matchFacts?.events?.events || [];
    const rawMomentum = matchData.content?.momentum;
    const momentum = (rawMomentum && rawMomentum.main && Array.isArray(rawMomentum.main.data))
        ? rawMomentum.main.data
        : [];
    const lineup = matchData.content?.lineup;

    return (
        // Truyền biến fonts.base vào main
        <main className={`min-h-screen bg-black text-white pb-20 ${fonts.base}`}>
            {/* Nút Quay Lại */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
                <BackButton />
            </div>

            {/* Khối Hero (Tỉ số, Highlights) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
                {/* Truyền fonts xuống MatchHero */}
                <MatchHero matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} fonts={fonts} />
            </div>

            {/* Layout 2 Cột: Main & Sidebar */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <MatchTimeline events={events} momentum={momentum} />
                    <MatchLineups lineup={lineup} homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
                <div className="lg:col-span-4">
                    <MatchSidebar matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} />
                </div>
            </div>
        </main >
    );
}