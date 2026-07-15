# Tour Booking Workflow

ภาพรวมลำดับงานตั้งแต่ลูกค้ากดจอง จนถึงจ่ายเงินเสร็จ

---

## ภาพรวม 3 ขั้น

ลูกค้าเห็นแถบ progress 3 จุดบนหน้า Booking Status:

```
1. Request received  →  2. Confirmed  →  3. Paid
   (ส่งคำขอแล้ว)         (Admin ยืนยัน)    (จ่ายเงินแล้ว)
```

หลุดจากเส้นนี้ได้ทางเดียวคือ **Cancelled** (Admin ยกเลิก)

---

## STEP 1 — ลูกค้าส่งคำขอจอง

**ฝั่งลูกค้า**
1. เข้าหน้า tour → กรอกฟอร์มด้านขวา (ชื่อ, เบอร์, email, วันเดินทาง, จำนวนผู้ใหญ่/เด็ก, special requests)
2. กด **Book Now**
3. ระบบเด้งไปหน้า `/booking/{reference}` ทันที — หน้านี้คือใบเสร็จชั่วคราว มี booking reference ให้เก็บไว้
4. หน้านี้ขึ้นว่า **"Awaiting confirmation"** + บอกชัดว่า **ยังไม่ต้องจ่ายเงิน**

**ระบบทำอัตโนมัติ**
- สร้าง booking: status = `pending`, payment = `unpaid`
- คำนวณราคารวมจากราคา tour (ไม่เชื่อราคาที่ส่งมาจากหน้าเว็บ)
- ส่ง email 2 ฉบับ:
  - → ลูกค้า: "We received your booking" (ยังไม่มีปุ่มจ่าย)
  - → Admin: "New Booking from [ชื่อ]" พร้อมรายละเอียดครบ
- ส่งข้อมูลเข้า backoffice (admin web) ด้วย

**ฝั่ง Admin**
- ได้ email แจ้งเตือน
- booking โผล่ในหน้า Bookings ของ admin panel สถานะ `pending`

---

## STEP 2 — Admin ยืนยัน (ขั้นสำคัญที่สุด)

Admin ต้องเช็คว่า **วันนั้นว่างจริงไหม** ก่อน ระบบไม่เช็คให้

**Admin ทำอะไรได้บ้าง**

| กด | เกิดอะไร |
|---|---|
| **Confirm** | status → `confirmed` + ส่ง email "Pay Now" ให้ลูกค้าอัตโนมัติ |
| **Cancel** | status → `cancelled` (ใส่เหตุผลได้) |
| **Mark as Paid** | ใช้ตอนลูกค้าจ่ายเงินสด/โอน — ข้าม Stripe ไปเลย |
| **Resend payment link** | ลูกค้าหา email ไม่เจอ ส่งซ้ำได้ ปลอดภัย |

> ⚠️ **ปุ่ม Confirm = ตัวปลดล็อกการจ่ายเงิน**
> ตราบใดที่ยังไม่กด Confirm ลูกค้าจะไม่เห็นปุ่ม Pay Now เลย

**ฝั่งลูกค้า (หลัง Admin กด Confirm)**
- ได้ email "Booking confirmed — please complete payment" พร้อมปุ่ม **Pay Now · [ราคา]**
- ปุ่มใน email ไม่ได้ลิงก์ตรงไป Stripe แต่ลิงก์กลับมาหน้า Booking Status → email เลยไม่มีวันหมดอายุ ส่งซ้ำได้ตลอด

---

## STEP 3 — ลูกค้าจ่ายเงิน

**ฝั่งลูกค้า**
1. เปิดหน้า Booking Status → เห็นปุ่ม **Pay Now** แล้ว
2. กด → ระบบสร้าง Stripe Checkout ใหม่สดๆ ตอนนั้น → เด้งไปหน้าจ่ายบัตร
3. จ่ายเสร็จ → เด้งกลับมาหน้า Booking Status พร้อมแถบเขียว "Thank you — your payment went through"
4. หน้าจะรอ Stripe ยืนยันสัก 1-2 วิ (เช็คซ้ำอัตโนมัติ ~20 วิ) แล้วขึ้น **Paid**

ถ้าลูกค้ากดยกเลิกกลางทาง → กลับมาหน้าเดิม แถบเหลืองบอกว่า **booking ยังอยู่** จ่ายเมื่อไหร่ก็ได้

**ระบบทำอัตโนมัติ (Stripe webhook)**
- Stripe ยิงกลับมาบอกว่าจ่ายแล้ว → ระบบ mark payment = `paid`
- ส่ง email:
  - → ลูกค้า: ใบเสร็จ "Payment received"
  - → Admin: "PAID - [ชื่อลูกค้า]"
- อัปเดต backoffice

> 🔒 **ความปลอดภัย:** ระบบจะ mark ว่า "จ่ายแล้ว" ได้ **จาก Stripe เท่านั้น**
> ต่อให้ลูกค้าพิมพ์ URL `?paid=1` เองก็ไม่มีผล — หน้าเว็บแค่ *แสดงผล* ไม่ได้ตัดสินใจ
> และถ้า Stripe ยิงซ้ำ ระบบก็ไม่ส่งใบเสร็จซ้ำ

---

## STEP 4 — หลังจ่ายเงิน

- ลูกค้าเห็นหน้า Booking Status เป็น **Paid** ครบ 3 จุด
- ข้อความบอกว่า "ทีมงานจะติดต่อเรื่องจุดรับ"
- **Admin ต้องติดต่อลูกค้าเองเรื่อง pickup** — ตรงนี้ระบบไม่ทำให้

---

## กรณีจ่ายเงินสด / โอน (ไม่ผ่านบัตร)

Admin กด **Mark as Paid** → เลือกวิธี (Cash / Bank Transfer / Other)

ระบบจะ:
- mark payment = `paid`
- ถ้า booking ยังเป็น `pending` อยู่ → **confirm ให้อัตโนมัติ** (จ่ายเงินแล้ว = ยืนยันโดยปริยาย)
- ส่งใบเสร็จให้ลูกค้า + แจ้ง Admin

---

## สรุปตารางสถานะ

| booking status | payment | ลูกค้าเห็นอะไร |
|---|---|---|
| `pending` | `unpaid` | "Awaiting confirmation" — ยังไม่ต้องจ่าย |
| `confirmed` | `unpaid` | ปุ่ม **Pay Now** |
| `confirmed` | `paid` | **Paid** ✅ รอทีมงานติดต่อ |
| `cancelled` | — | "Booking cancelled" ติดต่อเราถ้าผิดพลาด |

---

## Email ทั้งหมด 5 ฉบับ

**ลูกค้าได้ 3:**
1. `Booking Request Received` — จองแล้ว รอยืนยัน
2. `Booking Confirmed` — ยืนยันแล้ว จ่ายได้
3. `Payment Received` — ใบเสร็จ

**Admin ได้ 2:**
1. `New Booking` — มีจองใหม่ ไปกด Confirm
2. `PAID` — เงินเข้าแล้ว

---

## จุดที่ต้องระวัง

- **ระบบไม่เช็ค availability ให้** — Admin ต้องเช็คเองก่อนกด Confirm
- **ไม่กด Confirm = ลูกค้าจ่ายไม่ได้** — booking ค้างอยู่ตลอด
- **ลบ booking ไม่ได้** ทำได้แค่ Cancel (เก็บ record ไว้)
- **จ่ายซ้ำไม่ได้** — ถ้า paid แล้ว ระบบบล็อกทุกทาง
