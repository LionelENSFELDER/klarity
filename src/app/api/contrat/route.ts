import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/contract - Lister tous les contrats de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where = {
      userId: session.user.id,
      ...(status && { status }),
    };

    const contracts = await prisma.contract.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const total = await prisma.contract.count({ where });

    return NextResponse.json({
      contracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contrats:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// POST /api/contract - Créer un nouveau contrat
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      provider,
      contractNumber,
      startDate,
      endDate,
      renewalDate,
      monthlyAmount,
      annualAmount,
      clientPhone,
      website,
      advisorName,
      notes,
      status,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Le titre est requis" },
        { status: 400 },
      );
    }

    const contract = await prisma.contract.create({
      data: {
        name,
        provider: provider || null,
        contractNumber: contractNumber || null,
        renewalDate: renewalDate ? new Date(renewalDate) : null,
        monthlyAmount: monthlyAmount ? parseFloat(monthlyAmount) : null,
        annualAmount: annualAmount ? parseFloat(annualAmount) : null,
        clientPhone: clientPhone || null,
        website: website || null,
        advisorName: advisorName || null,
        notes: notes || null,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : undefined,
        userId: session.user.id,
        status: status || "DRAFT",
      },
    });

    return NextResponse.json(contract, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}

// DELETE /api/contract - Supprimer un contrat de l'utilisateur (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get("id");
    if (!contractId) {
      return NextResponse.json(
        { error: "ID du contrat requis" },
        { status: 400 },
      );
    }
    await prisma.contract.delete({
      where: { id: contractId },
    });
    return NextResponse.json({ message: "Contrat supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du contrat:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 },
    );
  }
}
