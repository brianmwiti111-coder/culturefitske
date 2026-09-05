import jwt from "jsonwebtoken";

export function signToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, process.env.JWT_SECRET, { expiresIn: "30d" });
}

// Reads and verifies the JWT from a Next.js Request's Authorization header.
// Returns { id, role } or null if missing/invalid.
export function getAuthUser(request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// Throws a Response-friendly error object route handlers can catch and return.
export class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.status = status;
  }
}

export function requireAuth(request) {
  const user = getAuthUser(request);
  if (!user) throw new AuthError("Not signed in.", 401);
  return user;
}

export function requireAdmin(request) {
  const user = requireAuth(request);
  if (user.role !== "admin") throw new AuthError("Admins only.", 403);
  return user;
}

export function publicUser(user) {
  return { id: user._id.toString(), name: user.name, phone: user.phone, email: user.email, role: user.role };
}
