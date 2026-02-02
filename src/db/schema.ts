import {
  integer,
  pgTable,
  varchar,
  timestamp,
  pgEnum,
  serial,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const emailServerEnum = pgEnum("email_server", ["SMTP", "IMAP"]);

export const roleEnum = pgEnum("role", ["STAFF", "ADMIN"]);

export const ticketSourceEnum = pgEnum("ticket_source", [
  "EMAIL",
  "MANUAL",
  "API",
]);

export const ticketStatusEnum = pgEnum("ticket_status", [
  "OPEN",
  "IN_PROGRESS",
  "CLOSED",
]);

export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),
  organization_name: varchar("organization_name").default("Mailcue").notNull(),
});

export const emailServers = pgTable("email_servers", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: emailServerEnum("type").notNull(),
  host: varchar("host").notNull(),
  port: integer("port").notNull(),
  secure: boolean("secure").default(false).notNull(),
  username: varchar("username").notNull(),
  password: varchar("password").notNull(),
  verified: boolean("verified").default(false).notNull(),

  // IMAP specific
  polling_interval: integer("polling_interval"),
  folder: varchar("folder"),

  // SMTP specific
  from_name: varchar("from_name"),
  reply_to: varchar("reply_to"),

  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  role: roleEnum("role").default("STAFF").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(),
  contact: varchar("contact").notNull(),
  subject: varchar("subject").notNull(),
  status: ticketStatusEnum("status").default("OPEN").notNull(),
  source: ticketSourceEnum("source").notNull(),
  // For email tickets: Message-ID of the confirmation email (thread anchor)
  email_thread_id: varchar("email_thread_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Messages are all replies/communications in the ticket
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  author_id: integer("author_id").references(() => users.id),
  body: text("body").notNull(),
  // Internal messages are staff-only notes (not sent via email)
  is_internal: boolean("is_internal").default(false).notNull(),
  // For email messages: the Message-ID from the email server
  email_message_id: varchar("email_message_id"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Activity log for status changes and other events
export const activity = pgTable("activity", {
  id: serial("id").primaryKey(),
  ticket_id: integer("ticket_id")
    .notNull()
    .references(() => tickets.id, { onDelete: "cascade" }),
  user_id: integer("user_id").references(() => users.id),
  event: varchar("event").notNull(), // "status_changed", "ticket_created", etc.
  old_value: varchar("old_value"),
  new_value: varchar("new_value"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

export const messageRelations = relations(messages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [messages.ticket_id],
    references: [tickets.id],
  }),
  author: one(users, {
    fields: [messages.author_id],
    references: [users.id],
  }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  ticket: one(tickets, {
    fields: [activity.ticket_id],
    references: [tickets.id],
  }),
  user: one(users, {
    fields: [activity.user_id],
    references: [users.id],
  }),
}));

export const ticketRelations = relations(tickets, ({ many }) => ({
  messages: many(messages),
  activity: many(activity),
}));

export const userRelations = relations(users, ({ many }) => ({
  messages: many(messages),
  activity: many(activity),
}));
