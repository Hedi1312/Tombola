import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("roue_plays")
            .select("id, email, total_wins, total_losses, last_result, played_at")
            .order("played_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({
            success: true,
            participants: data || [],
        });
    } catch (err) {
        console.error("Erreur /api/admin/roue-participants :", err);
        return NextResponse.json(
            { success: false, error: "Erreur lors de la récupération des participants." },
            { status: 500 }
        );
    }
}
