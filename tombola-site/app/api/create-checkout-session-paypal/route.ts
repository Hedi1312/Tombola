import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();

        // 1️⃣ Créer le token d'accès
        const auth = Buffer.from(
            `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`
        ).toString("base64");

        const tokenRes = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        if (!accessToken) {
            return NextResponse.json({ error: "Impossible d'obtenir le token PayPal" }, { status: 500 });
        }

        // 2️⃣ Créer l'ordre
        const orderRes = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [
                    {
                        amount: {
                            currency_code: "EUR",
                            value: amount.toString(),
                        },
                    },
                ],
            }),
        });

        const orderData = await orderRes.json();

        return NextResponse.json({ orderID: orderData.id });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erreur lors de la création de l'ordre PayPal" }, { status: 500 });
    }
}
