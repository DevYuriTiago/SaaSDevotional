import { NextResponse } from "next/server";

// -----------------------------------------------------------------------------
// Tradução central de erros do provedor de IA → resposta amigável ao usuário.
// Fonte única de verdade: qualquer rota que chame a IA usa isto no catch, então
// a mensagem que o usuário vê é consistente e sem jargão técnico em todo o app.
// -----------------------------------------------------------------------------

export interface AiErrorOptions {
    /** Substantivo usado na mensagem (ex.: "seu devocional", "sua jornada"). */
    subject?: string;
}

export function aiErrorResponse(error: unknown, options: AiErrorOptions = {}): NextResponse {
    const subject = options.subject ?? "seu devocional";
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[ai] Error:", msg);

    // Muitas requisições / cota atingida.
    if (msg.includes("429") || /quota|too many requests/i.test(msg)) {
        return NextResponse.json(
            { error: "Muita gente buscando uma Palavra agora. Espere um instante e tente novamente." },
            { status: 429 }
        );
    }

    // Acesso negado pelo provedor (403 — projeto/billing/permissão).
    if (msg.includes("403") || /denied|forbidden|permission/i.test(msg)) {
        return NextResponse.json(
            { error: `Não conseguimos preparar ${subject} agora. Já estamos cuidando disso — respire fundo e tente novamente em alguns instantes.` },
            { status: 503 }
        );
    }

    // Modelo/endpoint indisponível.
    if (msg.includes("404") || /no longer available|not found/i.test(msg)) {
        return NextResponse.json(
            { error: `Não conseguimos preparar ${subject} agora. Tente novamente em instantes.` },
            { status: 503 }
        );
    }

    // Genérico.
    return NextResponse.json(
        { error: `Algo não saiu como esperado ao preparar ${subject}. Tente novamente em instantes.` },
        { status: 500 }
    );
}
