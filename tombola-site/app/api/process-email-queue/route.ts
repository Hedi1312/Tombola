import { processEmailJobs } from "@/app/api/process-email-queue/jobs";

export async function GET() {
    try {
        const count = await processEmailJobs(); // Appelle la fonction pure
        return new Response(`✅ ${count} emails traités.`, { status: 200 });
    } catch (err) {
        console.error("Erreur générale du worker :", err);
        return new Response("❌ Erreur lors du traitement des emails", { status: 500 });
    }
}
