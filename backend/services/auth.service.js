import { userRepository } from "../repositories/user.repository.js";
import { UnauthorizedError } from "../utils/errors.js";

export const authService = {
  async login({ email, password }) {
    // Placeholder logic for bootstrap.
    // Replace with proper password hashing + JWT.
    const user = await userRepository.findByEmail(email);

    if (!user) throw new UnauthorizedError("Invalid credentials");

    // WARNING: placeholder; never do this in production
    if (user.password !== password) throw new UnauthorizedError("Invalid credentials");

    return {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      token: "placeholder-jwt-token",
    };
  },
};

