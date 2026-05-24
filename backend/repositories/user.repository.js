// Placeholder repository.
// In production, wire this to Mongoose models.
export const userRepository = {
  async findByEmail(email) {
    // Example: return a dummy user; replace with DB query.
    if (email === "admin@example.com") {
      return {
        _id: "1",
        email,
        role: "superadmin",
        password: "admin123",
      };
    }
    return null;
  },
};