import { getFixtures, getStandings, getNews, getBracket, getTournamentStats } from '@/lib/scraper';
import TournamentClientPage from '@/components/TournamentClientPage';
import { tournamentDetails } from '@/data/tournament-details';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const { leagueId, season, query, tournamentKey } = tournamentDetails.copaAmerica2019.config;

    const [matches, standings, news, bracket, stats] = await Promise.all([
        getFixtures(leagueId, season),
        getStandings(leagueId, season),
        getNews(query),
        getBracket(leagueId, season),
        getTournamentStats(leagueId, season)
    ]);

    return (
        <TournamentClientPage
            initialMatches={matches}
            initialStandings={standings}
            initialNews={news}
            initialBracket={bracket}
            initialStats={stats}
            tournamentKey={tournamentKey}
        />
    );
}