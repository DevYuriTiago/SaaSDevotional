import type { Metadata } from "next";
import LegalShell, { type LegalSection } from "@/components/LegalShell";

export const metadata: Metadata = {
    title: "Política de Privacidade",
    description: "Como a Humanáh coleta, usa e protege os seus dados, em conformidade com a LGPD.",
    robots: { index: true, follow: true },
};

const sections: LegalSection[] = [
    {
        title: "Quem é o responsável pelos seus dados",
        body: [
            "A Humanáh é a controladora dos dados tratados neste serviço. Para qualquer questão sobre privacidade, ou para exercer os seus direitos, fale com o nosso encarregado pelo e-mail contato@humanah.app.",
            "Esta política explica, de forma transparente, quais dados coletamos, por que, com quem compartilhamos e como você controla tudo isso — em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).",
        ],
    },
    {
        title: "Dados que coletamos",
        body: [
            "Coletamos apenas o necessário para entregar a experiência da Humanáh:",
            [
                "Cadastro: seu nome, e-mail e senha (armazenada de forma criptografada, nunca em texto puro). Se você entrar com o Google, recebemos seu nome, e-mail e foto de perfil.",
                "O que você compartilha: como você está se sentindo e os textos que você escreve (por exemplo, ao descrever seu momento ou registrar no diário). Esses dados podem revelar seu estado emocional e sua fé — por isso os tratamos como dados sensíveis (veja o item sobre consentimento).",
                "Conteúdo gerado: os devocionais criados para você (versículo, reflexão, oração, aplicação e declaração).",
                "Uso do app: contadores de devocionais, sequência de dias, preferências e progresso nas jornadas.",
                "Pagamento: quando você assina, os dados do cartão são processados diretamente pela Stripe. Nós NÃO armazenamos o número do seu cartão — guardamos apenas identificadores e o status da assinatura.",
                "Métricas de uso: eventos anônimos de navegação (ex.: cadastro, geração de devocional) e a origem da sua visita (parâmetros de campanha/UTM).",
            ],
        ],
    },
    {
        title: "Dados sensíveis e o seu consentimento",
        body: [
            "Como a Humanáh é um serviço de fé e trabalha a partir do que você está sentindo, alguns dados podem ser considerados sensíveis pela LGPD (por revelarem convicção religiosa ou estado emocional).",
            "Tratamos esses dados exclusivamente para gerar o seu devocional e a sua experiência espiritual — com base no seu consentimento livre, informado e específico, dado no momento do cadastro. Você pode revogar esse consentimento a qualquer momento (veja 'Seus direitos').",
        ],
    },
    {
        title: "Para que usamos os seus dados",
        body: [
            [
                "Criar e manter a sua conta e autenticar o seu acesso.",
                "Gerar devocionais e jornadas personalizados a partir do que você compartilha.",
                "Processar e gerenciar a sua assinatura.",
                "Entender o uso do produto e melhorá-lo (métricas agregadas).",
                "Cumprir obrigações legais e prevenir fraudes e abusos.",
            ],
            "Bases legais (LGPD): execução do contrato (para operar o serviço), consentimento (para dados sensíveis e comunicações), legítimo interesse (para métricas e segurança) e cumprimento de obrigação legal (ex.: fiscal).",
        ],
    },
    {
        title: "Com quem compartilhamos",
        body: [
            "Não vendemos os seus dados. Compartilhamos o mínimo necessário com prestadores que operam o serviço em nosso nome (operadores):",
            [
                "Supabase — autenticação, banco de dados e hospedagem dos dados da sua conta.",
                "Google (API Gemini) — para gerar o devocional, o texto do que você sente é enviado ao modelo de IA. Não é usado para treinar modelos com a sua identidade.",
                "Stripe — processamento de pagamentos e assinaturas.",
                "Vercel — hospedagem da aplicação.",
            ],
            "Transferência internacional: alguns desses provedores tratam dados fora do Brasil (por exemplo, nos Estados Unidos). Nesses casos, exigimos salvaguardas adequadas de proteção, conforme a LGPD.",
        ],
    },
    {
        title: "Cookies e armazenamento local",
        body: [
            "Usamos cookies estritamente necessários para manter você conectado com segurança (sem eles, o login não funciona). Também guardamos, no seu navegador (localStorage), a origem da sua visita (UTM) e um código de indicação, quando houver.",
            "Não usamos cookies de publicidade de terceiros.",
        ],
    },
    {
        title: "Por quanto tempo guardamos",
        body: [
            "Mantemos os seus dados enquanto a sua conta existir e enquanto forem necessários para as finalidades acima. Dados fiscais/financeiros podem ser mantidos pelos prazos exigidos por lei. Ao excluir a sua conta, apagamos ou anonimizamos os seus dados pessoais, salvo o que a lei exigir reter.",
        ],
    },
    {
        title: "Seus direitos",
        body: [
            "A LGPD garante a você, a qualquer momento e gratuitamente, o direito de:",
            [
                "Confirmar a existência de tratamento e acessar os seus dados.",
                "Corrigir dados incompletos, inexatos ou desatualizados.",
                "Solicitar a exclusão (eliminação) dos seus dados e da sua conta.",
                "Solicitar a portabilidade dos seus dados.",
                "Revogar o consentimento e se opor a tratamentos.",
                "Obter informação sobre com quem compartilhamos os seus dados.",
            ],
            "Para exercer qualquer um desses direitos, basta escrever para contato@humanah.app. Responderemos no menor prazo possível.",
        ],
    },
    {
        title: "Segurança",
        body: [
            "Adotamos medidas técnicas e organizacionais para proteger os seus dados, como criptografia de senhas, conexão segura (HTTPS) e controles de acesso. Nenhum sistema é 100% infalível, mas trabalhamos continuamente para proteger a sua confiança.",
        ],
    },
    {
        title: "Idade mínima",
        body: [
            "A Humanáh é destinada a maiores de 18 anos. Se você é responsável por um menor e acredita que ele nos forneceu dados, entre em contato para que possamos removê-los.",
        ],
    },
    {
        title: "Alterações nesta política",
        body: [
            "Podemos atualizar esta política para refletir melhorias ou exigências legais. Quando isso acontecer, alteraremos a data de 'última atualização' no topo e, em mudanças relevantes, avisaremos você.",
        ],
    },
];

export default function PrivacidadePage() {
    return (
        <LegalShell
            title="Política de Privacidade"
            updated="14 de julho de 2026"
            intro="A sua confiança é sagrada para nós. Aqui explicamos, sem juridiquês desnecessário, o que fazemos com os seus dados — e como você mantém o controle sobre eles."
            sections={sections}
            otherHref="/termos"
            otherLabel="Termos de Uso"
        />
    );
}
