import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  masterStores: defineTable({
    sourceKey: v.string(),
    siteCode: v.optional(v.string()),
    siteCode4: v.optional(v.string()),
    siteDescr: v.string(),
    type: v.optional(v.string()),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    emailStore: v.optional(v.string()),
    storeHead: v.optional(v.string()),
    areaManager: v.optional(v.string()),
    areaManagerEmail: v.optional(v.string()),
    regionalManager: v.optional(v.string()),
    regionalManagerEmail: v.optional(v.string()),
    operationalStatus: v.optional(v.string()),
    latitude: v.optional(v.string()),
    longitude: v.optional(v.string()),
    notes: v.optional(v.string()),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_sourceKey", ["sourceKey"])
    .index("by_siteCode4", ["siteCode4"])
    .index("by_siteDescr", ["siteDescr"])
    .index("by_updatedAt", ["updatedAt"]),

  appSettings: defineTable({
    key: v.string(),
    payload: v.any(),
    updatedAt: v.number(),
    updatedBy: v.optional(v.string()),
  })
    .index("by_key", ["key"])
    .index("by_updatedAt", ["updatedAt"]),

  monitorVisits: defineTable({
    visitKey: v.string(),
    bestie_name: v.optional(v.string()),
    store_name: v.optional(v.string()),
    store_code: v.optional(v.string()),
    visit_date: v.optional(v.string()),
    total_visits: v.optional(v.number()),
    last_visit_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
    session_id: v.optional(v.string()),
    event_type: v.optional(v.string()),
    page_url: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    payload: v.any(),
    updatedAt: v.number(),
  })
    .index("by_visitKey", ["visitKey"])
    .index("by_updatedAt", ["updatedAt"]),

  presence: defineTable({
    session_id: v.string(),
    bestie_name: v.optional(v.string()),
    store_name: v.optional(v.string()),
    store_code: v.optional(v.string()),
    screen_name: v.optional(v.string()),
    last_seen_at: v.optional(v.string()),
    updated_at: v.optional(v.string()),
    page_url: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    payload: v.any(),
    updatedAt: v.number(),
  })
    .index("by_session_id", ["session_id"])
    .index("by_updatedAt", ["updatedAt"]),

  manualStoreRequests: defineTable({
    requestId: v.string(),
    status: v.string(),
    bestie_name: v.optional(v.string()),
    store_name: v.optional(v.string()),
    store_code: v.optional(v.string()),
    address: v.optional(v.string()),
    note: v.optional(v.string()),
    session_id: v.optional(v.string()),
    page_url: v.optional(v.string()),
    user_agent: v.optional(v.string()),
    payload: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_requestId", ["requestId"])
    .index("by_status", ["status"])
    .index("by_updatedAt", ["updatedAt"]),
});
