import { createServerFn } from "@tanstack/react-start";
import { DEFAULT_SITE_DATA } from "./default-site-data";

export { DEFAULT_SITE_DATA };

// In-memory runtime cache to guarantee continuity across requests within a serverless instance
let inMemorySiteData: Record<string, unknown> | null = null;
let inMemoryPassword = "Torrescell123";

/**
 * Safely resolves Node.js filesystem and path utilities strictly in server environments.
 * Returns null if evaluated in client/browser environments without throwing errors.
 */
async function getServerEnv() {
  if (typeof window !== "undefined") {
    return null;
  }
  try {
    const [fs, path, os] = await Promise.all([
      import("node:fs/promises"),
      import("node:path"),
      import("node:os"),
    ]);

    const tmpDir = typeof os?.tmpdir === "function" ? os.tmpdir() : "/tmp";
    const tmpBase = path.join(tmpDir, "torres-cell");
    const cwd =
      typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : "";

    return {
      fs,
      path,
      primaryDataFile: path.resolve(cwd, "data/site-data.json"),
      tmpDataFile: path.join(tmpBase, "site-data.json"),
      primaryAuthFile: path.resolve(cwd, "data/admin-auth.json"),
      tmpAuthFile: path.join(tmpBase, "admin-auth.json"),
      primaryUploadsDir: path.resolve(cwd, "public/uploads"),
      tmpUploadsDir: path.join(tmpBase, "uploads"),
    };
  } catch (err) {
    console.warn("Server environment check skipped or running in edge/browser context:", err);
    return null;
  }
}

async function readSiteData(): Promise<Record<string, unknown> | null> {
  const env = await getServerEnv();
  if (!env) {
    return inMemorySiteData;
  }

  const candidates = [env.primaryDataFile, env.tmpDataFile];
  for (const p of candidates) {
    try {
      const content = await env.fs.readFile(p, "utf-8");
      if (content) {
        return JSON.parse(content);
      }
    } catch {
      // try next candidate
    }
  }

  return inMemorySiteData;
}

async function writeSiteData(data: unknown): Promise<void> {
  inMemorySiteData = data as Record<string, unknown>;
  const env = await getServerEnv();
  if (!env) return;

  const content = JSON.stringify(data, null, 2);
  const candidates = [env.primaryDataFile, env.tmpDataFile];
  for (const p of candidates) {
    try {
      await env.fs.mkdir(env.path.dirname(p), { recursive: true });
      await env.fs.writeFile(p, content, "utf-8");
      return;
    } catch {
      // continue to next candidate
    }
  }
}

async function readAdminPassword(): Promise<string> {
  const env = await getServerEnv();
  if (!env) return inMemoryPassword;

  const candidates = [env.primaryAuthFile, env.tmpAuthFile];
  for (const p of candidates) {
    try {
      const content = await env.fs.readFile(p, "utf-8");
      if (content) {
        const parsed = JSON.parse(content);
        if (parsed.password) {
          inMemoryPassword = parsed.password;
          return parsed.password;
        }
      }
    } catch {
      // try next candidate
    }
  }

  return inMemoryPassword;
}

async function writeAdminPassword(password: string): Promise<void> {
  inMemoryPassword = password;
  const env = await getServerEnv();
  if (!env) return;

  const content = JSON.stringify({ password, updatedAt: new Date().toISOString() }, null, 2);
  const candidates = [env.primaryAuthFile, env.tmpAuthFile];
  for (const p of candidates) {
    try {
      await env.fs.mkdir(env.path.dirname(p), { recursive: true });
      await env.fs.writeFile(p, content, "utf-8");
      return;
    } catch {
      // try next candidate
    }
  }
}

export const getServerSiteData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const data = await readSiteData();
    if (data) {
      inMemorySiteData = data;
      return { ...DEFAULT_SITE_DATA, ...data };
    }
  } catch (err) {
    console.warn("Could not retrieve file data, falling back to in-memory/defaults:", err);
  }

  if (inMemorySiteData) {
    return { ...DEFAULT_SITE_DATA, ...inMemorySiteData };
  }

  return DEFAULT_SITE_DATA;
});

export const saveServerSiteData = createServerFn({ method: "POST" })
  .validator((d: unknown) => d)
  .handler(async ({ data }) => {
    try {
      await writeSiteData(data);
      return { success: true };
    } catch (err) {
      console.warn("Notice: Saved to memory cache (file write skipped):", err);
      return { success: true };
    }
  });

export const authenticateAdmin = createServerFn({ method: "POST" })
  .validator((creds: { username?: string; password?: string }) => creds)
  .handler(async ({ data }) => {
    const { username, password } = data;
    let expectedPass = inMemoryPassword || "Torrescell123";

    try {
      const storedPass = await readAdminPassword();
      if (storedPass) {
        expectedPass = storedPass;
      }
    } catch {
      // Use default password
    }

    const cleanUser = username?.trim().toLowerCase() ?? "";
    const isUserValid =
      cleanUser === "torrescell2026" ||
      cleanUser === "torrescell2026@torrescell.com.br" ||
      cleanUser === "admin";
    const isPassValid = password === expectedPass;

    if (isUserValid && isPassValid) {
      const token = `tc_session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      return {
        success: true,
        token,
        username: "Torrescell2026",
      };
    }

    return {
      success: false,
      error: "Usuário ou senha incorretos. Verifique suas credenciais de administrador.",
    };
  });

export const changeAdminPassword = createServerFn({ method: "POST" })
  .validator((args: { currentPassword?: string; newPassword?: string; token?: string }) => args)
  .handler(async ({ data }) => {
    const { currentPassword, newPassword } = data;
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "A nova senha deve ter no mínimo 6 caracteres." };
    }

    let currentExpected = inMemoryPassword || "Torrescell123";
    try {
      const stored = await readAdminPassword();
      if (stored) currentExpected = stored;
    } catch {
      // Use default
    }

    if (currentPassword !== currentExpected) {
      return { success: false, error: "Senha atual incorreta." };
    }

    try {
      await writeAdminPassword(newPassword);
      return { success: true };
    } catch {
      return { success: true };
    }
  });

export const uploadImageServer = createServerFn({ method: "POST" })
  .validator(
    (args: { filename: string; base64Data: string; category?: string; title?: string }) => args,
  )
  .handler(async ({ data }) => {
    try {
      const rawData = data.base64Data || "";
      const cleanName = `${Date.now()}-${(data.filename || "imagem.jpg").replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const env = await getServerEnv();
      if (!env) {
        // Return base64 directly
        return { success: true, url: rawData, filename: cleanName };
      }

      // Extract base64 part
      const matches = rawData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      const buffer = Buffer.from(matches?.[2] ?? rawData, "base64");

      // Attempt to save to public uploads directory
      try {
        await env.fs.mkdir(env.primaryUploadsDir, { recursive: true });
        const filePath = env.path.join(env.primaryUploadsDir, cleanName);
        await env.fs.writeFile(filePath, buffer);
        return { success: true, url: `/uploads/${cleanName}`, filename: cleanName };
      } catch {
        // Fallback: in serverless (e.g. Vercel read-only Lambda), return the optimized base64 Data URL directly!
        return { success: true, url: rawData, filename: cleanName };
      }
    } catch (err) {
      console.warn("Upload handler fallback to direct image data:", err);
      if (data.base64Data) {
        return { success: true, url: data.base64Data, filename: data.filename };
      }
      return { success: false, error: String(err) };
    }
  });
