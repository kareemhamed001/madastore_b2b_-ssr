import {
  backendFetchFallback,
  clearAuthTokenCookie,
  getAuthTokenFromCookie,
} from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = getAuthTokenFromCookie(event);
  clearAuthTokenCookie(event);

  if (!token) {
    return { success: true };
  }

  try {
    await backendFetchFallback(event, ["/auth/logout", "/logout"], {
      method: "POST",
      authToken: token,
    });
  } catch {
    // Local logout should still succeed even if backend logout fails.
  }

  return { success: true };
});
