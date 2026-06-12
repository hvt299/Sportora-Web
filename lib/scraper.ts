import axios from 'axios';
import * as cheerio from 'cheerio';
import Parser from 'rss-parser';

// Map trạng thái trận đấu
const periodMap: Record<string, string> = {
    PRE_MATCH: "Chưa diễn ra",
    FIRST_HALF: "Hiệp 1",
    HALF_TIME: "Nghỉ giữa hiệp",
    SECOND_HALF: "Hiệp 2",
    EXTRA_TIME_FIRST_HALF: "Hiệp phụ 1",
    EXTRA_TIME_SECOND_HALF: "Hiệp phụ 2",
    PENALTY_SHOOTOUT: "Luân lưu",
    FULL_TIME: "Kết thúc",
    POSTPONED: "Hoãn",
    CANCELLED: "Hủy",
    ABANDONED: "Bị hủy"
};

export interface MatchItem {
    home: string;
    away: string;
    homeLogo?: string;
    awayLogo?: string;
    time: string;
    date: string;
    status: string;
    score: string | null;
    round: string;
    live: boolean;
    minute: string | null;
    rawPeriod: string;
}

export async function getFixtures() {
    try {
        let allLists: any[] = [];
        let url: string | undefined = "https://api.onefootball.com/web-experience/en/competition/fifa-world-cup-12/fixtures";

        for (let i = 0; i < 5; i++) {
            if (!url) break;

            // Bổ sung <any> để TypeScript không bắt bẻ cấu trúc phản hồi
            const response = await axios.get<any>(url, {
                headers: { "User-Agent": "Mozilla/5.0" },
            });

            // Ép kiểu tường minh : any
            const data: any = response.data;
            let currentLists: any[] = [];
            let nextUrl: string | undefined = undefined;

            if (data.containers && Array.isArray(data.containers)) {
                // Ép kiểu tường minh : any cho container và listComponent
                const container: any = data.containers.find((c: any) => c.fullWidth?.component?.matchCardsListsAppender);
                const listComponent: any = container?.fullWidth?.component?.matchCardsListsAppender;

                if (listComponent?.lists) {
                    currentLists = listComponent.lists;
                }
                nextUrl = listComponent?.loadMoreButton?.apiUrl;
            } else if (data.lists && Array.isArray(data.lists)) {
                currentLists = data.lists;
                nextUrl = data.loadMoreButton?.apiUrl;
            }

            allLists.push(...currentLists);
            url = nextUrl;
        }

        const nestedFixtures: Record<string, Record<string, any[]>> = {};

        allLists.forEach((list: any) => {
            if (!list.sectionHeader?.subtitle || !list.matchCards || list.matchCards.length === 0) return;

            const roundName: string = list.sectionHeader.subtitle;

            if (!nestedFixtures[roundName]) {
                nestedFixtures[roundName] = {};
            }

            list.matchCards.forEach((match: any) => {
                const dateObj = new Date(match.kickoff);

                const dateKey = dateObj.toLocaleString("en-GB", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });

                const timeStr = dateObj.toLocaleString("en-GB", {
                    timeZone: "Asia/Ho_Chi_Minh",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                if (!nestedFixtures[roundName][dateKey]) {
                    nestedFixtures[roundName][dateKey] = [];
                }

                const isDuplicate = nestedFixtures[roundName][dateKey].find(
                    (m: any) => m.home === match.homeTeam?.name && m.away === match.awayTeam?.name
                );

                if (!isDuplicate) {
                    const isLive = match.period !== "PRE_MATCH" && match.period !== "FULL_TIME" && match.period !== "POSTPONED" && match.period !== "CANCELLED";
                    const mappedPeriod = periodMap[match.period] || match.period;

                    nestedFixtures[roundName][dateKey].push({
                        home: match.homeTeam?.name || "Unknown",
                        away: match.awayTeam?.name || "Unknown",
                        homeLogo: match.homeTeam?.imageObject?.path,
                        awayLogo: match.awayTeam?.imageObject?.path,
                        time: timeStr,
                        date: dateKey,
                        status: mappedPeriod,
                        score: match.homeTeam?.score != null ? `${match.homeTeam.score} - ${match.awayTeam.score}` : null,
                        round: roundName,
                        live: isLive,
                        minute: match.timePeriod ?? null,
                        rawPeriod: match.period
                    });
                }
            });
        });

        return nestedFixtures;
    } catch (error) {
        console.error("Lỗi cào dữ liệu Fixtures:", error);
        return {};
    }
}

export async function getStandings() {
    try {
        // Lấy dữ liệu trực tiếp từ API Table
        const response = await axios.get<any>('https://api.onefootball.com/web-experience/en/competition/fifa-world-cup-12/table', {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const data: any = response.data;
        const standings: Record<string, any[]> = {};

        if (data.containers && Array.isArray(data.containers)) {
            data.containers.forEach((container: any) => {
                // Trỏ đúng vào component standings
                const standingsComponent: any = container?.fullWidth?.component?.standings;

                if (!standingsComponent || !standingsComponent.title || !standingsComponent.rows) return;

                // API trả về title: "Group Group A" hoặc "Group Best 3rd placed teams "
                // Ta dùng Regex xóa chữ "Group" để lấy tên bảng cho đẹp (VD: "A", "Best 3rd placed teams")
                const groupName = standingsComponent.title.replace(/Group/ig, "").trim();

                if (!standings[groupName]) standings[groupName] = [];

                standingsComponent.rows.forEach((row: any) => {
                    standings[groupName].push({
                        pos: row.position || 0,
                        team: row.teamName || "Unknown",
                        logo: row.imageObject?.path || "",
                        // Các chỉ số như w, d, l nếu API không trả về nghĩa là 0
                        pl: row.playedMatchesCount || 0,
                        w: row.wonMatchesCount || 0,
                        d: row.drawnMatchesCount || 0,
                        l: row.lostMatchesCount || 0,
                        gd: row.goalsDiff ?? 0, // Dùng ?? vì hiệu số có thể là 0
                        pts: row.points || 0,
                    });
                });
            });
        }

        return standings;
    } catch (error) {
        console.error("Lỗi cào dữ liệu Standings API:", error);
        return {};
    }
}

// Thêm hàm lấy dữ liệu Bracket
export async function getBracket() {
    try {
        const { data } = await axios.get<any>('https://api.onefootball.com/web-experience/en/competition/fifa-world-cup-12/kotree', {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        // Tìm container chứa knockoutTree
        const container = data.containers?.find((c: any) => c.fullWidth?.component?.knockoutTree);
        const stages = container?.fullWidth?.component?.knockoutTree?.stages || [];

        // Hàm helper để map từng stage
        const getStageNodes = (keyword: string) => {
            const stage = stages.find((s: any) => s.label?.text?.toLowerCase().includes(keyword.toLowerCase()));
            if (!stage) return [];

            return stage.nodes.map((node: any) => {
                const homeScore = node.firstTeam?.score;
                const awayScore = node.secondTeam?.score;

                // Nếu chưa đá thì hiện giờ, nếu có tỷ số thì hiện tỷ số
                let score = "? - ?";
                if (homeScore != null && awayScore != null) {
                    score = `${homeScore} - ${awayScore}`;
                } else if (node.kickoffTimeFormatted) {
                    score = node.kickoffTimeFormatted;
                }

                return {
                    id: node.uiKey || Math.random().toString(),
                    home: node.firstTeam?.name || "TBD",
                    away: node.secondTeam?.name || "TBD",
                    score: score,
                };
            });
        };

        return {
            roundOf32: getStageNodes('32'),
            roundOf16: getStageNodes('16'),
            quarterFinals: getStageNodes('quarter'),
            semiFinals: getStageNodes('semi'),
            final: getStageNodes('final')[0] || null, // Chung kết chỉ có 1 trận
        };
    } catch (error) {
        console.error("Lỗi cào dữ liệu Bracket:", error);
        return { roundOf32: [], roundOf16: [], quarterFinals: [], semiFinals: [], final: null };
    }
}

export interface NewsItem { tag: string; title: string; link: string; }

export async function getNews() {
    const parser = new Parser();
    try {
        // Dùng fetch API chuẩn của Web/Next.js thay vì parseURL để tránh lỗi url.parse()
        const response = await fetch('https://news.google.com/rss/search?q=World+Cup+2026&hl=vi&gl=VN&ceid=VN:vi', {
            // Thêm Header giả lập trình duyệt để Google News không chặn
            headers: { 'User-Agent': 'Mozilla/5.0' },
            // Nếu dùng Next.js App Router, có thể thêm cache để web chạy siêu mượt
            next: { revalidate: 3600 }
        });

        const xml = await response.text();

        // Phân tích dữ liệu từ chuỗi XML đã tải về
        const feed = await parser.parseString(xml);

        return feed.items.slice(0, 25).map(item => ({
            tag: "WORLD CUP",
            title: item.title ? item.title.split(' - ')[0].trim() : "Tin tức mới",
            link: item.link || "#"
        }));
    } catch (e) {
        console.error("Lỗi RSS News:", e);
        return [];
    }
}