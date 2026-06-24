"use client";

import FootballSidebar from './football/FootballSidebar';

interface MatchSidebarProps {
    category?: string;
    matchData: any;
    homeTeam: any;
    awayTeam: any;
}

export default function MatchSidebar(props: MatchSidebarProps) {
    const { category = 'football', ...restProps } = props;

    switch (category) {
        case 'football':
            return <FootballSidebar {...restProps} />;

        case 'basketball':
        case 'tennis':
        case 'badminton':
        case 'volleyball':
        case 'esports':
        case 'mma':
        case 'motorsport':
            return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-center min-h-37.5">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-center">
                        Thống kê {category} đang phát triển...
                    </p>
                </div>
            );

        default:
            return <FootballSidebar {...restProps} />;
    }
}