# คู่มือนักพัฒนา KicksVault

เอกสารนี้สำหรับคนที่จะ setup local development หรือพัฒนา KicksVault ต่อ

## 1. Tech stack

- Next.js 16 App Router
- React 19
- TypeScript
- Prisma 6
- PostgreSQL
- Custom JWT auth ผ่าน http-only cookies
- bcrypt สำหรับ password และ refresh token hash
- Zustand สำหรับ cart ฝั่ง client
- Tailwind CSS 4
- Node test runner ผ่าน `tsx`

## 2. Setup local

ติดตั้ง dependencies:

```powershell
npm.cmd install
```

สร้าง `.env` จากตัวอย่าง:

```powershell
Copy-Item .env.example .env
```

แก้ค่าใน `.env` ให้ตรงกับเครื่อง local ของคุณ ห้าม commit `.env`

Generate Prisma client:

```powershell
npx.cmd prisma generate
```

รัน migration:

```powershell
npx.cmd prisma migrate dev
```

Seed ข้อมูลสินค้า:

```powershell
npx.cmd prisma db seed
```

รัน dev server:

```powershell
npm.cmd run dev
```

## 3. คำสั่งสำคัญ

ใช้ `npm.cmd` บน PowerShell ตามที่ระบุใน `AGENTS.md`

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

รัน test เฉพาะไฟล์:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
```

รันกลุ่ม test ที่มักเกี่ยวกับ commerce/account/admin:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts lib/account-center.test.ts lib/account-orders.test.ts lib/product-discovery.test.ts lib/admin-upload.test.ts
```

## 4. โครงสร้างโฟลเดอร์

```text
app/
  (public)/             หน้า landing และ public product detail
  (auth)/               login/register
  (shop)/               account, cart, product store
  actions/              server actions ฝั่งลูกค้า เช่น create-order
  admin/                admin dashboard, orders, shoes
  api/                  API routes
  component/            UI และ feature components
  store/                Zustand stores
lib/
  auth.ts               current user และ admin guard
  jwt.ts                sign/verify JWT
  prisma.ts             Prisma client singleton
  order-fulfillment.ts  rules สถานะ order
  order-cancellation.ts cancel และคืน stock
  account-orders.ts     helper tab ประวัติออเดอร์
prisma/
  schema.prisma         schema หลัก
  seed.ts               seed product catalog
public/
  images/               static assets
  uploads/shoes/        local upload จาก admin
docs/
  *.md                  เอกสารหลัก
  superpowers/          spec/plan ระหว่างพัฒนา
```

## 5. แนวทางแก้โค้ด

- Server-only logic อยู่ใน server actions, route handlers หรือ `lib/*` ที่ไม่ import ใน client
- Client interaction ใช้ client component ชัดเจนด้วย `"use client"`
- Admin route ต้อง guard ฝั่ง server เสมอ
- API route ที่รับข้อมูลควร parse ด้วย Zod
- ห้ามเชื่อราคาจาก client ตอน checkout
- การสร้าง order และหัก stock ต้องอยู่ใน Prisma transaction เดียวกัน
- การยกเลิก order และคืน stock ต้องใช้ guard กันคืนซ้ำ
- อย่า commit `.env` หรือไฟล์ upload จริงที่เป็น user-generated

## 6. จุดที่ควรรู้ก่อนแก้ order flow

Checkout อยู่ที่:

```text
app/actions/create-order.ts
```

สิ่งที่ checkout ทำ:

- validate input ด้วย Zod
- require login
- merge cart item ซ้ำด้วย shoeId + size
- โหลดราคาจาก database
- ตรวจ stock ด้วย `stock >= quantity`
- decrement stock
- create order และ order items ใน transaction
- snapshot payment mock และ shipping address

User cancellation อยู่ที่:

```text
app/(shop)/account/orders/[id]/actions.ts
lib/order-fulfillment.ts
lib/order-cancellation.ts
```

## 7. จุดที่ควรรู้ก่อนแก้ admin flow

Admin layout guard อยู่ที่:

```text
app/admin/layout.tsx
```

Admin order actions อยู่ที่:

```text
app/admin/orders/actions.ts
```

Admin dashboard data อยู่ที่:

```text
app/admin/dashboard-data.ts
```

Admin local upload อยู่ที่:

```text
app/api/admin/uploads/shoes/route.ts
lib/admin-upload.ts
```

## 8. Checklist ก่อนส่งงาน

ก่อนบอกว่างานเสร็จ ให้รัน:

```powershell
npm.cmd run lint
npm.cmd run build
```

ถ้าแก้ logic ที่มี test ให้รัน test ที่เกี่ยวข้องด้วย

ตัวอย่าง:

```powershell
npx.cmd tsx --test lib/account-orders.test.ts
```
