import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { readZip, cleanEntries } from "@/lib/updaterZip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PREVIEW_BRANCH = "update-preview";
const MAX_ZIP_BYTES = 4 * 1024 * 1024; // Vercel request body limit is ~4.5 MB
const MAX_FILES = 200;

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.MAIN_REPO; // e.g. "yourname/aigirlfriend-"
  const password = process.env.UPDATE_PASSWORD;
  const main = process.env.MAIN_BRANCH || "main";
  if (!token || !repo || !password) return null;
  return { token, repo, password, main };
}

function checkPassword(request: Request, expected: string): boolean {
  const given = request.headers.get("x-update-password") || "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function gh(token: string, path: string, init: RequestInit = {}) {
  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "aigirlfriend-updater",
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    cache: "no-store",
  });
}

async function ghJson(token: string, path: string, init: RequestInit = {}) {
  const res = await gh(token, path, init);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

function guard(request: Request) {
  const cfg = getConfig();
  if (!cfg) {
    return {
      cfg: null,
      error: NextResponse.json(
        { error: "GITHUB_TOKEN, MAIN_REPO বা UPDATE_PASSWORD সেট করা নেই (Vercel Environment Variables)।" },
        { status: 500 }
      ),
    };
  }
  if (!checkPassword(request, cfg.password)) {
    return { cfg: null, error: NextResponse.json({ error: "পাসওয়ার্ড ভুল।" }, { status: 401 }) };
  }
  return { cfg, error: null };
}

// POST: ZIP -> new preview branch (main site is NOT touched)
export async function POST(request: Request) {
  const { cfg, error } = guard(request);
  if (!cfg) return error!;

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "কোনো ফাইল পাওয়া যায়নি।" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".zip")) {
      return NextResponse.json({ error: "শুধু .zip ফাইল দিন।" }, { status: 400 });
    }
    if (file.size > MAX_ZIP_BYTES) {
      return NextResponse.json({ error: "ZIP ৪ MB এর বেশি। শুধু বদলানো ফাইল দিন।" }, { status: 413 });
    }

    const { files, deletes, skipped } = cleanEntries(readZip(Buffer.from(await file.arrayBuffer())));
    if (files.length + deletes.length === 0) {
      return NextResponse.json({ error: "ZIP এ কোনো ব্যবহারযোগ্য ফাইল নেই।" }, { status: 400 });
    }
    if (files.length + deletes.length > MAX_FILES) {
      return NextResponse.json({ error: `একবারে সর্বোচ্চ ${MAX_FILES}টা ফাইল।` }, { status: 400 });
    }

    // base = current head of the main branch
    const baseRef = await ghJson(cfg.token, `/repos/${cfg.repo}/git/ref/heads/${cfg.main}`);
    const baseSha: string = baseRef.object.sha;
    const baseCommit = await ghJson(cfg.token, `/repos/${cfg.repo}/git/commits/${baseSha}`);

    const blobs = await Promise.all(
      files.map(async (f) => {
        const blob = await ghJson(cfg.token, `/repos/${cfg.repo}/git/blobs`, {
          method: "POST",
          body: JSON.stringify({ content: f.data.toString("base64"), encoding: "base64" }),
        });
        return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
      })
    );
    const removals = deletes.map((p) => ({ path: p, mode: "100644", type: "blob", sha: null }));

    const tree = await ghJson(cfg.token, `/repos/${cfg.repo}/git/trees`, {
      method: "POST",
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree: [...blobs, ...removals] }),
    });

    const commit = await ghJson(cfg.token, `/repos/${cfg.repo}/git/commits`, {
      method: "POST",
      body: JSON.stringify({
        message: `update preview ${new Date().toISOString()}`,
        tree: tree.sha,
        parents: [baseSha],
      }),
    });

    // create or reset the preview branch
    const existing = await gh(cfg.token, `/repos/${cfg.repo}/git/ref/heads/${PREVIEW_BRANCH}`);
    if (existing.ok) {
      await ghJson(cfg.token, `/repos/${cfg.repo}/git/refs/heads/${PREVIEW_BRANCH}`, {
        method: "PATCH",
        body: JSON.stringify({ sha: commit.sha, force: true }),
      });
    } else {
      await ghJson(cfg.token, `/repos/${cfg.repo}/git/refs`, {
        method: "POST",
        body: JSON.stringify({ ref: `refs/heads/${PREVIEW_BRANCH}`, sha: commit.sha }),
      });
    }

    return NextResponse.json({
      ok: true,
      changed: files.map((f) => f.path),
      deleted: deletes,
      skipped,
    });
  } catch (err: any) {
    console.error("Updater POST error:", err);
    return NextResponse.json({ error: err.message || "আপডেট পাঠানো যায়নি।" }, { status: 500 });
  }
}

// GET: status of the preview branch + preview link
export async function GET(request: Request) {
  const { cfg, error } = guard(request);
  if (!cfg) return error!;

  try {
    const refRes = await gh(cfg.token, `/repos/${cfg.repo}/git/ref/heads/${PREVIEW_BRANCH}`);
    if (!refRes.ok) return NextResponse.json({ exists: false });
    const sha: string = (await refRes.json()).object.sha;

    let files: { name: string; status: string }[] = [];
    try {
      const cmp = await ghJson(cfg.token, `/repos/${cfg.repo}/compare/${cfg.main}...${PREVIEW_BRANCH}`);
      files = (cmp.files || []).map((f: any) => ({ name: f.filename, status: f.status }));
    } catch (e) {}

    let state = "waiting";
    let previewUrl = "";
    let logUrl = "";
    try {
      // Vercel may record the commit sha (not the branch name) as the deployment ref,
      // so look up by sha first, then scan the most recent deployments.
      let dep: any = null;
      const bySha = await ghJson(cfg.token, `/repos/${cfg.repo}/deployments?sha=${sha}&per_page=10`);
      dep = (bySha as any[])[0] || null;
      if (!dep) {
        const recent = await ghJson(cfg.token, `/repos/${cfg.repo}/deployments?per_page=30`);
        dep = (recent as any[]).find((d) => d.sha === sha || d.ref === sha) || null;
      }
      if (dep) {
        const sts = await ghJson(cfg.token, `/repos/${cfg.repo}/deployments/${dep.id}/statuses?per_page=5`);
        const latest = (sts as any[])[0];
        if (latest) {
          previewUrl = latest.environment_url || "";
          logUrl = latest.target_url || "";
          if (latest.state === "success") state = "ready";
          else if (latest.state === "failure" || latest.state === "error") state = "failed";
          else state = "building";
          if (state === "ready" && !previewUrl) previewUrl = logUrl;
        } else {
          state = "building";
        }
      }
    } catch (e) {}

    return NextResponse.json({ exists: true, sha, state, previewUrl, logUrl, files });
  } catch (err: any) {
    console.error("Updater GET error:", err);
    return NextResponse.json({ error: err.message || "স্ট্যাটাস জানা যায়নি।" }, { status: 500 });
  }
}

// PUT: approve -> merge preview into main (goes live)
export async function PUT(request: Request) {
  const { cfg, error } = guard(request);
  if (!cfg) return error!;

  try {
    const res = await gh(cfg.token, `/repos/${cfg.repo}/merges`, {
      method: "POST",
      body: JSON.stringify({
        base: cfg.main,
        head: PREVIEW_BRANCH,
        commit_message: "Apply approved update",
      }),
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      return NextResponse.json(
        { error: `চালু করা যায়নি (${res.status}): ${text.slice(0, 200)}` },
        { status: 502 }
      );
    }
    await gh(cfg.token, `/repos/${cfg.repo}/git/refs/heads/${PREVIEW_BRANCH}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Updater PUT error:", err);
    return NextResponse.json({ error: err.message || "চালু করা যায়নি।" }, { status: 500 });
  }
}

// DELETE: reject -> remove preview branch
export async function DELETE(request: Request) {
  const { cfg, error } = guard(request);
  if (!cfg) return error!;

  try {
    await gh(cfg.token, `/repos/${cfg.repo}/git/refs/heads/${PREVIEW_BRANCH}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "বাতিল করা যায়নি।" }, { status: 500 });
  }
}
