import { GET as processEmailQueue } from "@/app/api/process-email-queue/route";

export async function GET(req: Request) {
    // Récupère le token depuis la query string
    const url = new URL(req.url);
    const tokenQuery = url.searchParams.get("token");

    // Vérifie le token
    if (tokenQuery !== process.env.CRON_SECRET) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // Appelle ton worker interne pour envoyer les emails
        const response = await processEmailQueue();

        // Log pour savoir que le cron a été exécuté
        console.log("✅ Cron exécuté avec succès à", new Date().toISOString());

        return response;
    } catch (err) {
        console.error("❌ Erreur pendant le cron :", err);
        return new Response("Internal Server Error", { status: 500 });
    }
}
