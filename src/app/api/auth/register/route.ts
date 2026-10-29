import { NextRequest, NextResponse } from "next/server";
import { validateRegistration, REGISTRATION_SUCCESS_MESSAGE } from "@/modules/auth/registration";
import { registerAccount } from "@/modules/auth/verification";
import { allowAttempt, clientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Chaque inscription coûte un hachage bcrypt et un e-mail : on freine les rafales.
  const ip = clientIp(request.headers);
  if (ip && !(await allowAttempt(`register:${ip}`, 5, 60 * 60 * 1000))) {
    return NextResponse.json(
      { error: "Trop de comptes créés depuis cette connexion. Réessayez dans une heure." },
      { status: 429 },
    );
  }

  try {
    const body = await request.json();
    const parsed = validateRegistration(body);

    if (!parsed.ok) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    // Même réponse que l'adresse ait déjà un compte ou non (voir registerAccount).
    await registerAccount(parsed);
    return NextResponse.json({ message: REGISTRATION_SUCCESS_MESSAGE }, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "Le compte n'a pas pu être créé. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
