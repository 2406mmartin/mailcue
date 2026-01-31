import type { APIRoute } from "astro";
import { db } from "../../../index";
import { tickets, messages } from "../../../db/schema";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { subject, description, contact } = await request.json();

    if (!subject || !description || !contact) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const [ticket] = await db
      .insert(tickets)
      .values({
        subject: subject,
        contact: contact,
        source: "API",
      })
      .returning();

    // Store the initial description as the first message
    await db.insert(messages).values({
      ticket_id: ticket.id,
      body: description,
      is_internal: false,
    });

    return new Response(JSON.stringify({ success: true, ticket }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to create ticket" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
