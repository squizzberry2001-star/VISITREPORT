import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function text(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

export const setLatest = mutation({
  args: {
    backupKey: v.string(),
    deviceId: v.optional(v.string()),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const backupKey = text(args.backupKey) || "regional-bestie-visit-report-v1";
    const deviceId = text(args.deviceId) || text(args.payload?.deviceId) || "unknown-device";
    const existing = await ctx.db
      .query("deviceBackups")
      .withIndex("by_backupKey", (q) => q.eq("backupKey", backupKey))
      .unique();
    const row = {
      backupKey,
      deviceId,
      payload: args.payload,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("deviceBackups", row);
    return { ok: true, backupKey, deviceId, updatedAt: now };
  },
});

export const getLatest = query({
  args: { backupKey: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const backupKey = text(args.backupKey) || "regional-bestie-visit-report-v1";
    const row = await ctx.db
      .query("deviceBackups")
      .withIndex("by_backupKey", (q) => q.eq("backupKey", backupKey))
      .unique();
    if (!row) return null;
    return {
      ok: true,
      backupKey: row.backupKey,
      deviceId: row.deviceId,
      payload: row.payload,
      updatedAt: row.updatedAt,
      updated_at: new Date(row.updatedAt).toISOString(),
    };
  },
});
