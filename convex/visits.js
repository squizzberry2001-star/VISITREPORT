import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertVisit = mutation({
  args: {
    deviceId: v.string(),
    visitId: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const payload = args.payload || {};
    const existing = await ctx.db
      .query("visits")
      .withIndex("by_visit_id", (q) => q.eq("visitId", args.visitId))
      .unique();

    const doc = {
      ownerDeviceId: args.deviceId,
      storeName: payload.storeName,
      storeCode: payload.storeCode,
      bestieName: payload.bestieName,
      visitDate: payload.visitDate,
      progress: payload.progress,
      payload,
      updatedAt: now,
      deletedAt: undefined,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("visits", {
        visitId: args.visitId,
        ...doc,
      });
    }

    await ctx.db.insert("syncEvents", {
      eventId: `visit-${args.visitId}-${now}`,
      deviceId: args.deviceId,
      type: "visit_upsert",
      payload: { visitId: args.visitId },
      createdAt: now,
    });

    return { ok: true, updatedAt: now };
  },
});

export const deleteVisit = mutation({
  args: {
    deviceId: v.string(),
    visitId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("visits")
      .withIndex("by_visit_id", (q) => q.eq("visitId", args.visitId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
    }

    await ctx.db.insert("syncEvents", {
      eventId: `visit-delete-${args.visitId}-${now}`,
      deviceId: args.deviceId,
      type: "visit_delete",
      payload: { visitId: args.visitId },
      createdAt: now,
    });

    return { ok: true };
  },
});

export const listVisits = query({
  args: {
    deviceId: v.string(),
    since: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("visits")
      .withIndex("by_owner_device", (q) => q.eq("ownerDeviceId", args.deviceId))
      .collect();

    return rows
      .filter((item) => !args.since || item.updatedAt > args.since)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
