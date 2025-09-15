import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface WinnerRow {
    id: number;
    name: string;
    ticket: number;
    rank: number;
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

        // On supprime tous les anciens gagnants
        await supabase.from("winners").delete().neq("id", 0);

        // On insère les nouveaux gagnants avec le rang correspondant
        const newWinners: Omit<WinnerRow, "id">[] = winners.map(
            (w: { name: string; ticket: string | number }, index: number) => ({
                name: w.name || "",
                ticket: Number(w.ticket) || 0,
                rank: index + 1,
            })
        );
        const { data, error } = await supabase.from("winners").insert(newWinners).select("*");

        if (error) return NextResponse.json({ success: false, error: error.message });

        return NextResponse.json({ success: true, winners: data });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
