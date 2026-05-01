# Convex backend rules for Bestie Visit

## Tujuan
Folder ini menyiapkan struktur backend/database untuk fitur Linked Device dan sync visit.

## Tabel
- `devices`: identitas device yang sudah pernah membuka aplikasi.
- `deviceLinks`: kode/link antar device, termasuk status pending/linked/expired.
- `visits`: data visit utama untuk sync antar device.
- `syncEvents`: log perubahan agar client bisa mengecek update terakhir.

## Cara pakai
1. Install Convex di project:
   ```bash
   npm install convex
   npx convex dev
   ```
2. Copy folder `convex/` ini ke root project.
3. Deploy Convex:
   ```bash
   npx convex deploy
   ```
4. Simpan URL Convex ke `convex-config.js`.
5. Hubungkan client ke mutation/query:
   - `linkedDevices.registerDevice`
   - `linkedDevices.createLinkCode`
   - `linkedDevices.acceptLinkCode`
   - `linkedDevices.getLinkedDevices`
   - `visits.upsertVisit`
   - `visits.deleteVisit`
   - `visits.listVisits`

## Catatan implementasi
Fitur QR di app v42 masih menyiapkan link device dan local marker.
Untuk real sync penuh, client perlu memanggil mutation/query di atas saat:
- app dibuka
- visit dibuat/diubah/dihapus
- device selesai scan QR
