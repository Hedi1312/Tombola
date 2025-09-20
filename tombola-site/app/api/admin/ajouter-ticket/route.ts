import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";
import { generateTicketImage } from "@/lib/generateTicketImage";
import {supabaseAdmin} from "@/lib/supabaseAdmin";


export async function POST(req: NextRequest) {
    try {
        const { full_name, email, quantity } = await req.json();

        if (!full_name || !email || !quantity || quantity < 1) {
            return NextResponse.json({ success: false, error: "Champs invalides" }, { status: 400 });
        }

        // Générer un token unique pour ce lot
        const accessToken = uuidv4();

        // 🎟️ Générer des tickets uniques à partir d'un pool
        const pool = Array.from({ length: 900000 }, (_, i) => i + 100000); // 100000 → 999999
        pool.sort(() => Math.random() - 0.5); // mélanger aléatoirement
        const ticketNumbers = pool.slice(0, quantity);

        const ticketsToInsert = ticketNumbers.map((num) => ({
            full_name,
            email,
            ticket_number: num,
            access_token: accessToken,
        }));


        // Générer les images
        const attachments = await Promise.all(
            ticketNumbers.map(async (num) => {
                const buffer = await generateTicketImage(String(num).padStart(6, "0"));
                return {
                    filename: `ticket-${num}.png`,
                    content: buffer,
                    contentType: "image/png",
                    cid: `ticket-${num}@tombola` // pour inline
                };
            })
        );



        // Contenu HTML du mail

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding-top: 50px; padding-bottom: 50px;">
                <h1 style="margin-bottom: 40px;">🎟️ Marocola</h1>
                <p style="margin-bottom: 30px; font-size: 18px;">Bonjour <strong>${full_name}</strong> et merci pour votre participation !</p>
                <p style="margin-bottom: 30px; font-size: 18px; font-weight: bold;">Voici vos tickets :</p>
            
                <!-- Table responsive pour les tickets -->
                <table align="center" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin-bottom: 24px;">
                    <tr>
                        ${ticketNumbers.map((num, idx) => `
                        <td align="center" valign="top" style="padding: 8px; width: 50%;">
                            <img src="cid:ticket-${num}@tombola" alt="Ticket ${num}" style="width: 100%; max-width: 288px; height: auto; display: block;" />
                        </td>
                        ${idx % 2 === 1 ? '</tr><tr>' : ''}
                        `).join('')}
                    </tr>
                </table>
                
                <p style="margin-top: 20px; font-size: 18px; ">
                    Vous pouvez aussi consulter vos tickets ici :
                </p>
                <p style="margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_URL}/mes-tickets?token=${accessToken}"
                        style="display: inline-block; background-color: #3498db; color: #fff; padding: 16px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                        Voir mes tickets
                    </a>
                </p>
                <p style="margin-top: 30px; font-size: 18px;">Bonne chance pour le tirage au sort 🍀</p>
            </div>

        `;



        // Envoyer le mail
        try {
            await sendEmail(
                email,
                "🎟️ Vos tickets de tombola",
                htmlContent,
                undefined, // version texte simple si nécessaire
                attachments  // <- ici tu passes tes images générées
            );

        } catch (mailError) {
            console.error("❌ Erreur lors de l'envoi du mail :", mailError);
        }

        const { data, error } = await supabaseAdmin.from("tickets").insert(ticketsToInsert).select("*");

        if (error) throw error;

        return NextResponse.json({ success: true, tickets: data });
    } catch (err: unknown) {
        if (err instanceof Error) {
            return NextResponse.json({ success: false, error: err.message }, { status: 500 });
        }
        return NextResponse.json({ success: false, error: "Erreur inconnue" }, { status: 500 });
    }
}
