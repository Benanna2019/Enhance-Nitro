import { defineEventHandler, getQuery } from "h3";
import { db } from "../../lib/auth";

export default defineEventHandler(async (event) => {
  const { email } = getQuery(event);

  if (!email) {
    return "";
  }

  try {
    const result = await db.execute({
      sql: "SELECT COUNT(*) as count FROM users WHERE email = ?",
      args: [email.toString().toLowerCase()],
    });

    const count = result.rows[0].count as number;

    if (count > 0) {
      return '<span class="text-red-500">Email already in use</span>';
    }

    return '<span class="text-green-500">Email available</span>';
  } catch (error) {
    console.error("Error validating email:", error);
    return "";
  }
});
