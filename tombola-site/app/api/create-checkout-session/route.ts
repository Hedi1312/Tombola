import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { v4 as uuidv4 } from "uuid"; // 🔹 importer uuid

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    const { tickets, email, full_name, lang } = await req.json();

    // 🔹 Générer le token unique avant Stripe
    const accessToken = uuidv4();
    let successUrl = "";
    let cancelUrl = "";

    if (lang === "fr") {
        successUrl = `${process.env.NEXT_PUBLIC_URL}/fr/mes-tickets?token=${accessToken}`;
        cancelUrl = `${process.env.NEXT_PUBLIC_URL}/fr/acheter`;
    } else if (lang === "en") {
        successUrl = `${process.env.NEXT_PUBLIC_URL}/en/buy?token=${accessToken}`;
        cancelUrl = `${process.env.NEXT_PUBLIC_URL}/en/buy`;
    }


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
                full_name,
                accessToken, // 🔹 stocker le token pour le webhook
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
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
