import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

export async function GET() {
    try {
        await sendEmail(
            "test@example.com", // adresse fictive (elle sera captée par Mailtrap)
            "Test Mailtrap 🎉",
            "Bravo, ton setup Mailtrap fonctionne ! 🚀"
        );

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Erreur envoi mail :", err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
