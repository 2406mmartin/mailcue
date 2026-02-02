import type { APIRoute } from "astro";
import { db } from "../../../index";
import { activity, tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const GET = (async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(null, { status: 400 });
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parseInt(id)),
  });

  if (!ticket) {
    return new Response(null, { status: 404 });
  }

  return new Response(JSON.stringify(ticket), { status: 200 });
}) satisfies APIRoute;

export const POST = (async ({ params, request }) => {
  const id = params.id;
  if (!id) return new Response(null, { status: 400 });

  const body = await request.json();
  const { status, subject } = body;

  const ticket = await db
    .update(tickets)
    .set({ status, subject, updated_at: new Date() })
    .where(eq(tickets.id, parseInt(id)))
    .returning();

  if (!ticket) return new Response(null, { status: 404 });

  if (status !== undefined) {
    await db.insert(activity).values({
      ticket_id: parseInt(id),
      event: "status_changed",
      new_value: status,
    });
  }

  return new Response(JSON.stringify(ticket), { status: 200 });
}) satisfies APIRoute;

export const DELETE = (async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(null, { status: 400 });
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parseInt(id)),
  });

  if (!ticket) {
    return new Response(null, { status: 404 });
  }

  await db.delete(tickets).where(eq(tickets.id, parseInt(id)));

  return new Response(null, { status: 204 });
}) satisfies APIRoute;
