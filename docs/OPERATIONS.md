# คู่มือดูแลระบบและงานประจำ

เอกสารนี้รวมงานที่ต้องทำบ่อยและปัญหาที่เจอได้ระหว่างพัฒนา/ดูแล KicksVault

## 1. Environment variables

ดูตัวอย่างได้ที่ `.env.example`

ต้องมีอย่างน้อย:

```text
DATABASE_URL
JWT_SECRET
```

ห้าม commit `.env`

## 2. Local database

หลังตั้งค่า `DATABASE_URL` แล้ว ใช้คำสั่ง:

```powershell
npx.cmd prisma migrate dev
npx.cmd prisma db seed
```

ถ้า Prisma Client ไม่ตรง schema:

```powershell
npx.cmd prisma generate
```

## 3. รันแอป

```powershell
npm.cmd run dev
```

Production build:

```powershell
npm.cmd run build
npm.cmd start
```

## 4. Verification ก่อนส่งงาน

ขั้นต่ำ:

```powershell
npm.cmd run lint
npm.cmd run build
```

เมื่อแก้ logic เฉพาะด้าน ให้รัน test ที่เกี่ยวข้อง เช่น:

```powershell
npx.cmd tsx --test lib/order-fulfillment.test.ts
npx.cmd tsx --test lib/account-orders.test.ts
npx.cmd tsx --test lib/admin-upload.test.ts
```

## 5. Upload storage

ตอนนี้ admin upload เก็บที่:

```text
public/uploads/shoes
```

ข้อควรระวัง:

- เหมาะกับ local/prototype
- บน production แบบ serverless local filesystem อาจไม่ถาวร
- ถ้าจะใช้งานจริงควรเปลี่ยนเป็น cloud object storage
- เก็บ `.gitkeep` ไว้เพื่อให้ folder อยู่ใน repo

## 6. Order และ stock troubleshooting

ถ้า stock ไม่ลด:

- ตรวจว่า checkout ผ่าน `app/actions/create-order.ts`
- ตรวจว่า size ตรงกับ `ShoeSize.size`
- ตรวจว่า `stock >= quantity`
- ตรวจ transaction error จาก server log

ถ้า stock คืนซ้ำ:

- ตรวจ `Order.stockRestoredAt`
- ตรวจว่า flow cancel ใช้ `lib/order-cancellation.ts`
- อย่าเขียน logic คืน stock ซ้ำในไฟล์อื่น

ถ้า user ไม่เห็นออเดอร์ที่ยกเลิก:

- ไปที่ `/account/orders?status=cancelled`
- Default tab แสดงเฉพาะออเดอร์ที่กำลังดำเนินการ

## 7. Auth troubleshooting

ถ้าเข้า protected route ไม่ได้:

- ตรวจ cookies `accessToken` และ `refreshToken`
- ตรวจ `JWT_SECRET`
- ตรวจว่า user ยังมีอยู่ใน database
- ตรวจ route guard ใน `proxy.ts`

ถ้าเข้า admin ไม่ได้:

- ตรวจว่า user role เป็น `ADMIN`
- ตรวจ `app/admin/layout.tsx`
- ตรวจ `requireAdmin()` ใน `lib/auth.ts`

## 8. Prisma build warning

ตอน build อาจเห็น warning:

```text
package.json#prisma is deprecated and will be removed in Prisma 7
```

โปรเจคมี `prisma.config.ts` แล้ว แต่ยังมี property `prisma` ใน `package.json` สำหรับ seed config เดิม ถ้าจะเก็บงาน tech debt นี้ ให้ย้าย seed config ไป Prisma config ตามเอกสาร Prisma เวอร์ชันปัจจุบัน

## 9. Release checklist

ก่อน push/deploy:

- [ ] ไม่มี `.env` หรือ secret ถูก stage
- [ ] ไม่มีรูป upload จริงถูก stage โดยไม่ตั้งใจ
- [ ] `npm.cmd run lint` ผ่าน
- [ ] `npm.cmd run build` ผ่าน
- [ ] migration ใหม่ถูก review ถ้ามี schema change
- [ ] admin guard ยังอยู่ครบใน server side
- [ ] checkout ยังใช้ราคา database และ transaction
- [ ] cancel flow ยังคืน stock ผ่าน helper กลาง

## 10. สิ่งที่ควรทำต่อก่อน production จริง

- เชื่อม payment gateway จริง
- ย้าย upload ไป cloud storage
- เพิ่ม email/notification สำหรับ order status
- เพิ่ม audit log สำหรับ admin actions
- เพิ่ม persistent cart ใน database
- เพิ่ม test สำหรับ server actions ที่สำคัญ
