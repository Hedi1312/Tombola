import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface Params {
    id: string;
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<Params> }
) {
    const { id } = await context.params;

    try {
        // On recule la date d'une journée (UTC)
        const newPlayedAt = new Date(Date.now() - 86400000).toISOString();

        // 🔹 Mise à jour simple : recule seulement la date
        const { data, error } = await supabaseAdmin
            .from("roue_plays")
            .update({ played_at: newPlayedAt })
            .eq("id", Number(id))
            .select();

        if (error) {
            console.error("Erreur reset roue_plays:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json({
                success: false,
                message: "Participation introuvable.",
            });
        }

        return NextResponse.json({
            success: true,
            message: "Participation réinitialisée : le joueur peut rejouer aujourd'hui.",
        });
    } catch (err) {
        console.error("Erreur PATCH roue_plays:", err);
        const message =
            err instanceof Error ? err.message : "Erreur serveur inconnue";
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
