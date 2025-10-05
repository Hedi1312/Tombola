import { GET as processEmailQueue } from "@/app/api/process-email-queue/route";

export async function GET(req: Request) {
    // Vérifie le secret
    const authHeader = req.headers.get("Authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new Response("Unauthorized", { status: 401 });
    }

    // Appelle ton worker
    const response = await processEmailQueue();
    return response;
}
