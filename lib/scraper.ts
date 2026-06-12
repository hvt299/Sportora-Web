import Parser from 'rss-parser';

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

// Hàm dịch mã đội bóng (Dùng chung cho cả Bracket và Fixtures)
function translateTeamName(name: string) {
    if (!name) return "TBD";
    return name
        .replace(/Winner EF/g, "Thắng V16 đội")
        .replace(/Winner QF/g, "Thắng Tứ Kết")
        .replace(/Winner SF/g, "Thắng Bán Kết")
        .replace(/Loser SF/g, "Thua Bán Kết")
        .replace(/Winner/g, "Thắng")
        .replace(/Loser/g, "Thua");
}

/**
 * 1. LẤY LỊCH THI ĐẤU (FIXTURES)
 */
export async function getFixtures(leagueId: number | string = 77, season: string = "2026") {
    try {
        const url = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=VNM&season=${season}`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } });
        const data: any = await response.json();

        const nestedFixtures: Record<string, Record<string, MatchItem[]>> = {};
        const allMatches = data?.fixtures?.allMatches || data?.overview?.matches?.allMatches || [];

        allMatches.forEach((match: any) => {
            let roundCategory = "Vòng bảng";
            if (match.round === "1/16") roundCategory = "Vòng 32 đội";
            else if (match.round === "1/8") roundCategory = "Vòng 16 đội";
            else if (match.round === "1/4") roundCategory = "Tứ kết";
            else if (match.round === "1/2") roundCategory = "Bán kết";
            else if (match.round === "bronze") roundCategory = "Tranh hạng ba";
            else if (match.round === "final") roundCategory = "Chung kết";

            if (!nestedFixtures[roundCategory]) nestedFixtures[roundCategory] = {};

            // Fallback thời gian phòng hờ Fotmob đổi key
            const utcTime = match.status?.utcTime || match.matchDate;
            const dateObj = new Date(utcTime);

            const dateKey = dateObj.toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });
            const timeStr = dateObj.toLocaleTimeString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });

            if (!nestedFixtures[roundCategory][dateKey]) nestedFixtures[roundCategory][dateKey] = [];

            const isStarted = match.status?.started ?? false;
            const isFinished = match.status?.finished ?? false;
            const isCancelled = match.status?.cancelled ?? false;

            let live = false;
            let mappedStatus = "Chưa diễn ra";
            let minute = null;
            let score = null; // Mặc định là null để UI hiện thời gian

            if (isCancelled) {
                mappedStatus = "Hủy";
            } else if (isFinished) {
                mappedStatus = "Kết thúc";
            } else if (isStarted && !isFinished) {
                live = true;
                mappedStatus = "Đang diễn ra";
                minute = match.status?.liveTime?.short || match.status?.reason?.short || "LIVE";
            }

            // BẢO MẬT HIỂN THỊ: Chỉ gán điểm số nếu trận đấu thực sự đã bắt đầu hoặc kết thúc
            if (isStarted || isFinished) {
                // Ưu tiên lấy scoreStr (ví dụ: "2 - 1"), nếu không có thì tự ghép từ điểm 2 đội
                score = match.status?.scoreStr ??
                    (match.home?.score != null && match.away?.score != null ? `${match.home.score} - ${match.away.score}` : null);
            }

            nestedFixtures[roundCategory][dateKey].push({
                home: translateTeamName(match.home?.name),
                away: translateTeamName(match.away?.name),
                homeLogo: match.home?.id ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.home.id}.png` : undefined,
                awayLogo: match.away?.id ? `https://images.fotmob.com/image_resources/logo/teamlogo/${match.away.id}.png` : undefined,
                time: timeStr,
                date: dateKey,
                status: mappedStatus,
                score: score,
                round: roundCategory,
                live: live,
                minute: minute,
                rawPeriod: match.status?.reason?.short || ""
            });
        });

        return nestedFixtures;
    } catch (error) {
        console.error("Lỗi cào dữ liệu Fixtures:", error);
        return {};
    }
}

/**
 * 2. LẤY BẢNG XẾP HẠNG (STANDINGS)
 */
export async function getStandings(leagueId: number | string = 77, season: string = "2026") {
    try {
        const url = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=VNM&season=${season}`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } });
        const data: any = await response.json();
        const standings: Record<string, any[]> = {};

        if (data?.table?.[0]?.data?.tables) {
            data.table[0].data.tables.forEach((groupData: any) => {
                const rawName = groupData.leagueName || "";
                if (!rawName) return;

                const groupName = rawName.replace(/Grp\.\s*/i, "").trim();
                if (!standings[groupName]) standings[groupName] = [];

                const rows = groupData.table?.all || [];
                rows.forEach((row: any) => {
                    standings[groupName].push({
                        pos: row.idx || 0,
                        team: row.name || "Unknown",
                        logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
                        pl: row.played || 0,
                        w: row.wins || 0,
                        d: row.draws || 0,
                        l: row.losses || 0,
                        scoresStr: row.scoresStr || "0-0",
                        gd: row.goalConDiff ?? 0,
                        pts: row.pts || 0,
                        qualColor: row.qualColor || null
                    });
                });
            });
        }
        return standings;
    } catch (error) {
        console.error("Lỗi cào dữ liệu Standings:", error);
        return {};
    }
}

/**
 * 3. LẤY NHÁNH ĐẤU (BRACKET) VÀ LỊCH SỬ NHÀ VÔ ĐỊCH
 */
export async function getBracket(leagueId: number | string = 77, season: string = "2026") {
    try {
        const url = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=VNM&season=${season}`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } });
        const data: any = await response.json();

        const rounds = data?.playoff?.rounds || [];
        const specials = data?.playoff?.special || [];
        const allRounds = [...rounds, ...specials];

        // Lấy tên nhà vô địch mùa hiện tại (Nếu đã kết thúc)
        const seasonIndex = data?.seasons?.findIndex((s: any) => s.seasonName.includes(season));
        // Lấy tên nhà vô địch mùa hiện tại (Nếu đã kết thúc)
        const currentSeasonObj = data?.seasons?.find((s: any) => s.seasonName.includes(season));
        const championName = currentSeasonObj?.winner?.name || null;

        // TÌM LỊCH SỬ: Lấy mùa giải diễn ra ngay trước năm được truyền vào
        const targetYear = parseInt(season.substring(0, 4)) || 2026;
        const prevSeasonObj = data?.seasons?.find((s: any) => {
            const historyYear = parseInt(s.seasonName.substring(0, 4));
            return historyYear < targetYear;
        });

        const defendingChampion = prevSeasonObj?.winner ? {
            name: translateTeamName(prevSeasonObj.winner.name),
            logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${prevSeasonObj.winner.id}.png`
        } : null;

        const runnerUp = prevSeasonObj?.loser ? {
            name: translateTeamName(prevSeasonObj.loser.name),
            logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${prevSeasonObj.loser.id}.png`
        } : null;

        // BÍ QUYẾT: Lấy mảng lịch thi đấu CHUẨN XÁC NHẤT để đối chiếu
        const allMatches = data?.fixtures?.allMatches || data?.overview?.matches?.allMatches || [];

        const getStageNodes = (stageId: string) => {
            const round = allRounds.find((r: any) => r.stage === stageId);
            if (!round) return [];

            return round.matchups.map((matchup: any) => {
                const matchObj = matchup.matches?.[0] || {};
                const matchId = matchObj.matchId || matchObj.matchID;

                const realMatchData = allMatches.find((m: any) => String(m.id) === String(matchId));

                const homeName = translateTeamName(matchObj.home?.name || matchObj.homeTeam || matchup.homeTeam);
                const awayName = translateTeamName(matchObj.away?.name || matchObj.awayTeam || matchup.awayTeam);
                const homeId = matchObj.home?.id || matchObj.homeTeamID || matchup.homeTeamId;
                const awayId = matchObj.away?.id || matchObj.awayTeamID || matchup.awayTeamId;

                const statusSource = realMatchData?.status || matchObj.status || matchObj;
                const started = statusSource.started ?? false;
                const finished = statusSource.finished ?? false;

                const hScore = realMatchData?.home?.score ?? matchObj.home?.score ?? matchObj.homeScore;
                const aScore = realMatchData?.away?.score ?? matchObj.away?.score ?? matchObj.awayScore;

                let score = null;
                if ((started || finished) && hScore != null && aScore != null) {
                    score = `${hScore} - ${aScore}`;
                }

                let time = null;
                const utcTime = realMatchData?.status?.utcTime || matchObj.status?.utcTime || matchObj.matchDate;
                if (utcTime) {
                    const dateObj = new Date(utcTime);
                    const h = dateObj.toLocaleTimeString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });
                    const d = dateObj.toLocaleDateString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit" });
                    time = `${h} - ${d}`;
                }

                return {
                    id: matchId || Math.random().toString(),
                    home: homeName,
                    away: awayName,
                    homeLogo: homeId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${homeId}.png` : undefined,
                    awayLogo: awayId ? `https://images.fotmob.com/image_resources/logo/teamlogo/${awayId}.png` : undefined,
                    score: score,
                    time: time,
                };
            });
        };

        return {
            roundOf32: getStageNodes('1/16'),
            roundOf16: getStageNodes('1/8'),
            quarterFinals: getStageNodes('1/4'),
            semiFinals: getStageNodes('1/2'),
            thirdPlace: getStageNodes('bronze')[0] || null,
            final: getStageNodes('final')[0] || null,
            winner: championName,
            defendingChampion,
            runnerUp
        };
    } catch (error) {
        console.error("Lỗi cào dữ liệu Bracket Fotmob:", error);
        return { roundOf32: [], roundOf16: [], quarterFinals: [], semiFinals: [], thirdPlace: null, final: null, winner: null, defendingChampion: null, runnerUp: null };
    }
}

/**
 * 4. TIN TỨC BÊN LỀ
 */
export interface NewsItem {
    tag: string;
    title: string;
    link: string;
}

export interface NewsData {
    vn: NewsItem[];
    global: NewsItem[];
}

export async function getNews(query: string = "World Cup 2026"): Promise<NewsData> {
    const parser = new Parser();
    try {
        const encodedQuery = encodeURIComponent(query);

        // Link lấy tin tức Việt Nam
        const vnUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=vi&gl=VN&ceid=VN:vi`;
        // Link lấy tin tức Quốc tế (Tiếng Anh - Mỹ)
        const globalUrl = `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;

        // Gọi song song 2 API bằng Promise.all để tăng tốc độ tải
        const [vnResponse, globalResponse] = await Promise.all([
            fetch(vnUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } }),
            fetch(globalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 3600 } })
        ]);

        const [vnXml, globalXml] = await Promise.all([
            vnResponse.text(),
            globalResponse.text()
        ]);

        const [vnFeed, globalFeed] = await Promise.all([
            parser.parseString(vnXml),
            parser.parseString(globalXml)
        ]);

        // Cắt đúng 25 tin cho mỗi bên
        const vnItems: NewsItem[] = vnFeed.items.slice(0, 25).map(item => ({
            tag: "VN",
            title: item.title ? item.title.split(' - ')[0].trim() : "Tin tức mới",
            link: item.link || "#"
        }));

        const globalItems: NewsItem[] = globalFeed.items.slice(0, 25).map(item => ({
            tag: "GLOBAL",
            title: item.title ? item.title.split(' - ')[0].trim() : "New Update",
            link: item.link || "#"
        }));

        return { vn: vnItems, global: globalItems };
    } catch (e) {
        console.error("Lỗi RSS News:", e);
        return { vn: [], global: [] };
    }
}