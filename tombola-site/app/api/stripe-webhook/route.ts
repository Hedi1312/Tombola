import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { generateTickets } from "@/lib/generateTicket";


// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);


export async function POST(req: NextRequest) {

    const sig = req.headers.get("stripe-signature")!;
    const body = await req.text();
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("❌ Webhook signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const email = session.customer_email ?? "";
        const full_name = session.metadata?.full_name ??"";

        const pricePerTicket = 200; // 2€ par ticket
        const quantity = Number(session.metadata?.quantity ?? 0);
        const expectedAmount = quantity * pricePerTicket;
        const accessToken = session.metadata?.accessToken; // <- récupérer le token pré-généré

        if (!email) {
            console.error("❌ Pas d'email dans la session Stripe");
            return NextResponse.json({ error: "Email manquant" }, { status: 400 });
        }

        if (session.amount_total !== expectedAmount) {
            console.error("❌ Le montant payé ne correspond pas à la quantité !");
            return NextResponse.json({ error: "Montant incorrect" }, { status: 400 });
        }


        try {
            await generateTickets({
                full_name,
                email,
                quantity,
                accessToken,
            });

        } catch (err) {
            console.error("❌ Erreur lors de la génération des tickets:", err);
        }
    }

    return NextResponse.json({ received: true });
}