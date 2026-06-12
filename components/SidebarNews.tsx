"use client";
import { useState } from 'react';
import { NewsItem } from '@/lib/scraper';

interface SidebarNewsProps {
    news: {
        vn: NewsItem[];
        global: NewsItem[];
    }
}

export default function SidebarNews({ news }: SidebarNewsProps) {
    // State quản lý tab đang được chọn
    const [activeTab, setActiveTab] = useState<'vn' | 'global'>('vn');

    // Dữ liệu sẽ hiển thị tùy thuộc vào tab
    const currentNews = activeTab === 'vn' ? news.vn : news.global;

    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl h-full flex flex-col">

            {/* Header + Nút Switch */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 hidden xl:block">
                    Thông tin bên lề
                </h3>

                {/* Nút Toggle UI */}
                <div className="flex bg-slate-950 rounded-lg p-1 border border-slate-800 w-full xl:w-auto">
                    <button
                        onClick={() => setActiveTab('vn')}
                        className={`flex-1 xl:flex-none text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors ${activeTab === 'vn' ? 'bg-blue-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Việt Nam
                    </button>
                    <button
                        onClick={() => setActiveTab('global')}
                        className={`flex-1 xl:flex-none text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md transition-colors ${activeTab === 'global' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Quốc tế
                    </button>
                </div>
            </div>

            {/* Danh sách tin tức (Có thanh cuộn bên trong để giới hạn chiều cao) */}
            <div className="space-y-6 overflow-y-auto pr-2 max-h-150 scrollbar-thin scrollbar-thumb-slate-800">
                {currentNews && currentNews.length > 0 ? currentNews.map((item, i) => (
                    <a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-4 hover:opacity-80 transition-opacity"
                    >
                        {/* Tag tin tức (Đổi màu theo Tab) */}
                        <span className={`shrink-0 text-[9px] font-black mt-1 uppercase border px-2 py-0.5 rounded transition-colors ${activeTab === 'vn'
                                ? 'text-blue-500 border-blue-500/20 group-hover:bg-blue-500/10'
                                : 'text-teal-500 border-teal-500/20 group-hover:bg-teal-500/10'
                            }`}>
                            {item.tag}
                        </span>

                        {/* Tiêu đề tin */}
                        <p className={`font-display-reg text-sm transition-colors leading-snug ${activeTab === 'vn' ? 'group-hover:text-blue-400' : 'group-hover:text-teal-400'
                            }`}>
                            {item.title}
                        </p>
                    </a>
                )) : (
                    <p className="text-slate-500 text-sm text-center py-4">Đang tải tin tức...</p>
                )}
            </div>

        </div>
    );
}