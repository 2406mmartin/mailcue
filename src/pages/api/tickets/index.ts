import type { APIRoute } from "astro";
import { db } from "../../../index";
import { tickets, messages } from "../../../db/schema.ts";
import { sendEmail } from "../../../../server/lib/email.ts";
import { eq } from "drizzle-orm";

export const GET = (async () => {
  const allTickets = await db.query.tickets.findMany();

  if (!allTickets) {
    return new Response(null, { status: 404 });
  }

  return new Response(JSON.stringify(allTickets), { status: 200 });
}) satisfies APIRoute;

export const POST = (async ({ request }) => {
  const { subject, description, contact } = await request.json();

  if (!subject || !description || !contact) {
    return new Response(null, { status: 400 });
  }

  const [ticket] = await db
    .insert(tickets)
    .values({
      subject: subject,
      contact: contact,
      source: "API",
    })
    .returning();

  if (!ticket) {
    return new Response(null, { status: 500 });
  }

  await db.insert(messages).values({
    ticket_id: ticket.id,
    body: description,
    is_internal: false,
  });

  const notificationMessage = `Hello,

A support ticket has been created successfully.

Ticket ID: #${ticket.id}
Subject: ${subject}

Description:
${description}

We'll get back to you as soon as possible.

Best regards,
Not a Support Team`;

  const emailResult = await sendEmail(
    contact,
    `[Ticket #${ticket.id}] ${subject}`,
    notificationMessage,
  );

  await db
    .update(tickets)
    .set({ email_thread_id: emailResult.messageId })
    .where(eq(tickets.id, ticket.id));

  return new Response(JSON.stringify(ticket), { status: 201 });
}) satisfies APIRoute;
