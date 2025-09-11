import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const { tickets, email, fullName } = await req.json();

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "eur",
                        product_data: { name: "Ticket de tombola 🎟️" },
                        unit_amount: 200, // 2€ par ticket
                    },
                    quantity: tickets,
                },
            ],
            mode: "payment",
            customer_email: email,
            metadata: {
                fullName, // 🔹 stocké dans Stripe pour récupérer dans le webhook
            },
            success_url: `${process.env.NEXT_PUBLIC_URL}/mes-tickets`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/acheter`,
        });

        return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error("Erreur Stripe :", err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
        return NextResponse.json({ error: "Erreur inconnue" }, { status: 500 });
    }
}
