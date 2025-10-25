import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

// GET -> retourne { success: true, value: number } (decimal)
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("settings")
            .select("value")
            .eq("key", "win_probability")
            .single();

        if (error) {
            // si pas trouvé, retourner 0 par défaut
            return NextResponse.json({ success: false, error: error.message ?? "DB error" }, { status: 500 });
        }

        // value peut être stocké en string ou numeric; cast en number
        const raw = data?.value;
        const num = typeof raw === "string" ? parseFloat(raw) : Number(raw);
        return NextResponse.json({ success: true, value: isNaN(num) ? 0 : num });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}

// POST -> body { value: number } (decimal between 0 and 1)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const value = Number(body?.value);

        if (typeof value !== "number" || Number.isNaN(value) || value < 0 || value > 1) {
            return NextResponse.json({ success: false, error: "Valeur invalide (doit être entre 0 et 1)" }, { status: 400 });
        }

        // upsert into settings table
        const { error } = await supabaseAdmin.from("settings").upsert({ key: "win_probability", value: value });

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
