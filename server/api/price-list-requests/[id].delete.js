import { backendFetch, requireAuthToken } from "~~/server/utils/backendApi";

export default defineEventHandler(async (event) => {
  const token = requireAuthToken(event);
  const id = event.context.params?.id;

  return backendFetch(event, `/price-list-requests/${id}`, {
    method: "DELETE",
    authToken: token,
  });
});
