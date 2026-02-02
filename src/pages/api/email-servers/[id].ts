import type { APIRoute } from "astro";
import { db } from "../../../index";
import { emailServers } from "../../../db/schema";
import { eq } from "drizzle-orm";

export const prerender = false;

export const GET = (async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(null, {
      status: 400,
    });
  }

  const emailServer = await db.query.emailServers.findFirst({
    where: eq(emailServers.id, parseInt(id)),
  });

  if (!emailServer) {
    return new Response(null, {
      status: 404,
    });
  }

  return new Response(JSON.stringify(emailServer), { status: 200 });
}) satisfies APIRoute;

export const POST = (async ({ params, request }) => {
  const id = params.id;
  const { name, type, host, port, secure, username, password } =
    await request.json();

  if (
    !id ||
    !name ||
    !type ||
    !host ||
    !port ||
    !secure ||
    !username ||
    !password
  ) {
    return new Response(JSON.stringify({ error: "Missing required fields" }));
  }

  const updated = await db
    .update(emailServers)
    .set({
      name: name,
      type: type,
      host: host,
      port: port,
      secure: secure,
      username: username,
      password: password,
      verified: false,
    })
    .where(eq(emailServers.id, parseInt(id)));

  if (!updated) {
    return new Response(
      JSON.stringify({ error: "Failed to update email server" }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify(updated), { status: 200 });
}) satisfies APIRoute;

export const DELETE = (async ({ params }) => {
  const id = params.id;

  if (!id) {
    return new Response(JSON.stringify("Missing ID"), { status: 400 });
  }

  const emailServer = await db.query.emailServers.findFirst({
    where: eq(emailServers.id, parseInt(id)),
  });

  const deleted = await db
    .delete(emailServers)
    .where(eq(emailServers.id, parseInt(id)));

  if (!emailServer) {
    return new Response(
      JSON.stringify({ error: "Failed to delete email server" }),
      {
        status: 404,
      },
    );
  }

  return new Response(JSON.stringify({ success: "Deleted email server" }), {
    status: 204,
  });
}) satisfies APIRoute;
