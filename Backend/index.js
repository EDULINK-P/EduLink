import express from "express";
import http from "http";
import { setUpSocket } from "./socketHandler.js";
import cors from "cors";
import session from "express-session";
import * as connectRedis from "connect-redis";
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

const app = express();
const PORT = process.env.PORT || 3000;
const RedisStore = connectRedis.RedisStore;
const redisClient = redis.createClient({ url: process.env.REDIS_URL });
redisClient.connect().catch(console.error);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: "edulink-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

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

const server = http.createServer(app);
setUpSocket(server);

server.listen(PORT, () => {});
