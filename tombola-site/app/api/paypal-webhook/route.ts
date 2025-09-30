import { NextResponse } from "next/server";
import { generateTickets } from "@/lib/generateTicket";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const eventType = body.event_type;

        if (eventType === "PAYMENT.CAPTURE.COMPLETED") {
            // Récupérer l'order ID lié à la capture
            const orderID = body.resource.supplementary_data?.related_ids?.order_id;
            if (!orderID) {
                console.error("❌ Pas d'order_id dans la capture PayPal");
                return NextResponse.json({ received: true });
            }

            // 🔹 Récupérer le token d'accès PayPal côté serveur
            const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString("base64");
            const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
                method: "POST",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: "grant_type=client_credentials",
            });
            const tokenData = await tokenRes.json();
            const accessTokenPaypal = tokenData.access_token;
            if (!accessTokenPaypal) {
                console.error("❌ Impossible d'obtenir le token PayPal");
                return NextResponse.json({ received: true });
            }

            // 🔹 Récupérer les détails de l'ordre pour récupérer custom_id + description
            const orderRes = await fetch(`https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessTokenPaypal}`,
                    "Content-Type": "application/json",
                },
            });

            const orderData = await orderRes.json();
            const purchaseUnit = orderData.purchase_units?.[0];
            if (!purchaseUnit) {
                console.error("❌ Pas de purchase_unit dans l'ordre PayPal");
                return NextResponse.json({ received: true });
            }

            const accessToken = purchaseUnit.custom_id;
            const description = purchaseUnit.description || "";
            const [full_name, email, ticketsStr] = description.split("|");
            const tickets = Number(ticketsStr);

            if (!accessToken || !email || !full_name || !tickets) {
                console.error("❌ Données manquantes dans description ou custom_id");
                return NextResponse.json({ received: true });
            }

            try {
                await generateTickets({
                    email,
                    full_name,
                    quantity: tickets,
                    accessToken,
                });
            } catch (err) {
                console.error("❌ Erreur lors de la génération des tickets:", err);
                return NextResponse.json({ error: "Erreur tickets" }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error("❌ Erreur webhook PayPal :", err);
        return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
    }
}
