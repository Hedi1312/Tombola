import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { processEmailJobs } from "@/app/api/process-email-queue/jobs";


export async function GET(req: Request) {
    const token = req.headers.get("CRON_SECRET");
    if (token !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // 🔹 Débloquer les jobs en "processing"
        const MAX_RETRIES = 5;
        await supabaseAdmin
            .from("email_queue")
            .update({ status: "pending" })
            .eq("status", "processing")
            .lt("retries", MAX_RETRIES);

        // 🔹 Lancer le traitement des emails
        processEmailJobs()
            .then((count) => console.log(`✅ ${count} emails traités en background`))
            .catch((err) => console.error("❌ Erreur background :", err));

        return new Response("Cron lancé avec succès", { status: 200 });
    } catch (err) {
        console.error(err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
