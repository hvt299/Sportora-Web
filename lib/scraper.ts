import * as footballAPI from './api/football';
// Tương lai bạn sẽ thêm: import * as basketballAPI from './api/basketball';

// 1. Re-export các Interface quan trọng để các component cũ (MatchCard, GroupTable...) không bị báo lỗi import
export type { MatchItem, NewsItem, NewsData, FotmobMatchDetails } from './api/football';

// ==========================================
// BỘ ĐỊNH TUYẾN DỮ LIỆU ĐA MÔN (ROUTER)
// Mặc định biến category = 'football' để không làm vỡ các code cũ chưa kịp truyền category
// ==========================================

export async function getFixtures(leagueId: number | string = 77, season: string = "2026", category: string = 'football') {
    switch (category) {
        case 'football': return await footballAPI.getFixtures(leagueId, season);
        // case 'basketball': return await basketballAPI.getFixtures(leagueId, season);
        default: return await footballAPI.getFixtures(leagueId, season);
    }
}

export async function getStandings(leagueId: number | string = 77, season: string = "2026", category: string = 'football') {
    switch (category) {
        case 'football': return await footballAPI.getStandings(leagueId, season);
        default: return await footballAPI.getStandings(leagueId, season);
    }
}

export async function getBracket(leagueId: number | string = 77, season: string = "2026", category: string = 'football') {
    switch (category) {
        case 'football': return await footballAPI.getBracket(leagueId, season);
        default: return await footballAPI.getBracket(leagueId, season);
    }
}

export async function getNews(query: string = "World Cup 2026", category: string = 'football') {
    // RSS News dùng chung Google nên tạm thời dùng chung hàm của bóng đá
    return await footballAPI.getNews(query);
}

export async function getMatchDetails(matchId: string, category: string = 'football') {
    switch (category) {
        case 'football': return await footballAPI.getMatchDetails(matchId);
        default: return await footballAPI.getMatchDetails(matchId);
    }
}

export async function getTournamentStats(leagueId: number | string = 77, season: string = "2026", category: string = 'football') {
    switch (category) {
        case 'football': return await footballAPI.getTournamentStats(leagueId, season);
        default: return await footballAPI.getTournamentStats(leagueId, season);
    }
}

// Re-export các hàm Helper dùng chung
export function translateTeamName(name: string, category: string = 'football') {
    switch (category) {
        case 'football': return footballAPI.translateTeamName(name);
        default: return footballAPI.translateTeamName(name);
    }
}

export function formatMatchMinute(statusObj: any, category: string = 'football') {
    switch (category) {
        case 'football': return footballAPI.formatMatchMinute(statusObj);
        default: return footballAPI.formatMatchMinute(statusObj);
    }
}