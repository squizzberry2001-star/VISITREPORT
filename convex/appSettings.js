import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const listConfigs = query({
  args: {
    keys: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query("appConfigs").collect();
    const allowed = Array.isArray(args.keys) && args.keys.length ? new Set(args.keys) : null;
    return rows
      .filter((row) => !allowed || allowed.has(row.configKey))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  },
});

export const getConfig = query({
  args: {
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("appConfigs")
      .withIndex("by_config_key", (q) => q.eq("configKey", args.key))
      .unique();
  },
});

export const setConfig = mutation({
  args: {
    key: v.string(),
    payload: v.any(),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("appConfigs")
      .withIndex("by_config_key", (q) => q.eq("configKey", args.key))
      .unique();

    const doc = {
      configKey: args.key,
      payload: args.payload,
      updatedAt: now,
      updatedBy: args.updatedBy,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return { ok: true, id: existing._id, updatedAt: now };
    }

    const id = await ctx.db.insert("appConfigs", doc);
    return { ok: true, id, updatedAt: now };
  },
});
