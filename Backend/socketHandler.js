import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function setUpSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.on("connection", (socket) => {
    socket.on("joinCourse", (courseId) => {
      socket.join(`course:${courseId}`);
    });

    socket.on("createNote", async ({courseId, x, y}) => {
      try {
        const newNote = await prisma.stickyNote.create({
          data: {
            course_id: parseInt(courseId),
            x : parseInt(x),
            y : parseInt(y),
          },
        });
        io.to(`course:${courseId}`).emit("newNote", newNote);
      } catch (error) {
        console.error("createNote error", error);
      }
    });

    socket.on("disconnect", () => {});
  });
  return io;
}

export { setUpSocket };
