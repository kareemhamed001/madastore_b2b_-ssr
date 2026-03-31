import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);

  return backendFetch(event, "/price-list-requests", {
    method: "GET",
    authToken: token,
  });
});
