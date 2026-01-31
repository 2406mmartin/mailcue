import "dotenv/config";
import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { tickets, messages } from "../../src/db/schema.ts";
import { eq } from "drizzle-orm";
import { removeSignatureAdvanced } from "../lib/signature-remover.ts";
import { sendEmail } from "../lib/email.ts";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

function generateSubject(
  subject: string | undefined,
  text: string | undefined
): string {
  if (subject?.trim()) return subject;
  if (text?.trim()) {
    const cleanText = text.trim().replace(/\s+/g, " ");
    return cleanText.length <= 50
      ? cleanText
      : cleanText.substring(0, 50) + "...";
  }
  return "(No Subject)";
}

async function createTicket(
  from: string | undefined,
  subject: string | undefined,
  text: string | undefined,
  messageId: string | undefined
) {
  const generatedSubject = generateSubject(subject, text);

  if (!from) {
    throw new Error("Email from address is required");
  }

  // Create the ticket first
  const [ticket] = await db
    .insert(tickets)
    .values({
      source: "EMAIL",
      contact: from,
      subject: generatedSubject,
    })
    .returning();

  // Store the original customer message
  await db.insert(messages).values({
    ticket_id: ticket.id,
    body: text || "",
    is_internal: false,
    email_message_id: messageId,
  });

  // Send confirmation email that will serve as the thread anchor
  const confirmationMessage = `Hello,

Thank you for contacting us. Your support ticket has been created successfully.

Ticket #${ticket.id}: ${generatedSubject}

We'll review your request and get back to you as soon as possible. Please reply to this email if you need to add any additional information to your ticket.

Best regards,
Support Team`;

  try {
    // Send confirmation email in reply to the original message
    const { messageId: confirmationMessageId } = await sendEmail(
      from,
      `Ticket Opened - #${ticket.id}`,
      confirmationMessage,
      messageId,
      []
    );

    // Update the ticket to use the confirmation email as the thread anchor
    await db
      .update(tickets)
      .set({ email_thread_id: confirmationMessageId })
      .where(eq(tickets.id, ticket.id));

    // Store the confirmation message in the database
    await db.insert(messages).values({
      ticket_id: ticket.id,
      body: confirmationMessage,
      is_internal: false,
      email_message_id: confirmationMessageId,
    });

    console.log(
      `Confirmation email sent with Message-ID: ${confirmationMessageId}`
    );
  } catch (error) {
    console.error("Failed to send confirmation email:", error);
    // Ticket is still created even if email fails
  }

  return ticket;
}

const client = new ImapFlow({
  host: process.env.EMAIL_HOST!,
  port: Number(process.env.EMAIL_IMAP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
  logger: false,
});

async function start() {
  try {
    await client.connect();
    console.log("Connected to IMAP");

    await client.mailboxOpen("INBOX");

    client.on("exists", async () => {
      console.log("New email detected!");

      const lock = await client.getMailboxLock("INBOX");
      try {
        // Fetch the latest message
        const message = await client.fetchOne("*", { source: true });

        const parsed = await simpleParser(message.source);

        // Remove email signatures from the message body
        const cleanedText = removeSignatureAdvanced(parsed.text);

        if (parsed.inReplyTo == undefined) {
          const ticket = await createTicket(
            parsed.from?.value[0].address,
            parsed.subject,
            cleanedText,
            parsed.messageId
          );
          console.log("TICKET CREATED:", ticket.subject);
        } else {
          console.log("Reply detected. In-Reply-To:", parsed.inReplyTo);

          // Try to find the ticket by matching the In-Reply-To header
          // First check messages table
          const existingMessages = await db
            .select()
            .from(messages)
            .where(eq(messages.email_message_id, parsed.inReplyTo));

          // Then check if it's a reply to the thread anchor
          const existingTickets = await db
            .select()
            .from(tickets)
            .where(eq(tickets.email_thread_id, parsed.inReplyTo));

          let ticketId: number | null = null;

          if (existingMessages.length > 0) {
            ticketId = existingMessages[0].ticket_id;
            console.log("Found existing message, ticket ID:", ticketId);
          } else if (existingTickets.length > 0) {
            ticketId = existingTickets[0].id;
            console.log(
              "Found existing ticket via email_thread_id, ticket ID:",
              ticketId
            );
          }

          if (ticketId) {
            // Create reply message linked to the ticket
            await db.insert(messages).values({
              ticket_id: ticketId,
              body: cleanedText || "",
              is_internal: false,
              email_message_id: parsed.messageId,
            });
            console.log("TICKET REPLY CREATED: ", parsed.subject);
          } else {
            console.log(
              "Could not find existing ticket for In-Reply-To:",
              parsed.inReplyTo
            );
            const ticket = await createTicket(
              parsed.from?.value[0].address,
              parsed.subject,
              cleanedText,
              parsed.messageId
            );
            console.log("NEW TICKET CREATED FOR REPLY:", ticket.subject);
          }
        }
      } catch (err) {
        console.error("Error fetching or parsing email:", err);
      } finally {
        lock.release();
      }
    });

    // Keep IDLE loop alive
    while (true) {
      await client.idle();
    }
  } catch (err) {
    console.error("IMAP connection error:", err);
  }
}

start();
