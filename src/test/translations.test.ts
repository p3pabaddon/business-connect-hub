import { describe, it, expect } from "vitest";
import { t, setLanguage } from "@/lib/translations";

describe("Translations", () => {
  it("should return Turkish text by default", () => {
    setLanguage("tr");
    expect(t("nav.home")).toBe("Ana Sayfa");
  });

  it("should return English text when set", () => {
    setLanguage("en");
    const result = t("nav.home");
    expect(result).toBe("Home");
    setLanguage("tr"); // reset
  });

  it("should return the key itself for missing translations", () => {
    const result = t("nonexistent.key.here");
    expect(result).toBe("nonexistent.key.here");
  });
});
