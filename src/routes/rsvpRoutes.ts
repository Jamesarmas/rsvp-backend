import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/summary', async (req: Request, res: Response) => {
  try {
    // Fetch all RSVPs grouped by response type
    const rsvpSummary = await prisma.rSVP.groupBy({
      by: ['response'],
      _count: { response: true },
    });

    // Format the result as needed
    const summary = rsvpSummary.map((item) => ({
      response: item.response,
      count: item._count.response,
    }));

    res.json(summary);
  } catch (error) {
    console.error('Error fetching RSVP summary:', error);
    res.status(500).json({ error: 'Error fetching RSVP summary' });
  }
});

export default router;
