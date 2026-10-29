import { describe, it, expect, vi, afterEach } from "vitest";
import { appUrl, sendMail } from "./mailer";

const mail = { to: "jean@example.com", subject: "Sujet", text: "Corps" };

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("sendMail", () => {
  it("appelle l'API Resend avec la clé et l'expéditeur", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "Klarity <bonjour@klarity.app>");
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendMail(mail);

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer re_test");
    expect(JSON.parse(init.body as string)).toEqual({
      from: "Klarity <bonjour@klarity.app>",
      ...mail,
    });
  });

  it("lève si Resend refuse", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "x@y.z");
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 422 })));
    await expect(sendMail(mail)).rejects.toThrow("422");
  });

  it("écrit dans la console en développement sans clé", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "development");
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    await sendMail(mail);
    expect(info).toHaveBeenCalledWith(expect.stringContaining("Corps"));
  });

  it("refuse d'envoyer en production sans clé", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("NODE_ENV", "production");
    await expect(sendMail(mail)).rejects.toThrow("RESEND_API_KEY");
  });
});

describe("appUrl", () => {
  it("préfixe le chemin par NEXTAUTH_URL, sans double barre", () => {
    vi.stubEnv("NEXTAUTH_URL", "https://klarity.app/");
    expect(appUrl("/auth/x?token=1")).toBe("https://klarity.app/auth/x?token=1");
  });
});
