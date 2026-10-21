import { inflateRawSync } from "zlib";

// Small ZIP reader (no extra packages needed). Supports "stored" and "deflate" entries.

export interface ZipEntry {
  name: string;
  data: Buffer;
}

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

export function readZip(buf: Buffer): ZipEntry[] {
  let eocd = -1;
  const lowest = Math.max(0, buf.length - 22 - 65535);
  for (let i = buf.length - 22; i >= lowest; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error("এটা সঠিক ZIP ফাইল নয়।");

  const total = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries: ZipEntry[] = [];
  let totalBytes = 0;

  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error("ZIP ফাইল নষ্ট।");
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString("utf8", p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith("/")) continue;
    if (compSize === 0xffffffff || localOffset === 0xffffffff) {
      throw new Error("খুব বড় ZIP (zip64) সমর্থিত নয়।");
    }

    if (buf.readUInt32LE(localOffset) !== 0x04034b50) throw new Error("ZIP ফাইল নষ্ট।");
    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const raw = buf.subarray(start, start + compSize);

    let data: Buffer;
    if (method === 0) {
      data = Buffer.from(raw);
    } else if (method === 8) {
      data = inflateRawSync(raw, { maxOutputLength: MAX_FILE_BYTES });
    } else {
      throw new Error("এই ZIP কম্প্রেশন সমর্থিত নয়।");
    }

    if (data.length > MAX_FILE_BYTES) throw new Error(`${name} ফাইলটি খুব বড়।`);
    totalBytes += data.length;
    if (totalBytes > MAX_TOTAL_BYTES) throw new Error("ZIP এর মোট সাইজ খুব বড়।");
    entries.push({ name, data });
  }
  return entries;
}

// ---------- path cleaning ----------

const KNOWN_ROOTS = ["app", "components", "lib", "public", "hooks", "styles", "pages", "src"];

// Files/folders an update is never allowed to touch
const BLOCKED_PREFIXES = [
  ".git/",
  ".github/",
  "node_modules/",
  ".next/",
  "app/api/updater/",
  "app/updater/",
  "lib/updaterZip.ts",
];

function cleanPath(raw: string): string | null {
  let name = raw.replace(/\\/g, "/").replace(/^\.\//, "");
  if (!name || name.startsWith("/") || name.includes(":")) return null;
  const parts = name.split("/");
  if (parts.some((s) => s === ".." || s === "." || s === "")) return null;
  return parts.join("/");
}

function isBlocked(path: string): boolean {
  if (BLOCKED_PREFIXES.some((b) => path === b || path.startsWith(b))) return true;
  const base = path.split("/").pop() || "";
  if (base.startsWith(".env") && base !== ".env.example") return true;
  return false;
}

export interface CleanResult {
  files: { path: string; data: Buffer }[];
  deletes: string[];
  skipped: string[];
}

export function cleanEntries(entries: ZipEntry[]): CleanResult {
  const usable = entries.filter((e) => {
    const n = e.name.replace(/\\/g, "/");
    return !n.startsWith("__MACOSX/") && !n.includes("/__MACOSX/") && !n.endsWith(".DS_Store");
  });

  // If everything sits inside ONE wrapper folder (like "my-update/"), remove it
  const firsts = new Set(usable.map((e) => e.name.replace(/\\/g, "/").split("/")[0]));
  let strip = "";
  if (firsts.size === 1) {
    const only = Array.from(firsts)[0];
    const hasWrapper = usable.every((e) => e.name.replace(/\\/g, "/").includes("/"));
    if (hasWrapper && !KNOWN_ROOTS.includes(only)) strip = only + "/";
  }

  const files: { path: string; data: Buffer }[] = [];
  const deletes: string[] = [];
  const skipped: string[] = [];

  for (const e of usable) {
    let name = e.name.replace(/\\/g, "/");
    if (strip && name.startsWith(strip)) name = name.slice(strip.length);

    if (name === "_delete.txt") {
      for (const line of e.data.toString("utf8").split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const cp = cleanPath(t);
        if (!cp || isBlocked(cp)) skipped.push(t);
        else deletes.push(cp);
      }
      continue;
    }

    const cp = cleanPath(name);
    if (!cp || isBlocked(cp)) {
      skipped.push(name);
      continue;
    }
    files.push({ path: cp, data: e.data });
  }

  return { files, deletes, skipped };
}
