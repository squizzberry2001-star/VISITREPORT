import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

function text(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

function normalizeCode(value: unknown): string {
  const raw = text(value).replace(/\.0$/, "");
  if (!raw) return "";
  return /^\d+$/.test(raw) ? raw.padStart(Math.min(Math.max(raw.length, 4), 8), "0") : raw;
}

function normalizeStore(raw: any, updatedBy = "web") {
  const siteCode4 = normalizeCode(raw.siteCode4 ?? raw.storeCode ?? raw.store_code ?? raw["Kode Toko"]);
  const siteCode = text(raw.siteCode ?? raw.code ?? raw.kode);
  const siteDescr = text(raw.siteDescr ?? raw.storeName ?? raw.store_name ?? raw.name ?? raw["Nama Toko"]);
  const sourceKey = text(siteCode4 || siteCode || siteDescr).toLowerCase();
  const status = text(raw.operationalStatus ?? raw.status ?? "active").toLowerCase();
  return {
    sourceKey,
    siteCode,
    siteCode4,
    siteDescr,
    type: text(raw.type ?? raw.Type),
    city: text(raw.city ?? raw.City ?? raw.Kota),
    address: text(raw.address ?? raw.Address ?? raw.Alamat),
    emailStore: text(raw.emailStore ?? raw.storeEmail ?? raw.email_store).toLowerCase(),
    storeHead: text(raw.storeHead ?? raw["Store Head"]),
    areaManager: text(raw.areaManager ?? raw["Area Manager"]),
    areaManagerEmail: text(raw.areaManagerEmail ?? raw.amEmail).toLowerCase(),
    regionalManager: text(raw.regionalManager ?? raw["Regional Manager"]),
    regionalManagerEmail: text(raw.regionalManagerEmail ?? raw.rmEmail).toLowerCase(),
    operationalStatus: ["inactive", "temporary_closed"].includes(status) ? status : "active",
    latitude: text(raw.latitude ?? raw.lat),
    longitude: text(raw.longitude ?? raw.lng ?? raw.lon),
    notes: text(raw.notes ?? raw.note),
    updatedAt: Date.now(),
    updatedBy,
  };
}

export const listStores = query({
  args: {
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
    q: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(5000, Math.round(args.limit ?? 5000)));
    const needle = text(args.q).toLowerCase();
    const rows = await ctx.db.query("masterStores").collect();
    return rows
      .filter((row) => args.includeInactive || row.operationalStatus !== "inactive")
      .filter((row) => {
        if (!needle) return true;
        return [row.siteCode4, row.siteCode, row.siteDescr, row.type, row.city, row.address, row.emailStore, row.areaManager]
          .map((item) => text(item).toLowerCase())
          .join(" ")
          .includes(needle);
      })
      .sort((a, b) => text(a.siteDescr).localeCompare(text(b.siteDescr)))
      .slice(0, limit);
  },
});

export const upsertMany = mutation({
  args: {
    stores: v.array(v.any()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let saved = 0;
    for (const raw of args.stores) {
      const store = normalizeStore(raw, args.updatedBy ?? "web");
      if (!store.sourceKey || !store.siteDescr) continue;
      const existing = await ctx.db
        .query("masterStores")
        .withIndex("by_sourceKey", (q) => q.eq("sourceKey", store.sourceKey))
        .unique();
      if (existing) {
        await ctx.db.patch(existing._id, store);
      } else {
        await ctx.db.insert("masterStores", store);
      }
      saved += 1;
    }
    return { ok: true, saved };
  },
});

export const replaceStores = mutation({
  args: {
    stores: v.array(v.any()),
    updatedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const oldRows = await ctx.db.query("masterStores").collect();
    for (const row of oldRows) {
      await ctx.db.delete(row._id);
    }
    let saved = 0;
    for (const raw of args.stores) {
      const store = normalizeStore(raw, args.updatedBy ?? "web");
      if (!store.sourceKey || !store.siteDescr) continue;
      await ctx.db.insert("masterStores", store);
      saved += 1;
    }
    return { ok: true, saved, replaced: true };
  },
});
