import { GET as processEmailQueue } from "@/app/api/process-email-queue/route";

export async function GET(req: Request) {

    const token = req.headers.get("CRON_SECRET");
    if (token !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // ⚡ Lance le traitement sans attendre qu’il finisse
        processEmailQueue()
            .then(() => console.log("✅ Email queue traitée en arrière-plan"))
            .catch((err) => console.error("❌ Erreur background :", err));

        // ✅ Répond immédiatement à FastCron
        console.log("🚀 Cron déclenché à", new Date().toISOString());
        return new Response("Cron lancé avec succès", { status: 200 });
    } catch (err) {
        console.error("❌ Erreur pendant le cron :", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
