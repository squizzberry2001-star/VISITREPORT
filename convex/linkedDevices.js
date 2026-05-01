import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const LINK_TTL_MS = 5 * 60 * 1000;

export const registerDevice = mutation({
  args: {
    deviceId: v.string(),
    deviceName: v.optional(v.string()),
    platform: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    role: v.optional(v.union(v.literal("desktop"), v.literal("mobile"), v.literal("tablet"), v.literal("unknown"))),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query("devices")
      .withIndex("by_device_id", (q) => q.eq("deviceId", args.deviceId))
      .unique();

    const patch = {
      deviceName: args.deviceName,
      platform: args.platform,
      userAgent: args.userAgent,
      role: args.role || "unknown",
      lastSeenAt: now,
      isActive: true,
    };

    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return existing._id;
    }

    return await ctx.db.insert("devices", {
      deviceId: args.deviceId,
      ...patch,
    });
  },
});

export const createLinkCode = mutation({
  args: {
    sourceDeviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const linkCode = `${args.sourceDeviceId}.${Math.random().toString(36).slice(2, 10)}.${now.toString(36)}`;

    await ctx.db.insert("deviceLinks", {
      linkCode,
      sourceDeviceId: args.sourceDeviceId,
      status: "pending",
      createdAt: now,
      expiresAt: now + LINK_TTL_MS,
    });

    return {
      linkCode,
      expiresAt: now + LINK_TTL_MS,
    };
  },
});

export const acceptLinkCode = mutation({
  args: {
    linkCode: v.string(),
    targetDeviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const link = await ctx.db
      .query("deviceLinks")
      .withIndex("by_link_code", (q) => q.eq("linkCode", args.linkCode))
      .unique();

    if (!link) throw new Error("Kode linked device tidak ditemukan.");
    if (link.status !== "pending") throw new Error("Kode linked device sudah tidak aktif.");
    if (link.expiresAt < now) {
      await ctx.db.patch(link._id, { status: "expired" });
      throw new Error("Kode linked device sudah expired.");
    }

    await ctx.db.patch(link._id, {
      targetDeviceId: args.targetDeviceId,
      status: "linked",
      linkedAt: now,
    });

    await ctx.db.insert("syncEvents", {
      eventId: `link-${link._id}-${now}`,
      deviceId: link.sourceDeviceId,
      type: "device_link",
      payload: { targetDeviceId: args.targetDeviceId },
      createdAt: now,
    });

    return { ok: true };
  },
});

export const getLinkedDevices = query({
  args: {
    deviceId: v.string(),
  },
  handler: async (ctx, args) => {
    const asSource = await ctx.db
      .query("deviceLinks")
      .withIndex("by_source_device", (q) => q.eq("sourceDeviceId", args.deviceId))
      .collect();

    const asTarget = await ctx.db
      .query("deviceLinks")
      .withIndex("by_target_device", (q) => q.eq("targetDeviceId", args.deviceId))
      .collect();

    return [...asSource, ...asTarget].filter((item) => item.status === "linked");
  },
});
