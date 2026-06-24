"use client";

import FootballHero from './football/FootballHero';

interface MatchHeroProps {
    category?: string;
    matchData: any;
    homeTeam: any;
    awayTeam: any;
    fonts?: { base: string; heading: string; subHeading: string };
}

export default function MatchHero(props: MatchHeroProps) {
    const { category = 'football', ...restProps } = props;

    switch (category) {
        case 'football':
            return <FootballHero {...restProps} category={category} />;

        case 'basketball':
        case 'tennis':
        case 'badminton':
        case 'volleyball':
        case 'esports':
        case 'mma':
        case 'motorsport':
            return (
                <div className="bg-slate-900 border border-slate-800 rounded-4xl p-10 flex items-center justify-center min-h-50">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-center">
                        Giao diện Hero {category} đang phát triển...
                    </p>
                </div>
            );

        default:
            return <FootballHero {...restProps} category={category} />;
    }
}