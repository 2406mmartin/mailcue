import type { APIRoute } from "astro";
import { db } from "../../../index";
import { activity, tickets } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ticketId, field, value } = await request.json();

    if (!ticketId || !field || value === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const data: { [key: string]: any } = {};

    if (field === "status") {
      const validStatuses = ["OPEN", "IN_PROGRESS", "CLOSED"];
      if (!validStatuses.includes(value)) {
        return new Response(
          JSON.stringify({ error: `Invalid status value: ${value}` }),
          { status: 400 }
        );
      }
      data[field] = value;
    }

    // Get old value
    const oldTicket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
    });

    const [ticket] = await db
      .update(tickets)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(tickets.id, ticketId))
      .returning();

    // Log the status change in activity table
    await db.insert(activity).values({
      ticket_id: ticket.id,
      event: "status_changed",
      old_value: oldTicket?.status,
      new_value: value,
    });

    return new Response(JSON.stringify({ success: true, ticket }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to update ticket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
