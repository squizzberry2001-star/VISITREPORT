import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listConfigs = query({
  args: { keys: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("appSettings").collect();
    const allowed = args.keys && args.keys.length ? new Set(args.keys) : null;
    return rows
      .filter((row) => !allowed || allowed.has(row.key))
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((row) => ({
        key: row.key,
        config_key: row.key,
        payload: row.payload,
        updatedAt: new Date(row.updatedAt).toISOString(),
        updated_at: new Date(row.updatedAt).toISOString(),
        updatedBy: row.updatedBy ?? "web",
        updated_by: row.updatedBy ?? "web",
      }));
  },
});

export const setConfig = mutation({
  args: {
    key: v.string(),
    payload: v.any(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("appSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    const row = { key: args.key, payload: args.payload, updatedAt: Date.now(), updatedBy: args.updatedBy ?? "web" };
    if (existing) await ctx.db.patch(existing._id, row);
    else await ctx.db.insert("appSettings", row);
    return { ok: true, key: args.key };
  },
});
