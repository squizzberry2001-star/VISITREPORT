// Example Convex HTTP actions. Copy this idea into convex/http.js in your Convex project.
// Adjust database schema/authorization to match your organization policy.
//
// import { httpRouter } from "convex/server";
// import { httpAction } from "./_generated/server";
// const http = httpRouter();
// http.route({
//   path: "/monitor/upsertVisit",
//   method: "POST",
//   handler: httpAction(async (ctx, request) => {
//     const payload = await request.json();
//     const existing = await ctx.db
//       .query("regional_bestie_visits")
//       .withIndex("by_visit_key", q => q.eq("visit_key", payload.visit_key))
//       .unique();
//     if (existing) await ctx.db.patch(existing._id, payload);
//     else await ctx.db.insert("regional_bestie_visits", payload);
//     return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
//   })
// });
// http.route({
//   path: "/monitor/listVisits",
//   method: "GET",
//   handler: httpAction(async (ctx) => {
//     const rows = await ctx.db.query("regional_bestie_visits").order("desc").take(500);
//     return new Response(JSON.stringify({ rows }), { headers: { "content-type": "application/json" } });
//   })
// });
// export default http;
