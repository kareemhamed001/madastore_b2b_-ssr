import { createError, readBody } from "h3";
import {
  backendFetchFallback,
  resolveTokenFromPayload,
  resolveUserFromPayload,
  setAuthTokenCookie,
} from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const credentials = await readBody(event);

  const payload = await backendFetchFallback(event, ["/auth/login"], {
    method: "POST",
    body: credentials,
  });

  const token = resolveTokenFromPayload(payload);
  if (!token) {
    throw createError({
      statusCode: 502,
      statusMessage: "Login succeeded but no token was returned.",
    });
  }

  setAuthTokenCookie(event, token);

  return {
    authenticated: true,
    user: resolveUserFromPayload(payload),
  };
});
