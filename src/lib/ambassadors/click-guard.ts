/**
 * Defesa contra cookie stuffing na rota /e/<slug>.
 *
 * O ataque: carregar o link de forma invisível (iframe, tag de imagem, script)
 * numa página com tráfego, para plantar o cookie em quem nunca clicou. Se essa
 * pessoa assinar depois, o crédito vai para o fraudador, roubado de quem de
 * fato a trouxe, já que a atribuição é first-touch.
 *
 * A defesa: o próprio navegador denuncia o contexto no cabeçalho
 * Sec-Fetch-Dest. Navegação de topo é "document"; iframe, imagem e script têm
 * seus próprios valores. Stuffing precisa, por definição, de um contexto que
 * não seja "document".
 *
 * Função pura de propósito: toda a decisão fica testável sem rede nem banco.
 */

export type ClickContext = {
    /** Cabeçalho Sec-Fetch-Dest, ou null se o navegador não enviou. */
    secFetchDest: string | null | undefined;
    /** Já houve clique deste mesmo IP neste link na janela recente. */
    hasRecentClick: boolean;
};

export type ClickVerdict = {
    /** Somar na métrica de cliques. */
    countClick: boolean;
    /** Gravar o cookie de atribuição. */
    setCookie: boolean;
    /** Motivo do desvio, guardado para perícia. Null quando o clique é limpo. */
    reason: string | null;
};

/** Janela em que cliques repetidos do mesmo IP no mesmo link não somam. */
export const DEDUPE_WINDOW_MINUTES = 30;

export function assessClick({ secFetchDest, hasRecentClick }: ClickContext): ClickVerdict {
    // Cabeçalho presente e diferente de "document" significa carregamento
    // invisível. Ausência não bloqueia: navegador antigo não envia, e punir
    // quem não manda o cabeçalho quebraria a atribuição de gente real.
    if (secFetchDest && secFetchDest !== "document") {
        return { countClick: false, setCookie: false, reason: "carregamento invisivel" };
    }

    // Recarregar a página é normal, não é fraude: não soma na métrica, mas a
    // atribuição continua valendo.
    if (hasRecentClick) {
        return { countClick: false, setCookie: true, reason: "clique repetido" };
    }

    return { countClick: true, setCookie: true, reason: null };
}
