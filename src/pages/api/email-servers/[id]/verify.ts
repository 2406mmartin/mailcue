import type { APIRoute } from "astro";
import { db } from "../../../../index";
import { emailServers } from "../../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

export const POST = (async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(null, { status: 400 });
  }

  const emailServer = await db.query.emailServers.findFirst({
    where: eq(emailServers.id, parseInt(id)),
  });

  const setVerified = await db
    .update(emailServers)
    .set({ verified: true })
    .where(eq(emailServers.id, parseInt(id)));

  if (!setVerified) {
    return new Response(null, { status: 404 });
  }

  return new Response(null, { status: 200 });
}) satisfies APIRoute;
