// app/api/tickets-vendus/route.ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";


export async function GET() {
    const { data, error } = await supabaseAdmin
        .from("tickets")
        .select("*")
        .order("id", { ascending: false });

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, tickets: data });
}
