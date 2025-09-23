import { NextResponse } from "next/server";

// Exemple pour Supabase, adapte si tu utilises autre chose
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Vérifier l'événement (optionnel : pour plus de sécurité, tu peux valider la signature)
        // const webhookId = process.env.PAYPAL_WEBHOOK_ID;
        // valider la signature avec PayPal SDK ou API REST si nécessaire

        const eventType = body.event_type;

        if (eventType === "CHECKOUT.ORDER.APPROVED" || eventType === "PAYMENT.CAPTURE.COMPLETED") {
            const orderID = body.resource.id;
            const payerEmail = body.resource.payer?.email_address || null;
            const amount = body.resource.purchase_units?.[0]?.amount?.value || null;

            // Exemple : ajouter le paiement dans Supabase
            const { error } = await supabase.from("tickets").insert({
                order_id: orderID,
                email: payerEmail,
                amount: amount,
                payment_provider: "paypal",
                status: "paid",
                created_at: new Date().toISOString(),
            });

            if (error) {
                console.error("Erreur enregistrement PayPal :", error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            console.log("Paiement PayPal enregistré :", orderID);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("Erreur webhook PayPal :", err);
        return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
    }
}
