export type DropFile = { path: string; content: string };

export type ParseResult =
  | { ok: true; files: DropFile[]; warnings: string[] }
  | { ok: false; error: string; warnings?: string[] };

const FILE_HEADER_RE = /^FILE:\s+(.+)\s*$/gm;

export function parseDropText(dropText: string): ParseResult {
  if (!dropText || !dropText.trim()) return { ok: false, error: "Empty drop text." };

  const warnings: string[] = [];
  const files: DropFile[] = [];
  const headers: Array<{ path: string; startIdx: number; endIdx: number }> = [];
  let m: RegExpExecArray | null;

  while ((m = FILE_HEADER_RE.exec(dropText)) !== null) {
    const rawPath = (m[1] || "").trim();
    if (!rawPath) continue;
    headers.push({ path: rawPath, startIdx: m.index, endIdx: FILE_HEADER_RE.lastIndex });
  }

  if (headers.length === 0) {
    return { ok: false, error: "No FILE: blocks found." };
  }

  for (let i = 0; i < headers.length; i++) {
    const h = headers[i];
    const nextStart = i + 1 < headers.length ? headers[i + 1].startIdx : dropText.length;
    const block = dropText.slice(h.endIdx, nextStart);

    const fenceStart = block.indexOf("```");
    if (fenceStart === -1) { warnings.push(`FILE: ${h.path} missing fence; skipped.`); continue; }
    const fenceEnd = block.indexOf("```", fenceStart + 3);
    if (fenceEnd === -1) { warnings.push(`FILE: ${h.path} unterminated fence; skipped.`); continue; }

    const afterOpen = block.indexOf("\n", fenceStart);
    if (afterOpen === -1) { warnings.push(`FILE: ${h.path} malformed fence; skipped.`); continue; }

    const content = block.slice(afterOpen + 1, fenceEnd);
    files.push({ path: h.path.trim(), content });
  }

  if (files.length === 0) return { ok: false, error: "No valid FILE blocks parsed.", warnings };
  return { ok: true, files, warnings };
}
