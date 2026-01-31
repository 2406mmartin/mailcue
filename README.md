# Mailcue

> **Note**: This project is a work in progress and is not close to being finished.

A lightweight support ticket system that turns emails into manageable tickets.

## What it does

Monitors an email inbox via IMAP and automatically converts incoming emails into support tickets. Replies to tickets are sent back as emails, creating a seamless email-based support workflow.

## Tech Stack

- **Frontend**: Astro + Solid.js + Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Email**: IMAP monitoring + Nodemailer for replies

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env

# Run database migrations
pnpm drizzle-kit push

# Start the dev server
pnpm dev

# Start the email worker (in a separate terminal)
pnpm worker
```

## Features

- Automatic ticket creation from emails
- Reply to tickets via web UI (sends as email)
- Ticket status management (Open, In Progress, Closed)
- Email signature removal for cleaner ticket threads
