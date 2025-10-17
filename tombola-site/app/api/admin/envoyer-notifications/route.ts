import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notifyParticipants } from "@/lib/notifyParticipants";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("notifications")
            .select("id, full_name, email, notified, access_token");

        if (error) {
            throw new Error(error.message);
        }
        // 🔥 Trier ici : ceux non notifiés (false) en premier
        const sorted = (data ?? []).sort((a, b) => Number(a.notified) - Number(b.notified));

        return NextResponse.json({ success: true, participants: sorted });
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "Erreur inconnue côté serveur";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}

export async function POST() {
    try {
        await notifyParticipants();
        return NextResponse.json({
            success: true,
            message: "✅ Participants notifiés avec succès !",
        });
    } catch (err) {
        const errorMessage =
            err instanceof Error ? err.message : "Erreur inconnue lors de l'envoi";
        return NextResponse.json(
            { success: false, error: errorMessage },
            { status: 500 }
        );
    }
}
