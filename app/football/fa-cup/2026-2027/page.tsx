import { getFixtures, getStandings, getNews, getBracket, getTournamentStats } from '@/lib/scraper';
import TournamentClientPage from '@/components/TournamentClientPage';
import { tournamentDetails } from '@/data/tournament-details';
import { tournaments } from '@/data/tournaments';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const { leagueId, season, query, tournamentKey } = tournamentDetails.facup20262027.config;
    const eventInfo = tournaments.flatMap(t => t.events).find(e => e.detailKey === tournamentKey);
    const category = eventInfo?.category || 'football';

    const [matches, standings, news, bracket, stats] = await Promise.all([
        getFixtures(leagueId, season, category),
        getStandings(leagueId, season, category),
        getNews(query, category),
        getBracket(leagueId, season, category),
        getTournamentStats(leagueId, season, category)
    ]);

    return (
        <TournamentClientPage
            initialMatches={matches}
            initialStandings={standings}
            initialNews={news}
            initialBracket={bracket}
            initialStats={stats}
            tournamentKey={tournamentKey}
            category={category}
        />
    );
}