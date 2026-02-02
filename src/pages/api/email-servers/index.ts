import type { APIRoute } from "astro";
import { db } from "../../../index";

export const GET = (async () => {
  const emailServers = await db.query.emailServers.findMany();

  if (!emailServers) {
    return new Response(null, { status: 404 });
  }

  return new Response(JSON.stringify(emailServers), { status: 200 });
}) satisfies APIRoute;
