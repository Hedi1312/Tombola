import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const { tickets } = await req.json();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: { name: "Ticket de tombola 🎟️" },
                        unit_amount: 500, // 5€ par ticket
                    },
                    quantity: tickets,
                },
            ],
            mode: "payment",
            success_url: `${process.env.NEXT_PUBLIC_URL}/mes-tickets/123`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/acheter`,
        });

        return NextResponse.json({ id: session.id });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Erreur Stripe :", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
    }

}
