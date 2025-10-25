import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";


interface DrawDateRow {
    id: number;
    draw_date: string;
}

// GET → récupérer la date
export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("draw_date")
        .select("draw_date")
        .order("id", { ascending: false })
        .limit(1);

    if (error) {
        return NextResponse.json({ success: false, error: error.message });
    }

    const drawData = data as DrawDateRow[] | null;

    return NextResponse.json({
        success: true,
        drawDate: drawData?.[0]?.draw_date || null,
    });
}

// POST → insérer OU mettre à jour la date
export async function POST(req: NextRequest) {
    try {
        const { newDate } = await req.json();

        if (!newDate) {
            return NextResponse.json({ success: false, error: "Nouvelle date manquante" });
        }

        // Vérifier si une date existe déjà
        const { data: existing, error: fetchError } = await supabaseAdmin
            .from("draw_date")
            .select("id")
            .order("id", { ascending: false })
            .limit(1);

        if (fetchError) {
            return NextResponse.json({ success: false, error: fetchError.message });
        }

        let drawData: DrawDateRow[] | null = null;

        if (existing && existing.length > 0) {
            // ⚡ Update la date existante
            const { data, error } = await supabaseAdmin
                .from("draw_date")
                .update({ draw_date: newDate })
                .eq("id", existing[0].id)
                .select("draw_date");

            if (error) {
                return NextResponse.json({ success: false, error: error.message });
            }

            drawData = data as DrawDateRow[] | null;
        } else {
            // ⚡ Insérer une nouvelle date
            const { data, error } = await supabaseAdmin
                .from("draw_date")
                .insert({ draw_date: newDate })
                .select("draw_date");

            if (error) {
                return NextResponse.json({ success: false, error: error.message });
            }

            drawData = data as DrawDateRow[] | null;
        }

        return NextResponse.json({
            success: true,
            drawDate: drawData?.[0]?.draw_date || null,
        });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage });
    }
}
