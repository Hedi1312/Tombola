import { v4 as uuidv4 } from "uuid";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type GenerateTicketInput = {
    full_name: string;
    email: string;
    quantity: number;
    accessToken?: string;
};

const MAX_TICKETS_PER_EMAIL = 10;

export async function generateTickets({ full_name, email, quantity, accessToken }: GenerateTicketInput) {
    if (!full_name || !email || !quantity || quantity < 1) {
        throw new Error("Champs invalides");
    }

    const token = accessToken ?? uuidv4();

    // Étape 1 : récupérer des tickets via la fonction RPC sécurisée
    const { data: ticketRows, error } = await supabaseAdmin.rpc("get_and_mark_tickets", { quantity });
    if (error) throw error;
    if (!ticketRows || ticketRows.length < quantity) {
        throw new Error("Pas assez de tickets disponibles");
    }

    // Étape 2 : Extraire uniquement les numéros de ticket depuis les lignes récupérées
    const ticketNumbers: string[] = ticketRows.map((r: { ticket_number: string }) => r.ticket_number);

    // Étape 3 : insérer dans la table tickets
    const { data: insertedTickets, error: insertError } = await supabaseAdmin
        .from("tickets")
        .insert(
            ticketNumbers.map(num => ({
                full_name,
                email,
                ticket_number: num,
                access_token: token,
            }))
        )
        .select("*");

    if (insertError) throw insertError;

    // Étape 4 : créer les jobs dans la queue d’emails par batch de MAX_TICKETS_PER_EMAIL
    for (let i = 0; i < ticketNumbers.length; i += MAX_TICKETS_PER_EMAIL) {
        const batchTickets = ticketNumbers.slice(i, i + MAX_TICKETS_PER_EMAIL);
        await supabaseAdmin.from("email_queue").insert([{
            full_name,
            email,
            access_token: token,
            ticket_numbers: batchTickets,
            status: 'pending',
            retries: 0,
        }]);
    }

    // ✅ Étape 5 : Retour immédiat au client
    return {
        success: true,
        message: "Tickets générés. Un email de confirmation arrivera sous peu.",
        tickets: insertedTickets,
        ticketNumbers,
        accessToken: token,
    };
}
