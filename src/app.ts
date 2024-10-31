import express from "express";
import passport from "./config/passport";
import cors from "cors";
import expressSession from "express-session";
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
import prisma from "./config/prisma";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes"
import rsvpRoutes from "./routes/rsvpRoutes";
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;



app.use(cors({
    origin: 'http://localhost:5173',  // Replace with the allowed origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,  // Allow credentials if needed (for cookies, etc.)
  allowedHeaders: ['Content-Type', 'Authorization'],
  }));
app.use(expressSession({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true, 
      sameSite: 'none',
      secure: process.env.NODE_ENV === "production",
      domain: process.env.DOMAIN
    },
    secret: process.env.SECRET || "",
    store: new PrismaSessionStore(
      prisma,
      {
        
      }
    ),
    rolling: true
  }))

  app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/rsvp', rsvpRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });