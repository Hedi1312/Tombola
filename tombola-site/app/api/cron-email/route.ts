import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { processEmailJobs } from "@/app/api/process-email-queue/jobs";


export async function GET(req: Request) {
    const token = req.headers.get("CRON_SECRET");
    if (token !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // 🔹 Débloquer les jobs en "processing"
        await supabaseAdmin
            .from("email_queue")
            .update({ status: "pending" })
            .eq("status", "processing")

        // 🔹 Lancer le traitement des emails et attendre la fin
        const count = await processEmailJobs();
        console.log(`✅ ${count} emails traités`);

        return new Response(`Cron terminé, ${count} emails traités`, { status: 200 });
    } catch (err) {
        console.error("❌ Erreur cron :", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
