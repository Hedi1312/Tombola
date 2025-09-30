import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
    try {
        const { tickets: requestedTickets, email, full_name } = await req.json();
        const tickets = Math.min(Math.max(requestedTickets, 1), 100); // 1 ≤ tickets ≤ 100


        // 🔹 Générer un token unique pour associer le paiement
        const accessToken = uuidv4();

        // 1️⃣ Créer le token d'accès PayPal
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
            return NextResponse.json({ error: "Impossible d'obtenir le token PayPal" }, { status: 500 });
        }

        // 2️⃣ Créer l'ordre PayPal
        const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: { Authorization: `Bearer ${accessTokenPaypal}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: { currency_code: "EUR", value: (tickets * 2).toString() },
                        custom_id: accessToken, // juste le token
                        description: `${full_name}|${email}|${tickets}`, // séparés par un pipe
                    },
                ],
            }),
        });

        const orderData = await orderRes.json();

        return NextResponse.json({ orderID: orderData.id, accessToken });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création de l'ordre PayPal" }, { status: 500 });
    }
}
