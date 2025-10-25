import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";


export async function GET() {
    try {
        // Récupérer la date du tirage
        const { data: drawDateData, error: drawDateError } = await supabaseAdmin
            .from("draw_date")
            .select("draw_date")
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (drawDateError) throw drawDateError;

        // Récupérer les gagnants triés par rank
        const { data: winnersData, error: winnersError } = await supabaseAdmin
            .from("winners")
            .select("name, ticket, rank")
            .order("rank", { ascending: true });

        if (winnersError) throw winnersError;

        return NextResponse.json({
            success: true,
            drawDate: drawDateData?.draw_date || null,
            winners: winnersData || [],
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
