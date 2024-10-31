import axios from 'axios';

const API_KEY = process.env.MAILCHIMP_API_KEY || '';
const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || ''; // e.g., 'us1'
const LIST_ID = process.env.MAILCHIMP_LIST_ID || '';

export const mailchimpAPI = axios.create({
  baseURL: `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/`,
  headers: {
    Authorization: `apikey ${API_KEY}`,
  },
});

interface CustomEvent {
  id: number;
  title: string;
  description: string | null;
  date: string | Date;
  location: string;
  recipientEmail: string; // Add recipientEmail to identify users
}

export const mailchimpService = {
  async sendEventInvitations(event: CustomEvent): Promise<boolean> {
    try {
      // Check if the recipient is already in the list
      const memberResponse = await mailchimpAPI.get(`lists/${LIST_ID}/members?email_address=${event.recipientEmail}`);
      const member = memberResponse.data.members[0];

      // If the member exists, check if they have the event tag
      const eventTag = `event_${event.id}`; // Unique tag for the event
      if (member && member.tags.some((tag: { name: string }) => tag.name === eventTag)) {
        console.log(`User ${event.recipientEmail} has already been invited to the event.`);
        return false; // User has already been invited, exit
      }

      // Create a campaign
      const campaignResponse = await mailchimpAPI.post('campaigns', {
        type: 'regular',
        recipients: {
          list_id: LIST_ID,
        },
        settings: {
          subject_line: `You're invited: ${event.title}`,
          from_name: 'Event Organizer',
          reply_to: 'dreamsend08@gmail.com',
        },
      });

      const campaignId = campaignResponse.data.id;

      // Set the content for the campaign
      const content = {
        html: `
          <h1>You're invited to ${event.title}</h1>
          <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
          <p>Location: ${event.location}</p>
          <p>${event.description || ''}</p>
          <a href="http://localhost:5173/event/${event.id}/rsvp">RSVP Now</a>
        `,
      };

      await mailchimpAPI.put(`campaigns/${campaignId}/content`, content);

      // Send the campaign
      await mailchimpAPI.post(`campaigns/${campaignId}/actions/send`);

      // Tag the member to prevent future invites
      if (member) {
        await mailchimpAPI.post(`lists/${LIST_ID}/members/${member.id}/tags`, {
          tags: [{ name: eventTag, status: 'active' }],
        });
      }

      return true;
    } catch (error) {
      console.error('Error sending invitations:', error);
      throw error;
    }
  },
};
