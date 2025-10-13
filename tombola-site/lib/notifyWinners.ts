import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { generateTicketImage } from "@/lib/generateTicketImage";


export async function notifyWinners() {
    const { data: winners, error } = await supabaseAdmin
        .from("winners")
        .select("*")
        .eq("notified", false);

    if (error) {
        throw new Error("Erreur récupération gagnants");
    }

    if (!winners || winners.length === 0) {
        return "no-winners";
    }

    for (const winner of winners) {
        try {
            // Générer les pièces jointes pour les tickets
            const attachments = await Promise.all(
                winner.ticket.split(",").map(async (num: string) => ({
                    filename: `ticket-${num}.png`,
                    content: await generateTicketImage(num.trim()),
                    contentType: "image/png",
                    cid: `ticket-${num}@tombola`,
                }))
            );

            // Construire le contenu HTML complet
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding: 50px 20px;">
                    <table align="center" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 50px;">
                        <tr>
                            <!-- Image du ticket -->
                            <td style="vertical-align: middle;">
                            <img src="${process.env.NEXT_PUBLIC_URL}/img/ticket/ticket.png"
                               alt="Ticket" 
                               width="100" 
                               style="display: block; height: auto;">
                            </td>
                            
                            <!-- Image Marocola -->
                            <td style="padding-left: 10px; vertical-align: middle;">
                            <a href="${process.env.NEXT_PUBLIC_URL}" style="text-decoration: none;">
                            <img src="${process.env.NEXT_PUBLIC_URL}/img/ui/marocola-title.png"
                                 alt="Marocola" 
                                 style="display: block; width: auto; height: 120px;">
                            </a>
                            </td>
                        </tr>
                    </table>

                    <p style="margin-bottom: 50px; font-size: 25px;">
                        Félicitations <strong>${winner.name}</strong> ! 🎉
                    </p>

                    <p style="margin-bottom: 30px; font-size: 18px;">
                        Vous avez remporté la <strong>${winner.rank}ᵉ place</strong> du tirage au sort Marocola ! 🏆
                    </p>

                    <p style="margin-top: 20px; font-size: 18px;">
                        Votre ticket gagnant : <strong>${winner.ticket}</strong>
                    </p>

                    <table align="center" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin-bottom: 24px;">
                        <tr>
                            ${winner.ticket
                .split(",")
                .map(
                    (num: string, idx: number) => `
                                <td align="center" valign="top" style="padding: 8px; width: 50%;">
                                    <img src="cid:ticket-${num}@tombola" alt="Ticket ${num}" style="width: 100%; max-width: 288px; height: auto; display: block;" />
                                </td>
                                ${idx % 2 === 1 ? "</tr><tr>" : ""}
                            `
                )
                .join("")}
                        </tr>
                    </table>

                    <p style="margin-top: 60px;">
                        <a href="${process.env.NEXT_PUBLIC_URL}/resultat" style="display: inline-block; background-color: #3498db; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Voir les résultats complets 🏆
                        </a>
                    </p>

                    <p style="margin-top: 30px; font-size: 18px; color: #555;">
                        Merci pour votre participation et félicitations encore 🍀
                    </p>
                </div>
            `;

            await sendEmail(
                winner.email,
                "🏆 Félicitations — Vous êtes l'un des gagnants du tirage Marocola !",
                htmlContent,
                undefined,
                attachments
            );

            await supabaseAdmin
                .from("winners")
                .update({ notified: true })
                .eq("id", winner.id);

            console.log(`Email envoyé à ${winner.email}`);
        } catch (err) {
            console.error(`Erreur envoi email à ${winner.email} :`, err);
        }
    }

    return winners.length;
}
