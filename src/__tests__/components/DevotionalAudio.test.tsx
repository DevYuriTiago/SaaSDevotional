// PATH: src/__tests__/components/DevotionalAudio.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DevotionalAudio from "@/components/DevotionalAudio";
import type { Devotional } from "@/types";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const devotional: Devotional = {
  id: "dev-1",
  user_id: "user-1",
  emotion: "ansiedade",
  emotion_raw: "Estou ansioso",
  title: "Paz que excede o entendimento",
  verse: "Não andeis ansiosos por coisa alguma",
  verse_reference: "Filipenses 4:6",
  reflection:
    "Deus nos convida a lançar todas as nossas preocupações sobre Ele.",
  practical_application: "Reserve 5 minutos para oração hoje.",
  prayer: "Senhor, entrego minhas ansiedades a Ti.",
  declaration: "Sou guardado pela paz de Deus.",
  reflective_question: "O que me impede de confiar plenamente?",
  is_saved: false,
  created_at: "2026-06-08T00:00:00.000Z",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderComponent(isPremium: boolean) {
  return render(<DevotionalAudio devotional={devotional} isPremium={isPremium} />);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DevotionalAudio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // 1. Paywall — texto visível
  it("renderiza mensagem de paywall quando isPremium=false", () => {
    renderComponent(false);

    expect(
      screen.getByText("Áudio disponível no Premium")
    ).toBeInTheDocument();
  });

  // 2. Paywall — link para /subscription
  it("renderiza link para /subscription quando não é premium", () => {
    renderComponent(false);

    const link = screen.getByRole("link", { name: /assinar/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/subscription");
  });

  // 3. Premium — botão TTS visível
  it("renderiza botão 'Ouvir devocional' quando isPremium=true", () => {
    renderComponent(true);

    expect(
      screen.getByRole("button", { name: /ouvir devocional/i })
    ).toBeInTheDocument();
  });

  // 4. Premium — botão Música ambiente visível
  it("renderiza botão 'Música ambiente' quando isPremium=true", () => {
    renderComponent(true);

    expect(
      screen.getByRole("button", { name: /música ambiente/i })
    ).toBeInTheDocument();
  });

  // 5. Clicar "Ouvir devocional" chama speechSynthesis.speak
  it("clicar em 'Ouvir devocional' chama window.speechSynthesis.speak", async () => {
    const user = userEvent.setup();
    renderComponent(true);

    await user.click(screen.getByRole("button", { name: /ouvir devocional/i }));

    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  // 6. Clicar "Música ambiente" instancia AudioContext
  it("clicar em 'Música ambiente' instancia AudioContext", async () => {
    const user = userEvent.setup();
    renderComponent(true);

    await user.click(screen.getByRole("button", { name: /música ambiente/i }));

    expect(global.AudioContext).toHaveBeenCalledTimes(1);
  });

  // 7. Clicar duas vezes em "Ouvir devocional": segunda chamada cancela a fala
  it("clicar duas vezes em 'Ouvir devocional' cancela a fala na segunda vez", async () => {
    const user = userEvent.setup();
    renderComponent(true);

    // Primeira vez — inicia a fala
    await user.click(screen.getByRole("button", { name: /ouvir devocional/i }));
    expect(window.speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(window.speechSynthesis.cancel).not.toHaveBeenCalled();

    // Segunda vez — o botão muda para "Parar leitura"; clicar cancela
    await user.click(screen.getByRole("button", { name: /parar leitura/i }));
    expect(window.speechSynthesis.cancel).toHaveBeenCalledTimes(1);
  });
});
