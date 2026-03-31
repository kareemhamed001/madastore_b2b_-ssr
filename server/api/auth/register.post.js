import { readBody } from "h3";
import {
  backendFetchFallback,
  resolveTokenFromPayload,
  resolveUserFromPayload,
  setAuthTokenCookie,
} from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const payload = await backendFetchFallback(
    event,
    ["/auth/signup", "/auth/register", "/register"],
    {
      method: "POST",
      body,
    },
  );

  const token = resolveTokenFromPayload(payload);
  if (token) {
    setAuthTokenCookie(event, token);
  }

  return {
    authenticated: Boolean(token),
    user: resolveUserFromPayload(payload),
  };
});
