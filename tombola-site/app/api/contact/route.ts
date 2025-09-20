import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        const { name, email, message } = await req.json();

        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: "Tous les champs sont requis." }, { status: 400 });
        }

        // Vérifie que la variable d'environnement est définie
        const supportEmail = process.env.GMAIL_USER;
        if (!supportEmail) {
            console.error("❌ GMAIL_USER non défini !");
            return NextResponse.json(
                { success: false, error: "Erreur côté serveur." },
                { status: 500 }
            );
        }


        // Envoyer du mail
        try {
            await sendEmail(
                supportEmail,
                `SUPPORT - Nouveau message de ${name}`,
                `<p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong></p>
                <p>${message}</p>`, // contenu HTML
                undefined,  // version texte (optionnel)
                undefined, // attachments (optionnel)
                email  // replyTo : adresse de l’expéditeur
            );

            return NextResponse.json({ success: true });
        } catch (mailError) {
            console.error("Erreur lors de l'envoi du mail :", mailError);
            return NextResponse.json({ success: false, error: "Impossible d'envoyer le message." }, { status: 500 });
        }

    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}
