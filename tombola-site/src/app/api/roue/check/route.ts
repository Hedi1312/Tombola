import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// 🧩 Fonction de normalisation serveur
function normalizeEmail(email: string): string {
    const trimmed = email.trim().toLowerCase();
    const [local, domain] = trimmed.split("@");

    if (!local || !domain) return trimmed;

    // Supprime le +quelquechose uniquement pour Gmail et Googlemail
    const cleanLocal =
        domain === "gmail.com" || domain === "googlemail.com"
            ? local.split("+")[0]
            : local;

    return `${cleanLocal}@${domain}`;
}

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { canPlay: false, message: "Adresse mail requise" },
                { status: 400 }
            );
        }

        const todayParis = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Paris',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());


        // Normalisation
        const cleanEmail = normalizeEmail(email);
        const today = todayParis;

        // Récupère les infos du joueur (une seule ligne par email)
        const { data: player, error } = await supabaseAdmin
            .from("roue_plays")
            .select("played_date, last_result")
            .eq("email", cleanEmail)
            .maybeSingle();

        if (error) throw error;

        // Récupère la probabilité de gain une seule fois
        const { data: prob } = await supabaseAdmin
            .from("settings")
            .select("value")
            .eq("key", "win_probability")
            .maybeSingle();

        const winProbability = Number(prob?.value ?? 0.1);


        // Cas 1 : jamais joué → peut jouer et potentiellement gagner
        if (!player) {
            const willWin = Math.random() < winProbability;
            return NextResponse.json({ canPlay: true, canWin: willWin });
        }

        // Cas 2 : déjà joué aujourd’hui → interdit
        if (player.played_date === today) {
            return NextResponse.json({
                canPlay: false,
                message: "Vous avez déjà joué aujourd'hui. Revenez demain !",
            });
        }

        // Cas 3 : il a gagné la dernière fois → doit perdre avant de regagner
        if (player.last_result === "win") {
            return NextResponse.json({ canPlay: true, canWin: false });
        }

        // Sinon il peut jouer et potentiellement gagner
        const willWin = Math.random() < winProbability;
        return NextResponse.json({ canPlay: true, canWin: willWin });
    } catch (err) {
        console.error("Erreur /api/roue/check:", err);
        return NextResponse.json(
            { canPlay: false, message: "Erreur serveur. Réessayez plus tard." },
            { status: 500 }
        );
    }
}
