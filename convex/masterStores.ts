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

function normalizeHeaderKey(value: unknown): string {
  return text(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "");
}

function pick(raw: any, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const value = raw?.[key];
    if (value !== undefined && value !== null && text(value) !== "") return text(value);
  }
  const wanted = new Set(keys.map(normalizeHeaderKey));
  for (const [key, value] of Object.entries(raw || {})) {
    if (value !== undefined && value !== null && text(value) !== "" && wanted.has(normalizeHeaderKey(key))) {
      return text(value);
    }
  }
  return fallback;
}

function normalizeStore(raw: any, updatedBy = "web") {
  const siteCode4 = normalizeCode(pick(raw, ["siteCode4", "storeCode", "store_code", "Kode Toko", "Kode Store", "Store Code", "Site Code 4", "SITE_CODE4"]));
  const siteCode = pick(raw, ["siteCode", "code", "kode", "site", "Site", "Site Code"]);
  const siteDescr = pick(raw, ["siteDescr", "storeName", "store_name", "name", "Nama Toko", "Nama Store", "Store Name", "Site Descr", "Site Description"]);
  const sourceKey = text(siteCode4 || siteCode || siteDescr).toLowerCase();
  const status = pick(raw, ["operationalStatus", "Operational Status", "status", "Status"], "active").toLowerCase();
  const typeStore = pick(raw, ["type", "Type", "typeStore", "Type Store", "TYPE STORE", "Jenis", "Jenis Store", "Format Store"]);
  return {
    sourceKey,
    siteCode,
    siteCode4,
    siteDescr,
    type: typeStore,
    typeStore,
    city: pick(raw, ["city", "City", "Kota"]),
    address: pick(raw, ["address", "Address", "Alamat", "Alamat Store"]),
    emailStore: pick(raw, ["emailStore", "Email Store", "EMAIL STORE", "Email Toko", "storeEmail", "Store Email", "email_store", "Email"]).toLowerCase(),
    storeHead: pick(raw, ["storeHead", "Store Head", "STORE HEAD", "Kepala Toko"]),
    areaManager: pick(raw, ["areaManager", "Area Manager", "AREA MANAGER", "Nama Area Manager", "am", "AM"]),
    areaManagerEmail: pick(raw, ["areaManagerEmail", "Area Manager Email", "Email Area Manager", "amEmail", "AM Email"]).toLowerCase(),
    regionalManager: pick(raw, ["regionalManager", "Regional Manager", "REGIONAL MANAGER", "Nama Regional Manager", "rm", "RM"]),
    regionalManagerEmail: pick(raw, ["regionalManagerEmail", "Regional Manager Email", "Email Regional Manager", "rmEmail", "RM Email"]).toLowerCase(),
    operationalStatus: ["inactive", "temporary_closed"].includes(status) ? status : "active",
    latitude: pick(raw, ["latitude", "lat"]),
    longitude: pick(raw, ["longitude", "lng", "lon"]),
    notes: pick(raw, ["notes", "note", "Catatan"]),
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
