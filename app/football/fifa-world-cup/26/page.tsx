import { getFixtures, getStandings, getNews } from '@/lib/scraper'; // Thêm getNews
import WC26ClientPage from '@/components/WC26ClientPage';

export default async function Page() {
    // Gọi song song 3 hàm để tối ưu tốc độ tải trang
    const [matches, standings, news] = await Promise.all([
        getFixtures(),
        getStandings(),
        getNews()
    ]);

    return (
        <WC26ClientPage
            initialMatches={matches}
            initialStandings={standings}
            initialNews={news}
        />
    );
}