"use client";

import FootballBracket from './football/FootballBracket';

export default function Bracket(props: any) {
    const { category = 'football', ...restProps } = props;

    switch (category) {
        case 'football':
            return <FootballBracket {...restProps} />;

        case 'basketball':
        case 'tennis':
        case 'badminton':
        case 'volleyball':
        case 'esports':
        case 'mma':
        case 'motorsport':
            return (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex items-center justify-center min-h-75">
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-center">
                        Sơ đồ nhánh đấu {category} đang phát triển
                    </p>
                </div>
            );

        default:
            return <FootballBracket {...restProps} />;
    }
}