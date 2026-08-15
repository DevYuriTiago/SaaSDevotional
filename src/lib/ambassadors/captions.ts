/**
 * Legendas prontas para o embaixador divulgar.
 *
 * Duas escolhas deliberadas:
 *  - o link já vem embutido, sem marcador para preencher, porque atrito de
 *    edição é onde a divulgação morre;
 *  - o tom é de testemunho pessoal, não de anúncio. Numa audiência de fé, quem
 *    convence é a experiência de quem fala, não a peça publicitária.
 */

export type Caption = { label: string; text: string };

export function buildCaptions(link: string): Caption[] {
    return [
        {
            label: "Testemunho pessoal",
            text: `Tem dias em que eu quero orar e não sei nem por onde começar. Foi por isso que o Humanáh me ganhou.

Você escreve o que está sentindo, de verdade, do jeito que está, e recebe uma Palavra pensada para aquele momento. Versículo, reflexão e oração. Não é frase pronta de autoajuda, é Escritura aplicada ao que você vive hoje.

Se você anda seco, cansado ou sem direção, começa por aqui: ${link}`,
        },
        {
            label: "Convite direto",
            text: `Quero te apresentar uma coisa que tem feito bem à minha caminhada.

O Humanáh entrega um devocional novo todos os dias, feito para o que você está sentindo naquele momento. É como ter uma Palavra fresca a cada manhã, do jeito que o maná caía no deserto.

Dá para começar de graça: ${link}`,
        },
        {
            label: "Para stories",
            text: `Se hoje você acordou pesado, não tenta orar sozinho no escuro.

Escreve o que está sentindo aqui e recebe uma Palavra para hoje: ${link}`,
        },
        {
            label: "Para a igreja ou célula",
            text: `Uma ferramenta que tenho indicado para quem quer constância na Palavra.

O Humanáh recebe o que a pessoa está vivendo e devolve um devocional fundamentado na Bíblia, com versículo, reflexão, aplicação e oração. Tem ajudado muita gente a não deixar o devocional de lado.

Vale conhecer: ${link}`,
        },
        {
            label: "Curta, para o WhatsApp",
            text: `Comecei a usar esse app de devocional e tem me ajudado demais. Você conta o que está sentindo e ele traz uma Palavra pra hoje, com versículo e oração. Dá uma olhada: ${link}`,
        },
    ];
}
