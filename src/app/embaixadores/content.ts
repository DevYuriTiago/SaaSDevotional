/**
 * Conteúdo textual compartilhado da landing de embaixadores.
 * Fica fora do componente porque o JSON-LD (server, em page.tsx) precisa das
 * MESMAS perguntas e respostas exibidas na tela: dados estruturados que não
 * batem com o conteúdo visível são violação das diretrizes do Google.
 */

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
    {
        q: "Custa algo para participar?",
        a: "Nada. Nem para se inscrever, nem para permanecer. O programa existe para reconhecer quem já leva a Palavra adiante.",
    },
    {
        q: "Quando e como recebo?",
        a: "Via Pix, mensalmente. A comissão de cada pagamento é confirmada após a garantia de 7 dias e continua caindo enquanto a assinatura do seu indicado estiver ativa.",
    },
    {
        q: "Preciso de quantos seguidores?",
        a: "Não existe número mágico. Avaliamos alcance real e coerência de vida e conteúdo. Uma comunidade fiel vale mais do que um número grande.",
    },
    {
        q: "Posso doar a minha comissão?",
        a: "Sim. Se preferir, você pode destinar parte ou 100% do que receber para abençoar sua igreja ou ministério. Muitos embaixadores escolhem esse caminho.",
    },
    {
        q: "Como acompanho meus resultados?",
        a: "Sendo aprovado, você terá acesso ao portal do embaixador: cliques, assinaturas e ganhos, tudo ao vivo, com seu link e materiais prontos para divulgar.",
    },
];
