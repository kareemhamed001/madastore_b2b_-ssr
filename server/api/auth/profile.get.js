import { backendFetchFallback, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);

  return backendFetchFallback(event, ["/auth/profile", "/user/info", "/user"], {
    method: "GET",
    authToken: token,
  });
});
