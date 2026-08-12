// PATH: src/__tests__/unit/ambassadors-slug.test.ts

import type { SupabaseClient } from "@supabase/supabase-js";
import { slugify, uniqueSlug } from "@/lib/ambassadors/slug";

describe("slugify", () => {
  it("remove acentos, espaços e maiúsculas", () => {
    expect(slugify("Pastor João")).toBe("pastorjoao");
    expect(slugify("Maria da Conceição")).toBe("mariadaconceicao");
    expect(slugify("Ação & Fé!")).toBe("acaofe");
  });

  it("descarta qualquer caractere fora de a-z0-9", () => {
    expect(slugify("@pastor_joao.123")).toBe("pastorjoao123");
  });

  it("corta em 24 caracteres", () => {
    expect(slugify("a".repeat(60))).toHaveLength(24);
  });

  it("nome vazio ou só símbolos vira um fallback utilizável", () => {
    expect(slugify("")).toBe("embaixador");
    expect(slugify("!!!")).toBe("embaixador");
  });
});

/** Admin fake: `taken` são os slugs já ocupados. */
function makeAdmin(taken: string[]) {
  const admin = {
    from: () => ({
      select: () => ({
        eq: (_col: string, value: string) => ({
          maybeSingle: async () => ({
            data: taken.includes(value) ? { id: "x" } : null,
            error: null,
          }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
  return admin;
}

describe("uniqueSlug", () => {
  it("devolve a base quando está livre", async () => {
    expect(await uniqueSlug(makeAdmin([]), "pastorjoao")).toBe("pastorjoao");
  });

  it("adiciona sufixo quando a base está ocupada", async () => {
    expect(await uniqueSlug(makeAdmin(["pastorjoao"]), "pastorjoao")).toBe("pastorjoao2");
  });

  it("continua incrementando enquanto houver colisão", async () => {
    const taken = ["pastorjoao", "pastorjoao2", "pastorjoao3"];
    expect(await uniqueSlug(makeAdmin(taken), "pastorjoao")).toBe("pastorjoao4");
  });

  it("normaliza a base recebida antes de checar", async () => {
    expect(await uniqueSlug(makeAdmin([]), "Pastor João")).toBe("pastorjoao");
  });
});
