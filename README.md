
Welcome to the Event Management Application! This app allows users to create, manage, and RSVP to events. It provides an intuitive interface for event organizers and attendees alike, enabling seamless event management.

## Frontend
https://github.com/Jamesarmas/rsvp-frontend

## Installation
To run the application locally, follow these steps:

## Clone the repository:
```
git clone https://github.com/Jamesarmas/rsvp-backend
cd rsvo-backend
npm i
npm run dev
```

## Create the ENV file
DATABASE_URL=
MAILCHIMP_API_KEY=
MAILCHIMP_LIST_ID=
MAILCHIMP_SERVER_PREFIX=
GOOGLE_MAPS_API_KEY=
SECRET=

## Features
Create new events with details such as title, date, and location.
Edit existing events.
Delete events from the dashboard.
View RSVP counts and pending responses for each event.
Send email invitations to attendees.
Technologies Used
Frontend: React, TypeScript, Tailwind CSS
Backend: Node.js, Express, Prisma
Database: PostgreSQL (or your chosen database)
Mail Service: Mailchimp (for sending invitations)
## API Endpoints
GET https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${LIST_ID}/members?email_address=${event.recipientEmail} - checking if the user is already part of the email list

POST https://${SERVER_PREFIX}.api.mailchimp.com/3.0/campaigs - creating a new campaign

PUT https://${SERVER_PREFIX}.api.mailchimp.com/3.0/campaigns/${campaignId}/content - Updating the content of the campaign

POST campaigns/${campaignId}/actions/send - for sending the emails

GET https://maps.googleapis.com/maps/api/geocode/json - for geocoding of the latitude and longitude


## Frontend Overview
Dashboard Component
The Dashboard component displays a list of events and allows the user to manage them. Key functionalities include:

Fetching events and RSVP summaries.
Displaying event details including RSVP counts.
Navigating to create, edit, or delete events.
Key State Variables
events: Array of event objects fetched from the backend.
totalRSVPs: Total count of RSVPs across all events.
pendingRSVPs: Count of pending RSVPs.
