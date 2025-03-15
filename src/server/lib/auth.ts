// auth.ts - Authentication System for Nitro with Node.js (Deno compatible)

import {
  defineEventHandler,
  readBody,
  setCookie,
  getCookie,
  createError,
  H3Event,
} from "h3";
import { createClient } from "@libsql/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { z } from "zod";

// Environment variables (Store these securely in .env or deploy secrets)
const JWT_SECRET = process.env.JWT_SECRET || randomUUID();
const COOKIE_SECRET = process.env.COOKIE_SECRET || randomUUID();
const TURSO_URL = process.env.TURSO_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;
const COOKIE_NAME = "auth_token";
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds
const REFRESH_TOKEN_EXPIRY = 60 * 60 * 24 * 30; // 30 days in seconds
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Connect to Turso
const db = createClient({
  url: TURSO_URL,
  authToken: TURSO_AUTH_TOKEN,
});

// Initialize database schema
export async function initializeDatabase() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Create index on email for faster lookups
  await db.execute(
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
  );

  console.log("Database initialized");
}

// Input validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

// JWT functions
function createJWT(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function verifyJWT(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    return payload.sub as string;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

// Create refresh token
async function createRefreshToken(userId: string): Promise<string> {
  const token = randomUUID();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + REFRESH_TOKEN_EXPIRY;

  await db.execute({
    sql: `INSERT INTO refresh_tokens (token, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    args: [token, userId, expiresAt, now],
  });

  return token;
}

// Verify refresh token
async function verifyRefreshToken(token: string): Promise<string | null> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const result = await db.execute({
      sql: `SELECT user_id FROM refresh_tokens WHERE token = ? AND expires_at > ?`,
      args: [token, now],
    });

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].user_id as string;
  } catch (error) {
    console.error("Refresh token verification failed:", error);
    return null;
  }
}

// Delete refresh token (logout)
async function deleteRefreshToken(token: string): Promise<void> {
  await db.execute({
    sql: `DELETE FROM refresh_tokens WHERE token = ?`,
    args: [token],
  });
}

// Clean up expired refresh tokens (run periodically)
export async function cleanupExpiredRefreshTokens(): Promise<void> {
  const now = Math.floor(Date.now() / 1000);
  await db.execute({
    sql: `DELETE FROM refresh_tokens WHERE expires_at < ?`,
    args: [now],
  });
}

// Set secure HTTP cookies - Nitro style
function setAuthCookies(
  event: H3Event,
  token: string,
  refreshToken: string
): void {
  const jwtExpiry = new Date(Date.now() + TOKEN_EXPIRY * 1000);
  const refreshExpiry = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);

  // Set the JWT cookie
  setCookie(event, COOKIE_NAME, token, {
    expires: jwtExpiry,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    domain: COOKIE_DOMAIN,
  });

  // Set the refresh token cookie
  setCookie(event, `${COOKIE_NAME}_refresh`, refreshToken, {
    expires: refreshExpiry,
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    domain: COOKIE_DOMAIN,
  });
}

// Clear auth cookies (logout) - Nitro style
function clearAuthCookies(event: H3Event): void {
  // Expire the JWT cookie
  setCookie(event, COOKIE_NAME, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    domain: COOKIE_DOMAIN,
  });

  // Expire the refresh token cookie
  setCookie(event, `${COOKIE_NAME}_refresh`, "", {
    expires: new Date(0),
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "strict",
    path: "/",
    domain: COOKIE_DOMAIN,
  });
}

// User registration
async function registerUser(email: string, password: string): Promise<string> {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = randomUUID();
  const now = Math.floor(Date.now() / 1000);

  try {
    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?)`,
      args: [userId, email.toLowerCase(), passwordHash, now, now],
    });

    return userId;
  } catch (error) {
    // @ts-ignore - Error message might be different depending on the environment
    if (error.message?.includes("UNIQUE constraint failed")) {
      throw new Error("Email already exists");
    }
    throw error;
  }
}

// User login
async function loginUser(
  email: string,
  password: string
): Promise<string | null> {
  const result = await db.execute({
    sql: `SELECT id, password_hash FROM users WHERE email = ?`,
    args: [email.toLowerCase()],
  });

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash as string);

  if (!isValid) {
    return null;
  }

  return user.id as string;
}

// Auth middleware for Nitro
export async function authMiddleware(event: H3Event): Promise<string | null> {
  const token = getCookie(event, COOKIE_NAME);

  if (!token) {
    return null;
  }

  // Verify JWT
  const userId = verifyJWT(token);
  if (userId) {
    return userId;
  }

  // JWT failed, try refresh token
  const refreshToken = getCookie(event, `${COOKIE_NAME}_refresh`);
  if (!refreshToken) {
    return null;
  }

  return await verifyRefreshToken(refreshToken);
}

// Route Handlers for Nitro

// Registration handler
export const registerHandler = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = registerSchema.parse(body);

    const userId = await registerUser(email, password);
    const token = createJWT(userId);
    const refreshToken = await createRefreshToken(userId);

    setAuthCookies(event, token, refreshToken);

    return {
      success: true,
      message: "Registration successful",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation error",
        data: { errors: error.errors },
      });
    }

    throw createError({
      statusCode: 400,
      statusMessage: error.message || "Registration failed",
    });
  }
});

// Login handler
export const loginHandler = defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password } = loginSchema.parse(body);
    console.log("body", body);
    console.log("email", email);
    console.log("password", password);

    const userId = await loginUser(email, password);
    console.log("userId", userId);
    if (!userId) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    const token = createJWT(userId);
    const refreshToken = await createRefreshToken(userId);

    setAuthCookies(event, token, refreshToken);

    return {
      success: true,
      message: "Login successful",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError({
        statusCode: 400,
        statusMessage: "Validation error",
        data: { errors: error.errors },
      });
    }

    // If it's already an H3Error, just rethrow it
    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 400,
      statusMessage: "Login failed",
    });
  }
});

// Logout handler
export const logoutHandler = defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, `${COOKIE_NAME}_refresh`);

  if (refreshToken) {
    await deleteRefreshToken(refreshToken);
  }

  clearAuthCookies(event);

  return {
    success: true,
    message: "Logout successful",
  };
});

// Token refresh handler
export const refreshTokenHandler = defineEventHandler(async (event) => {
  const refreshToken = getCookie(event, `${COOKIE_NAME}_refresh`);

  if (!refreshToken) {
    throw createError({
      statusCode: 401,
      statusMessage: "No refresh token",
    });
  }

  const userId = await verifyRefreshToken(refreshToken);
  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid or expired refresh token",
    });
  }

  // Delete old refresh token
  await deleteRefreshToken(refreshToken);

  // Create new tokens
  const newToken = createJWT(userId);
  const newRefreshToken = await createRefreshToken(userId);

  setAuthCookies(event, newToken, newRefreshToken);

  return {
    success: true,
    message: "Token refreshed",
  };
});

// Protected route example
export const getUserHandler = defineEventHandler(async (event) => {
  const userId = await authMiddleware(event);

  console.log("userId", userId);

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  // Query user data but exclude password_hash
  const result = await db.execute({
    sql: `SELECT id, email, created_at, updated_at FROM users WHERE id = ?`,
    args: [userId],
  });

  if (result.rows.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    success: true,
    user: result.rows[0],
  };
});

// Helper functions
export {
  registerUser,
  loginUser,
  createJWT,
  verifyJWT,
  createRefreshToken,
  verifyRefreshToken,
  db,
};
