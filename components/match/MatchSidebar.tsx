import { Activity, MapPin, Thermometer, Wind, UserCheck, History, Info, PieChart, TrendingUp } from 'lucide-react';

const STAT_MAP: Record<string, string> = {
    "Ball possession": "Kiểm soát bóng",
    "Expected goals (xG)": "Bàn thắng kỳ vọng (xG)",
    "Total shots": "Tổng số cú sút",
    "Shots on target": "Sút trúng đích",
    "Shots off target": "Sút chệch đích",
    "Blocked shots": "Sút bị chặn",
    "Touches in opposition box": "Chạm bóng vòng cấm",
    "Big chances": "Cơ hội rõ rệt",
    "Big chances missed": "Bỏ lỡ cơ hội lớn",
    "Accurate passes": "Chuyền chính xác",
    "Yellow cards": "Thẻ vàng",
    "Red cards": "Thẻ đỏ",
    "Corners": "Phạt góc",
    "Fouls committed": "Phạm lỗi",
    "Offsides": "Việt vị",
    "Hit woodwork": "Sút trúng khung gỗ",
    "Shots inside box": "Sút trong vòng cấm",
    "Shots outside box": "Sút ngoài vòng cấm",
    "Keeper saves": "Cứu thua",
    "Clearances": "Phá bóng",
    "Interceptions": "Cắt bóng",
    "Tackles": "Tắc bóng",
    "Duels won": "Tranh chấp thành công",
    "Ground duels won": "Tranh chấp tay đôi",
    "Aerial duels won": "Tranh chấp trên không",
    "Successful dribbles": "Qua người thành công",
    "Accurate long balls": "Chuyền dài chính xác",
    "Accurate crosses": "Tạt bóng chính xác",
    "Throws": "Ném biên"
};

const WEATHER_MAP: Record<string, string> = {
    "Clear": "Trời quang",
    "Sunny": "Trời nắng",
    "Mostly Sunny": "Nắng nhẹ",
    "Partly Cloudy": "Trời có mây",
    "Mostly Cloudy": "Nhiều mây",
    "Cloudy": "Mây mù",
    "Overcast": "Âm u",
    "Rain": "Có mưa",
    "Light Rain": "Mưa nhỏ",
    "Showers": "Mưa rào",
    "Thunderstorm": "Có sấm sét",
    "Snow": "Có tuyết",
    "Fog": "Sương mù"
};

export default function MatchSidebar({ matchData, homeTeam, awayTeam }: { matchData: any, homeTeam: any, awayTeam: any }) {
    const infoBox = matchData.content?.matchFacts?.infoBox;
    const weather = matchData.content?.weather;
    const statsTop = matchData.content?.stats?.Periods?.All?.stats?.[0]?.stats || [];
    const h2h = matchData.content?.h2h;

    // Trích xuất Dữ liệu Vote động từ FotMob API
    const voteData = matchData.content?.matchFacts?.poll?.voteData?.Votes?.find((v: any) => v.Name === "1x2")?.Votes;

    const teamForm = matchData.content?.matchFacts?.teamForm || [];

    const renderFormBadge = (resultStr: string) => {
        const resultMap: any = { W: "Thắng", D: "Hòa", L: "Thua" };
        const colors: any = { W: 'bg-emerald-500 text-emerald-950', D: 'bg-slate-500 text-white', L: 'bg-rose-500 text-white' };
        return (
            <span className={`w-6 h-6 shrink-0 flex items-center justify-center rounded text-xs font-bold ${colors[resultStr]}`} title={resultMap[resultStr]}>
                {resultStr}
            </span>
        );
    };

    // Hàm render danh sách phong độ cực kỳ chi tiết
    const renderDetailedForm = (formArray: any[]) => {
        if (!formArray || formArray.length === 0) return <p className="text-xs text-slate-500">Chưa có dữ liệu</p>;

        return (
            <div className="flex flex-col gap-2 mt-3">
                {formArray.map((m: any, i: number) => {
                    const isHome = m.home.isOurTeam;
                    const opponent = isHome ? m.away : m.home;
                    const dateObj = new Date(m.date?.utcTime || m.tooltipText?.utcTime || Date.now());
                    const dateStr = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

                    return (
                        <div key={i} className="flex items-center justify-between bg-slate-950/80 border border-slate-800/50 p-2.5 rounded-xl hover:border-slate-700 transition">
                            <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                {renderFormBadge(m.resultString)}
                                <span className="text-[10px] text-slate-500 font-medium w-10 shrink-0">{dateStr}</span>
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <img src={m.imageUrl} alt={opponent.name} className="w-4 h-4 object-contain shrink-0" />
                                    <span className="text-xs text-slate-300 truncate font-medium">{opponent.name}</span>
                                </div>
                            </div>
                            <div className="text-xs font-black text-white bg-slate-800 px-2 py-1 rounded shrink-0 ml-2 shadow-inner">
                                {m.score}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* MATCH INFO */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-black italic tracking-tighter uppercase mb-4 text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                    <Info className="w-5 h-5 text-sky-500" /> Thông tin trận đấu
                </h3>
                <div className="space-y-4 text-sm">
                    {infoBox?.Stadium && (
                        <div>
                            <div className="flex items-center gap-2 text-slate-300 font-bold mb-1"><MapPin className="w-4 h-4 text-emerald-400" /> {infoBox.Stadium.name}</div>
                            <p className="text-xs text-slate-500 pl-6">{infoBox.Stadium.city}, {infoBox.Stadium.country}</p>
                            <div className="pl-6 mt-2 text-xs text-slate-400 space-y-1">
                                <p>Sức chứa: <span className="text-white font-mono">{infoBox.Stadium.capacity?.toLocaleString() || '?'}</span></p>
                                <p>Mặt sân: <span className="text-white capitalize">{infoBox.Stadium.surface || '?'}</span></p>
                            </div>
                        </div>
                    )}
                    {infoBox?.Attendance && infoBox?.Stadium?.capacity && (
                        <div className="border-t border-slate-800 pt-4">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-400 flex items-center gap-1"><UserCheck className="w-3 h-3" /> Khán giả</span>
                                <span className="text-white font-bold">{infoBox.Attendance.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(infoBox.Attendance / infoBox.Stadium.capacity) * 100}%` }} />
                            </div>
                            <p className="text-right text-[10px] text-slate-500 mt-1 font-bold">
                                Lấp đầy {(infoBox.Attendance / infoBox.Stadium.capacity * 100).toFixed(0)}%
                            </p>
                        </div>
                    )}
                    {weather && (
                        <div className="border-t border-slate-800 pt-4 flex gap-4">
                            <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center gap-1">
                                <Thermometer className="w-5 h-5 text-amber-500" />
                                <span className="text-lg font-bold">{weather.temperature}°C</span>
                            </div>
                            <div className="flex-1 bg-slate-950 rounded-xl p-3 border border-slate-800 flex flex-col items-center justify-center gap-1 text-center">
                                <Wind className="w-5 h-5 text-sky-400" />
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{WEATHER_MAP[weather.defaultTitle] || weather.description}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TOP STATS */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                <h3 className="text-lg font-black italic tracking-tighter uppercase mb-6 flex items-center gap-3 text-slate-200 border-b border-slate-800 pb-3">
                    <Activity className="w-5 h-5 text-blue-500" /> Thống kê
                </h3>
                <div className="space-y-5">
                    {statsTop.map((stat: any, idx: number) => {
                        if (!stat.stats || stat.stats[0] === undefined) return null;
                        const homeStat = Number(stat.stats[0] ?? 0);
                        const awayStat = Number(stat.stats[1] ?? 0);
                        const total = homeStat + awayStat;
                        const homePercent = total > 0 ? (homeStat / total) * 100 : 50;
                        const awayPercent = total > 0 ? (awayStat / total) * 100 : 50;

                        return (
                            <div key={idx} className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center text-xs font-bold">
                                    <span className={stat.highlighted === 'home' ? 'text-blue-400' : 'text-slate-400'}>
                                        {stat.stats[0] ?? 0}
                                    </span>
                                    <span className="text-slate-500 text-[10px] uppercase tracking-widest text-center px-1">
                                        {STAT_MAP[stat.title] || stat.title}
                                    </span>
                                    <span className={stat.highlighted === 'away' ? 'text-amber-400' : 'text-slate-400'}>
                                        {stat.stats[1] ?? 0}
                                    </span>
                                </div>
                                <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800 gap-1">
                                    <div className="bg-blue-500 h-full rounded-r-full" style={{ width: `${homePercent}%` }} />
                                    <div className="bg-amber-500 h-full rounded-l-full" style={{ width: `${awayPercent}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* H2H */}
            {h2h && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase mb-4 text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                        <History className="w-5 h-5 text-rose-500" /> Đối đầu
                    </h3>
                    <div className="flex items-center text-center text-xs font-bold mb-6 bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                        <div className="flex-1 py-2 bg-blue-900/20 text-blue-400 border-r border-slate-800"><span className="block text-lg">{h2h.summary[0]}</span> Thắng</div>
                        <div className="flex-1 py-2 bg-slate-800/50 text-slate-300"><span className="block text-lg">{h2h.summary[1]}</span> Hòa</div>
                        <div className="flex-1 py-2 bg-amber-900/20 text-amber-400 border-l border-slate-800"><span className="block text-lg">{h2h.summary[2]}</span> Thắng</div>
                    </div>
                    {h2h.matches.length > 0 && (
                        <div className="space-y-3">
                            {h2h.matches.map((m: any, i: number) => (
                                <div key={i} className="text-xs bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-600 transition">
                                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex justify-between">
                                        <span>{new Date(m.time.utcTime).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        <span className="text-slate-400 truncate ml-2 text-right">{m.league.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-bold text-slate-200">
                                        <span className={`truncate w-2/5 ${m.home.name === homeTeam.name ? 'text-blue-400' : ''}`}>{m.home.name}</span>
                                        <span className="w-1/5 text-center bg-slate-800 px-2 py-0.5 rounded">{m.status.scoreStr}</span>
                                        <span className={`truncate w-2/5 text-right ${m.away.name === awayTeam.name ? 'text-amber-400' : ''}`}>{m.away.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* POLL (DỰ ĐOÁN KẾT QUẢ ĐỘNG TỪ API) */}
            {voteData && voteData.length === 3 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 text-center">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
                        <PieChart className="w-4 h-4 text-amber-500" /> Dự đoán kết quả
                    </h3>
                    {(() => {
                        const [homeVotes, drawVotes, awayVotes] = voteData;
                        const totalVotes = homeVotes + drawVotes + awayVotes;

                        if (totalVotes === 0) return <p className="text-slate-500 text-xs">Chưa có dữ liệu bình chọn</p>;

                        const homePct = Math.round((homeVotes / totalVotes) * 100);
                        const drawPct = Math.round((drawVotes / totalVotes) * 100);
                        const awayPct = 100 - homePct - drawPct; // Đảm bảo tổng tròn 100%

                        return (
                            <>
                                <div className="flex h-8 rounded-lg overflow-hidden font-bold text-xs mb-3 shadow-inner">
                                    {homePct > 0 && <div className="bg-blue-600 flex items-center justify-center text-white transition-all duration-500" style={{ width: `${homePct}%` }}>{homePct}%</div>}
                                    {drawPct > 0 && <div className="bg-slate-500 flex items-center justify-center text-white transition-all duration-500" style={{ width: `${drawPct}%` }}>{drawPct}%</div>}
                                    {awayPct > 0 && <div className="bg-amber-600 flex items-center justify-center text-black transition-all duration-500" style={{ width: `${awayPct}%` }}>{awayPct}%</div>}
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase px-1">
                                    <span className="text-blue-400 truncate w-1/3 text-left">{homeTeam.name}</span>
                                    <span className="w-1/3">Hòa</span>
                                    <span className="text-amber-400 truncate w-1/3 text-right">{awayTeam.name}</span>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-4">
                                    Tổng lượt bình chọn: <span className="font-bold text-slate-400">{totalVotes.toLocaleString('vi-VN')}</span>
                                </p>
                            </>
                        );
                    })()}
                </div>
            )}

            {/* TEAM FORM TỐI ƯU HIỂN THỊ CHI TIẾT */}
            {teamForm.length > 0 && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
                    <h3 className="text-lg font-black italic tracking-tighter uppercase mb-4 text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-500" /> Phong độ gần đây
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <img src={homeTeam.imageUrl} alt="" className="w-5 h-5 object-contain" />
                                <span className="font-bold text-sm text-slate-300 truncate">{homeTeam.name}</span>
                            </div>
                            {renderDetailedForm(teamForm[0])}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <img src={awayTeam.imageUrl} alt="" className="w-5 h-5 object-contain" />
                                <span className="font-bold text-sm text-slate-300 truncate">{awayTeam.name}</span>
                            </div>
                            {renderDetailedForm(teamForm[1])}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}