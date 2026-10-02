# LMS Pro

A full-stack Learning Management System built with Next.js 15, React 19, MongoDB Atlas, Mongoose, and JWT authentication. The app includes student, teacher, and super-admin portals for courses, quizzes, assignments, attendance, certificates, messaging, and administration.

## Local Development

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` and set `MONGODB_URI` and `JWT_SECRET`.
3. Start the app: `npm run dev`
4. Optionally seed demo users: `npm run db:seed`

## Deploy to Vercel

Use the repository root as the Root Directory and select the Next.js framework preset. The build script is `npm run build` (`next build`). Configure `MONGODB_URI` and `JWT_SECRET` as server-only variables. Set SMTP variables if email delivery is enabled. API requests default to the same-origin `/api` path.

Vercel does not host persistent Socket.IO servers. For live presence and realtime messaging, deploy `socket-server.js` to a persistent Node.js host and set `NEXT_PUBLIC_SOCKET_URL` to that service. Leaving it unset disables sockets while keeping HTTP API functionality available.

See [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) for the deployment environment variable list and database details.
