import Parser from 'rss-parser';

export interface MatchItem {
    id: string;
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
    rawStatus: any;
}

export interface FotmobMatchTeam {
    id: number;
    name: string;
    imageUrl: string;
    score?: number;
    pageUrl?: string;
    fifaRank?: number;
}

export interface FotmobMatchStatus {
    utcTime: string;
    started: boolean;
    finished: boolean;
    cancelled: boolean;
    scoreStr?: string;
    reason?: {
        short: string;
        long: string;
    };
}

export interface FotmobLineupTeam {
    id: number;
    name: string;
    formation: string;
    starters: any[]; // Bạn có thể quy định chi tiết Player ở đây nếu muốn
    subs?: any[];    // Có thể là undefined nếu trận chưa đá
    coach?: {
        name: string;
    };
}

export interface FotmobMatchDetails {
    general: any;
    header: {
        teams: FotmobMatchTeam[];
        status: FotmobMatchStatus;
        events: any | null; // Sẽ là null nếu chưa đá
    };
    content: {
        matchFacts: {
            infoBox: any;
            events: { events: any[] };
            highlights: any | null;
            poll: any | null;
            teamForm: any[];
        };
        stats: {
            Periods: {
                All: {
                    stats: any[];
                };
            };
        } | null;
        momentum: any | boolean; // Trả về false nếu chưa có dữ liệu
        lineup: {
            lineupType: string;
            homeTeam: FotmobLineupTeam;
            awayTeam: FotmobLineupTeam;
        } | null;
        weather: any | null;
        h2h: any | null;
    };
}

// Hàm dịch mã đội bóng (Dùng chung cho cả Bracket và Fixtures)
export function translateTeamName(name: string) {
    if (!name) return "Chưa xác định";

    return name
        // 1. Dịch nhánh đấu loại trực tiếp
        .replace(/Winner EF/g, "Thắng V16 đội")  // EF (Eighth-finals)
        .replace(/Winner QF/g, "Thắng Tứ kết")       // QF (Quarter-finals)
        .replace(/Winner SF/g, "Thắng Bán kết")      // SF (Semi-finals)
        .replace(/Loser SF/g, "Thua Bán kết")        // Tranh hạng 3
        .replace(/Winner/g, "Thắng")
        .replace(/Loser/g, "Thua")

        // 2. Dịch ghép cặp nhánh đấu (VD: 1E/3ABCDF -> Nhất E/Ba ABCDF, 2A/2B -> Nhì A/Nhì B)
        // Dịch Nhất bảng (1A -> 1L)
        .replace(/(^|\/)1([A-L])(?=\/|$)/g, "$1Nhất $2")
        // Dịch Nhì bảng (2A -> 2L)
        .replace(/(^|\/)2([A-L])(?=\/|$)/g, "$1Nhì $2")
        // Dịch Đứng thứ 3 có thành tích tốt nhất (VD: 3ABCDF -> Ba ABCDF)
        .replace(/(^|\/)3([A-Z]{3,6})(?=\/|$)/g, "$1Ba $2")

        // 3. Xử lý các từ khóa TBD
        .replace(/TBD/g, "Chưa xác định");
}

// Hàm xử lý định dạng phút thi đấu chuẩn xác (Tích hợp Live Time chuyên sâu)
export function formatMatchMinute(statusObj: any): string | null {
    if (!statusObj) return null;

    const liveTime = statusObj.liveTime;

    // 1. Fallback nếu API không trả về block liveTime
    if (!liveTime) {
        let short = statusObj.reason?.short || null;
        if (short) {
            short = short.replace(/[\u200E\u200F\u202A-\u202E]/g, "").replace(/'/g, "").trim();
            if (/^\d+$/.test(short)) return `${short}'`;
            if (/^(\d+)\s*\+\s*(\d+)$/.test(short)) return short.replace(/^(\d+)\s*\+\s*(\d+)$/, "$1'+$2'");
            return short;
        }
        return null;
    }

    let shortStr = liveTime.short || "";
    shortStr = shortStr.replace(/[\u200E\u200F\u202A-\u202E]/g, "").replace(/'/g, "").trim();

    const basePeriod = liveTime.basePeriod; // Phút hiệp chính (VD: 45, 90, 105, 120)
    const addedTime = liveTime.addedTime;   // Tổng phút bù giờ (VD: 10)
    const longStr = liveTime.long;          // Phút thực tế đang chạy (VD: "95:21")

    // 2. Xử lý kịch bản trận đấu đang lọt vào thời gian bù giờ
    if (basePeriod && shortStr) {
        const currentMinShort = parseInt(shortStr);

        // Nếu đã qua phút thi đấu chính thức (VD: đang ở phút 96, base là 90)
        if (!isNaN(currentMinShort) && currentMinShort >= basePeriod) {

            // Tính số phút:giây bù giờ đang trôi qua thực tế
            let currentAddedStr = `${currentMinShort - basePeriod}'`;

            if (longStr && longStr.includes(":")) {
                const [m] = longStr.split(":"); // Chỉ lấy phần phút, bỏ phần giây
                const min = parseInt(m);
                if (!isNaN(min) && min >= basePeriod) {
                    currentAddedStr = `${min - basePeriod}'`; // Output: "5'"
                }
            }

            // Trả về chuỗi chi tiết: VD "90' + 5' (+10')"
            if (addedTime !== undefined && addedTime > 0) {
                return `${basePeriod}' + ${currentAddedStr} (+${addedTime}')`;
            } else {
                return `${basePeriod}' + ${currentAddedStr}`;
            }
        }

        // Nếu trận đấu ở đúng phút cuối (VD: 90) và trọng tài vừa giơ biển báo bù giờ
        if (!isNaN(currentMinShort) && currentMinShort <= basePeriod && addedTime > 0 && (basePeriod - currentMinShort <= 1)) {
            return `${shortStr}' (+${addedTime}')`;
        }
    }

    // 3. Xử lý các case bình thường (Đang đá giữa hiệp, chưa tới phút bù giờ)
    if (/^\d+$/.test(shortStr)) {
        return `${shortStr}'`;
    }
    if (/^(\d+)\s*\+\s*(\d+)$/.test(shortStr)) {
        return shortStr.replace(/^(\d+)\s*\+\s*(\d+)$/, "$1'+$2'");
    }

    return shortStr || null; // Trả về các text dạng "HT", "FT"
}

/**
 * 1. LẤY LỊCH THI ĐẤU (FIXTURES)
 */
export async function getFixtures(leagueId: number | string = 77, season: string = "2026") {
    try {
        const url = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=VNM&season=${season}`;
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store"
        });
        const data: any = await response.json();

        const nestedFixtures: Record<string, Record<string, MatchItem[]>> = {};
        const allMatches = data?.fixtures?.allMatches || data?.overview?.matches?.allMatches || [];

        // DÙNG PROMISE.ALL ĐỂ XỬ LÝ SONG SONG CÁC TRẬN ĐẤU GIÚP WEB TẢI SIÊU TỐC
        const processedMatches = await Promise.all(allMatches.map(async (match: any) => {

            // --- THUẬT TOÁN NHẬN DIỆN VÒNG ĐẤU ĐỘNG (DYNAMIC ROUNDS) ---
            let roundCategory = match.roundName || match.round || "Vòng bảng";

            // Nếu FotMob trả về số nguyên (VD: "1", "38") -> Giải League
            if (/^\d+$/.test(roundCategory.toString())) {
                roundCategory = `Vòng ${roundCategory}`;
            } else {
                // Mở rộng bộ Map để bắt luôn cả các chuỗi tiếng Anh từ API
                const roundMap: Record<string, string> = {
                    "1/16": "Vòng 32 đội",
                    "Round of 32": "Vòng 32 đội",
                    "1/8": "Vòng 16 đội",
                    "Round of 16": "Vòng 16 đội",
                    "1/4": "Tứ kết",
                    "Quarter-Finals": "Tứ kết",
                    "Quarter-final": "Tứ kết",
                    "1/2": "Bán kết",
                    "Semi-Finals": "Bán kết",
                    "Semi-final": "Bán kết",
                    "bronze": "Tranh hạng ba",
                    "Bronze Final": "Tranh hạng ba",
                    "3rd Place Final": "Tranh hạng ba",
                    "final": "Chung kết",
                    "Final": "Chung kết",
                    "Group Stage": "Vòng bảng"
                };
                if (roundMap[roundCategory]) {
                    roundCategory = roundMap[roundCategory];
                }
            }

            const utcTime = match.status?.utcTime || match.matchDate;
            const dateObj = new Date(utcTime);

            const dateKey = dateObj.toLocaleString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit", year: "numeric" });
            const timeStr = dateObj.toLocaleTimeString("en-GB", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" });

            const isStarted = match.status?.started ?? false;
            const isFinished = match.status?.finished ?? false;
            const isCancelled = match.status?.cancelled ?? false;

            let live = false;
            let mappedStatus = "Chưa diễn ra";
            let rawStatus = match.status || {};

            // BÍ QUYẾT TỐI ƯU CỦA BẠN: CHỈ FETCH THÊM DỮ LIỆU NẾU TRẬN ĐÓ ĐANG ĐÁ
            if (isStarted && !isFinished && !isCancelled) {
                live = true;
                mappedStatus = "Đang diễn ra";
                try {
                    const detailUrl = `https://www.fotmob.com/api/data/matchDetails?matchId=${match.id}&ccode3=VNM`;
                    const detailRes = await fetch(detailUrl, { cache: "no-store", headers: { "User-Agent": "Mozilla/5.0" } });
                    if (detailRes.ok) {
                        const detailData = await detailRes.json();
                        if (detailData?.header?.status?.liveTime) {
                            // Bơm trực tiếp cục liveTime đầy đủ (có addedTime) vào rawStatus
                            rawStatus.liveTime = detailData.header.status.liveTime;
                        }
                    }
                } catch (e) {
                    console.error(`Lỗi fetch live time trận ${match.id}:`, e);
                }
            } else if (isCancelled) {
                mappedStatus = "Hủy";
            } else if (isFinished) {
                mappedStatus = "Kết thúc";
            }

            let minute = formatMatchMinute(rawStatus);
            if (live && !minute) minute = rawStatus?.reason?.short || "LIVE";

            let score = null;
            if (isStarted || isFinished) {
                score = rawStatus?.scoreStr ??
                    (match.home?.score != null && match.away?.score != null ? `${match.home.score} - ${match.away.score}` : null);
            }

            return {
                roundCategory,
                dateKey,
                item: {
                    id: match.id.toString(),
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
                    rawPeriod: match.status?.reason?.short || "",
                    rawStatus: rawStatus // Bây giờ rawStatus của các trận Live đã chứa đủ 100% thời gian!
                }
            };
        }));

        // Gộp data đã xử lý xong vào nestedFixtures
        processedMatches.forEach((data: any) => {
            if (!nestedFixtures[data.roundCategory]) nestedFixtures[data.roundCategory] = {};
            if (!nestedFixtures[data.roundCategory][data.dateKey]) nestedFixtures[data.roundCategory][data.dateKey] = [];
            nestedFixtures[data.roundCategory][data.dateKey].push(data.item);
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
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store"
        });
        const data: any = await response.json();
        const standings: Record<string, any[]> = {};

        // Lấy gốc dữ liệu bảng xếp hạng
        const tableRoot = data?.table?.[0]?.data;
        if (!tableRoot) return standings;

        // TRƯỜNG HỢP 1: GIẢI CÚP (Có nhiều bảng con, nằm trong mảng `tables` CÓ 'S')
        if (tableRoot.tables && Array.isArray(tableRoot.tables)) {
            tableRoot.tables.forEach((groupData: any) => {
                const rawName = groupData.leagueName || "";
                if (!rawName) return;

                const groupName = rawName.replace(/Grp\.\s*/i, "").trim();
                const rows = groupData.table?.all || [];

                standings[groupName] = rows.map((row: any) => ({
                    pos: row.idx || 0,
                    team: row.shortName || row.name || "Unknown",
                    logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
                    pl: row.played || 0,
                    w: row.wins || 0,
                    d: row.draws || 0,
                    l: row.losses || 0,
                    scoresStr: row.scoresStr || "0-0",
                    gd: row.goalConDiff ?? 0,
                    pts: row.pts || 0,
                    qualColor: row.qualColor || null
                }));
            });
        }
        // TRƯỜNG HỢP 2: GIẢI VĐQG (Chỉ có 1 bảng duy nhất, nằm trong Object `table` KHÔNG 'S')
        else if (tableRoot.table && tableRoot.table.all) {
            const groupName = tableRoot.leagueName || "Bảng xếp hạng";
            const rows = tableRoot.table.all || [];

            standings[groupName] = rows.map((row: any) => ({
                pos: row.idx || 0,
                team: row.shortName || row.name || "Unknown",
                logo: `https://images.fotmob.com/image_resources/logo/teamlogo/${row.id}.png`,
                pl: row.played || 0,
                w: row.wins || 0,
                d: row.draws || 0,
                l: row.losses || 0,
                scoresStr: row.scoresStr || "0-0",
                gd: row.goalConDiff ?? 0,
                pts: row.pts || 0,
                qualColor: row.qualColor || null
            }));
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
        const response = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
            cache: "no-store" // Vô hiệu hóa cache hoàn toàn, luôn lấy dữ liệu tươi (fresh data)
        });
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

                // --- LOGIC LẤY ĐỘI THẮNG QUA ID TỪ FOTMOB ---
                // Ưu tiên lấy từ matchup.winner hoặc matchup.aggregatedWinner (rất quan trọng cho các trận Penalty)
                const winnerId = matchup.winner ?? matchup.aggregatedWinner ?? realMatchData?.status?.winner ?? realMatchData?.winner ?? matchObj.winner;

                let isHomeWinner = false;
                let isAwayWinner = false;

                if (winnerId !== undefined && winnerId !== null) {
                    // Nếu Fotmob trả về ID đội thắng, đem so sánh với ID của đội nhà/khách
                    if (String(winnerId) === String(homeId)) isHomeWinner = true;
                    else if (String(winnerId) === String(awayId)) isAwayWinner = true;
                } else {
                    // Fallback (cho an toàn, phòng trường hợp Fotmob đổi API về true/false)
                    isHomeWinner = realMatchData?.home?.winner === true || matchObj.home?.winner === true;
                    isAwayWinner = realMatchData?.away?.winner === true || matchObj.away?.winner === true;
                }

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
                    isHomeWinner: isHomeWinner,
                    isAwayWinner: isAwayWinner
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

        // Gọi song song 2 API bằng Promise.all, tắt cache để tự làm mới mỗi 15s
        const [vnResponse, globalResponse] = await Promise.all([
            fetch(vnUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: "no-store" }),
            fetch(globalUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: "no-store" })
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

/**
 * 5. LẤY CHI TIẾT TRẬN ĐẤU (MATCH DETAILS)
 */
export async function getMatchDetails(matchId: string): Promise<FotmobMatchDetails | null> {
    try {
        const detailsUrl = `https://www.fotmob.com/api/data/matchDetails?matchId=${matchId}&ccode3=VNM`;
        const votesUrl = `https://www.fotmob.com/api/data/vote?matchId=${matchId}&ccode3=VNM`;

        // Fetch song song cả 2 API, tuyệt đối không cache
        const [detailsRes, votesRes] = await Promise.all([
            fetch(detailsUrl, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" }),
            fetch(votesUrl, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" })
        ]);

        const data = await detailsRes.json();
        const votesData = await votesRes.json().catch(() => null); // Bắt lỗi an toàn nếu API vote sập

        // Gắn dữ liệu vote vào trong data để truyền xuống component
        if (data?.content?.matchFacts?.poll) {
            data.content.matchFacts.poll.voteData = votesData;
        }

        return data;
    } catch (error) {
        console.error(`Lỗi cào dữ liệu chi tiết trận đấu ${matchId}:`, error);
        return null;
    }
}

/**
 * 6. LẤY CHỈ SỐ GIẢI ĐẤU (TOURNAMENT STATS)
 */
export async function getTournamentStats(leagueId: number | string = 77, season: string = "2026") {
    try {
        const url = `https://www.fotmob.com/api/data/leagues?id=${leagueId}&ccode3=VNM&season=${season}`;
        const response = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, cache: "no-store" });
        const data: any = await response.json();

        return {
            players: data?.stats?.players || [],
            teams: data?.stats?.teams || []
        };
    } catch (error) {
        console.error("Lỗi cào dữ liệu Stats:", error);
        return { players: [], teams: [] };
    }
}