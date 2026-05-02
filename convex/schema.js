import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  devices: defineTable({
    deviceId: v.string(),
    deviceName: v.optional(v.string()),
    platform: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    role: v.union(v.literal("desktop"), v.literal("mobile"), v.literal("tablet"), v.literal("unknown")),
    linkedAt: v.optional(v.number()),
    lastSeenAt: v.number(),
    isActive: v.boolean(),
  }).index("by_device_id", ["deviceId"]),

  deviceLinks: defineTable({
    linkCode: v.string(),
    sourceDeviceId: v.string(),
    targetDeviceId: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("linked"), v.literal("revoked"), v.literal("expired")),
    createdAt: v.number(),
    expiresAt: v.number(),
    linkedAt: v.optional(v.number()),
  })
    .index("by_link_code", ["linkCode"])
    .index("by_source_device", ["sourceDeviceId"])
    .index("by_target_device", ["targetDeviceId"]),

  visits: defineTable({
    visitId: v.string(),
    ownerDeviceId: v.string(),
    storeName: v.optional(v.string()),
    storeCode: v.optional(v.string()),
    bestieName: v.optional(v.string()),
    visitDate: v.optional(v.string()),
    progress: v.optional(v.number()),
    payload: v.any(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_visit_id", ["visitId"])
    .index("by_owner_device", ["ownerDeviceId"])
    .index("by_updated_at", ["updatedAt"]),

  syncEvents: defineTable({
    eventId: v.string(),
    deviceId: v.string(),
    type: v.union(v.literal("visit_upsert"), v.literal("visit_delete"), v.literal("device_link"), v.literal("device_unlink")),
    payload: v.any(),
    createdAt: v.number(),
  })
    .index("by_device", ["deviceId"])
    .index("by_created_at", ["createdAt"]),

  appConfigs: defineTable({
    configKey: v.string(),
    payload: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  }).index("by_config_key", ["configKey"]),
});
