import type { APIRoute } from "astro";
import { db } from "../../../index";
import { tickets, messages } from "../../../db/schema";
import { sendEmail } from "../../../../server/lib/email.ts";
import { eq } from "drizzle-orm";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { subject, description, contact } = await request.json();

    if (!subject || !description || !contact) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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

    // Send notification email that ticket was created
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

    // Save the email thread ID to the ticket for future reference
    await db
      .update(tickets)
      .set({ email_thread_id: emailResult.messageId })
      .where(eq(tickets.id, ticket.id));

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
