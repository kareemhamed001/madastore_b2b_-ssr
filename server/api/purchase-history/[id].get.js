import { createError, getRouterParam } from "h3";
import {
  backendFetchFallback,
  requireAuthToken,
} from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Order id is required",
    });
  }

  return backendFetchFallback(
    event,
    [`/purchase-history/${id}`, `/purchase-history-details/${id}`],
    {
      method: "GET",
      authToken: token,
    },
  );
});
