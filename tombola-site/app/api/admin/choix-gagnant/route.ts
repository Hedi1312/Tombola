import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WinnerRow {
    id: number;
    name: string;
    email: string;
    ticket: string;
    rank: number;
}


// Fonction utilitaire pour récupérer les tickets
async function GET_Tickets() {
    const { data, error } = await supabase
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
    const { data, error } = await supabase
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


        // Récupérer tous les tickets une seule fois
        const tickets = await GET_Tickets();

        // Vérifier que chaque gagnant correspond à une entrée dans "tickets"
        // Vérifier que chaque gagnant correspond à une entrée dans "tickets"
        for (const w of winners) {
            const match = tickets.find(
                t =>
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

        // On supprime tous les anciens gagnants
        await supabase.from("winners").delete().neq("id", 0);

        // On insère les nouveaux gagnants avec le rang correspondant
        const newWinners: Omit<WinnerRow, "id">[] = winners.map(
            (w: { name: string; email: string; ticket: string}, index: number) => ({
                name: w.name || "",
                email: w.email || "",
                ticket: w.ticket,
                rank: index + 1,
            })
        );
        const { data, error } = await supabase
            .from("winners")
            .insert(newWinners)
            .select("*");

        // Gestion des erreurs, notamment l'unicité sur l'email
        if (error) {
            // Code Postgres pour violation de contrainte UNIQUE
            if (error.code === "23505") {
                return NextResponse.json({
                    success: false,
                    error: "Un des emails correspond déjà à un vainqueur et ne peut pas être ajouté deux fois."
                });
            }
            return NextResponse.json({ success: false, error: error.message });
        }

        return NextResponse.json({ success: true, winners: data });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
