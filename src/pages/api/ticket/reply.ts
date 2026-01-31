import type { APIRoute } from "astro";
import { db } from "../../../index";
import { messages, tickets } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "../../../../server/lib/email.ts";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ticketId, message, internal } = await request.json();

    if (!ticketId || !message || internal === undefined) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ticket = await db.query.tickets.findFirst({
      where: eq(tickets.id, ticketId),
      with: {
        messages: {
          orderBy: (messages) => [desc(messages.created_at)],
        },
      },
    });

    if (!ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    let inReplyTo: string | null = null;
    const references: string[] = [];

    if (ticket.source === "EMAIL") {
      // Build email threading references
      const emailMessages = ticket.messages
        .filter((m) => m.email_message_id)
        .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

      // The thread anchor (confirmation email) is the first reference
      if (ticket.email_thread_id) {
        references.push(ticket.email_thread_id);
      }

      // Add all other messages to references
      emailMessages.forEach(m => {
        if (m.email_message_id && m.email_message_id !== ticket.email_thread_id) {
          references.push(m.email_message_id);
        }
      });

      // Reply to the most recent message
      if (emailMessages.length > 0) {
        inReplyTo = emailMessages[emailMessages.length - 1].email_message_id;
      } else if (ticket.email_thread_id) {
        inReplyTo = ticket.email_thread_id;
      }
    }

    let emailMessageId: string | null = null;
    if (!internal && ticket.source === "EMAIL") {
      const result = await sendEmail(
        ticket.contact,
        `Re: ${ticket.subject}`,
        message,
        inReplyTo,
        references.length > 0 ? references : undefined
      );
      emailMessageId = result.messageId;
    }

    const [newMessage] = await db
      .insert(messages)
      .values({
        ticket_id: ticketId,
        body: message,
        is_internal: internal,
        email_message_id: emailMessageId,
      })
      .returning();

    await db
      .update(tickets)
      .set({ updated_at: new Date() })
      .where(eq(tickets.id, ticketId));

    return new Response(JSON.stringify({ success: true, message: newMessage }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating reply:", err);
    return new Response(JSON.stringify({ error: "Failed to create reply" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
