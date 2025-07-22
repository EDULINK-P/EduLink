import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import cors from "cors";
import session from "express-session";
import * as connectRedis from "connect-redis";
import { PrismaClient } from "@prisma/client";
import redis from "redis";
import dotenv from "dotenv";
import authrouter from "./Routes/auth.js";
import courseRoutes from "./Routes/courses.js";
import profileRouter from "./Routes/profile.js";
import zoomRoutes from "./Routes/zoom.js";
import availabilityRoutes from "./Routes/TAavailability.js";
import studentRequests from "./Routes/studentRequest.js";
import schedulerRouter from "./Routes/scheduler.js";
import noteRouter from "./Routes/notes.js";

dotenv.config();

const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();

const RedisStore = connectRedis.RedisStore;
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
async function startRedis() {
  await redisClient.connect();
}
startRedis();

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

const store = new RedisStore({
  client: redisClient,
  prefix: "edulink-session",
});

const sessionMiddleware = session({
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 6000 * 60 * 60 * 24,
    sameSite: "lax"
  },
});
app.use(sessionMiddleware);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
});
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

app.get("/", (req, res) => {
  res.send("EduLink is running");
});

app.use("/auth", authrouter);
app.use("/courses", courseRoutes);
app.use("/profile", profileRouter);
app.use("/api", zoomRoutes);
app.use("/availability", availabilityRoutes);
app.use("/student-requests", studentRequests);
app.use("/schedule", schedulerRouter);
app.use("/notes", noteRouter);

const locks = {};
// socket io
io.on("connection", (socket) => {
  const userId = socket.request.session.userId;
  socket.on("joinCourse", (courseId) => {
    socket.join(`course:${courseId}`);
  });

  socket.on("createNote", async ({ courseId, x, y }) => {
    try {
      const newNote = await prisma.stickyNotes.create({
        data: {
          course_id: parseInt(courseId),
          x: parseInt(x),
          y: parseInt(y),
        },
      });
      io.to(`course:${courseId}`).emit("newNote", newNote);
    } catch (error) {
      console.error("createNote error", error);
    }
  });

  // lock a sticky note and emit it to the course
  socket.on("lock_note", async ({ noteId }) => {
    console.log("lock_note", noteId);
    const userId = socket.request.session.userId;
    const note = await prisma.stickyNotes.findUnique({
      where: { id: noteId },
    });
    const userCourse = await prisma.userCourse.findUnique({
      where: {
        user_id_course_id: {
          user_id: userId,
          course_id: note.course_id,
        },
      },
      select: { role: true },
    });
    const role = userCourse.role;
    const currentLock = locks[noteId];
    if (
      !currentLock ||
      role === "TA" ||
      (currentLock.role === "Student" && currentLock.lockedBy === userId)
    ) {
      locks[noteId] = { lockedBy: userId, role };
      io.emit("note_locked", { noteId, lockedBy: userId });
    } else {
      io.emit("lock_denied", { noteId });
    }
  });

  // unlock a sticky note and emit it to the course
  socket.on("unlock_note", ({ noteId }) => {
    if (locks[noteId]?.lockedBy === userId) {
      delete locks[noteId];
      io.emit("note_unlocked", { noteId });
    }
  });

  // update a sticky note and emit it to the course
  socket.on("update_note", async ({ noteId, content }) => {
    const userId = socket.request.session.userId;
    io.emit("note_content_preview", { noteId, content, userId });
  });


  socket.on("disconnect", () => {});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {});

export { io };
