import fs from 'fs';
import path from 'path';
import {generateSessions} from './generateSessions.js';
import {buildSchedule} from './buildSchedule.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const students = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/students.json'), 'utf8'));
const tas = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/tas.json'), 'utf8'));

function runScheduler(studentAvailability, taList, sessionPerWeek, budget, maxSessionsPerDay = 1) {
    const sessions = generateSessions(studentAvailability, taList);
    console.log("Generated sessions")

    if (sessions.length === 0) {
        console.log("No matching time blocks between students and TAs");
        return { sessions: [], totalCost: 0 , totalRating: 0};
    }

    const best = buildSchedule(sessions, sessionPerWeek, budget, maxSessionsPerDay);

    return best;
}

const student = students[0];
const result = runScheduler(
    student.availability,
    tas.filter(ta => ta.courseId === student.courseId),
    student.sessionPerWeek,
    student.budget,
    student.maxSessionsPerDay || 1
);

fs.writeFileSync(
    path.join(dataDir, 'finalSchedules.json'),
    JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
console.log('Done!');
