import { NextRequest, NextResponse } from "next/server";
import { generateTickets } from "@/lib/generateTicket";
import { supabaseAdmin } from "@/lib/supabaseAdmin";



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
            return NextResponse.json({ success: false, error: "Email obligatoire" }, { status: 400 });
        }

        const cleanEmail = normalizeEmail(email);
        const today = new Date().toISOString().slice(0, 10);

        // 🔹 Récupère le joueur existant
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (fetchError) throw fetchError;

        let canWin = is_win;
        let totalWins = existing?.total_wins ?? 0;
        let totalLosses = existing?.total_losses ?? 0;

        // 🕒 Empêche de jouer deux fois le même jour
        if (existing?.played_date === today) {
            return NextResponse.json(
                { success: false, error: "Vous avez déjà joué aujourd'hui. Revenez demain !" },
                { status: 403 }
            );
        }

        // 🚫 Empêche deux gains consécutifs
        if (existing?.last_result === "win" && is_win) {
            canWin = false;
        }

        // 🔹 Mise à jour des stats
        const now = new Date().toISOString();
        const newData: Partial<RouePlay> = {
            email: cleanEmail,
            played_at: now,
            last_result: canWin ? "win" : "lose",
        };

        if (canWin) {
            totalWins += 1;
            newData.total_wins = totalWins;
        } else {
            totalLosses += 1;
            newData.total_losses = totalLosses;
        }

        // 🔹 Upsert (une seule ligne par joueur)
        const { error: upsertError } = await supabaseAdmin
            .from("roue_plays")
            .upsert([newData], { onConflict: "email" });

        if (upsertError) throw upsertError;

        // 🔹 Si perdu
        if (!canWin) {
            return NextResponse.json({
                success: true,
                is_win: false,
                message: "Dommage, réessayez demain !",
            });
        }

        // 🔹 Si gagné
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
