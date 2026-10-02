# LMS Pro

LMS Pro is a Next.js 15 full-stack Learning Management System using MongoDB Atlas through Mongoose. It retains JWT authentication and the existing student, teacher, and administrator workflows.

## Stack

- Next.js 15 App Router, React 19, and TypeScript
- MongoDB Atlas with Mongoose models in `lib/models.ts`
- JWT authentication and bcryptjs password hashing
- Socket.IO for optional realtime messaging and presence
- Tailwind CSS, Redux Toolkit, React Context, and Swagger/OpenAPI

## Features

Student, teacher, and super-admin portals; course browsing and authoring; modules, topics, and resources; enrollments and learning progress; quizzes and attempts; assignments and grading; attendance; certificates and verification; messages and notifications; schedules; contact submissions; and admin user/settings/health views.

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `JWT_SECRET`.
3. Start Next.js with `npm run dev`.
4. Optionally create demo users with `npm run db:seed`.

`MONGODB_URI` must be a MongoDB Atlas connection string. Add the deployed Vercel application's outbound access as permitted by the Atlas network access configuration. Use a long, unique `JWT_SECRET` and do not expose either secret through a `NEXT_PUBLIC_*` variable.

## Vercel Deployment

Set the Vercel Root Directory to the repository root and Framework Preset to Next.js. The build command is `npm run build` (`next build`); the start command is `next start`. No custom build output configuration is required.

Configure these environment variables for the appropriate Vercel environments:

- `MONGODB_URI`: server-only Atlas connection string
- `JWT_SECRET`: server-only signing secret
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`: server-only, when email delivery is enabled
- `NEXT_PUBLIC_API_URL`: optional; defaults to the same-origin `/api`
- `NEXT_PUBLIC_SOCKET_URL`: optional public URL of a separately hosted persistent Socket.IO server

Vercel functions do not host a persistent Socket.IO server. To enable live presence and realtime messaging, deploy `socket-server.js` to a persistent Node.js host, configure its `JWT_SECRET` and allowed frontend origins, then set `NEXT_PUBLIC_SOCKET_URL` to that service URL. Without it, the app skips the socket connection and continues to use HTTP API routes.

## Database Models

`lib/models.ts` defines Mongoose models for users, courses and content, enrollments and progress, quizzes and attempts, assignments and submissions, attendance, certificates, messages, notifications, schedules, settings, security logs, AI chats, and contact requests. `lib/db.ts` caches the Mongoose connection across requests and hot reloads.

## Validation

- `npm test` runs TypeScript and ESLint.
- `npm run build` runs the production Next.js build.
