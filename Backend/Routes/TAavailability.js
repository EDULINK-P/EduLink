import express from 'express';
import {PrismaClient} from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    const userId = req.body.userId;
    const {courseId, intervals, rate} = req.body;

    if (rate > 30) {
        res.status(400).json({message: 'Rate cannot be greater than 30 credits'});
        return;
    }

    try{
        const availability = await prisma.tAAvailability.create({
            data: {
                user_id: userId,
                course_id: courseId,
                intervals,
                rate,
            }
        });
        res.status(200).json(availability);
    } catch (error) {
        console.error("Error saving availability",error);
        res.status(500).json({message: error.message});
    }
});

export default router;
