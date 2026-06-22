# คู่มือแอดมิน KicksVault

เอกสารนี้สำหรับผู้ดูแลร้านค้าที่ต้องจัดการสินค้า stock payment และออเดอร์

## 1. การเข้าใช้งาน admin

หน้า admin อยู่ที่ `/admin`

เงื่อนไข:

- ต้อง login
- user ต้องมี role เป็น `ADMIN`
- admin guard ทำงานฝั่ง server ใน `app/admin/layout.tsx`

ถ้าไม่มีสิทธิ์ ระบบจะ redirect ออกจาก admin area

## 2. Dashboard

หน้า `/admin` แสดงภาพรวมร้านค้า เช่น:

- รายได้จากออเดอร์ที่ไม่ถูกยกเลิก
- ออเดอร์วันนี้
- ออเดอร์รอดำเนินการ
- ออเดอร์ที่ยังไม่ชำระเงิน
- จำนวนสินค้าและแบรนด์
- stock ต่ำหรือหมด
- กราฟ/summary ของ fulfillment และ payment status
- สินค้าขายดี
- catalog health เช่น สินค้าไม่มีรูปหรือไม่มีราคา

Dashboard ใช้ข้อมูลจาก `app/admin/dashboard-data.ts`

## 3. จัดการสินค้า

หน้าสินค้า admin:

- `/admin/shoes`
- `/admin/shoes/new`
- `/admin/shoes/[id]`

แอดมินสามารถจัดการ:

- ชื่อสินค้า
- slug
- description
- price
- featured flag
- brand
- specs
- sizes และ stock
- images

## 4. อัปโหลดรูปสินค้าแบบ local

ระบบรองรับ local upload ผ่าน `/api/admin/uploads/shoes`

ไฟล์จะถูกเก็บที่:

```text
public/uploads/shoes
```

ข้อควรรู้:

- เหมาะกับ local development หรือ prototype
- ถ้า deploy production จริงควรย้ายไป cloud storage เช่น S3, Vercel Blob หรือบริการเทียบเท่า
- ห้ามลบ `.gitkeep` ใน `public/uploads/shoes`
- รูปที่ upload จริงไม่ควร commit เข้า repo ถ้าเป็นไฟล์ user-generated

## 5. จัดการ payment mock

ในหน้า order detail ของ admin แอดมินสามารถปรับ:

- payment status: `UNPAID`, `PAID`, `FAILED`, `REFUNDED`
- payment method: `MANUAL`, `BANK_TRANSFER`, `COD`
- payment note

เมื่อเปลี่ยนเป็น `PAID` ระบบจะตั้ง `paidAt` ถ้ายังไม่มีค่า

ระบบนี้เป็น mock payment เท่านั้น ยังไม่มี payment gateway จริง

## 6. จัดการ fulfillment

สถานะ fulfillment:

- `PENDING`
- `PROCESSING`
- `SHIPPED`
- `DELIVERED`
- `CANCELLED`

ลำดับหลัก:

```text
PENDING -> PROCESSING -> SHIPPED -> DELIVERED
```

การจัดส่งต้องใส่:

- shipping carrier
- tracking number

การยกเลิกต้องใส่เหตุผล

## 7. การยกเลิกและคืน stock

เมื่อ admin ยกเลิกออเดอร์ ระบบใช้ helper กลาง:

```text
lib/order-cancellation.ts
```

ผลลัพธ์:

- เปลี่ยน order เป็น `CANCELLED`
- ตั้ง `cancelledAt`
- ตั้ง `cancelReason`
- ตั้ง `stockRestoredAt`
- คืน stock ให้ `ShoeSize`
- ถ้า payment เป็น `PAID` จะเปลี่ยนเป็น `REFUNDED`

ระบบ guard ด้วย `stockRestoredAt: null` เพื่อกันการคืน stock ซ้ำ

## 8. ข้อมูลลูกค้าใน order detail

หน้า admin order detail ควรใช้ตรวจสอบ:

- email ลูกค้า
- ชื่อผู้รับ
- เบอร์โทร
- ที่อยู่ snapshot
- รายการสินค้า
- size และ quantity
- payment status
- fulfillment status
- shipping carrier และ tracking number
- cancel reason

## 9. งานประจำของ admin

งานที่ควรตรวจเป็นประจำ:

- ออเดอร์ `PENDING`
- payment `UNPAID`
- stock ต่ำหรือหมด
- สินค้าที่ไม่มีรูป
- สินค้าที่ไม่มีราคา
- ออเดอร์ที่ถูกยกเลิกและ refund mock
