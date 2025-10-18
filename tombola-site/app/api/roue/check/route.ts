import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { canPlay: false, message: "Adresse mail requise" },
                { status: 400 }
            );
        }

        // 🔹 Vérifie s’il a déjà joué aujourd’hui
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: todayPlay } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", email)
            .gte("played_at", todayStart.toISOString())
            .lte("played_at", todayEnd.toISOString())
            .maybeSingle();

        if (todayPlay) {
            return NextResponse.json({
                canPlay: false,
                message: "Vous avez déjà joué aujourd'hui. Revenez demain !",
            });
        }

        // 🔹 Vérifie s’il a gagné hier
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        const { data: yesterdayWin } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", email)
            .eq("is_win", true)
            .gte("played_at", yesterdayStart.toISOString())
            .lte("played_at", yesterdayEnd.toISOString())
            .maybeSingle();

        if (yesterdayWin) {
            return NextResponse.json({
                canPlay: false,
                message: "Vous avez gagné hier 🎉 Attendez demain pour rejouer.",
            });
        }

        // ✅ Sinon, il peut jouer
        return NextResponse.json({ canPlay: true });
    } catch (err) {
        console.error("Erreur /api/roue/check:", err);
        return NextResponse.json(
            { canPlay: false, message: "Erreur serveur. Réessayez plus tard." },
            { status: 500 }
        );
    }
}
