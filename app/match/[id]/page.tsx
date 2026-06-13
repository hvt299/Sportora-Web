import { getMatchDetails } from '@/lib/scraper';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

import MatchHero from '@/components/match/MatchHero';
import MatchTimeline from '@/components/match/MatchTimeline';
import MatchLineups from '@/components/match/MatchLineups';
import MatchSidebar from '@/components/match/MatchSidebar';

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

    const homeTeam = matchData.header.teams[0];
    const awayTeam = matchData.header.teams[1];
    const events = matchData.content?.matchFacts?.events?.events || [];
    const rawMomentum = matchData.content?.momentum;
    const momentum = (rawMomentum && rawMomentum.main && Array.isArray(rawMomentum.main.data)) 
        ? rawMomentum.main.data 
        : [];
    const lineup = matchData.content?.lineup;

    return (
        <main className="min-h-screen bg-black text-white font-wc26 pb-20">
            {/* Nút Quay Lại */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
                <BackButton />
            </div>

            {/* Khối Hero (Tỉ số, Highlights) */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
                <MatchHero matchData={matchData} homeTeam={homeTeam} awayTeam={awayTeam} />
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