# TaskFlow

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green)](https://nodejs.org/) 
[![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue)](https://www.typescriptlang.org/) 
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Ready-brightgreen)](https://github.com/QADEER-AHMED-cs/TaskFlow)

**TaskFlow** is a modern task management web application that allows users to **register, login with email OTP, and manage tasks** in a simple, intuitive UI.  

![TaskFlow Preview](https://user-images.githubusercontent.com/your-github-username/your-repo/preview-image.png)

---

## Table of Contents
1. [Features](#features)  
2. [Tech Stack](#tech-stack)  
3. [Project Structure](#project-structure)  
4. [Installation & Setup](#installation--setup)  
5. [Environment Variables](#environment-variables)  
6. [Database Setup](#database-setup)  
7. [Running Locally](#running-locally)  
8. [Testing Email OTP](#testing-email-otp)  
9. [Deployment](#deployment)  
10. [Troubleshooting](#troubleshooting)  
11. [License](#license)  

---

## Features
- ✅ User registration & login with **email OTP verification**  
- ✅ Create, read, update, delete tasks  
- ✅ Session management with **MemoryStore**  
- ✅ SQLite database with **Drizzle ORM**  
- ✅ Fully typed with TypeScript  
- ✅ Ready for production deployment with persistent storage  

---

## Tech Stack
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Express](https://img.shields.io/badge/Express-4-lightgrey)
![SQLite](https://img.shields.io/badge/SQLite-3-blueviolet)
![Vite](https://img.shields.io/badge/Vite-4-orange)

- **Backend:** Node.js, Express.js, TypeScript  
- **Database:** SQLite (Drizzle ORM)  
- **Email:** Nodemailer (Gmail App Password)  
- **Frontend:** Vite + HTML/CSS/JS  
- **Environment Management:** cross-env, dotenv  

---

## Project Structure
TaskFlow/
├─ server/
│ ├─ db.ts # Drizzle ORM DB setup
│ ├─ storage.ts # Session & DB storage class
│ ├─ index.ts # Express server entry
├─ shared/
│ ├─ schema.ts # Drizzle schema definitions
├─ package.json
├─ tsconfig.json
├─ .env
└─ README.md

## Installation & Setup

### Prerequisites
- Node.js v18+  
- npm v9+  
- Git  

### Clone Repository
```bash
git clone https://github.com/QADEER-AHMED-cs/TaskFlow.git
cd TaskFlow

Install Dependencies:
npm install

Database Setup

TaskFlow uses SQLite.

Initialize Database
npm run db:push

Creates SQLite file sqlite.db
Generates tables automatically using Drizzle ORM

Running Locally
Start Development Server
npm run dev

Open in Browser
http://localhost:3000

Testing Email OTP

Register a new user

Check Gmail inbox for OTP

Enter OTP to complete signup

Login → Manage tasks

Optional Email Test Script:

Create test-email.ts:
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail(
  {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER,
    subject: "Test OTP",
    text: "This is a test OTP email",
  },
  (err, info) => {
    if (err) console.log("Email Error:", err);
    else console.log("Email Sent:", info.response);
  }
);


