import { readBody } from "h3";
import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

const updateAttempts = [
  { endpoint: "/auth/profile/update", method: "POST" },
  { endpoint: "/auth/profile", method: "PUT" },
  { endpoint: "/auth/profile", method: "POST" },
  { endpoint: "/user/profile", method: "PUT" },
  { endpoint: "/user/update", method: "POST" },
  { endpoint: "/user", method: "PUT" },
];

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);
  const body = await readBody(event);

  let lastError = null;
  for (const attempt of updateAttempts) {
    try {
      return await backendFetch(event, attempt.endpoint, {
        method: attempt.method,
        authToken: token,
        body,
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Unable to update profile.");
});
