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

const matchedSessions = generateSessions(students[0].availability, tas);
const allCombinations = buildSchedule(matchedSessions);
const result = allCombinations;

fs.writeFileSync(
    path.join(dataDir, 'finalSchedules.json'),
    JSON.stringify(result, null, 2));
// console.log(JSON.stringify(result, null, 2));
console.log('Done!');
