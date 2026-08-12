import type { Metadata } from "next";
import EmbaixadoresClient from "./EmbaixadoresClient";

export const metadata: Metadata = {
    title: "Programa de Embaixadores · Humanáh",
    description:
        "Leve a Palavra mais longe e participe do fruto: comissão recorrente de 5% a 30% por cada assinante que chegar pela sua voz. Sem custo, com curadoria.",
    openGraph: {
        title: "Programa de Embaixadores · Humanáh",
        description:
            "Indique o Humanáh e receba comissão recorrente: todo mês, enquanto cada pessoa permanecer. Do Bronze ao Maná (30%).",
    },
};

export default function EmbaixadoresPage() {
    return <EmbaixadoresClient />;
}
