import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";
import { generateTicketImage } from "@/lib/generateTicketImage";

const MAX_RETRIES = 5;

interface EmailJob {
    id: number;
    full_name: string;
    email: string;
    access_token: string;
    ticket_numbers: string[];
    retries: number;
}

interface FetchEmailJobsResponse {
    data: EmailJob[] | null;
    error: { message: string } | null;
}

export async function GET() {
    try {
        // Récupérer jusqu’à 10 jobs en attente
        const { data: jobs, error }: FetchEmailJobsResponse = await supabaseAdmin.rpc(
            "fetch_and_mark_email_jobs",
            { batch: 10 }
        );

        if (error) throw new Error(error.message);
        if (!jobs || jobs.length === 0) {
            return Response.json({ message: "Aucun email à traiter" });
        }

        // Traiter chaque job en parallèle
        jobs.forEach((job: EmailJob) => {
            setImmediate(async () => {
                const { id, full_name, email, access_token, ticket_numbers, retries } = job;

                try {
                    // Générer les images des tickets
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
                        <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding: 50px 0;">
                          <h1 style="margin-bottom: 40px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}" style="text-decoration: none; color: #000;">
                              🎟️ Marocola
                            </a>
                          </h1>
                          <p style="margin-bottom: 30px; font-size: 18px;">Bonjour <strong>${full_name}</strong> et merci pour votre participation !</p>
                          <p style="margin-bottom: 30px; font-size: 18px; font-weight: bold;">Voici vos tickets : ${ticket_numbers.length}</p>
            
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
            
                          <p style="margin-top: 20px; font-size: 18px;">Vous pouvez aussi consulter vos tickets ici :</p>
                          <p style="margin-top: 30px;">
                            <a href="${process.env.NEXT_PUBLIC_URL}/mes-tickets?token=${access_token}"
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

                    // Envoi de l’email
                    await sendEmail(email, "🎟️ Vos tickets de tombola", htmlContent, undefined, attachments);

                    // Marquer le job comme envoyé
                    await supabaseAdmin.from("email_queue").update({
                        status: "sent",
                        updated_at: new Date(),
                    }).eq("id", id);
                } catch (err) {
                    console.error("❌ Email failed:", err);

                    // Retry automatique
                    await supabaseAdmin.from("email_queue").update({
                        status: retries + 1 >= MAX_RETRIES ? "failed" : "pending",
                        retries: retries + 1,
                        last_error: err instanceof Error ? err.message : String(err),
                        updated_at: new Date(),
                    }).eq("id", id);
                }
            });
        });

        return Response.json({ message: `${jobs.length} emails traités.` });
    } catch (err) {
        console.error("Erreur générale du worker :", err);
        return Response.json({ error: String(err) }, { status: 500 });
    }
}
