import { Router } from "express";

export const pingRouter = Router();

pingRouter.get("/", (_req, res) => {
  res.json({ pong: true, ts: Date.now() });
});
