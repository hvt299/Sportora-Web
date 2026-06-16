"use client";
import { useRef, useState, useEffect } from 'react';
import { Trophy, CalendarDays, Table, GitBranch, ArrowLeft, Volume2, VolumeX, Users, BarChart2, Image as ImageIcon, Video } from 'lucide-react';
import Link from 'next/link';
import MatchCard from '@/components/MatchCard';
import GroupTable from '@/components/GroupTable';
import Bracket from '@/components/Bracket';
import SidebarNews from '@/components/SidebarNews';
import { NewsItem, MatchItem } from '@/lib/scraper';
import { useRouter } from 'next/navigation';
import { tournamentDetails } from '@/data/tournament-details';
import StatCard from './StatCard';

type FixturesData = Record<string, Record<string, MatchItem[]>>;

interface PageProps {
    initialMatches: FixturesData;
    initialStandings: Record<string, any[]>;
    initialNews: { vn: NewsItem[], global: NewsItem[] };
    initialBracket: any;
    initialStats: { players: any[], teams: any[] };
    tournamentKey: string;
}

type TournamentDetailType = {
    config: { leagueId: number; season: string; query: string; tournamentKey: string };
    fonts?: { base: string; heading: string; subHeading: string };
    hero: { badge: string; title: string; backgroundImage: string; video: string };
    overview: {
        title: string;
        description: string;
        stats: { teams: number; matches: number; cities?: number; stadiums?: number; };
    };
    message?: { title: string; description: string };
    hosts?: { name: string; code: string; logo: string }[];
    hostCities?: { city: string; country: string }[];
    format: { title: string; description: string };
    tournamentInfo: { startDate: string; endDate: string; teams: number; matches: number };
    teams?: { name: string; logo: string }[];
};

export default function TournamentClientPage({
    initialMatches,
    initialStandings,
    initialNews,
    initialBracket,
    initialStats,
    tournamentKey
}: PageProps) {
    const [activeTab, setActiveTab] = useState('overview');
    const [activeGroup, setActiveGroup] = useState(() => Object.keys(initialStandings)[0]);
    const [newsData] = useState(initialNews);

    // DYNAMIC TABS: Kiểm tra xem giải đấu có dữ liệu Nhánh đấu không
    const hasBracket = initialBracket && (
        initialBracket.final ||
        (initialBracket.semiFinals && initialBracket.semiFinals.length > 0) ||
        (initialBracket.quarterFinals && initialBracket.quarterFinals.length > 0) ||
        (initialBracket.roundOf16 && initialBracket.roundOf16.length > 0) ||
        (initialBracket.roundOf32 && initialBracket.roundOf32.length > 0)
    );

    const TABS = [
        { id: 'overview', name: 'Tổng quan', icon: Trophy },
        { id: 'fixtures', name: 'Lịch thi đấu', icon: CalendarDays },
        { id: 'standings', name: 'Bảng xếp hạng', icon: Table },
        ...(hasBracket ? [{ id: 'bracket', name: 'Nhánh đấu', icon: GitBranch }] : []),
        { id: 'player-stats', name: 'Chỉ số cầu thủ', icon: Users },
        { id: 'team-stats', name: 'Chỉ số đội bóng', icon: BarChart2 },
    ];

    // DYNAMIC ROUNDS: Lấy danh sách Vòng đấu hiện có và sắp xếp thông minh
    const sortedRounds = Object.keys(initialMatches).sort((a, b) => {
        const cupOrder = ['Vòng bảng', 'Vòng 32 đội', 'Vòng 16 đội', 'Tứ kết', 'Bán kết', 'Tranh hạng ba', 'Chung kết'];
        const idxA = cupOrder.indexOf(a);
        const idxB = cupOrder.indexOf(b);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;

        const matchA = a.match(/Vòng (\d+)/);
        const matchB = b.match(/Vòng (\d+)/);
        if (matchA && matchB) {
            return parseInt(matchA[1]) - parseInt(matchB[1]);
        }
        return 0;
    });

    const [selectedRound, setSelectedRound] = useState(() => sortedRounds[0] || '');
    const [hideFinished, setHideFinished] = useState(false);

    // VIDEO STATE
    const [isMuted, setIsMuted] = useState(true);
    const [videoError, setVideoError] = useState(false);
    const [preferredMode, setPreferredMode] = useState<'video' | 'image'>('video');

    const router = useRouter();
    useEffect(() => {
        const interval = setInterval(() => { router.refresh(); }, 15000);
        return () => clearInterval(interval);
    }, [router]);

    const formatGroupName = (name: string) => {
        if (name.toLowerCase().includes('best 3rd')) return 'Các đội hạng 3 tốt nhất';
        // Nếu chỉ có 1 bảng (Giải League) thì giữ nguyên tên
        if (Object.keys(initialStandings).length === 1) return name;
        return `Bảng ${name}`;
    };

    const roundData = initialMatches[selectedRound] || {};
    const details = (tournamentDetails[tournamentKey as keyof typeof tournamentDetails] || tournamentDetails.worldCup2026) as TournamentDetailType;

    const fonts = details.fonts || { base: "font-sans", heading: "font-black", subHeading: "font-bold" };

    const hostCitiesRef = useRef<HTMLDivElement>(null);
    const [isDraggingCities, setIsDraggingCities] = useState(false);
    const [startXCities, setStartXCities] = useState(0);
    const [scrollLeftCities, setScrollLeftCities] = useState(0);

    const handleCitiesMouseDown = (e: React.MouseEvent) => {
        if (!hostCitiesRef.current) return;
        setIsDraggingCities(true);
        setStartXCities(e.pageX - hostCitiesRef.current.offsetLeft);
        setScrollLeftCities(hostCitiesRef.current.scrollLeft);
    };
    const handleCitiesMouseLeaveOrUp = () => setIsDraggingCities(false);
    const handleCitiesMouseMove = (e: React.MouseEvent) => {
        if (!isDraggingCities || !hostCitiesRef.current) return;
        e.preventDefault();
        const x = e.pageX - hostCitiesRef.current.offsetLeft;
        const walk = (x - startXCities) * 1.5;
        hostCitiesRef.current.scrollLeft = scrollLeftCities - walk;
    };

    return (
        <div className={`min-h-screen bg-black text-white ${fonts.base} relative`}>

            <Link
                href="/tournaments"
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/40 hover:bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
            >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-bold uppercase tracking-widest text-xs hidden sm:block">Các giải đấu</span>
            </Link>

            {/* HERO HEADER VỚI VIDEO/IMAGE TỐI ƯU */}
            <section
                className="h-[40vh] relative flex items-end p-8 border-b border-slate-800 overflow-hidden bg-blue-950"
            >
                {(() => {
                    const hasVideo = !!details.hero.video && !videoError;
                    const hasImage = !!details.hero.backgroundImage;
                    let currentDisplay: 'video' | 'image' | 'none' = 'none';

                    if (preferredMode === 'video') {
                        if (hasVideo) currentDisplay = 'video';
                        else if (hasImage) currentDisplay = 'image';
                    } else {
                        if (hasImage) currentDisplay = 'image';
                        else if (hasVideo) currentDisplay = 'video';
                    }

                    const canToggle = hasVideo && hasImage;

                    return (
                        <>
                            {currentDisplay === 'video' && (
                                <video
                                    autoPlay loop muted={isMuted} playsInline
                                    className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
                                    onError={() => setVideoError(true)}
                                >
                                    <source src={details.hero.video} type="video/mp4" />
                                </video>
                            )}
                            {currentDisplay === 'image' && (
                                <div
                                    className="absolute inset-0 bg-center bg-cover z-0 opacity-80"
                                    style={{ backgroundImage: `url('${details.hero.backgroundImage}')` }}
                                />
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent z-10" />

                            {canToggle && (
                                <button
                                    onClick={() => setPreferredMode(prev => prev === 'video' ? 'image' : 'video')}
                                    className="absolute top-6 right-6 z-30 p-2.5 bg-black/30 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/20 transition text-white shadow-xl"
                                    title={currentDisplay === 'video' ? "Chuyển sang Hình ảnh tĩnh" : "Chuyển sang Video động"}
                                >
                                    {currentDisplay === 'video' ? <ImageIcon className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                                </button>
                            )}

                            {currentDisplay === 'video' && (
                                <button
                                    onClick={() => setIsMuted(!isMuted)}
                                    className="absolute bottom-6 right-6 z-30 p-3 bg-black/30 hover:bg-black/60 rounded-full backdrop-blur-md border border-white/20 transition text-white shadow-xl"
                                >
                                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                </button>
                            )}
                        </>
                    );
                })()}

                <div className="relative z-20 pointer-events-none">
                    <span className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2 block drop-shadow-md">
                        {details.hero.badge}
                    </span>
                    <h1 className={`${fonts.heading} text-5xl md:text-7xl italic uppercase tracking-tighter drop-shadow-lg`}>
                        {details.hero.title}
                    </h1>
                </div>
            </section>

            {/* Tab Navigation (Responsive) */}
            <div className="border-b border-slate-800 bg-black/50 sticky top-0 z-40 backdrop-blur-xl">
                <div className="hidden md:flex">
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
                <div className="md:hidden overflow-x-auto scrollbar-hide flex gap-2 px-3 py-3">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-full border transition ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-transparent text-slate-400 border-slate-700 hover:text-white'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nội dung theo Tab */}
            <main className="p-8">
                {activeTab === "overview" && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
                        <div className="lg:col-span-8 space-y-8">
                            {/* Khối Hero Overview */}
                            <div className="bg-linear-to-br from-blue-900/40 to-slate-900/50 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden">
                                <div className={`absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[180px] ${fonts.heading} italic leading-none`}>
                                    FIFA
                                </div>
                                <h2 className={`text-4xl md:text-5xl ${fonts.heading} italic uppercase tracking-tighter mb-4 bg-linear-to-r from-blue-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent relative z-10`}>
                                    {details.overview.title}
                                </h2>
                                <p className="text-slate-300 leading-relaxed mb-8 relative z-10">
                                    {details.overview.description}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Số đội</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">{details.overview.stats.teams}</p>
                                    </div>
                                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                        <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Trận đấu</p>
                                        <p className="text-3xl font-bold font-mono text-blue-400">{details.overview.stats.matches}</p>
                                    </div>
                                    {details.overview.stats.cities && (
                                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Thành phố</p>
                                            <p className="text-3xl font-bold font-mono text-blue-400">{details.overview.stats.cities}</p>
                                        </div>
                                    )}
                                    {details.overview.stats.stadiums && (
                                        <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 backdrop-blur-md hover:border-blue-500/50 transition">
                                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Sân vận động</p>
                                            <p className="text-3xl font-bold font-mono text-blue-400">{details.overview.stats.stadiums}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Thông điệp */}
                            {details.message && (
                                <div className="bg-linear-to-br from-indigo-900/30 to-slate-900/50 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className={`absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[180px] ${fonts.heading} italic leading-none text-indigo-300`}>
                                        {details.config?.season?.slice(-2)}
                                    </div>
                                    <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2 relative z-10">
                                        Thông điệp chính thức
                                    </h3>
                                    <h2 className={`text-4xl ${fonts.heading} italic tracking-tighter mb-4 text-white relative z-10`}>
                                        {details.message.title}
                                    </h2>
                                    <p className="text-slate-300 leading-relaxed relative z-10 max-w-2xl">
                                        {details.message.description}
                                    </p>
                                </div>
                            )}

                            {/* Đội tuyển tham gia */}
                            {details.teams && details.teams.length > 0 && (
                                <div className="bg-linear-to-br from-teal-900/30 to-slate-900/50 border border-teal-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className={`absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[140px] ${fonts.heading} italic leading-none text-teal-200`}>
                                        TEAMS
                                    </div>
                                    <div className="flex justify-between items-center mb-8 relative z-10 border-b border-teal-500/20 pb-4">
                                        <h3 className={`text-2xl md:text-3xl ${fonts.heading} italic uppercase tracking-tighter text-teal-400`}>
                                            {details.overview.stats.teams} Đội tuyển tham dự
                                        </h3>
                                        <span className="text-xs uppercase text-teal-200 font-bold bg-teal-900/50 px-3 py-1 rounded-full border border-teal-500/30 hidden sm:block">
                                            Danh sách chính thức
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-3 relative z-10">
                                        {details.teams.map((team, idx) => (
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
                            )}

                            {/* Đương kim vô địch */}
                            {initialBracket?.defendingChampion && (
                                <div className="bg-linear-to-r from-sky-500/10 via-cyan-500/10 to-blue-500/10 border border-sky-500/20 rounded-3xl p-6 relative overflow-hidden hover:border-sky-400/40 transition">
                                    <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[120px] ${fonts.heading} italic leading-none text-sky-200`}>
                                        CHAMP
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                                        <div className="flex items-center gap-5">
                                            <img src={initialBracket.defendingChampion.logo} alt={initialBracket.defendingChampion.name} className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]" />
                                            <div>
                                                <p className="text-sky-400 text-xs uppercase tracking-widest font-black mb-1">Đương kim vô địch</p>
                                                <h3 className={`text-3xl ${fonts.heading} italic uppercase tracking-tighter text-white`}>{initialBracket.defendingChampion.name}</h3>
                                            </div>
                                        </div>
                                        {initialBracket.runnerUp && (
                                            <div className="flex items-center gap-4 sm:border-l sm:border-sky-500/20 sm:pl-6 pt-4 sm:pt-0 w-full sm:w-auto border-t sm:border-t-0 border-sky-500/20">
                                                <div className="text-left sm:text-right flex-1">
                                                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-1">Á quân</p>
                                                    <h4 className={`text-xl ${fonts.heading} italic uppercase tracking-tighter text-slate-200`}>{initialBracket.runnerUp.name}</h4>
                                                </div>
                                                <img src={initialBracket.runnerUp.logo} alt={initialBracket.runnerUp.name} className="w-12 h-12 object-contain opacity-80 drop-shadow-md" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* HOST NATIONS */}
                            {details.hosts && details.hosts.length > 0 && (
                                <div className="bg-linear-to-br from-purple-900/30 to-slate-900/50 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className={`absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[150px] ${fonts.heading} italic leading-none text-purple-200`}>
                                        HOSTS
                                    </div>
                                    <h3 className={`text-2xl md:text-3xl ${fonts.heading} italic uppercase tracking-tighter text-purple-400 mb-6 relative z-10 border-b border-purple-500/20 pb-4`}>
                                        Quốc gia đăng cai
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                                        {details.hosts.map((host: any) => (
                                            <div key={host.code} className="bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 text-center hover:border-purple-500/50 transition">
                                                <img src={host.logo} alt={host.code} className="w-20 h-20 mx-auto mb-4 object-contain" />
                                                <h4 className={`${fonts.heading} italic tracking-tighter text-xl text-white uppercase`}>{host.name}</h4>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* HOST CITIES */}
                            {details.hostCities && details.hostCities.length > 0 && (
                                <div className="bg-linear-to-br from-sky-900/30 to-slate-900/50 border border-sky-500/20 rounded-3xl p-8 relative overflow-hidden">
                                    <div className={`absolute -right-4 -bottom-6 opacity-5 pointer-events-none text-[150px] ${fonts.heading} italic leading-none text-sky-200`}>
                                        CITIES
                                    </div>
                                    <div className="flex items-center justify-between mb-6 relative z-10 border-b border-sky-500/20 pb-4">
                                        <h3 className={`text-2xl md:text-3xl ${fonts.heading} italic uppercase tracking-tighter text-sky-400`}>
                                            Các thành phố đăng cai
                                        </h3>
                                        <span className="text-xs uppercase text-sky-200 font-bold bg-sky-900/50 px-3 py-1 rounded-full border border-sky-500/30">
                                            {details.overview.stats.cities} Thành phố
                                        </span>
                                    </div>
                                    <div
                                        ref={hostCitiesRef}
                                        className={`flex gap-4 overflow-x-auto pb-4 relative z-10 scrollbar-hide select-none ${isDraggingCities ? "cursor-grabbing" : "cursor-grab"}`}
                                        onMouseDown={handleCitiesMouseDown}
                                        onMouseLeave={handleCitiesMouseLeaveOrUp}
                                        onMouseUp={handleCitiesMouseLeaveOrUp}
                                        onMouseMove={handleCitiesMouseMove}
                                    >
                                        {details.hostCities.map((city: any) => {
                                            const hostCountry = details.hosts?.find((h: any) => h.code === city.country);
                                            return (
                                                <div key={city.city} className="min-w-45 shrink-0 bg-slate-950/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-sky-400/50 transition flex flex-col items-start justify-center">
                                                    <div className="w-8 h-8 mb-3 drop-shadow-md">
                                                        {hostCountry?.logo && <img src={hostCountry.logo} alt={city.country} className="w-full h-full object-contain" />}
                                                    </div>
                                                    <h4 className="font-bold text-white">{city.city}</h4>
                                                    <p className="text-xs text-sky-200/60 mt-1 uppercase font-bold">{city.country}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Thể thức thi đấu & Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-linear-to-br from-rose-900/20 to-slate-900/50 border border-rose-500/20 rounded-3xl p-8 relative overflow-hidden hover:border-rose-500/40 transition">
                                    <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[100px] ${fonts.heading} italic leading-none text-rose-200`}>
                                        RULE
                                    </div>
                                    <h3 className={`text-2xl ${fonts.heading} italic uppercase tracking-tighter text-rose-400 mb-4 relative z-10`}>
                                        {details.format.title}
                                    </h3>
                                    <p className="text-slate-300 leading-relaxed text-sm relative z-10">
                                        {details.format.description}
                                    </p>
                                </div>
                                <div className="bg-linear-to-br from-amber-900/20 to-slate-900/50 border border-amber-500/20 rounded-3xl p-8 relative overflow-hidden hover:border-amber-500/40 transition">
                                    <div className={`absolute -right-4 -bottom-4 opacity-5 pointer-events-none text-[100px] ${fonts.heading} italic leading-none text-amber-200`}>
                                        INFO
                                    </div>
                                    <h3 className={`text-2xl ${fonts.heading} italic uppercase tracking-tighter text-amber-400 mb-6 relative z-10`}>
                                        Thông số giải đấu
                                    </h3>
                                    <div className="space-y-4 text-sm font-medium relative z-10">
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Thời gian</span>
                                            <span className="text-white">
                                                {details.tournamentInfo.startDate.split('-').reverse().join('/')} - {details.tournamentInfo.endDate.split('-').reverse().join('/')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Đội tham dự</span>
                                            <span className="text-white">{details.tournamentInfo.teams}</span>
                                        </div>
                                        <div className="flex justify-between border-b border-amber-900/50 pb-3">
                                            <span className="text-amber-200/70">Tổng trận đấu</span>
                                            <span className="text-white">{details.tournamentInfo.matches}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Sidebar News */}
                        <div className="lg:col-span-4">
                            <div className="sticky top-22">
                                <h3 className="font-bold text-lg mb-4 text-slate-200">Tin tức mới nhất</h3>
                                <SidebarNews news={newsData} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'fixtures' && (() => {
                    const processedRoundData = Object.keys(roundData).reduce((acc, date) => {
                        const filteredMatches = roundData[date].filter((match: any) => {
                            if (hideFinished) return match.status !== "Kết thúc" && match.status !== "Hủy";
                            return true;
                        });
                        if (filteredMatches.length > 0) acc[date] = filteredMatches;
                        return acc;
                    }, {} as Record<string, any[]>);

                    return (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            {/* DYNAMIC ROUND SELECTOR */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                                    {sortedRounds.map((round) => (
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
                                <button
                                    onClick={() => setHideFinished(!hideFinished)}
                                    className={`shrink-0 px-4 py-2 rounded-full text-[11px] font-bold tracking-wide transition-all border ${hideFinished
                                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                        : 'bg-slate-900/80 text-slate-400 border-slate-700 hover:bg-slate-800'
                                        }`}
                                >
                                    {hideFinished ? "Hiển thị tất cả trận đấu" : "Ẩn các trận đã kết thúc"}
                                </button>
                            </div>

                            <div className="space-y-10">
                                {Object.keys(processedRoundData).length > 0 ? (
                                    Object.keys(processedRoundData)
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
                                                    {processedRoundData[date].map((match: any, i: number) => (
                                                        <MatchCard key={i} {...match} fonts={fonts} />
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
                                        <p className="text-slate-400 font-medium mb-3">Không có trận đấu nào đang hoặc sắp diễn ra ở vòng này.</p>
                                        {hideFinished && (
                                            <button onClick={() => setHideFinished(false)} className="text-blue-400 text-sm font-bold hover:underline">
                                                Xem lại các trận đã kết thúc
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })()}

                {activeTab === 'standings' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                        {/* CONDITIONAL RENDER: Chỉ hiện nếu giải đấu có nhiều hơn 1 bảng */}
                        {Object.keys(initialStandings).length > 1 && (
                            <div className="flex gap-6 overflow-x-auto scrollbar-hide border-b border-slate-800">
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
                        )}

                        {initialStandings[activeGroup] ? (
                            <GroupTable data={initialStandings[activeGroup]} groupName={activeGroup} />
                        ) : (
                            <p className="text-slate-500 text-center py-10">Đang tải dữ liệu bảng này...</p>
                        )}
                    </div>
                )}

                {activeTab === 'bracket' && (<Bracket data={initialBracket} fonts={fonts} />)}

                {activeTab === 'player-stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {initialStats?.players?.map((statBlock: any, idx: number) => (
                            <StatCard key={idx} statBlock={statBlock} type="player" fonts={fonts} />
                        ))}
                    </div>
                )}

                {activeTab === 'team-stats' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {initialStats?.teams?.map((statBlock: any, idx: number) => (
                            <StatCard key={idx} statBlock={statBlock} type="team" fonts={fonts} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}