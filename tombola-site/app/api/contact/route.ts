import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
    try {
        // Utilisation de formData (et non JSON)
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;
        const file = formData.get("file") as File | null;

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json({ success: false, error: "Tous les champs sont requis." }, { status: 400 });
        }

        const supportEmail = process.env.GMAIL_USER;
        if (!supportEmail) {
            console.error("❌ GMAIL_USER non défini !");
            return NextResponse.json(
                { success: false, error: "Erreur côté serveur." },
                { status: 500 }
            );
        }

        // Préparation des pièces jointes
        const attachments = [];
        if (file) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            attachments.push({
                filename: file.name,
                content: buffer,
            });
        }

        // Envoi de l'email
        try {
            await sendEmail(
                supportEmail,
                `SUPPORT - Nouveau message de ${name}`,
                `<p><strong>Nom :</strong> ${name}</p>
                <p><strong>Email :</strong> ${email}</p>
                <p><strong>Message :</strong></p>
                <p>${message}</p>`,
                undefined,
                attachments,
                email
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
