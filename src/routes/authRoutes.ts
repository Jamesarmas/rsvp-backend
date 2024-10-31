import express from "express";
import passport from "passport";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { Request, Response, Router } from 'express';

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        res.status(400).json({ message: 'All fields are required' });
        return;
      }
  
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err: Error, user: User, info: any) => {
    if (err) {
      return res.status(500).json({ message: "Login Failed: Unknown Error" });
    }
    if (!user) {
      return res.status(400).json({ message: info.message || "Login Failed" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login Failed: Unknown Error" });
      }
      return res.status(200).json({ message: "Logged in", user: req.user });
    });
  })(req, res, next);
});


router.post('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { 
      return next(err); 
    }

    req.session.destroy((err) => {
      if (err) {
        return next(err); 
      }

      res.clearCookie("connect.sid", {
        path: '/',
        httpOnly: true,
        sameSite: 'none',
        secure: process.env.NODE_ENV === 'production',
      });

      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

export default router;