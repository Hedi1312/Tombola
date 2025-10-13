import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

export async function notifyParticipants() {
    const { data: participants, error } = await supabaseAdmin
        .from("notifications")
        .select("*")
        .eq("notified", false);

    if (error) {
        console.error("Erreur récupération notifications :", error);
        return;
    }

    const batchSize = 20;

    for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize);

        // Créer toutes les promesses d'envoi pour ce batch
        const sendPromises = batch.map(async (participant) => {
            try {
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
                            Bonjour <strong>${participant.full_name}</strong>,
                        </p>
                        <p style="margin-bottom: 30px; font-size: 18px;">
                            Les gagnants du tirage viennent d'être tirés ! 🎉
                        </p>
                        
                        <p style="margin-top: 20px; font-size: 18px;">
                            Découvrez la liste des gagnants ici :
                        </p>
                        <p style="margin-top: 60px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}/resultat"
                            style="display: inline-block; background-color: #3498db; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            🏆 Voir les résultats
                            </a>
                        </p>
                        
                        <p style="margin-top: 40px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}/api/notifications?token=${participant.access_token}"
                            style="display: inline-block; background-color: #e74c3c; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            ✖️ Se désinscrire
                            </a>
                        </p>
                        
                        <p style="margin-top: 40px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}"
                            style="display: inline-block; background-color: #2ecc71; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                            🌐 Aller sur le site Marocola
                            </a>
                        </p>
                        
                        <p style="margin-top: 30px; font-size: 18px; color: #555;">
                            Merci pour votre participation et à bientôt 🍀
                        </p>
                    </div>
                `;

                await sendEmail(participant.email, "🎉 Résultats du tirage au sort !", htmlContent);

                await supabaseAdmin
                    .from("notifications")
                    .update({ notified: true })
                    .eq("id", participant.id);
            } catch (err) {
                console.error("Erreur envoi email à", participant.email, err);
            }
        });

        // Exécuter toutes les promesses du batch en parallèle
        await Promise.all(sendPromises);
    }
}
