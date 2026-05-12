// /admin/operator-audit — read-only operator action ledger.
//
// Per Constitution §V every operator-flagged write across HAP lands in
// hap_operator_audit. This page surfaces the most recent 100 rows so
// Sonny can see who did what without going through psql. Auth gate
// matches the rest of the operator surface: Clerk publicMetadata.role
// === 'operator', signed `hap_operator` cookie, OR x-hap-operator-key
// header (CLI / curl).

import { headers, cookies } from "next/headers";
import { currentUser } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";
import {
  OPERATOR_COOKIE_NAME,
  OPERATOR_HEADER_NAME,
  verifyOperatorCookieValue,
} from "@/lib/operator-auth";
import { HiveFooter } from "../../_lib/HiveFooter";
import {
  TOKENS,
  PAGE_MAIN,
  TITLE,
  LEAD,
  LABEL,
  INPUT,
  PRIMARY_BTN,
  CARD,
  FOCUS_RING_CSS,
} from "../../_lib/activityFormStyles";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AuditRow = {
  id: string;
  user_identity: string;
  action: string;
  engine_slug: string;
  target_id: string | null;
  target_type: string | null;
  request_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type SearchParams = {
  from?: string | string[];
  to?: string | string[];
};

function param(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

function isYmd(v: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

async function isOperator(): Promise<boolean> {
  // 1) Clerk role
  try {
    const u = await currentUser();
    const role = (u?.publicMetadata as { role?: unknown } | undefined)?.role;
    if (role === "operator") return true;
  } catch {
    // currentUser() may throw if no session; fall through.
  }
  // 2) x-hap-operator-key header (CLI / curl path; constant-time-ish via
  //    string compare — header path is ASCII-fixed)
  const h = await headers();
  const headerKey = h.get(OPERATOR_HEADER_NAME);
  const expected = process.env.OPERATOR_KEY;
  if (
    headerKey &&
    expected &&
    headerKey.length === expected.length &&
    headerKey === expected
  ) {
    return true;
  }
  // 3) Signed hap_operator cookie
  const jar = await cookies();
  const raw = jar.get(OPERATOR_COOKIE_NAME)?.value;
  if (raw && verifyOperatorCookieValue(raw)) return true;
  return false;
}

export default async function OperatorAuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const fromRaw = param(sp.from);
  const toRaw = param(sp.to);
  const from = fromRaw && isYmd(fromRaw) ? fromRaw : "";
  const to = toRaw && isYmd(toRaw) ? toRaw : "";

  const ok = await isOperator();
  if (!ok) {
    return (
      <main style={PAGE_MAIN}>
        <style>{FOCUS_RING_CSS}</style>
        <h1 style={TITLE}>Not authorised</h1>
        <p style={LEAD}>
          This page is restricted to operators. Sign in with an operator
          account, set the operator cookie via{" "}
          <code style={{ color: TOKENS.gold }}>/api/operator/login</code>, or
          send the <code style={{ color: TOKENS.gold }}>{OPERATOR_HEADER_NAME}</code>{" "}
          header.
        </p>
        <HiveFooter />
      </main>
    );
  }

  // Build the query with optional date bounds. Inclusive `to` ends at
  // 23:59:59.999 of the chosen day so the last day's actions are caught.
  const fromTs = from ? `${from}T00:00:00.000Z` : null;
  const toTs = to ? `${to}T23:59:59.999Z` : null;

  let rows: AuditRow[];
  if (fromTs && toTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, target_id, target_type,
             request_id, metadata, created_at
        FROM hap_operator_audit
       WHERE created_at >= ${fromTs}::timestamptz
         AND created_at <= ${toTs}::timestamptz
       ORDER BY created_at DESC
       LIMIT 100
    `) as unknown as AuditRow[];
  } else if (fromTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, target_id, target_type,
             request_id, metadata, created_at
        FROM hap_operator_audit
       WHERE created_at >= ${fromTs}::timestamptz
       ORDER BY created_at DESC
       LIMIT 100
    `) as unknown as AuditRow[];
  } else if (toTs) {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, target_id, target_type,
             request_id, metadata, created_at
        FROM hap_operator_audit
       WHERE created_at <= ${toTs}::timestamptz
       ORDER BY created_at DESC
       LIMIT 100
    `) as unknown as AuditRow[];
  } else {
    rows = (await sql`
      SELECT id, user_identity, action, engine_slug, target_id, target_type,
             request_id, metadata, created_at
        FROM hap_operator_audit
       ORDER BY created_at DESC
       LIMIT 100
    `) as unknown as AuditRow[];
  }

  return (
    <main style={{ ...PAGE_MAIN, maxWidth: 960 }}>
      <style>{FOCUS_RING_CSS}</style>
      <h1 style={TITLE}>Operator audit</h1>
      <p style={LEAD}>
        Most recent 100 operator actions on HiveActivityPartner. Read-only
        — every operator-flagged write logs here.
      </p>

      <form
        method="get"
        action="/admin/operator-audit"
        style={{ ...CARD, display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}
        aria-label="Filter audit rows by date"
      >
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label htmlFor="from" style={LABEL}>From (UTC)</label>
          <input
            id="from"
            name="from"
            type="date"
            defaultValue={from}
            style={INPUT}
          />
        </div>
        <div style={{ flex: "1 1 160px", minWidth: 140 }}>
          <label htmlFor="to" style={LABEL}>To (UTC)</label>
          <input
            id="to"
            name="to"
            type="date"
            defaultValue={to}
            style={INPUT}
          />
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" style={PRIMARY_BTN}>Apply</button>
          <a
            href="/admin/operator-audit"
            style={{
              minHeight: 44,
              padding: "10px 18px",
              fontSize: 15,
              color: TOKENS.paper,
              background: "transparent",
              border: `1px solid ${TOKENS.border}`,
              borderRadius: 8,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Reset
          </a>
        </div>
      </form>

      <p style={{ ...LEAD, fontSize: 12, marginBottom: 12 }}>
        Showing <strong style={{ color: TOKENS.paper }}>{rows.length}</strong>{" "}
        row{rows.length === 1 ? "" : "s"}.
      </p>

      {rows.length === 0 ? (
        <p style={{ ...CARD, color: TOKENS.muted }}>
          No audit rows for this filter.
        </p>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: `1px solid ${TOKENS.border}`,
            borderRadius: 12,
            background: TOKENS.bgCard,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              color: TOKENS.paper,
              minWidth: 720,
            }}
          >
            <thead>
              <tr style={{ background: TOKENS.bgCardActive, textAlign: "left" }}>
                <Th>Timestamp (UTC)</Th>
                <Th>Operator</Th>
                <Th>Action</Th>
                <Th>Engine</Th>
                <Th>User / target</Th>
                <Th>File size</Th>
                <Th>File type</Th>
                <Th>Request ID</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const md = r.metadata ?? {};
                const fileSize =
                  typeof md["file_size"] === "number"
                    ? formatBytes(md["file_size"] as number)
                    : typeof md["fileSize"] === "number"
                    ? formatBytes(md["fileSize"] as number)
                    : "—";
                const fileType =
                  (typeof md["file_type"] === "string" && md["file_type"]) ||
                  (typeof md["fileType"] === "string" && md["fileType"]) ||
                  r.target_type ||
                  "—";
                const userId =
                  (typeof md["user_id"] === "string" && md["user_id"]) ||
                  (typeof md["userId"] === "string" && md["userId"]) ||
                  r.target_id ||
                  "—";
                return (
                  <tr key={r.id} style={{ borderTop: `1px solid ${TOKENS.border}` }}>
                    <Td mono>{new Date(r.created_at).toISOString().replace("T", " ").slice(0, 19)}</Td>
                    <Td>{r.user_identity}</Td>
                    <Td>
                      <span
                        style={{
                          display: "inline-block",
                          fontSize: 11,
                          color: TOKENS.gold,
                          border: `1px solid ${TOKENS.goldDim}`,
                          borderRadius: 6,
                          padding: "1px 8px",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {r.action}
                      </span>
                    </Td>
                    <Td mono>{r.engine_slug}</Td>
                    <Td mono>{userId}</Td>
                    <Td mono>{fileSize}</Td>
                    <Td mono>{fileType}</Td>
                    <Td mono>{r.request_id ?? "—"}</Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <HiveFooter />
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        padding: "10px 12px",
        fontSize: 11,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        color: TOKENS.muted,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td
      style={{
        padding: "10px 12px",
        verticalAlign: "top",
        fontFamily: mono
          ? "ui-monospace, SFMono-Regular, Menlo, monospace"
          : undefined,
        fontSize: mono ? 12 : 13,
        color: TOKENS.paper,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / 1024 / 1024).toFixed(1)} MB`;
  return `${(n / 1024 / 1024 / 1024).toFixed(1)} GB`;
}
