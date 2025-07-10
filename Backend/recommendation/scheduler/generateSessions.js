import fs from 'fs';
import path from 'path';
import { parseInterval, getHourBlocks } from '../utils/time.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const student = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/students.json'), 'utf8'));
const ta = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tas.json'), 'utf8'));

function generateSessions(studentAvailability, taList) {
    const sessions = []

    for (const studentSlot of studentAvailability) {
        console.log("student Interval", studentSlot);
        const studentDay = studentSlot.day;
        const studentInterval = parseInterval(studentSlot.interval);
        const studentBlocks = getHourBlocks(studentInterval);

        for (const ta of taList) {
            const taId = ta.id;
            const taRate = ta.rate;
            const taRating = ta.rating;

            const matchingTADaySlots = ta.availability.filter(a => a.day === studentDay);

            for (const taSlot of matchingTADaySlots) {
                console.log("ta Interval", taSlot);
                const taInterval = parseInterval(taSlot.interval);
                const taBlocks = getHourBlocks(taInterval);

                for (const studentBlock of studentBlocks) {
                    for (const taBlock of taBlocks) {
                        if (
                            studentBlock.start === taBlock.start &&
                            studentBlock.end === taBlock.end
                        ){
                            sessions.push({
                                day: studentDay,
                                start: studentBlock.start,
                                end: studentBlock.end,
                                taId: taId,
                                rate: taRate,
                                rating: taRating,
                            });
                        }
                    }
                }
            }
        }
    }
    console.log("Total sessions", sessions.length);
    return sessions;
}

export {generateSessions};
