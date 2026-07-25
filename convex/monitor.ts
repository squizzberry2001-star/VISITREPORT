import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function text(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}
function visitKey(payload: any): string {
  return text(payload.visit_key ?? payload.visitKey ?? [payload.bestie_name, payload.store_name, payload.visit_date].join("__")) || String(Date.now());
}

export const listVisits = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(1000, Math.round(args.limit ?? 500)));
    const rows = await ctx.db.query("monitorVisits").withIndex("by_updatedAt").order("desc").take(limit);
    return rows.map((row) => ({ ...row.payload, ...row, visit_key: row.visitKey }));
  },
});

export const upsertVisit = mutation({
  args: { payload: v.optional(v.any()), visit: v.optional(v.any()) },
  handler: async (ctx, args) => {
    const payload = args.payload ?? args.visit ?? {};
    const key = visitKey(payload);
    const existing = await ctx.db.query("monitorVisits").withIndex("by_visitKey", (q) => q.eq("visitKey", key)).unique();
    const now = Date.now();
    const row = {
      visitKey: key,
      bestie_name: text(payload.bestie_name ?? payload.bestieName ?? payload.nama),
      store_name: text(payload.store_name ?? payload.storeName ?? payload.store),
      store_code: text(payload.store_code ?? payload.storeCode),
      visit_date: text(payload.visit_date ?? payload.visitDate ?? payload.tanggal),
      total_visits: Number(payload.total_visits ?? 1),
      last_visit_at: text(payload.last_visit_at ?? payload.updated_at ?? new Date(now).toISOString()),
      updated_at: text(payload.updated_at ?? new Date(now).toISOString()),
      session_id: text(payload.session_id),
      event_type: text(payload.event_type),
      page_url: text(payload.page_url),
      user_agent: text(payload.user_agent),
      payload,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("monitorVisits", row);
    return { ok: true, visit_key: key };
  },
});

export const listPresence = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(500, Math.round(args.limit ?? 300)));
    const rows = await ctx.db.query("presence").withIndex("by_updatedAt").order("desc").take(limit);
    return rows.map((row) => ({ ...row.payload, ...row }));
  },
});

export const upsertPresence = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const payload = args.payload ?? {};
    const sessionId = text(payload.session_id ?? payload.sessionId) || String(Date.now());
    const now = Date.now();
    const existing = await ctx.db.query("presence").withIndex("by_session_id", (q) => q.eq("session_id", sessionId)).unique();
    const row = {
      session_id: sessionId,
      bestie_name: text(payload.bestie_name ?? payload.bestieName),
      store_name: text(payload.store_name ?? payload.storeName),
      store_code: text(payload.store_code ?? payload.storeCode),
      screen_name: text(payload.screen_name ?? payload.screenName ?? payload.screen),
      last_seen_at: text(payload.last_seen_at ?? new Date(now).toISOString()),
      updated_at: text(payload.updated_at ?? new Date(now).toISOString()),
      page_url: text(payload.page_url),
      user_agent: text(payload.user_agent),
      payload,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("presence", row);
    return { ok: true, session_id: sessionId };
  },
});

export const listManualStoreRequests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(1000, Math.round(args.limit ?? 500)));
    const rows = await ctx.db.query("manualStoreRequests").withIndex("by_updatedAt").order("desc").take(limit);
    return rows.map((row) => ({ ...row.payload, ...row, request_id: row.requestId }));
  },
});

export const upsertManualStoreRequest = mutation({
  args: { payload: v.any() },
  handler: async (ctx, args) => {
    const payload = args.payload ?? {};
    const requestId = text(payload.request_id ?? payload.id) || String(Date.now());
    const now = Date.now();
    const existing = await ctx.db.query("manualStoreRequests").withIndex("by_requestId", (q) => q.eq("requestId", requestId)).unique();
    const row = {
      requestId,
      status: text(payload.status) || "pending",
      bestie_name: text(payload.bestie_name ?? payload.bestieName),
      store_name: text(payload.store_name ?? payload.storeName ?? payload.store),
      store_code: text(payload.store_code ?? payload.storeCode),
      address: text(payload.address),
      note: text(payload.note),
      session_id: text(payload.session_id),
      page_url: text(payload.page_url),
      user_agent: text(payload.user_agent),
      payload,
      createdAt: Number(payload.createdAt ?? now),
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("manualStoreRequests", row);
    return { ok: true, request_id: requestId };
  },
});
