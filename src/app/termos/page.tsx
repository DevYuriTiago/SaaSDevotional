import type { Metadata } from "next";
import LegalShell, { type LegalSection } from "@/components/LegalShell";

export const metadata: Metadata = {
    title: "Termos de Uso",
    description: "As regras para usar a Humanáh: serviço, assinatura, cancelamento e responsabilidades.",
    robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
    {
        title: "Aceitação dos termos",
        body: [
            "Ao criar uma conta e usar a Humanáh, você concorda com estes Termos de Uso e com a nossa Política de Privacidade. Se não concordar, por favor, não utilize o serviço.",
        ],
    },
    {
        title: "O que é a Humanáh",
        body: [
            "A Humanáh é uma companheira devocional que, a partir do que você está sentindo, oferece uma direção fundamentada na Bíblia — com versículo, reflexão, oração, aplicação e declaração.",
            "A Humanáh é uma companheira de leitura da Palavra, e não uma substituta dela. Ela não fala por Deus, não é aconselhamento pastoral, e não substitui acompanhamento médico, psicológico ou psiquiátrico. Se você estiver passando por sofrimento intenso ou pensamentos de se machucar, procure ajuda profissional imediatamente ou ligue para o CVV (188).",
        ],
    },
    {
        title: "Quem pode usar",
        body: [
            "Você deve ter 18 anos ou mais e capacidade civil para aceitar estes termos. Ao usar o serviço, você declara que essas condições são verdadeiras.",
        ],
    },
    {
        title: "Sua conta",
        body: [
            "Você é responsável por manter a confidencialidade das suas credenciais e por toda atividade na sua conta. Avise-nos imediatamente em contato@humanah.app se suspeitar de uso não autorizado.",
        ],
    },
    {
        title: "Plano gratuito, assinatura e pagamento",
        body: [
            [
                "Você pode começar gratuitamente, com um número limitado de devocionais por nossa conta.",
                "Para uso ilimitado, oferecemos assinaturas (mensal ou anual), com pagamento processado pela Stripe.",
                "As assinaturas são renovadas automaticamente ao fim de cada período, pelo valor vigente, até que você cancele.",
                "Você pode cancelar quando quiser; o acesso premium permanece ativo até o fim do período já pago, sem cobranças futuras.",
                "Direito de arrependimento: conforme o Código de Defesa do Consumidor, você pode desistir em até 7 dias após a contratação e solicitar o reembolso pelo e-mail de contato.",
            ],
        ],
    },
    {
        title: "Conteúdo gerado por inteligência artificial",
        body: [
            "Os devocionais são gerados com apoio de inteligência artificial e podem, eventualmente, conter imprecisões. Recomendamos sempre conferir os versículos diretamente na Bíblia. O conteúdo tem propósito de edificação espiritual e não constitui aconselhamento profissional de qualquer natureza.",
        ],
    },
    {
        title: "Uso aceitável",
        body: [
            "Você concorda em não usar a Humanáh para fins ilícitos, ofensivos ou que violem direitos de terceiros, e em não tentar burlar, sobrecarregar ou explorar indevidamente o serviço ou a IA.",
        ],
    },
    {
        title: "Conteúdo e propriedade intelectual",
        body: [
            "A marca, o design e o software da Humanáh são de nossa titularidade. O conteúdo que você cria e compartilha continua sendo seu — você apenas nos concede a autorização necessária para operar o serviço (por exemplo, armazenar e exibir seus devocionais e registros para você).",
        ],
    },
    {
        title: "Limitação de responsabilidade",
        body: [
            "A Humanáh é oferecida 'no estado em que se encontra'. Na máxima extensão permitida pela lei, não nos responsabilizamos por decisões tomadas com base no conteúdo, nem por indisponibilidades temporárias ou fatores fora do nosso controle. Nada nestes termos exclui direitos que a lei garante a você como consumidor.",
        ],
    },
    {
        title: "Suspensão e encerramento",
        body: [
            "Podemos suspender ou encerrar contas que violem estes termos. Você pode encerrar a sua conta a qualquer momento, solicitando a exclusão pelo e-mail de contato.",
        ],
    },
    {
        title: "Alterações nos termos",
        body: [
            "Podemos atualizar estes termos. Mudanças relevantes serão comunicadas, e a data de 'última atualização' no topo será alterada. O uso continuado após as mudanças significa concordância com a nova versão.",
        ],
    },
    {
        title: "Lei aplicável e contato",
        body: [
            "Estes termos são regidos pelas leis da República Federativa do Brasil, e fica eleito o foro do domicílio do consumidor para dirimir eventuais controvérsias.",
            "Dúvidas? Escreva para contato@humanah.app.",
        ],
    },
];

export default function TermosPage() {
    return (
        <LegalShell
            title="Termos de Uso"
            updated="14 de julho de 2026"
            intro="Regras simples e honestas para a nossa caminhada juntos. Leia com calma — foram escritas para proteger você."
            sections={sections}
            otherHref="/privacidade"
            otherLabel="Política de Privacidade"
        />
    );
}
