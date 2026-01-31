import type { APIRoute } from "astro";
import { db } from "../../../index";
import { tickets, ticketSourceEnum } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ticketId } = await request.json();

    if (!ticketId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ticket = await db.delete(tickets).where(eq(tickets.id, ticketId));

    return new Response(JSON.stringify({ success: true, ticket }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to delete ticket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
