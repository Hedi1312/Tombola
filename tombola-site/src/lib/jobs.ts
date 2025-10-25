import { supabaseAdmin } from "@/src/lib/supabaseAdmin";
import { sendEmail } from "@/src/lib/email";
import { generateTicketImage } from "@/src/lib/generateTicketImage";

const MAX_RETRIES = 5;

export async function processEmailJobs() {
    const { data: jobs, error } = await supabaseAdmin.rpc("fetch_and_mark_email_jobs", { batch: 10 });
    if (error) throw new Error(error.message);
    if (!jobs || jobs.length === 0) return 0;

    for (const job of jobs) {
        const { id, full_name, email, access_token, ticket_numbers, retries } = job;
        try {
            const attachments = await Promise.all(
                ticket_numbers.map(async (num: string) => ({
                    filename: `ticket-${num}.png`,
                    content: await generateTicketImage(num),
                    contentType: "image/png",
                    cid: `ticket-${num}@tombola`,
                }))
            );

            // Construire le contenu HTML
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
                        Bonjour <strong>${full_name}</strong> et merci pour votre participation !
                    </p>
                    <p style="margin-bottom: 30px; font-size: 18px; font-weight: bold;">
                        Voici vos tickets : ${ticket_numbers.length}
                    </p>
        
                    <table align="center" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin-bottom: 24px;">
                        <tr>
                          ${ticket_numbers
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
        
                      <p style="margin-top: 60px; font-size: 18px;">Vous pouvez aussi consulter vos tickets ici :</p>
                      <p style="margin-top: 40px;">
                        <a href="${process.env.NEXT_PUBLIC_URL}/mes-tickets?token=${access_token}"
                           style="display: inline-block; background-color: #3498db; color: #fff; padding: 16px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px;">
                          🎟️ Voir tous mes tickets
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


            console.log(`Envoi email à ${email} avec ${ticket_numbers.length} tickets`);


            try {
                await sendEmail(email, "🎟️ Vos tickets de tombola", htmlContent, undefined, attachments);
            } catch (err) {
                console.error(`Erreur envoi mail à ${email} :`, err);
                await supabaseAdmin.from("email_queue").update({
                    status: retries + 1 >= MAX_RETRIES ? "failed" : "pending",
                    retries: retries + 1,
                    last_error: err instanceof Error ? err.message : String(err),
                    updated_at: new Date(),
                }).eq("id", id);
                continue; // passe au job suivant
            }


            await supabaseAdmin.from("email_queue").update({
                status: "sent",
                updated_at: new Date(),
            }).eq("id", id);

        } catch (err) {
            await supabaseAdmin.from("email_queue").update({
                status: retries + 1 >= MAX_RETRIES ? "failed" : "pending",
                retries: retries + 1,
                last_error: err instanceof Error ? err.message : String(err),
                updated_at: new Date(),
            }).eq("id", id);
        }
    }

    return jobs.length;
}
