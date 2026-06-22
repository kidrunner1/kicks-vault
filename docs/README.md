# KicksVault Documentation

เอกสารชุดนี้เป็นทางเข้าใหม่สำหรับคนที่ต้องใช้งาน ดูแล หรือพัฒนาต่อ KicksVault

## อ่านตามบทบาท

- [คู่มือผู้ใช้](./USER_GUIDE.md) - สำหรับลูกค้าที่สมัครสมาชิก เลือกสินค้า ใส่ตะกร้า checkout และติดตามออเดอร์
- [คู่มือแอดมิน](./ADMIN_GUIDE.md) - สำหรับผู้ดูแลร้านค้า จัดการสินค้า stock payment mock และ fulfillment
- [คู่มือนักพัฒนา](./DEVELOPER_GUIDE.md) - สำหรับคนมาทำต่อ ตั้งค่าเครื่อง local ดูคำสั่ง และเข้าใจแนวทางแก้โค้ด
- [สถาปัตยกรรมระบบ](./ARCHITECTURE.md) - ภาพรวม route, data model, auth, checkout, stock และ order flow
- [คู่มือดูแลระบบ](./OPERATIONS.md) - งานประจำ, troubleshooting, deployment notes และ checklist ก่อนส่งงาน

## สถานะระบบปัจจุบัน

KicksVault เป็น Next.js App Router storefront สำหรับร้านรองเท้า premium sneakers มีระบบหลักดังนี้

- หน้าร้าน: landing page, store, product detail, recommendation, favorite, cart
- Account: profile overview, address book, order history, order detail, user cancellation
- Checkout: ใช้ราคาจริงจาก database, หัก stock ใน transaction, เก็บ snapshot ที่อยู่และราคา
- Payment: mock payment ยังไม่มีการตัดเงินจริง
- Admin: dashboard, order/payment/fulfillment management, product/stock basics, local image upload
- Security: JWT cookies, refresh token hash, server-side admin guard, route protection

## ข้อจำกัดที่ควรรู้

- ยังไม่มี payment gateway จริง เช่น Stripe หรือ PromptPay
- รูปที่ admin upload เก็บ local ที่ `public/uploads/shoes`
- Cart อยู่ฝั่ง client ผ่าน Zustand ยังไม่ persistent ข้ามเครื่อง
- ยังไม่มีระบบส่ง email, notification, invoice หรือ webhook
- เอกสารใน `docs/superpowers/` เป็น spec/plan การพัฒนาเชิงละเอียด ไม่ใช่คู่มือใช้งานหลัก

## ไฟล์สำคัญ

- `README.md` - ภาพรวม repo และ quick start
- `AGENTS.md` - กฎสำหรับ agent/developer ที่แก้โปรเจคนี้
- `PRODUCT.md` - product direction และ design principles
- `prisma/schema.prisma` - database schema ปัจจุบัน
- `.env.example` - ตัวอย่าง environment variables โดยไม่มีค่าจริง
