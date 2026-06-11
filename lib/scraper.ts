// src/lib/scraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';
import { addDays, format, startOfToday } from 'date-fns';

// Hàm helper để chuẩn hóa ngày
function parseDate(dateStr: string) {
    const today = startOfToday(); // Ngày hiện tại (00:00:00)

    if (dateStr.toLowerCase().includes('tomorrow')) {
        return format(addDays(today, 1), 'dd/MM/yyyy');
    }
    if (dateStr.toLowerCase().includes('today')) {
        return format(today, 'dd/MM/yyyy');
    }
    // Nếu nó trả về dạng "13/06/2026", cứ trả về nguyên bản
    return dateStr.trim();
}

export async function getFixtures() {
    try {
        const { data } = await axios.get('https://onefootball.com/en/competition/fifa-world-cup-12/fixtures', {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const $ = cheerio.load(data);
        const groupedFixtures: Record<string, any[]> = {};

        $('.MatchCardsListsAppender_container__S1sCz ul li').each((_, element) => {
            // 1. Lấy tên đội
            const teamNames = $(element).find('.SimpleMatchCardTeam_simpleMatchCardTeam__name__cmh6q');

            // 2. Lấy URL ảnh logo/cờ
            const teamLogos = $(element).find('.SimpleMatchCardTeam_simpleMatchCardTeam__logo__xpwYg img');
            const homeLogo = teamLogos.eq(0).attr('src') || '';
            const awayLogo = teamLogos.eq(1).attr('src') || '';

            const home = teamNames.eq(0).text();
            const away = teamNames.eq(1).text();

            const timeElements = $(element).find('time');

            // Lấy ngày và giờ
            let rawDate = timeElements.length > 1 ? timeElements.eq(0).text() : "";
            const timeStr = timeElements.length > 1 ? timeElements.eq(1).text() : timeElements.eq(0).text();

            // Nếu rawDate rỗng, mặc định là ngày mai
            const finalDate = rawDate === "" ? parseDate("tomorrow") : parseDate(rawDate);

            if (home && away) {
                if (!groupedFixtures[finalDate]) groupedFixtures[finalDate] = [];

                groupedFixtures[finalDate].push({
                    home,
                    away,
                    homeLogo, // Thêm trường này
                    awayLogo, // Thêm trường này
                    time: timeStr,
                    status: 'Upcoming',
                    score: null
                });
            }
        });

        return groupedFixtures;
    } catch (error) {
        console.error("Lỗi cào dữ liệu:", error);
        return {};
    }
}

export async function getStandings() {
    const { data } = await axios.get('https://onefootball.com/en/competition/fifa-world-cup-12/table');
    const $ = cheerio.load(data);

    // Đổi từ mảng [] thành Object {} để nhóm theo bảng
    const standings: Record<string, any[]> = {};

    // Tìm tất cả các section chứa bảng (mỗi section là một bảng A, B, C...)
    $('.Standing_standings__Mn27P').each((_, section) => {
        // Lấy tên bảng và loại bỏ từ "GROUP" (không phân biệt hoa thường)
        const rawName = $(section).find('.Standing_standings__tableHeaderText__KBBsd').text().trim();
        const groupName = rawName.replace(/GROUP/i, "").trim();

        if (!standings[groupName]) {
            standings[groupName] = [];
        }

        // Lấy tất cả các dòng đội bóng trong bảng này
        $(section).find('.Standing_standings__rowLink__hmGOy').each((i, el) => {
            const row = $(el);
            standings[groupName].push({
                pos: i + 1,
                team: row.find('.Standing_standings__teamName__3JTSs').text(),
                logo: row.find('img').attr('src'),
                pl: parseInt(row.find('.Standing_standings__cell__dui_X').eq(3).text()) || 0,
                w: parseInt(row.find('.Standing_standings__cell__dui_X').eq(4).text()) || 0,
                d: parseInt(row.find('.Standing_standings__cell__dui_X').eq(5).text()) || 0,
                l: parseInt(row.find('.Standing_standings__cell__dui_X').eq(6).text()) || 0,
                gd: row.find('.Standing_standings__cell__dui_X').eq(7).text(),
                pts: parseInt(row.find('.Standing_standings__cell__dui_X').eq(8).text()) || 0,
            });
        });
    });

    return standings;
}

// Định nghĩa interface để dùng chung cho cả project
export interface NewsItem {
    tag: string;
    title: string;
    link: string;
}

import Parser from 'rss-parser';    

export async function getNews() {
    const parser = new Parser();
    try {
        const url = 'https://news.google.com/rss/search?q=World+Cup+2026&hl=vi&gl=VN&ceid=VN:vi';
        const feed = await parser.parseURL(url);

        return feed.items.slice(0, 25).map(item => ({
            tag: "WORLD CUP",
            // Lấy toàn bộ tiêu đề, nếu có dấu - thì chỉ lấy phần đầu
            title: item.title ? item.title.split(' - ')[0].trim() : "Tin tức mới",
            // Đảm bảo link luôn là link gốc của Google
            link: item.link || "#"
        }));
    } catch (e) {
        console.error("Lỗi RSS:", e);
        return [];
    }
}