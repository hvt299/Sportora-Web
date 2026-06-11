import { getFixtures, getStandings, getNews, getBracket } from '@/lib/scraper';
import WC26ClientPage from '@/components/WC26ClientPage';

export default async function Page() {
    const [matches, standings, news, bracket] = await Promise.all([
        getFixtures(),
        getStandings(),
        getNews(),
        getBracket()
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