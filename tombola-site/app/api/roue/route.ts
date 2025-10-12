import { NextRequest, NextResponse } from "next/server";
import { generateTickets } from "@/lib/generateTicket";

export async function POST(req: NextRequest) {
    try {
        const { full_name, email } = await req.json();

        if (!full_name || !email) {
            return NextResponse.json({ success: false, error: "Nom complet et email obligatoires" }, { status: 400 });
        }

        // On fixe la quantité à 1 puisque c’est 1 ticket par gain
        const result = await generateTickets({
            full_name,
            email,
            quantity: 1,
        });

        return NextResponse.json({
            success: true,
            tickets: result.tickets,
            ticketNumbers: result.ticketNumbers,
            accessToken: result.accessToken,
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
    }
}
