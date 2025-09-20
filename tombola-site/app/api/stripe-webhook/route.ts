import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendEmail } from "@/lib/email";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
//import { generateTicketImage } from "@/lib/generateTicketImage";



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
        const email = session.customer_email;
        const full_name = session.metadata?.full_name;
        const amount = session.amount_total || 0;
        const tickets = amount / 200; // 2€ par ticket

        if (!email) {
            console.error("❌ Pas d'email dans la session Stripe");
            return NextResponse.json({ error: "Email manquant" }, { status: 400 });
        }


        // 🎟️ Générer des tickets uniques à 6 chiffres
        const ticketsCount = tickets; // nombre de tickets à générer
        const pool = Array.from({ length: 900000 }, (_, i) => i + 100000);
        pool.sort(() => Math.random() - 0.5);
        const ticketNumbers = pool.slice(0, ticketsCount);


        // Générer un token unique pour cet achat
        const accessToken = session.metadata?.accessToken;


        console.log({
            email,
            full_name: session.metadata?.full_name,
            accessToken,
            tickets
        });

        // Sauvegarder dans Supabase
        const { error } = await supabaseAdmin.from("tickets").insert(
            ticketNumbers.map((num) => ({
                email,
                full_name,
                ticket_number: num,
                access_token: accessToken,
                created_at: new Date().toISOString(),
            }))
        );

        if (error) {
            console.error("Erreur Supabase insert:", error.message);
        }


        // Envoyer le mail
        try {
            await sendEmail(
                email,
                "🎟️ Vos tickets de tombola",
                `
          <h1>Merci ${full_name} pour votre participation !</h1>
          <p>Voici vos tickets :</p>
          <p><strong>${ticketNumbers.join(", ")}</strong></p>
          <p>Vous pouvez aussi consulter vos tickets ici : 
               <a href="${process.env.NEXT_PUBLIC_URL}/mes-tickets?token=${accessToken}">
               Voir mes tickets
               </a>
          </p>
          <p>Bonne chance pour le tirage au sort 🍀</p>
        `
            );
            console.log(`📩 Email envoyé à ${email}`);
        } catch (mailError) {
            console.error("❌ Erreur lors de l'envoi du mail :", mailError);
        }
    }

    return NextResponse.json({ received: true });
}
