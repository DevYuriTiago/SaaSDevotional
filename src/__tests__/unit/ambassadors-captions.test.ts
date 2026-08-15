// PATH: src/__tests__/unit/ambassadors-captions.test.ts

import { buildCaptions } from "@/lib/ambassadors/captions";

const LINK = "https://humanah.app/e/pastorjoao";

describe("buildCaptions", () => {
  const captions = buildCaptions(LINK);

  it("entrega várias opções de tom diferente", () => {
    expect(captions.length).toBeGreaterThanOrEqual(4);
    const titulos = captions.map((c) => c.label);
    expect(new Set(titulos).size).toBe(titulos.length); // sem rótulo repetido
  });

  it("toda legenda já vem com o link dentro, pronta para colar", () => {
    for (const c of captions) {
      expect(c.text).toContain(LINK);
    }
  });

  it("nenhuma legenda usa travessão (regra de copy da marca)", () => {
    for (const c of captions) {
      expect(c.text).not.toContain("—");
      expect(c.label).not.toContain("—");
    }
  });

  it("não deixa marcador de preenchimento por trocar", () => {
    for (const c of captions) {
      expect(c.text).not.toMatch(/\{\{|\[seu|\[link|XXX/i);
    }
  });

  it("são textos de verdade, com tamanho utilizável", () => {
    for (const c of captions) {
      expect(c.text.length).toBeGreaterThan(80);
      expect(c.text.length).toBeLessThan(2200); // limite do Instagram
    }
  });
});
