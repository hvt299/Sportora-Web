"use client";
import { useState } from 'react';
import { Trophy, CalendarDays, Table, GitBranch } from 'lucide-react';
import MatchCard from '@/components/MatchCard';
import GroupTable from '@/components/GroupTable';
import Bracket from '@/components/Bracket';
import SidebarNews from '@/components/SidebarNews';
import { NewsItem } from '@/lib/scraper';

const TABS = [
    { id: 'overview', name: 'Tổng quan', icon: Trophy },
    { id: 'fixtures', name: 'Lịch thi đấu', icon: CalendarDays },
    { id: 'standings', name: 'Bảng xếp hạng', icon: Table },
    { id: 'bracket', name: 'Nhánh đấu', icon: GitBranch },
];

const hostCities = [
    { city: "New York", country: "USA" },
    { city: "Los Angeles", country: "USA" },
    { city: "Dallas", country: "USA" },
    { city: "Houston", country: "USA" },
    { city: "Atlanta", country: "USA" },
    { city: "Miami", country: "USA" },
    { city: "Seattle", country: "USA" },
    { city: "Boston", country: "USA" },
    { city: "Philadelphia", country: "USA" },
    { city: "Kansas City", country: "USA" },
    { city: "San Francisco", country: "USA" },

    { city: "Toronto", country: "CAN" },
    { city: "Vancouver", country: "CAN" },

    { city: "Mexico City", country: "MEX" },
    { city: "Guadalajara", country: "MEX" },
    { city: "Monterrey", country: "MEX" },
]

interface PageProps {
    initialMatches: Record<string, any[]>;
    initialStandings: Record<string, any[]>;
    initialNews: NewsItem[];
}

export default function WC26ClientPage({ initialMatches, initialStandings, initialNews }: PageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [matches] = useState(initialMatches);
    const [activeGroup, setActiveGroup] = useState(() => Object.keys(initialStandings)[0]);
    const [newsData] = useState(initialNews);

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
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* LEFT COLUMN */}
                        <div className="md:col-span-8 space-y-6">

                            {/* HERO */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <h2 className="text-3xl font-black mb-4 bg-linear-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                                    FIFA World Cup 2026
                                </h2>

                                <p className="text-slate-400 leading-relaxed mb-8">
                                    FIFA World Cup 2026 là kỳ World Cup lớn nhất trong lịch sử
                                    bóng đá thế giới với 48 đội tuyển quốc gia tham dự và
                                    104 trận đấu được tổ chức trên khắp Bắc Mỹ.
                                    Giải đấu sẽ được đồng tổ chức bởi Hoa Kỳ, Canada và Mexico,
                                    đánh dấu lần đầu tiên ba quốc gia cùng đăng cai một kỳ World Cup.
                                </p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold">
                                            Số đội
                                        </p>
                                        <p className="text-2xl font-bold font-mono">
                                            48
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold">
                                            Trận đấu
                                        </p>
                                        <p className="text-2xl font-bold font-mono">
                                            104
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold">
                                            Thành phố
                                        </p>
                                        <p className="text-2xl font-bold font-mono">
                                            16
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                                        <p className="text-[10px] uppercase text-slate-500 font-bold">
                                            Sân vận động
                                        </p>
                                        <p className="text-2xl font-bold font-mono">
                                            16
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* ARGENTINA */}
                            <div className="bg-linear-to-rrom-sky-500/10 via-cyan-500/10 to-blue-500/10 border border-sky-500/20 rounded-3xl p-6">
                                <div className="flex items-center gap-5">
                                    <img
                                        src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/55.png"
                                        alt="Argentina"
                                        className="w-20 h-20 object-contain"
                                    />

                                    <div>
                                        <p className="text-sky-400 text-xs uppercase tracking-wider font-bold">
                                            Defending Champion
                                        </p>

                                        <h3 className="text-2xl font-black mt-1">
                                            Argentina
                                        </h3>

                                        <p className="text-slate-400 text-sm mt-2">
                                            Nhà vô địch FIFA World Cup 2022 sau chiến thắng
                                            trước Pháp trong trận chung kết lịch sử tại Qatar.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* HOST NATIONS */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6">
                                    Quốc gia đăng cai
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                                        <img
                                            src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/81.png"
                                            alt="USA"
                                            className="w-20 h-20 mx-auto mb-4"
                                        />

                                        <h4 className="font-bold text-lg">
                                            Hoa Kỳ
                                        </h4>

                                        <p className="text-slate-500 text-sm mt-2">
                                            Chủ nhà chính của giải đấu và địa điểm tổ chức trận chung kết.
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                                        <img
                                            src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/132.png"
                                            alt="Canada"
                                            className="w-20 h-20 mx-auto mb-4"
                                        />

                                        <h4 className="font-bold text-lg">
                                            Canada
                                        </h4>

                                        <p className="text-slate-500 text-sm mt-2">
                                            Đăng cai tại Toronto và Vancouver.
                                        </p>
                                    </div>

                                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
                                        <img
                                            src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/69.png"
                                            alt="Mexico"
                                            className="w-20 h-20 mx-auto mb-4"
                                        />

                                        <h4 className="font-bold text-lg">
                                            Mexico
                                        </h4>

                                        <p className="text-slate-500 text-sm mt-2">
                                            Quốc gia đầu tiên đăng cai World Cup 3 lần.
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* HOST CITIES */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold">
                                        Host Cities
                                    </h3>

                                    <span className="text-xs uppercase text-slate-500 font-bold">
                                        16 Cities
                                    </span>
                                </div>

                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">

                                    {hostCities.map((city) => (
                                        <div
                                            key={city.city}
                                            className="min-w-45 bg-slate-950 border border-slate-800 rounded-2xl p-4 hover:border-blue-500/50 transition"
                                        >
                                            <div className="text-2xl mb-3">
                                                {city.country === "USA" && "🇺🇸"}
                                                {city.country === "CAN" && "🇨🇦"}
                                                {city.country === "MEX" && "🇲🇽"}
                                            </div>

                                            <h4 className="font-bold">
                                                {city.city}
                                            </h4>

                                            <p className="text-xs text-slate-500 mt-1">
                                                {city.country}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* FORMAT */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-4">
                                    Thể thức thi đấu
                                </h3>

                                <p className="text-slate-400 leading-relaxed">
                                    48 đội được chia thành 12 bảng, mỗi bảng 4 đội.
                                    Hai đội dẫn đầu mỗi bảng cùng 8 đội xếp thứ ba xuất sắc nhất
                                    sẽ tiến vào vòng 32 đội. Từ đây giải đấu tiếp tục theo thể thức
                                    loại trực tiếp cho tới trận chung kết.
                                </p>
                            </div>

                            {/* TOURNAMENT INFO */}
                            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
                                <h3 className="text-xl font-bold mb-6">
                                    Thông số giải đấu
                                </h3>

                                <div className="space-y-4">

                                    <div className="flex justify-between border-b border-slate-800 pb-3">
                                        <span className="text-slate-500">Thời gian</span>
                                        <span>11/06/2026 - 19/07/2026</span>
                                    </div>

                                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                        <span className="text-slate-500">
                                            Đương kim vô địch
                                        </span>

                                        <div className="flex items-center gap-2">
                                            <img
                                                src="https://image-service.onefootball.com/transform?w=128&dpr=2&image=https://images.onefootball.com/icons/teams/164/55.png"
                                                alt="Argentina"
                                                className="w-6 h-6"
                                            />
                                            <span>Argentina</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between border-b border-slate-800 pb-3">
                                        <span className="text-slate-500">Đội tham dự</span>
                                        <span>48</span>
                                    </div>

                                    <div className="flex justify-between border-b border-slate-800 pb-3">
                                        <span className="text-slate-500">Tổng trận đấu</span>
                                        <span>104</span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Thành phố đăng cai</span>
                                        <span>16</span>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* SIDEBAR */}
                        <div className="md:col-span-4">
                            <h3 className="font-bold text-lg mb-4 text-slate-200">
                                Tin tức mới nhất
                            </h3>

                            <SidebarNews news={newsData} />
                        </div>
                    </div>
                )}
                {activeTab === 'fixtures' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        {/* Vòng bảng Selector (Giữ nguyên) */}
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            {['Vòng bảng', 'Vòng 16 đội', 'Tứ kết', 'Bán kết', 'Chung kết'].map((round, idx) => (
                                <button
                                    key={round}
                                    className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${idx === 0 ? "bg-white text-black" : "bg-slate-900 text-slate-400 hover:bg-slate-800"
                                        }`}
                                >
                                    {round}
                                </button>
                            ))}
                        </div>

                        {/* Danh sách trận đấu động theo ngày */}
                        <div className="space-y-10">
                            {Object.entries(matches).map(([date, matches]) => (
                                <div key={date} className="space-y-6">
                                    {/* Tiêu đề ngày hiển thị động theo key */}
                                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                                        {date}
                                    </h4>

                                    {/* Danh sách các trận trong ngày đó */}
                                    <div className="space-y-3">
                                        {(matches as any[]).map((match, i) => (
                                            <MatchCard
                                                key={i}
                                                home={match.home}
                                                away={match.away}
                                                homeLogo={match.homeLogo}
                                                awayLogo={match.awayLogo}
                                                score={match.score}
                                                time={match.time}
                                                status={match.status}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
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
                                    className={`pb-3 text-xs font-bold border-b-2 transition-all ${activeGroup === groupName
                                        ? "border-blue-500 text-white"
                                        : "border-transparent text-slate-500 hover:border-slate-500"
                                        }`}
                                >
                                    {groupName.toUpperCase()}
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
                {activeTab === 'bracket' && (
                    <Bracket />
                )}
            </main>
        </div>
    );
}