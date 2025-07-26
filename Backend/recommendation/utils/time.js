function parseTime(str) {
    const [hour, minute] = str.split(':').map(Number);
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
}

function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function parseInterval(intervalStr) {
    const [start, end] = intervalStr.split('-').map(s => s.trim());
    if (!start || !end) throw new Error('Invalid time string' + intervalStr);
    return { start, end };
}

function getHourBlocks(interval) {
    const blocks = [];
    let startDate = parseTime(interval.start);
    const endDate = parseTime(interval.end);

    while (startDate < endDate) {
        const nextHour = new Date(startDate.getTime() + 60 * 60 * 1000);
        if (nextHour > endDate) break;

        blocks.push({
            start: formatTime(startDate),
            end: formatTime(nextHour),
        });
        startDate = nextHour;
    }
    return blocks;
}

export { parseTime, parseInterval, formatTime, getHourBlocks };
