'use client';
import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string;
}

export default function Countdown({ targetDate }: CountdownProps) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const target = new Date(targetDate).getTime();
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                clearInterval(interval);
                return;
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((difference % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    // Helper để thêm số 0 phía trước
    const pad = (num: number) => num.toString().padStart(2, '0');

    return (
        <div className="flex gap-3 md:gap-6 font-mono text-center">
            {[
                { label: 'Ngày', value: timeLeft.days },
                { label: 'Giờ', value: timeLeft.hours },
                { label: 'Phút', value: timeLeft.minutes },
                { label: 'Giây', value: timeLeft.seconds },
            ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                    <div className="bg-slate-800 border border-slate-700 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-2xl text-2xl md:text-4xl font-black text-blue-400 shadow-inner">
                        {item.value.toString().padStart(2, '0')}
                    </div>
                    <span className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mt-2 font-bold">
                        {item.label}
                    </span>
                </div>
            ))}
        </div>
    );
}