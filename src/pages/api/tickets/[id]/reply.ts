import type { APIRoute } from "astro";
import { db } from "../../../../index";
import { messages, tickets } from "../../../../db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { sendEmail } from "../../../../../server/lib/email.ts";

export const POST = (async ({ params, request }) => {
  const id = params.id;
  const { message, internal } = await request.json();

  if (!id || !message || internal === undefined) {
    return new Response(null, { status: 400 });
  }

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, parseInt(id)),
    with: {
      messages: {
        orderBy: (messages) => [desc(messages.created_at)],
      },
    },
  });

  if (!ticket) {
    return new Response(null, { status: 404 });
  }

  let inReplyTo: string | null = null;
  const references: string[] = [];

  if (ticket.source === "EMAIL") {
    const emailMessages = ticket.messages
      .filter((m) => m.email_message_id)
      .sort((a, b) => a.created_at.getTime() - b.created_at.getTime());

    if (ticket.email_thread_id) {
      references.push(ticket.email_thread_id);
    }

    emailMessages.forEach((m) => {
      if (m.email_message_id && m.email_message_id !== ticket.email_thread_id) {
        references.push(m.email_message_id);
      }
    });

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
      references.length > 0 ? references : undefined,
    );
    emailMessageId = result.messageId;
  }

  const [newMessage] = await db
    .insert(messages)
    .values({
      ticket_id: parseInt(id),
      body: message,
      is_internal: internal,
      email_message_id: emailMessageId,
    })
    .returning();

  await db
    .update(tickets)
    .set({ updated_at: new Date() })
    .where(eq(tickets.id, parseInt(id)));

  return new Response(JSON.stringify(newMessage), { status: 201 });
}) satisfies APIRoute;
