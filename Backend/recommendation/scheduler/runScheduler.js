import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { buildSchedule } from "./buildSchedule.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const studentsPath = path.join(__dirname, "../data/students.json");
const tasPath = path.join(__dirname, "../data/tas.json");

const students = JSON.parse(fs.readFileSync(studentsPath, "utf8"));
const tas = JSON.parse(fs.readFileSync(tasPath, "utf8"));

const result = buildSchedule(students, tas);
console.log("full schedule:");
console.log(result, { depth: null });

const flat = result.flatMap(student =>
  student.sessions.map(session => ({
    studentId: student.studentId,
    ...session,
  }))
);
console.log("flat schedule:");
console.log(flat);

fs.writeFileSync(
  path.join(__dirname, "../data/scheduleResult.json"),
  JSON.stringify(flat, null, 2),
  "utf8"
);
console.log("schedule saved to data/scheduleResult.json");
