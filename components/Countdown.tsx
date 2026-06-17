'use client';

import { useEffect, useState } from 'react';

interface CountdownProps {
    startDate: string;
    endDate?: string;
}

export default function Countdown({ startDate, endDate }: CountdownProps) {
    const [status, setStatus] = useState<'upcoming' | 'live' | 'finished'>('upcoming');
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        const update = () => {
            const now = Date.now();
            const start = new Date(startDate).getTime();
            const end = endDate ? new Date(endDate).getTime() : null;

            if (now < start) {
                setStatus('upcoming');
                const diff = start - now;
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff % 86400000) / 3600000),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000),
                });
                return;
            }

            if (end && now <= end) {
                setStatus('live');
                const diff = end - now;
                setTimeLeft({
                    days: Math.floor(diff / 86400000),
                    hours: Math.floor((diff % 86400000) / 3600000),
                    minutes: Math.floor((diff % 3600000) / 60000),
                    seconds: Math.floor((diff % 60000) / 1000),
                });
                return;
            }

            setStatus('finished');
        };

        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, [startDate, endDate]);

    if (status === 'finished') return null;

    return (
        <div className="flex flex-col items-center gap-4 md:gap-5">
            <div className="flex gap-2 sm:gap-3 md:gap-5">
                {[
                    ['Ngày', timeLeft.days],
                    ['Giờ', timeLeft.hours],
                    ['Phút', timeLeft.minutes],
                    ['Giây', timeLeft.seconds],
                ].map(([label, value]) => (
                    <div key={label} className="text-center">
                        <div className="w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl lg:rounded-3xl bg-black/40 backdrop-blur-xl border border-white/10 flex items-center justify-center text-2xl md:text-3xl lg:text-4xl font-black text-white shadow-lg">
                            {String(value).padStart(2, '0')}
                        </div>
                        <div className="mt-1.5 md:mt-2 text-[9px] md:text-[10px] lg:text-xs uppercase tracking-widest text-slate-400 font-bold">
                            {label}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}