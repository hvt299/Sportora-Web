'use client';

import { ArrowLeft } from 'lucide-react';

export default function BackButton() {
    return (
        <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">
                Quay lại trang trước
            </span>
        </button>
    );
}