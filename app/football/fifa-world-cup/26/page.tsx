import { getFixtures, getStandings, getNews, getBracket } from '@/lib/scraper';
import WC26ClientPage from '@/components/WC26ClientPage';

export const dynamic = 'force-dynamic';

export default async function Page() {
    const [matches, standings, news, bracket] = await Promise.all([
        getFixtures(77, "2026"),
        getStandings(77, "2026"),
        getNews("World Cup 2026"),
        getBracket(77, "2026")
    ]);

    return (
        <WC26ClientPage
            initialMatches={matches}
            initialStandings={standings}
            initialNews={news}
            initialBracket={bracket}
        />
    );
}