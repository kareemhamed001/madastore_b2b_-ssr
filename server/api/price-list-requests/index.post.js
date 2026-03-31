import { readBody } from "h3";
import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);
  const body = await readBody(event);

  return backendFetch(event, "/price-list-requests", {
    method: "POST",
    authToken: token,
    body,
  });
});
