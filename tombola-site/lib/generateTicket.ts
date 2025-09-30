import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "@/lib/email";
import { generateTicketImage } from "@/lib/generateTicketImage";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GenerateTicketInput = {
    full_name: string;
    email: string;
    quantity: number;
    accessToken?: string;
};

export async function generateTickets({ full_name, email, quantity, accessToken }: GenerateTicketInput) {
    if (!full_name || !email || !quantity || quantity < 1) {
        throw new Error("Champs invalides");
    }


    const token = accessToken ?? uuidv4();


    // Étape 1 : récupérer les tickets via la fonction RPC sécurisée
    const { data: ticketRows, error } = await supabaseAdmin
        .rpc("get_and_mark_tickets", { quantity });

    if (error) throw error;
    if (!ticketRows || ticketRows.length < quantity) {
        throw new Error("Pas assez de tickets disponibles");
    }

    // Étape 2 : Extraire uniquement les numéros de ticket depuis les lignes récupérées
    const ticketNumbers: string[] = ticketRows.map((r: { ticket_number: string }) => r.ticket_number);



    // Étape 3 : Insérer dans la table tickets
    const { data: insertedTickets, error: insertError } = await supabaseAdmin
        .from("tickets")
        .insert(
            ticketNumbers.map(num => ({
                full_name,
                email,
                ticket_number: num,
                access_token: token,
            }))
        )
        .select("*");

    if (insertError) throw insertError;


    // ✅ Étape 4 : lancer la génération d'images et l'envoi des emails en arrière-plan
    setImmediate(async () => {
        try {
            const allAttachments = await Promise.all(
                ticketNumbers.map(async (num: string) => {
                    const buffer = await generateTicketImage(num);
                    return {
                        filename: `ticket-${num}.png`,
                        content: buffer,
                        contentType: "image/png",
                        cid: `ticket-${num}@tombola`,
                    };
                })
            );

            const batchSize = 50;
            for (let i = 0; i < ticketNumbers.length; i += batchSize) {
                const batchTickets = ticketNumbers.slice(i, i + batchSize);
                const batchAttachments = allAttachments.slice(i, i + batchSize);
                // Construire le contenu HTML
                const htmlContent = `
                    <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding-top: 50px; padding-bottom: 50px;">
                        <h1 style="margin-bottom: 40px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}" 
                            style="text-decoration: none; color: #000;">
                            🎟️ Marocola
                            </a>
                        </h1>
                        <p style="margin-bottom: 30px; font-size: 18px;">Bonjour <strong>${full_name}</strong> et merci pour votre participation !</p>
                        <p style="margin-bottom: 30px; font-size: 18px; font-weight: bold;">Voici vos tickets : ${batchTickets.length}</p>
                    
                        <!-- Table responsive pour les tickets -->
                        <table align="center" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin-bottom: 24px;">
                            <tr>
                                ${batchTickets.map((num, idx) => `
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
                            <a href="${process.env.NEXT_PUBLIC_URL}/mes-tickets?token=${token}"
                                style="display: inline-block; background-color: #3498db; color: #fff; padding: 16px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                                Voir tous mes tickets
                            </a>
                        </p>
                        
                        <p style="margin-top: 40px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}"
                            style="display: inline-block; background-color: #2ecc71; color: #fff; padding: 16px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                            🌐 Aller sur le site Marocola
                            </a>
                        </p>
                        <p style="margin-top: 30px; font-size: 18px;">Bonne chance pour le tirage au sort 🍀</p>
                    </div>
                `;
                await sendEmail(email, "🎟️ Vos tickets de tombola", htmlContent, undefined, batchAttachments)
                    .catch(err => console.error("❌ Erreur lors de l'envoi du mail :", err));
            }

        } catch (err) {
            console.error("Erreur génération/envoi des emails :", err);
        }
    });

    // ✅ Retour immédiat au client
    return { ticketNumbers, accessToken: token, tickets: insertedTickets };
}
