import { BadRequestError } from "../utils/errors.js";
import { authService } from "../services/auth.service.js";

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) throw new BadRequestError("email and password are required");
    const result = await authService.login({ email, password });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function registerController(req, res, next) {
  try {
    const { name, email, password, role } = req.body ?? {};
    if (!name || !email || !password) throw new BadRequestError("name, email and password are required");
    const result = await authService.register({ name, email, password, role });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function meController(req, res, next) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    next(err);
  }
}