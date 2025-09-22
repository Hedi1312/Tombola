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
        const amount = session.amount_total || 0;
        const quantity = amount / 200; // 2€ par ticket

        if (!email) {
            console.error("❌ Pas d'email dans la session Stripe");
            return NextResponse.json({ error: "Email manquant" }, { status: 400 });
        }


        try {
            const result = await generateTickets({
                full_name,
                email,
                quantity,
            });

            console.log(`✅ Tickets générés pour ${email}`, result.ticketNumbers);
        } catch (err) {
            console.error("❌ Erreur lors de la génération des tickets:", err);
        }
    }

    return NextResponse.json({ received: true });
}
