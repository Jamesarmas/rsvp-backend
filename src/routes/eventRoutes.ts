import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { mailchimpService, mailchimpAPI } from '../services/mailChimpService';
import { getNearestPopularLocation } from '../services/geocodingService';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
    try {
      const events = await prisma.event.findMany({
        include: {
          rsvps: true,
        },
      });
  
      const eventSummaries = events.map(event => ({
        id: event.id,
        title: event.title,
        date: event.date,
        rsvpCount: event.rsvps.length,
        pendingCount: event.rsvps.filter(rsvp => rsvp.response === 'MAYBE').length,
      }));
  
      res.json(eventSummaries);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching events' });
    }
  });

  router.get('/:id', async (req: any, res: any) => {
    const { id } = req.params;
  
    try {
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      res.json(event);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching event' });
    }
  });

  
  // 2. Create a new event
  router.post('/', async (req: Request, res: Response) => {
    const { title, description, date, latitude, longitude, organizerId } = req.body;
  
    try {
      // Fetch address from coordinates if latitude and longitude are provided
      let location = req.body.location;
      if (latitude && longitude) {
        const fetchedLocation = await getNearestPopularLocation(latitude, longitude);
        if (fetchedLocation) {
          location = fetchedLocation; // Update location if address is fetched successfully
        }
      }
  
      // Create the new event with fetched location if available
      const newEvent = await prisma.event.create({
        data: {
          title,
          description,
          date: new Date(date),
          location,
          latitude,
          longitude,
          organizerId,
        },
      });
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Error creating event' });
    }
  });
  
  // 3. Edit an event
  router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, description, date, location, latitude, longitude } = req.body;
  
    try {
      const updatedEvent = await prisma.event.update({
        where: { id: parseInt(id) },
        data: {
          title,
          description,
          date: new Date(date),
          location,
          latitude,
          longitude,
        },
      });
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: 'Error updating event' });
    }
  });
  
  // 4. Delete an event
  router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      await prisma.event.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting event' });
    }
  });

// 4. Delete an event
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      await prisma.event.delete({
        where: { id: parseInt(id) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Error deleting event' });
    }
  });
  
  // 5. Get RSVP tracking summary
  router.get('/:id/rsvps', async (req: Request, res: Response) => {
    const { id } = req.params;
  
    try {
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id, 10) },
        include: {
          rsvps: true,
        },
      });
  
      if (!event) {
         res.status(404).json({ error: 'Event not found' });
         return;
      }
  
      const totalRSVPs = event.rsvps.length;
      const pendingRSVPs = event.rsvps.filter(rsvp => rsvp.response === 'MAYBE').length;
  
      res.json({ totalRSVPs, pendingRSVPs });
      return;
    } catch (error) {
      res.status(500).json({ error: 'Error fetching RSVP summary' });
      return;
    }
  });


  router.post('/:id/invite', async (req: any, res: any) => {
    const { id } = req.params;
    const { email } = req.body; // Capture email from request body
  
    try {
      // Validate the email
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
  
      // Find the event by ID
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id),  },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Format the event for Mailchimp
      const customEvent = {
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        recipientEmail: email
      };
  
      // Add the email to Mailchimp
      const subscriber = {
        email_address: email,
        status: 'subscribed' as const, // Use a string literal type for 'status'
      };
  
      // Use Mailchimp API to add the subscriber
      await mailchimpAPI.post(`lists/${process.env.MAILCHIMP_LIST_ID || ''}/members`, subscriber);
  
      // Send the invitation using mailchimpService
      await mailchimpService.sendEventInvitations(customEvent);
  
      res.status(200).json({ message: 'Invitation sent successfully!' });
    } catch (error) {
      console.error('Error sending invitation:', error);
      res.status(500).json({ error: 'Error sending invitation' });
    }
  });
  
  router.post('/:id/rsvp', async (req: any, res: any) => {
    const { id } = req.params; // Get event ID from URL params
    const { userId, response } = req.body; // Get user ID and response from request body
    
    try {
      // Validate userId and response
      if (!userId || !response) {
        return res.status(400).json({ error: 'User ID and response are required' });
      }
  
      // Check if the event exists
      const event = await prisma.event.findUnique({
        where: { id: parseInt(id) },
      });
  
      if (!event) {
        return res.status(404).json({ error: 'Event not found' });
      }
  
      // Create RSVP entry in the database
      await prisma.rSVP.create({
        data: {
          userId: userId,
          eventId: parseInt(id),
          response: response, 
        },
      });
  
      res.status(200).json({ message: 'RSVP submitted successfully' });
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      res.status(500).json({ error: 'Error submitting RSVP' });
    }
  });
  

  
  export default router;