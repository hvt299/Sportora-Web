'use client';

import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs hidden sm:block">
                Quay lại trang trước
            </span>
        </button>
    );
}