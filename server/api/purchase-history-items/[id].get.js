import { createError, getRouterParam } from "h3";
import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order id is required",
    });
  }

  return backendFetch(event, `/purchase-history-items/${id}`, {
    method: "GET",
    authToken: token,
  });
});
