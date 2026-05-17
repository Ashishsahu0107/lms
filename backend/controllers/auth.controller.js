import { BadRequestError } from "../utils/errors.js";
import { authService } from "../services/auth.service.js";

export async function loginController(req, res, next) {
  try {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
      throw new BadRequestError("email and password are required");
    }

    const result = await authService.login({ email, password });

    res.json(result);
  } catch (err) {
    next(err);
  }
}

