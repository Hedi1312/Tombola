import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/src/lib/email";

export async function POST(req: NextRequest) {
    try {
        // Utilisation de formData (et non JSON)
        const formData = await req.formData();
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const message = formData.get("message") as string;
        const file = formData.get("file") as File | null;
        const subject = formData.get("subject") as string;
        const tickets = formData.get("tickets") as string | null;
        const otherSubject = formData.get("otherSubject") as string | null;


        // Validation champs
        if (!name || !email || !message || !subject) {
            return NextResponse.json({ success: false, error: "Tous les champs sont requis." }, { status: 400 });
        }

        // Validation spécifique selon le sujet
        if (subject === "Achat de ticket" && !tickets) {
            return NextResponse.json({ success: false, error: "Veuillez indiquer le nombre de tickets." }, { status: 400 });
        }

        if (subject === "Autre" && !otherSubject) {
            return NextResponse.json({ success: false, error: "Veuillez préciser le sujet." }, { status: 400 });
        }




        const supportEmail = process.env.GMAIL_USER;
        if (!supportEmail) {
            console.error("❌ GMAIL_USER non défini !");
            return NextResponse.json(
                { success: false, error: "Erreur côté serveur." },
                { status: 500 }
            );
        }


        let emailSubject = "";
        let emailContent = `
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
        `;

        if (subject === "Achat de ticket") {
            emailSubject = "Achat de ticket";
            emailContent += `<p><strong>Sujet :</strong> Achat de ticket</p>
                     <p><strong>Nombre de tickets :</strong> ${tickets}</p>`;
        } else {
            emailSubject = "Autre";
            emailContent += `<p><strong>Sujet :</strong> Autre</p>
                     <p><strong>Précision :</strong> ${otherSubject}</p>`;
        }

        emailContent += `<p><strong>Message :</strong></p>
                 <p>${message}</p>`;


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

        let emailTitle = emailSubject;
        if (subject === "Autre" && otherSubject) {
            emailTitle += ` - ${otherSubject}`;
        }

        // Envoi de l'email
        try {
            await sendEmail(
                supportEmail,
                `SUPPORT - ${emailTitle}`,
                emailContent,
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
