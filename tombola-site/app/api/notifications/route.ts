import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendEmail } from "@/lib/email";

// Inscription / mise à jour
export async function POST(req: NextRequest) {
    try {
        const { full_name, email } = await req.json();
        if (!full_name || !email) {
            return NextResponse.json({ success: false, error: "Champs manquants" }, { status: 400 });
        }


        // Vérifier si l'utilisateur existe déjà
        const { data: existing } = await supabaseAdmin
            .from("notifications")
            .select("*")
            .eq("email", email)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, error: "Vous êtes déjà inscrit(e) !" }, { status: 400 });
        }

        const access_token = crypto.randomUUID();

        // Ajouter / mettre à jour participant
        const { data, error } = await supabaseAdmin
            .from("notifications")
            .upsert({ full_name, email, access_token, notified: false }, { onConflict: "email" })
            .select("*");

        if (error) throw error;

        // Envoi du mail de confirmation
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; text-align: center; background-color: #f7f7f7; padding: 50px 20px;">
                <h1 style="margin-bottom: 40px;">
                    <a href="${process.env.NEXT_PUBLIC_URL}" 
                    style="text-decoration: none; color: #000;">
                    🎟️ Marocola
                    </a>
                </h1>
                
                <p style="margin-bottom: 20px; font-size: 25px;">
                    Bonjour <strong>${full_name}</strong>,
                </p>
                <p style="margin-bottom: 30px; font-size: 18px;">
                    Vous êtes inscrit(e) pour recevoir une notification lors du prochain tirage ! 🎉
                </p>
                
                <p style="margin-top: 20px; font-size: 18px;">
                    Si vous changez d'avis, vous pouvez vous désinscrire ici :
                </p>
                <p style="margin-top: 30px;">
                    <a href="${process.env.NEXT_PUBLIC_URL}/api/notifications?token=${access_token}"
                    style="display: inline-block; background-color: #e74c3c; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    Se désinscrire
                    </a>
                </p>
                
                <p style="margin-top: 40px;">
                    <a href="${process.env.NEXT_PUBLIC_URL}"
                    style="display: inline-block; background-color: #2ecc71; color: #fff; padding: 14px 26px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                    🌐 Aller sur le site Marocola
                    </a>
                </p>
                
                <p style="margin-top: 30px; font-size: 16px; color: #555;">
                    Merci et à bientôt pour le tirage 🍀
                </p>
            </div>
        `;

        await sendEmail(email, "Confirmation d'inscription aux notifications", htmlContent);

        return NextResponse.json({ success: true, participant: data });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
}


// Désinscription via lien GET
export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get("token");
        if (!token) {
            return NextResponse.json({ success: false, error: "Token manquant" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("notifications")
            .delete()
            .eq("access_token", token)
            .select("*");

        if (error) throw error;
        if (!data || data.length === 0) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/desinscription?status=invalid`);
        }

        // Rediriger vers une page frontend qui dit "Désinscription réussie"
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/desinscription?status=success`);
    } catch {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/desinscription?status=error`);
    }
}

