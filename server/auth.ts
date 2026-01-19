import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { sendOTP } from "./email";
import { emailVerifications } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "r8q_+&1lm3)cd*z0uhj!uv$16k(H%^&",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          if (!user.verified) {
            return done(null, false);
          }
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  passport.serializeUser((user, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id as number);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/send-otp", async (req, res, next) => {
    const { email, password, name } = req.body;
    try {
      const existingUser = await storage.getUserByUsername(email);
      if (existingUser) {
        return res.status(400).send("Email already exists");
      }

      // generate OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      // delete any existing verification for this email
      await db.delete(emailVerifications).where(eq(emailVerifications.email, email));

      // insert into emailVerifications
      await db.insert(emailVerifications).values({ email, otp, expiresAt });

      // send email
      await sendOTP(email, otp);

      res.json({ message: 'OTP sent to email' });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/verify-otp", async (req, res, next) => {
    const { email, otp, password, name } = req.body;
    try {
      const [verification] = await db.select().from(emailVerifications).where(eq(emailVerifications.email, email));
      if (!verification || verification.otp !== otp || new Date(verification.expiresAt) < new Date()) {
        return res.status(400).send("Invalid or expired OTP");
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username: email,
        name,
        password: hashedPassword,
        verified: true,
      });

      await db.delete(emailVerifications).where(eq(emailVerifications.email, email));

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    res.json(req.user);
  });
}
