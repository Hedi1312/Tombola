import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";


// Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Supabase
import { supabaseAdmin } from "../../../lib/supabaseAdmin";


// Mail (Mailtrap / SMTP)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

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
        const email = session.customer_email;
        const fullName = session.metadata?.full_name;
        const amount = session.amount_total || 0;
        const tickets = amount / 200; // 2€ par ticket

        if (!email) {
            console.error("❌ Pas d'email dans la session Stripe");
            return NextResponse.json({ error: "Email manquant" }, { status: 400 });
        }

        // 🎟️ Générer des tickets aléatoires
        const ticketNumbers = Array.from({ length: tickets }, () =>
            Math.floor(100000 + Math.random() * 900000) // 6 chiffres
        );

        // Générer un token unique pour cet achat
        const accessToken = session.metadata?.accessToken;



        // Sauvegarder dans Supabase
        const { error } = await supabaseAdmin.from("tickets").insert(
            ticketNumbers.map((num) => ({
                email,
                fullName,
                ticket_number: num,
                access_token: accessToken,
                created_at: new Date().toISOString(),
            }))
        );


        // Envoyer le mail
        try {
            await transporter.sendMail({
                from: `"Tombola Projet" <${process.env.SMTP_USER}>`,
                to: email,
                subject: "🎟️ Vos tickets de tombola",
                html: `
          <h1>Merci ${fullName} pour votre participation !</h1>
          <p>Voici vos tickets :</p>
          <p><strong>${ticketNumbers.join(", ")}</strong></p>
          <p>Vous pouvez aussi consulter vos billets ici : 
               <a href="${process.env.NEXT_PUBLIC_URL}/mes-billets?token=${accessToken}">
               Voir mes billets
               </a>
            </p>
          <p>Bonne chance pour le tirage au sort 🍀</p>
        `,
            });
            console.log(`📩 Email envoyé à ${email}`);
        } catch (mailError) {
            console.error("❌ Erreur lors de l'envoi du mail :", mailError);
        }
    }

    return NextResponse.json({ received: true });
}
