import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function getRandomRating() {
    return parseFloat((Math.random() * 1 + 4 ).toFixed(1));
}

async function assignRatings() {
    const taUserCourses = await prisma.userCourse.findMany({
        where: { role : 'TA' },
        include: { user: true },
    });

    for (const entry of taUserCourses) {
        const rating = getRandomRating();

        await prisma.user.update({
            where: { id: entry.user.id },
            data: { rating: rating },
        });
    }
    await prisma.$disconnect();
}

assignRatings().catch((e) => {
    console.error(e);
    prisma.$disconnect();
});
