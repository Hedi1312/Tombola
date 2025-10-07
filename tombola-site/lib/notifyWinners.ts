import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

export async function notifyWinners() {
    const { data: winners, error } = await supabaseAdmin
        .from("winners")
        .select("*")
        .eq("notified", false);

    if (error) {
        throw new Error("Erreur récupération gagnants");
        return;
    }

    if (!winners || winners.length === 0) {
        return "no-winners";
    }

    for (const winner of winners) {
        try {
            const htmlContent = `
                <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding: 50px 20px;">
                    <h1 style="margin-bottom: 40px;">
                        <a href="${process.env.NEXT_PUBLIC_URL}" 
                        style="text-decoration: none; color: #000;">
                        🎟️ Marocola
                        </a>
                    </h1>

                    <p style="margin-bottom: 20px; font-size: 25px;">
                        Félicitations <strong>${winner.name}</strong> ! 🎉
                    </p>

                    <p style="margin-bottom: 30px; font-size: 18px;">
                        Vous avez remporté la <strong>${winner.rank}ᵉ place</strong> du tirage au sort Marocola ! 🏆
                    </p>

                    <p style="margin-top: 20px; font-size: 18px;">
                        Votre ticket gagnant : <strong>${winner.ticket}</strong>
                    </p>

                    <p style="margin-top: 30px;">
                        <a href="${process.env.NEXT_PUBLIC_URL}/resultat"
                        style="display: inline-block; background-color: #3498db; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                        Voir les résultats complets 🏆
                        </a>
                    </p>

                    <p style="margin-top: 40px; font-size: 16px; color: #555;">
                        Merci pour votre participation et félicitations encore 🍀
                    </p>
                </div>
            `;

            await sendEmail(
                winner.email,
                "🎉 Félicitations — Vous êtes l'un des gagnant du tirage Marocola !",
                htmlContent
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
}
