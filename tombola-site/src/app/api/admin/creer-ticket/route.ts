import { NextRequest, NextResponse } from "next/server";
import { generateTickets } from "@/src/lib/generateTicket";


export async function POST(req: NextRequest) {
    try {
        const { full_name, email, quantity } = await req.json();

        if (!full_name || !email || !quantity || quantity < 1) {
            return NextResponse.json({ success: false, error: "Champs invalides" }, { status: 400 });
        }

        const result = await generateTickets({
            full_name,
            email,
            quantity,
        });

        return NextResponse.json({
            success: true,
            tickets: result.tickets,
            accessToken: result.accessToken, // ← garanti d’être le token généré
        });

    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
    }
}
