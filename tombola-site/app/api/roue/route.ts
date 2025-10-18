import { NextRequest, NextResponse } from "next/server";
import { generateTickets } from "@/lib/generateTicket";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const { full_name, email, is_win } = await req.json();

        if (!full_name || !email) {
            return NextResponse.json(
                { success: false, error: "Nom complet et email obligatoires" },
                { status: 400 }
            );
        }

        // 🔹 Vérification : a-t-il déjà joué aujourd'hui ?
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const { data: existingPlay } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", email)
            .gte("played_at", todayStart.toISOString())
            .lte("played_at", todayEnd.toISOString())
            .maybeSingle();

        if (existingPlay) {
            return NextResponse.json(
                { success: false, error: "Vous avez déjà joué aujourd'hui. Revenez demain !" },
                { status: 403 }
            );
        }

        // 🔹 Vérification : a-t-il gagné hier ?
        const yesterdayStart = new Date();
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        yesterdayStart.setHours(0, 0, 0, 0);

        const yesterdayEnd = new Date();
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
        yesterdayEnd.setHours(23, 59, 59, 999);

        const { data: yesterdayWin } = await supabaseAdmin
            .from("roue_plays")
            .select("*")
            .eq("email", email)
            .eq("is_win", true)
            .gte("played_at", yesterdayStart.toISOString())
            .lte("played_at", yesterdayEnd.toISOString())
            .maybeSingle();

        if (yesterdayWin && is_win) {
            // Il a gagné hier et retente une victoire → forcer perte
            return NextResponse.json({
                success: false,
                error: "Pas de double gain consécutif 😉 Vous pourrez rejouer demain !",
            });
        }

        //  Enregistre le tirage (qu’il gagne ou non)
        const { error: insertError } = await supabaseAdmin
            .from("roue_plays")
            .insert([{ email, is_win }]);

        if (insertError) throw insertError;

        // 🔹 Si perte → on ne génère rien
        if (!is_win) {
            return NextResponse.json({
                success: true,
                message: "Perdu, réessayez demain !",
                is_win: false,
            });
        }

        // 🔹 Génération du ticket (gain)
        const result = await generateTickets({
            full_name,
            email,
            quantity: 1,
        });

        return NextResponse.json({
            success: true,
            is_win: true,
            tickets: result.tickets,
            ticketNumbers: result.ticketNumbers,
            accessToken: result.accessToken,
        });
    } catch (err: unknown) {
        console.error("Erreur roue:", err);
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
    }
}
