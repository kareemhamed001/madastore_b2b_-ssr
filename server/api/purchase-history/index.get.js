import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);

  return backendFetch(event, "/purchase-history", {
    method: "GET",
    authToken: token,
  });
});
