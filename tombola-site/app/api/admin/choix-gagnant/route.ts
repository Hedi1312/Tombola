import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

interface IncomingWinner {
    name: string;
    email: string;
    ticket: string;
}


// Fonction utilitaire pour récupérer les tickets
async function GET_Tickets() {
    const { data, error } = await supabaseAdmin
        .from("tickets")
        .select("full_name, email, ticket_number")
        .order("id", { ascending: false });

    if (error) throw new Error(error.message);

    return data?.map(t => ({
        full_name: t.full_name,
        email: t.email,
        ticket_number: String(t.ticket_number).padStart(6, "0"),
    })) || [];
}


// GET → récupérer les gagnants
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("winners")
        .select("*")
        .order("rank", { ascending: true });

    if (error) return NextResponse.json({ success: false, error: error.message });

    return NextResponse.json({ success: true, winners: data || [] });
}

// POST → mettre à jour les gagnants
export async function POST(req: NextRequest) {
    try {
        const { winners } = await req.json();

        if (!winners || !Array.isArray(winners)) {
            return NextResponse.json({ success: false, error: "Liste de gagnants invalide" });
        }

        // Récupérer les gagnants actuels
        const { data: existingWinnersData, error: fetchError } = await supabaseAdmin
            .from("winners")
            .select("*");

        if (fetchError) throw fetchError;

        const existingWinners = existingWinnersData ?? [];

        // --- 1️⃣ Récupération des tickets pour validation
        const tickets = await GET_Tickets();

        for (const w of winners) {
            const match = tickets.find(
                (t) =>
                    t.ticket_number === w.ticket.trim() &&
                    t.full_name === w.name.trim() &&
                    t.email === w.email.trim()
            );

            if (!match) {
                return NextResponse.json({
                    success: false,
                    error: `Le couple (Prénom: ${w.name}, Email: ${w.email}, Ticket: ${w.ticket}) n'existe pas dans la base.`,
                });
            }
        }

        // --- 2️⃣ Déterminer les gagnants à supprimer
        const incomingEmails = winners.map((w) => w.email);
        const toDelete = existingWinners.filter(
            (ew) => !incomingEmails.includes(ew.email)
        );

        if (toDelete.length > 0) {
            await supabaseAdmin
                .from("winners")
                .delete()
                .in(
                    "email",
                    toDelete.map((d) => d.email)
                );
        }

        // --- 3️⃣ Upsert (ajout ou mise à jour)
        const formattedWinners = winners.map((w: IncomingWinner, index: number) => ({
            name: w.name,
            email: w.email,
            ticket: w.ticket,
            rank: index + 1,
        }));

        const { data, error: upsertError } = await supabaseAdmin
            .from("winners")
            .upsert(formattedWinners, { onConflict: "email" })
            .select("*");

        if (upsertError) {
            return NextResponse.json({ success: false, error: upsertError.message });
        }

        // --- 4️⃣ Retourner la liste finale
        return NextResponse.json({ success: true, winners: data });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage });
    }
}


