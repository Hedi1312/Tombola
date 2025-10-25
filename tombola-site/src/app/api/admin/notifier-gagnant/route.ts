import { NextResponse } from "next/server";
import { notifyWinners } from "@/src/lib/notifyWinners";

export async function POST() {
    try {
        const result = await notifyWinners();

        if (result === "no-winners") {
            return NextResponse.json(
                { success: false, error: "Aucun gagnant à notifier." },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true, message: "Emails envoyés aux gagnants !" });
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: message });
    }
}
