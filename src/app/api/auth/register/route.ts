import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { validateRegistration } from "@/modules/auth/registration";
import { allowAttempt, clientIp } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  // Chaque inscription coûte un hachage bcrypt : on freine les rafales.
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

    // La recherche et la création portent sur la même valeur normalisée :
    // sinon un doublon passe la vérification et casse l'index unique.
    const existingUser = await prisma.user.findUnique({
      where: { email: parsed.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet e-mail. Connectez-vous, ou utilisez « Continuer avec Google » si vous l'avez créé ainsi." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(parsed.password, 12);

    const user = await prisma.user.create({
      data: {
        email: parsed.email,
        password: hashedPassword,
        name: parsed.name,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Le compte n'a pas pu être créé. Réessayez dans un instant." },
      { status: 500 },
    );
  }
}
