import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";


const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { full_name, email, quantity } = await req.json();

        if (!full_name || !email || !quantity || quantity < 1) {
            return NextResponse.json({ success: false, error: "Champs invalides" }, { status: 400 });
        }

        // Générer un token unique pour ce lot
        const accessToken = uuidv4();

        // 🎟️ Générer des tickets uniques à partir d'un pool
        const pool = Array.from({ length: 900000 }, (_, i) => i + 100000); // 100000 → 999999
        pool.sort(() => Math.random() - 0.5); // mélanger aléatoirement
        const ticketNumbers = pool.slice(0, quantity);

        const ticketsToInsert = ticketNumbers.map((num) => ({
            full_name,
            email,
            ticket_number: num,
            access_token: accessToken,
        }));

        const { data, error } = await supabase.from("tickets").insert(ticketsToInsert).select("*");

        if (error) throw error;

        return NextResponse.json({ success: true, tickets: data });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
    }
}
