"use client";

import FootballLineups from './football/FootballLineups';

interface MatchLineupsProps {
    category?: string;
    lineup: any;
    homeTeam: any;
    awayTeam: any;
}

export default function MatchLineups(props: MatchLineupsProps) {
    const { category = 'football', ...restProps } = props;

    // Nếu không có đội hình, ẩn luôn khung này
    if (!props.lineup && category === 'football') return null;

    switch (category) {
        case 'football':
            return <FootballLineups {...restProps} />;

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
                        Sơ đồ đội hình {category} đang phát triển...
                    </p>
                </div>
            );

        default:
            return <FootballLineups {...restProps} />;
    }
}