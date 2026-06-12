"use client";
import { useEffect, useState } from 'react';
import { Trophy, CalendarDays, Table, GitBranch } from 'lucide-react';
import MatchCard from '@/components/MatchCard';
import GroupTable from '@/components/GroupTable';
import Bracket from '@/components/Bracket';
import SidebarNews from '@/components/SidebarNews';
import { NewsItem, MatchItem } from '@/lib/scraper';
import { useRouter } from 'next/navigation';

const TABS = [
    { id: 'overview', name: 'Tổng quan', icon: Trophy },
    { id: 'fixtures', name: 'Lịch thi đấu', icon: CalendarDays },
    { id: 'standings', name: 'Bảng xếp hạng', icon: Table },
    { id: 'bracket', name: 'Nhánh đấu', icon: GitBranch },
];

const hostCities = [
    { city: "New York", country: "USA" }, { city: "Los Angeles", country: "USA" }, { city: "Dallas", country: "USA" },
    { city: "Houston", country: "USA" }, { city: "Atlanta", country: "USA" }, { city: "Miami", country: "USA" },
    { city: "Seattle", country: "USA" }, { city: "Boston", country: "USA" }, { city: "Philadelphia", country: "USA" },
    { city: "Kansas City", country: "USA" }, { city: "San Francisco", country: "USA" },
    { city: "Toronto", country: "CAN" }, { city: "Vancouver", country: "CAN" },
    { city: "Mexico City", country: "MEX" }, { city: "Guadalajara", country: "MEX" }, { city: "Monterrey", country: "MEX" },
];

type FixturesData = Record<string, Record<string, MatchItem[]>>;

interface PageProps {
    initialMatches: FixturesData;
    initialStandings: Record<string, any[]>;
    initialNews: NewsItem[];
    initialBracket: any; // Bổ sung dòng này
}

export default function WC26ClientPage({
    initialMatches,
    initialStandings,
    initialNews,
    initialBracket,
}: PageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeGroup, setActiveGroup] = useState(() => Object.keys(initialStandings)[0]);
    const [newsData] = useState(initialNews);
    const [selectedRound, setSelectedRound] = useState('Vòng bảng');

    const router = useRouter();
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 60000);
        return () => clearInterval(interval);
    }, [router]);

    const getRoundKey = (tab: string) => {
        const mapping: Record<string, string> = {
            'Vòng bảng': 'group stage',
            'Vòng 32 đội': 'round of 32',
            'Vòng 16 đội': 'round of 16',
            'Tứ kết': 'quarter-final',
            'Bán kết': 'semi-final',
            'Tranh hạng ba': 'third place',
            'Chung kết': 'final'
        };
        return mapping[tab] || 'group stage';
    };

    const formatGroupName = (name: string) => {
        if (name.toLowerCase().includes('best 3rd')) return 'Các đội hạng 3 tốt nhất';
        return `Bảng ${name}`;
    };

    const activeRoundKeyword = getRoundKey(selectedRound).toLowerCase();

    // Logic này đã được fix để chữ "final" không nhận nhầm "quarter-final" hay "semi-final"
    const matchedKeys = Object.keys(initialMatches).filter(key => {
        const k = key.toLowerCase();
        if (activeRoundKeyword === 'final') return k === 'final';
        return k.includes(activeRoundKeyword);
    });

    const roundData = matchedKeys.reduce((acc, key) => {
        const dates = initialMatches[key];
        Object.entries(dates).forEach(([date, matches]) => {
            if (!acc[date]) acc[date] = [];
            acc[date] = [...acc[date], ...(matches as MatchItem[])];
        });
        return acc;
    }, {} as Record<string, MatchItem[]>);

    return (
        <div className="min-h-screen bg-black text-white font-wc26">
            {/* Hero Header riêng của WC26 */}
            <section
                className="h-[40vh] relative flex items-end p-8 border-b border-slate-800 bg-center bg-cover"
                style={{ backgroundImage: `url('/images/wc26.jpg')` }}
            >
                {/* Overlay tối để chữ dễ đọc hơn */}
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

                {/* Nội dung */}
                <div className="relative z-10">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block">
                        FIFA Official Tournament
                    </span>
                    <h1 className="font-display-black text-5xl md:text-7xl italic uppercase tracking-tighter drop-shadow-lg">
                        FIFA WORLD CUP 2026
                    </h1>
                </div>
            </section>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-black/50 sticky top-0 z-40">
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition ${activeTab === tab.id
                                ? 'border-blue-500 text-white'
                                : 'border-transparent text-slate-500 hover:text-white'
                                }`}
                        >
                            <Icon size={18} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            {/* Nội dung theo Tab */}
            <main className="p-8">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">

                        {/* LEFT COLUMN: Thông tin giải đấu */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* HERO (Xanh dương đậm) */}
                            <div className="bg-linear-to-br from-blue-900/40 to-slate-900/50 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[180px] font-display-black italic leading-none">
                                    FIFA
                                </div>
                                <h2 className="text-4xl md:text-5xl font-display-black italic uppercase tracking-tighter mb-4 bg-linear-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent relative z-10">
                                    FIFA World Cup 2026
                                </h2>
                                <p className="text-slate-300 leading-relaxed mb-8 relative z-10">
                                    FIFA World Cup 2026 là kỳ World Cup lớn nhất trong lịch sử
                                    bóng đá thế giới với 48 đội tuyển quốc gia tham dự và
                                    104 trận đấu được tổ chức trên khắp Bắc Mỹ.
                                    Giải đấu sẽ được đồng tổ chức bởi Hoa Kỳ, Canada và Mexico,
                                    đánh dấu lần đầu tiên ba quốc gia cùng đăng cai một kỳ World Cup.
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Số đội</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">48</p>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Trận đấu</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">104</p>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Thành phố</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">16</p>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sân vận động</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">16</p>
                                    </div>
                                </div>
                            </div>

                            {/* TOURNAMENT MESSAGE (Indigo) */}
                            <div className="bg-linear-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -right-10 -top-10 opacity-10 pointer-events-none text-9xl font-black italic text-indigo-300">
                                    26
                                </div>
                                <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">
                                    Thông điệp chính thức
                                </h3>
                                <h2 className="text-4xl font-display-black italic tracking-tighter mb-4 text-white relative z-10">
                                    WE ARE 26
                                </h2>
                                <p className="text-slate-300 leading-relaxed relative z-10 max-w-2xl">
                                    "WE ARE 26" không chỉ là một khẩu hiệu, mà là lời kêu gọi sự đoàn kết. Ba quốc gia, một lục địa, và toàn bộ thế giới bóng đá cùng hội tụ để tạo nên một lễ hội thể thao vĩ đại nhất, đa dạng nhất và toàn diện nhất từ trước đến nay. Đây là lúc bóng đá vượt qua mọi rào cản biên giới.
                                </p>
                            </div>

                            {/* 48 PARTICIPATING TEAMS (Teal/Xanh ngọc) */}
                            <div className="bg-linear-to-br from-teal-900/30 to-slate-900/50 border border-teal-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[140px] font-display-black italic leading-none text-teal-200">
                                    TEAMS
                                </div>
                                <div className="flex justify-between items-center mb-8 relative z-10 border-b border-teal-500/20 pb-4">
                                    <h3 className="text-2xl md:text-3xl font-display-black italic uppercase tracking-tighter text-teal-400">
                                        48 Đội tuyển tham dự
                                    </h3>
                                    <span className="text-xs uppercase text-teal-200 font-bold bg-teal-900/50 px-3 py-1 rounded-full border border-teal-500/30 hidden sm:block">
                                        Danh sách chính thức
                                    </span>
                                </div>
                                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3 relative z-10">
                                    {[
                                        { name: "Mexico", logo: "https://images.onefootball.com/icons/teams/164/69.png" },
                                        { name: "Czechia", logo: "https://images.onefootball.com/icons/teams/164/100.png" },
                                        { name: "Korea Republic", logo: "https://images.onefootball.com/icons/teams/164/70.png" },
                                        { name: "South Africa", logo: "https://images.onefootball.com/icons/teams/164/39.png" },
                                        { name: "Canada", logo: "https://images.onefootball.com/icons/teams/164/132.png" },
                                        { name: "Bosnia & Herzegovina", logo: "https://images.onefootball.com/icons/teams/164/297.png" },
                                        { name: "Qatar", logo: "https://images.onefootball.com/icons/teams/164/586.png" },
                                        { name: "Switzerland", logo: "https://images.onefootball.com/icons/teams/164/93.png" },
                                        { name: "Brazil", logo: "https://images.onefootball.com/icons/teams/164/79.png" },
                                        { name: "Morocco", logo: "https://images.onefootball.com/icons/teams/164/108.png" },
                                        { name: "Haiti", logo: "https://images.onefootball.com/icons/teams/164/134.png" },
                                        { name: "Scotland", logo: "https://images.onefootball.com/icons/teams/164/113.png" },
                                        { name: "United States", logo: "https://images.onefootball.com/icons/teams/164/81.png" },
                                        { name: "Paraguay", logo: "https://images.onefootball.com/icons/teams/164/47.png" },
                                        { name: "Australia", logo: "https://images.onefootball.com/icons/teams/164/74.png" },
                                        { name: "Türkiye", logo: "https://images.onefootball.com/icons/teams/164/123.png" },
                                        { name: "Germany", logo: "https://images.onefootball.com/icons/teams/164/96.png" },
                                        { name: "Curaçao", logo: "https://images.onefootball.com/icons/teams/164/1354.png" },
                                        { name: "Côte d'Ivoire", logo: "https://images.onefootball.com/icons/teams/164/41.png" },
                                        { name: "Ecuador", logo: "https://images.onefootball.com/icons/teams/164/101.png" },
                                        { name: "Netherlands", logo: "https://images.onefootball.com/icons/teams/164/38.png" },
                                        { name: "Japan", logo: "https://images.onefootball.com/icons/teams/164/52.png" },
                                        { name: "Sweden", logo: "https://images.onefootball.com/icons/teams/164/105.png" },
                                        { name: "Tunisia", logo: "https://images.onefootball.com/icons/teams/164/112.png" },
                                        { name: "Belgium", logo: "https://images.onefootball.com/icons/teams/164/116.png" },
                                        { name: "Egypt", logo: "https://images.onefootball.com/icons/teams/164/590.png" },
                                        { name: "Iran", logo: "https://images.onefootball.com/icons/teams/164/102.png" },
                                        { name: "New Zealand", logo: "https://images.onefootball.com/icons/teams/164/54.png" },
                                        { name: "Spain", logo: "https://images.onefootball.com/icons/teams/164/34.png" },
                                        { name: "Cabo Verde", logo: "https://images.onefootball.com/icons/teams/164/589.png" },
                                        { name: "Saudi Arabia", logo: "https://images.onefootball.com/icons/teams/164/104.png" },
                                        { name: "Uruguay", logo: "https://images.onefootball.com/icons/teams/164/56.png" },
                                        { name: "France", logo: "https://images.onefootball.com/icons/teams/164/45.png" },
                                        { name: "Senegal", logo: "https://images.onefootball.com/icons/teams/164/121.png" },
                                        { name: "Iraq", logo: "https://images.onefootball.com/icons/teams/164/133.png" },
                                        { name: "Norway", logo: "https://images.onefootball.com/icons/teams/164/115.png" },
                                        { name: "Argentina", logo: "https://images.onefootball.com/icons/teams/164/55.png" },
                                        { name: "Algeria", logo: "https://images.onefootball.com/icons/teams/164/59.png" },
                                        { name: "Austria", logo: "https://images.onefootball.com/icons/teams/164/117.png" },
                                        { name: "Jordan", logo: "https://images.onefootball.com/icons/teams/164/777.png" },
                                        { name: "Portugal", logo: "https://images.onefootball.com/icons/teams/164/43.png" },
                                        { name: "DR Congo", logo: "https://images.onefootball.com/icons/teams/164/895.png" },
                                        { name: "Uzbekistan", logo: "https://images.onefootball.com/icons/teams/164/592.png" },
                                        { name: "Colombia", logo: "https://images.onefootball.com/icons/teams/164/118.png" },
                                        { name: "England", logo: "https://images.onefootball.com/icons/teams/164/61.png" },
                                        { name: "Croatia", logo: "https://images.onefootball.com/icons/teams/164/99.png" },
                                        { name: "Ghana", logo: "https://images.onefootball.com/icons/teams/164/60.png" },
                                        { name: "Panama", logo: "https://images.onefootball.com/icons/teams/164/1022.png" }
                                    ].map((team, idx) => (
                                        <div key={idx} className="group relative flex justify-center">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-950/60 backdrop-blur-md rounded-full p-2 border border-slate-700/80 group-hover:border-teal-400 group-hover:scale-110 group-hover:bg-slate-50 transition-all duration-300 z-10 cursor-pointer shadow-sm shadow-black">
                                                <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="absolute -bottom-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-teal-500/50 text-teal-50 text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none">
                                                {team.name}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ARGENTINA (Sky Blue) - Giữ nguyên nhưng nâng cấp form chữ */}
                            <div className="bg-linear-to-r from-sky-500/10 via-cyan-500/10 to-blue-500/10 border border-sky-500/20 rounded-3xl p-6 relative overflow-hidden hover:border-sky-400/40 transition">
                                <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[120px] font-display-black italic leading-none text-sky-200">
                                    CHAMP
                                </div>
                                <div className="flex items-center gap-5 relative z-10">
                                    <img src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/55.png" alt="Argentina" className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
                                    <div>
                                        <p className="text-sky-400 text-xs uppercase tracking-widest font-black mb-1">Defending Champion</p>
                                        <h3 className="text-3xl font-display-black italic uppercase tracking-tighter text-white">Argentina</h3>
                                        <p className="text-sky-100/70 text-sm mt-1">Nhà vô địch FIFA World Cup 2022 sau chiến thắng trước Pháp trong trận chung kết.</p>
                                    </div>
                                </div>
                            </div>

                            {/* HOST NATIONS (Purple/Tím) */}
                            <div className="bg-linear-to-br from-purple-900/30 to-slate-900/50 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[150px] font-display-black italic leading-none text-purple-200">
                                    HOSTS
                                </div>
                                <h3 className="text-2xl md:text-3xl font-display-black italic uppercase tracking-tighter text-purple-400 mb-6 relative z-10 border-b border-purple-500/20 pb-4">
                                    Quốc gia đăng cai
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                    <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center hover:border-purple-500/50 transition">
                                        <img src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/81.png" alt="USA" className="w-20 h-20 mx-auto mb-4" />
                                        <h4 className="font-display-black italic tracking-tighter text-xl text-white uppercase">Hoa Kỳ</h4>
                                    </div>
                                    <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center hover:border-purple-500/50 transition">
                                        <img src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/132.png" alt="Canada" className="w-20 h-20 mx-auto mb-4" />
                                        <h4 className="font-display-black italic tracking-tighter text-xl text-white uppercase">Canada</h4>
                                    </div>
                                    <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center hover:border-purple-500/50 transition">
                                        <img src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/69.png" alt="Mexico" className="w-20 h-20 mx-auto mb-4" />
                                        <h4 className="font-display-black italic tracking-tighter text-xl text-white uppercase">Mexico</h4>
                                    </div>
                                </div>
                            </div>

                            {/* HOST CITIES (Sky/Xanh da trời nhạt) */}
                            <div className="bg-linear-to-br from-sky-900/30 to-slate-900/50 border border-sky-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[150px] font-display-black italic leading-none text-sky-200">
                                    CITIES
                                </div>
                                <div className="flex items-center justify-between mb-6 relative z-10 border-b border-sky-500/20 pb-4">
                                    <h3 className="text-2xl md:text-3xl font-display-black italic uppercase tracking-tighter text-sky-400">
                                        Các thành phố đăng cai
                                    </h3>
                                    <span className="text-xs uppercase text-sky-200 font-bold bg-sky-900/50 px-3 py-1 rounded-full border border-sky-500/30">
                                        16 Thành phố
                                    </span>
                                </div>
                                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-sky-900 relative z-10">
                                    {hostCities.map((city) => (
                                        <div key={city.city} className="min-w-45 bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-sky-400/50 transition">
                                            <div className="text-2xl mb-3 drop-shadow-md">
                                                {city.country === "USA" && "🇺🇸"}
                                                {city.country === "CAN" && "🇨🇦"}
                                                {city.country === "MEX" && "🇲🇽"}
                                            </div>
                                            <h4 className="font-bold text-white">{city.city}</h4>
                                            <p className="text-xs text-sky-200/60 mt-1 uppercase font-bold">{city.country}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* TOURNAMENT FORMAT & INFO (Chia 2 cột) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Thể thức thi đấu (Rose/Hồng đỏ) */}
                                <div className="bg-linear-to-br from-rose-900/20 to-slate-900/50 border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden hover:border-rose-500/40 transition">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[100px] font-display-black italic leading-none text-rose-200">
                                        RULE
                                    </div>
                                    <h3 className="text-2xl font-display-black italic uppercase tracking-tighter text-rose-400 mb-4 relative z-10">
                                        Thể thức thi đấu
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm relative z-10">
                                        48 đội được chia thành 12 bảng, mỗi bảng 4 đội.
                                        Hai đội dẫn đầu mỗi bảng cùng 8 đội xếp thứ ba xuất sắc nhất
                                        sẽ tiến vào vòng 32 đội. Từ đây giải đấu tiếp tục theo thể thức
                                        loại trực tiếp cho tới trận chung kết.
                                    </p>
                                </div>

                                {/* Thông số giải đấu (Amber/Vàng hổ phách) */}
                                <div className="bg-linear-to-br from-amber-900/20 to-slate-900/50 border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden hover:border-amber-500/40 transition">
                                    <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[100px] font-display-black italic leading-none text-amber-200">
                                        INFO
                                    </div>
                                    <h3 className="text-2xl font-display-black italic uppercase tracking-tighter text-amber-400 mb-6 relative z-10">
                                        Thông số giải đấu
                                    </h3>
                                    <div className="space-y-4 text-sm font-medium relative z-10">
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Thời gian</span>
                                            <span className="text-white">11/06 - 19/07/2026</span>
                                        </div>
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Đội tham dự</span>
                                            <span className="text-white">48</span>
                                        </div>
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Tổng trận đấu</span>
                                            <span className="text-white">104</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* RIGHT COLUMN (SIDEBAR): Tích hợp Sticky cho News */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-22"> {/* top-24 (88px) giữ khoảng cách khi cuộn */}
                                <h3 className="font-bold text-lg mb-4 text-slate-200">Tin tức mới nhất</h3>
                                <SidebarNews news={newsData} />
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'fixtures' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Đã thêm nút "Tranh hạng ba" */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['Vòng bảng', 'Vòng 32 đội', 'Vòng 16 đội', 'Tứ kết', 'Bán kết', 'Tranh hạng ba', 'Chung kết'].map((round) => (
                                <button
                                    key={round}
                                    onClick={() => setSelectedRound(round)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedRound === round
                                        ? "bg-white text-black"
                                        : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                                        }`}
                                >
                                    {round}
                                </button>
                            ))}
                        </div>

                        {/* Danh sách trận đấu động theo ngày */}
                        <div className="space-y-10">
                            {Object.keys(roundData).length > 0 ? (
                                Object.keys(roundData)
                                    .sort((a, b) => {
                                        const [d1, m1, y1] = a.split('/').map(Number);
                                        const [d2, m2, y2] = b.split('/').map(Number);
                                        return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
                                    })
                                    .map((date) => (
                                        <div key={date} className="space-y-6">
                                            <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                {date}
                                            </h4>
                                            <div className="space-y-3">
                                                {roundData[date].map((match: any, i: number) => (
                                                    <MatchCard key={i} {...match} />
                                                ))}
                                            </div>
                                        </div>
                                    ))
                            ) : (
                                <p className="text-slate-500 text-center py-10">Chưa có lịch thi đấu cho vòng này.</p>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'standings' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* Group Selector */}
                        <div className="flex gap-6 overflow-x-auto no-scrollbar border-b border-slate-800">
                            {Object.keys(initialStandings).map((groupName) => (
                                <button
                                    key={groupName}
                                    onClick={() => setActiveGroup(groupName)}
                                    className={`pb-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${activeGroup === groupName
                                        ? "border-blue-500 text-white"
                                        : "border-transparent text-slate-500 hover:border-slate-500"
                                        }`}
                                >
                                    {formatGroupName(groupName).toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Table: Lấy dữ liệu theo bảng đang chọn */}
                        {initialStandings[activeGroup] ? (
                            <GroupTable
                                data={initialStandings[activeGroup]}
                                groupName={activeGroup}
                            />
                        ) : (
                            <p className="text-slate-500 text-center py-10">Đang tải dữ liệu bảng này...</p>
                        )}
                    </div>
                )}
                {activeTab === 'bracket' && (<Bracket data={initialBracket} />)}
            </main>
        </div>
    );
}