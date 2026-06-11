import { NewsItem } from '@/lib/scraper';

export default function SidebarNews({ news }: { news: NewsItem[] }) {
    return (
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl h-full">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">
                Thông tin bên lề
            </h3>

            <div className="space-y-6">
                {news.map((item, i) => (
                    <a
                        key={i}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-4 hover:opacity-80 transition-opacity"
                    >
                        {/* Tag tin tức */}
                        <span className="shrink-0 text-[9px] font-black text-blue-500 mt-1 uppercase border border-blue-500/20 px-2 py-0.5 rounded group-hover:bg-blue-500/10 transition-colors">
                            {item.tag}
                        </span>

                        {/* Tiêu đề tin */}
                        <p className="font-display-reg text-sm group-hover:text-blue-400 transition-colors leading-snug">
                            {item.title}
                        </p>
                    </a>
                ))}
            </div>
        </div>
    );
}