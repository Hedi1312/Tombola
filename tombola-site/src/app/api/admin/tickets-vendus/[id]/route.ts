import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/src/lib/supabaseAdmin";

interface Params {
    id: string;
}

export async function DELETE(req: NextRequest, context: { params: Promise<Params> }) {
    // ⚠️ params est une promesse → on doit attendre
    const { id } = await context.params;

    const { error } = await supabaseAdmin
        .from("tickets")
        .delete()
        .eq("id", Number(id));

    if (error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}
