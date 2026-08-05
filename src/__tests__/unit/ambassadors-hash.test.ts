// PATH: src/__tests__/unit/ambassadors-hash.test.ts

import { hashIp } from "@/lib/ambassadors/hash";

describe("hashIp", () => {
  it("retorna null para entrada vazia", () => {
    expect(hashIp(null)).toBeNull();
    expect(hashIp(undefined)).toBeNull();
    expect(hashIp("")).toBeNull();
  });

  it("é determinístico: mesmo IP → mesmo hash", () => {
    expect(hashIp("1.2.3.4")).toBe(hashIp("1.2.3.4"));
  });

  it("IPs diferentes → hashes diferentes", () => {
    expect(hashIp("1.2.3.4")).not.toBe(hashIp("5.6.7.8"));
  });

  it("nunca devolve o IP cru (pseudonimiza)", () => {
    const h = hashIp("1.2.3.4");
    expect(h).not.toBeNull();
    expect(h).not.toContain("1.2.3.4");
    expect(h).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex
  });
});
