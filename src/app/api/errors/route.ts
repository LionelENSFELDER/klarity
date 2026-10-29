import { NextRequest, NextResponse } from "next/server";
import { logError } from "@/lib/errorLog";
import { allowAttempt, clientIp } from "@/lib/rateLimit";

const MAX_BODY = 2_000;

/**
 * Reçoit les plantages côté navigateur (pages d'erreur) pour qu'ils
 * apparaissent dans les journaux serveur. Ouvert sans session : une page qui
 * plante peut être une page d'auth. Borné en taille et en débit.
 */
export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);
  if (ip && !(await allowAttempt(`client-error:${ip}`, 20, 60 * 60 * 1000))) {
    return new NextResponse(null, { status: 429 });
  }

  const text = await request.text();
  if (text.length > MAX_BODY) return new NextResponse(null, { status: 413 });

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(text);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  logError({
    source: "client",
    message: typeof body.message === "string" ? body.message : undefined,
    digest: typeof body.digest === "string" ? body.digest : undefined,
    path: typeof body.path === "string" ? body.path : undefined,
  });
  return new NextResponse(null, { status: 204 });
}
