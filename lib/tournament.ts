export function getTournamentStatus(
    startDate: string,
    endDate?: string
) {
    const now = new Date().getTime();
    const start = new Date(startDate).getTime();

    if (!endDate) {
        return now < start ? "upcoming" : "started";
    }

    const end = new Date(endDate).getTime();

    if (now < start) return "upcoming";
    if (now > end) return "finished";

    return "live";
}

export function getTournamentLabel(
    startDate: string,
    endDate?: string
) {
    const status = getTournamentStatus(startDate, endDate);

    switch (status) {
        case "upcoming":
            return "Sắp diễn ra";
        case "live":
            return "Đang diễn ra";
        case "finished":
            return "Đã kết thúc";
        default:
            return "Đã bắt đầu";
    }
}