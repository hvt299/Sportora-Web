"use client";

import FootballMatchCard from './football/FootballMatchCard';
// Tương lai import các môn khác ở đây: import BasketballMatchCard from './basketball/BasketballMatchCard';

export default function MatchCard(props: any) {
    const { category = 'football', ...restProps } = props;

    switch (category) {
        case 'football':
            return <FootballMatchCard {...restProps} />;

        case 'basketball':
        case 'tennis':
        case 'badminton':
        case 'volleyball':
        case 'esports':
        case 'mma':
        case 'motorsport':
            return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-center min-h-25">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest text-center">
                        Thẻ trận {category} đang phát triển
                    </p>
                </div>
            );

        default:
            return <FootballMatchCard {...restProps} />;
    }
}