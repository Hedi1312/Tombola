import { GET as processEmailQueue } from "@/app/api/process-email-queue/route";

export async function GET(req: Request) {
    // 1️⃣ Vérifie le secret d’authentification
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // 2️⃣ Appelle ton worker interne (traitement des emails)
        const response = await processEmailQueue();

        // 3️⃣ Log utile pour suivi (visible sur les logs Vercel)
        console.log("✅ Cron exécuté avec succès à", new Date().toISOString());

        return response;
    } catch (err) {
        console.error("❌ Erreur pendant le cron :", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
