import { NextRequest, NextResponse } from "next/server";
import { generateTickets } from "@/src/lib/generateTicket";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

type ResultType = "win" | "lose";

interface RouePlay {
    id?: number;
    email: string;
    total_wins: number;
    total_losses: number;
    last_result: ResultType;
    played_at: string;
    played_date?: string;
}

function normalizeEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    const [local, domain] = trimmed.split("@");
    if (!local || !domain) return trimmed;
    const cleanLocal =
        domain === "gmail.com" || domain === "googlemail.com"
            ? local.split("+")[0]
            : local;
    return `${cleanLocal}@${domain}`;
}

export async function POST(req: NextRequest) {
    try {
        const { full_name, email, is_win } = await req.json();

        if (!email) {
            return NextResponse.json(
                { success: false, error: "Email obligatoire" },
                { status: 400 }
            );
        }

        const cleanEmail = normalizeEmail(email);
        const today = new Date().toISOString().slice(0, 10);

        // On vérifie si le joueur existe déjà
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (fetchError) throw fetchError;

        // Empêche de jouer deux fois le même jour
        if (existing?.played_date === today) {
            return NextResponse.json(
                { success: false, error: "Vous avez déjà joué aujourd'hui. Revenez demain !" },
                { status: 403 }
            );
        }

        // Empêche deux gains consécutifs
        const canWin = !(existing?.last_result === "win" && is_win);

        // Prépare les nouvelles données
        const now = new Date().toISOString();
        const newData: Partial<RouePlay> = {
            email: cleanEmail,
            played_at: now,
            last_result: canWin && is_win ? "win" : "lose",
            total_wins: existing?.total_wins ?? 0,
            total_losses: existing?.total_losses ?? 0,
        };

        if (canWin && is_win) newData.total_wins! += 1;
        else newData.total_losses! += 1;

        // Mise à jour atomique (évite conflits si deux requêtes arrivent quasi en même temps)
        const { error: upsertError } = await supabaseAdmin
            .from("roue_plays")
            .upsert([newData], { onConflict: "email" });

        if (upsertError) throw upsertError;

        // Si perdu
        if (!canWin || !is_win) {
            return NextResponse.json({
                success: true,
                is_win: false,
                message: "Dommage, réessayez demain !",
            });
        }

        // Si gagné → génération du ticket
        const result = await generateTickets({
            full_name,
            email: cleanEmail,
            quantity: 1,
        });

        return NextResponse.json({
            success: true,
            is_win: true,
            tickets: result.tickets,
            ticketNumbers: result.ticketNumbers,
            accessToken: result.accessToken,
        });
    } catch (err) {
        console.error("Erreur /api/roue:", err);
        const message = err instanceof Error ? err.message : "Erreur serveur inconnue";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
