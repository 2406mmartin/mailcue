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

- **Automatic ticket creation** - Incoming emails are automatically converted into tickets
- **Manual ticket creation** - Create tickets directly from the web UI
- **Email-based replies** - Reply to tickets via the web interface, responses are sent as emails
- **Internal notes** - Add internal team notes that aren't sent
- **Status management** - Track ticket progress (Open, In Progress, Closed)
- **"Smart" email parsing** - Automatic email signature removal for cleaner ticket threads
