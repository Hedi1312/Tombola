import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // attention : clé sécurisée côté serveur
);

export async function GET() {
    try {
        // Récupérer la date du tirage
        const { data: drawDateData, error: drawDateError } = await supabase
            .from("draw_date")
            .select("draw_date")
            .order("id", { ascending: false })
            .limit(1)
            .single();

        if (drawDateError) throw drawDateError;

        // Récupérer les gagnants triés par rank
        const { data: winnersData, error: winnersError } = await supabase
            .from("winners")
            .select("name, ticket, rank")
            .order("rank", { ascending: true });

        if (winnersError) throw winnersError;

        return NextResponse.json({
            success: true,
            drawDate: drawDateData?.draw_date || null,
            winners: winnersData || [],
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
