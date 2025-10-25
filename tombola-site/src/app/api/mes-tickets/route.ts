import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
    try {
        const token = req.nextUrl.searchParams.get("token");

        if (!token) {
            return NextResponse.json({ success: false, error: "Token manquant" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("tickets")
            .select("id, ticket_number, full_name, created_at")
            .eq("access_token", token)
            .order("id", { ascending: true });

        if (error) {
            console.error("Erreur Supabase:", error);
            return NextResponse.json({ success: false, error: "Veuillez utiliser l'URL reçu par mail." }, { status: 500 });
        }

        if (!data || data.length === 0) {
            return NextResponse.json({ success: false, error: "Vous n'avez aucun tickets." }, { status: 404 });
        }

        return NextResponse.json({ success: true, tickets: data });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error("Erreur inconnue:", errorMessage);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
