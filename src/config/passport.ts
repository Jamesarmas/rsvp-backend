import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "./prisma"; 
import bcrypt from "bcrypt";

passport.use(
    new LocalStrategy(
      {
        usernameField: "email",  
        passwordField: "password"
      },
      async (email: string, password: string, done: any) => {
        try {
          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            return done(null, false, { message: "No user found with this email." });
          }
  
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
            return done(null, false, { message: "Incorrect password." });
          }
  
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

passport.serializeUser((user, done) => {
  done(null, (user as any).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;