# Design System — Indo Smile South Services

กฎกลางสำหรับ UI/UX ทั้งเว็บ (หน้าบ้าน + admin). ทุกหน้าใหม่ต้อง follow เอกสารนี้
เพื่อให้ทุกอย่างไปทางเดียวกัน ดูมืออาชีพ และใช้งานง่าย.

Source of truth ของ token อยู่ที่ `src/index.css` (`@theme`). ถ้าจะเพิ่ม token
ให้เพิ่มที่นั่นก่อน แล้วอ้างอิงในเอกสารนี้.

---

## 1. หลักการ (Principles)

1. **Consistency over creativity** — ใช้ token/pattern ที่มี อย่าประดิษฐ์ค่าใหม่รายหน้า
2. **หนึ่ง accent เดียว** — สีเหลืองคือ accent เดียวของระบบ ใช้เท่าที่จำเป็น
3. **Whitespace คือ feature** — เว้นให้หายใจ ดีกว่ายัด
4. **Hierarchy ชัด** — ขนาด/น้ำหนัก/สี บอกลำดับความสำคัญเสมอ
5. **ทุก interactive element มี state** — hover / focus / disabled ต้องเห็นชัด

---

## 2. สี (Color) — กฎ 60-30-10

ทุกหน้าจอแบ่งสัดส่วนสีตามนี้:

| สัดส่วน | บทบาท | สี | ใช้กับ |
|--------|-------|----|--------|
| **60%** | Base / พื้นหลัง | White `#ffffff` + Light Gray `#f7f7f7` | พื้นหลังหน้า, การ์ด, พื้นที่ว่าง |
| **30%** | Secondary / โครงสร้าง | Navy `#010048` | Sidebar, header, ตัวอักษรหัวข้อ, ปุ่มรอง, เส้นโครง |
| **10%** | Accent | Yellow `#ffd447` | ปุ่มหลัก (CTA), nav ที่ active, highlight, badge สำคัญ |

**กฎ:**
- เหลืองห้ามเกิน ~10% ของพื้นที่ — ถ้าทุกอย่างเด่น = ไม่มีอะไรเด่น
- อย่าเอาเหลืองมาเป็นพื้นหลังก้อนใหญ่ หรือทำ text ยาวๆ (contrast ต่ำ)
- Navy บนเหลือง = คู่มาตรฐานของปุ่มหลัก (contrast ผ่าน)

### Tailwind classes
```
bg-white  bg-light-gray        → 60%
bg-navy   text-navy   border-navy → 30%
bg-yellow text-yellow           → 10% (accent)
```

### สี functional (ไม่นับใน 60-30-10)
ใช้เพื่อสื่อความหมาย/อ่านง่าย เท่านั้น:

| บทบาท | สี | Tailwind |
|-------|----|----|
| Text หัวข้อ | Navy `#010048` | `text-navy` |
| Text ปกติ | Gray 700 `#374151` | `text-gray-700` |
| Text รอง/muted | Gray 500 `#6b7280` | `text-gray-500` |
| เส้นขอบ / divider | Gray 200 `#e5e7eb` | `border-gray-200` |
| Success | `#16a34a` | `text-green-600` `bg-green-50` |
| Danger / ลบ | `#dc2626` | `text-red-600` `bg-red-50` |
| Warning | `#f59e0b` | `text-amber-500` `bg-amber-50` |
| Info | `#2563eb` | `text-blue-600` `bg-blue-50` |

> Semantic colors ใช้แบบ "สี + พื้นอ่อน" (เช่น `text-red-600 bg-red-50`) สำหรับ badge/alert เสมอ

---

## 3. Font & Typography

**2 ฟอนต์เท่านั้น:**
- **Koulen** (`font-heading`) — เฉพาะ **หัวข้อใหญ่** (page title / hero / section title หลัก). ห้ามใช้กับ body หรือหัวข้อย่อย
- **Be Vietnam Pro** (`font-body`) — ทุกอย่างที่เหลือ

### Be Vietnam Pro — 4 ขนาด × 2 น้ำหนัก (ห้ามใช้ค่านอกนี้)

**น้ำหนัก (2 ตัว):**
- **Regular 400** — เนื้อหาปกติ, ค่าในตาราง
- **SemiBold 600** — เน้น, label, ปุ่ม, หัวการ์ด

**ขนาด (4 ตัว):**

| ชื่อ | ขนาด | line-height | Tailwind | ใช้กับ |
|------|------|------------|----------|--------|
| **Small** | 14px / `0.875rem` | 1.4 | `text-sm` | label, caption, meta, cell ตาราง, helper text |
| **Body** | 16px / `1rem` | 1.6 | `text-base` | เนื้อหาหลัก (default) |
| **Title** | 20px / `1.25rem` | 1.4 | `text-xl` | หัวการ์ด, หัวข้อย่อย, ชื่อ modal |
| **Display** | 30px / `1.875rem` | 1.25 | `text-3xl` | หัว section (ที่ไม่ได้ใช้ Koulen) |

**กฎ:**
- หัวข้อใหญ่จริงๆ → Koulen. ระดับรองลงมาทั้งหมด → Be Vietnam Pro (Display/Title)
- ห้ามใช้ font-weight อื่นนอกจาก 400 / 600 (แม้ Google Fonts จะโหลด 300/500/700 มา — สงวนไว้ ไม่ใช้ทั่วไป)
- ข้อความยาว (paragraph) กว้างไม่เกิน ~70 ตัวอักษร (`max-w-prose`)
- อย่าใช้ตัวพิมพ์ใหญ่ทั้งหมด (ALL CAPS) ยกเว้น label เล็กๆ / badge

### Pattern
```jsx
<h1 className="font-heading text-4xl text-navy">Page Title</h1>   {/* Koulen */}
<h2 className="font-body text-3xl font-semibold text-navy">Section</h2>
<h3 className="font-body text-xl font-semibold text-navy">Card Title</h3>
<p  className="font-body text-base text-gray-700">Body copy…</p>
<span className="font-body text-sm text-gray-500">Meta</span>
```

---

## 4. Spacing — 4px base grid

ทุกระยะเป็นทวีคูณของ 4. ใช้เฉพาะค่าจาก scale นี้:

| Token | px | Tailwind | ใช้กับ |
|-------|----|----|--------|
| xs | 4 | `1` | ช่องไฟชิด (icon กับ text) |
| sm | 8 | `2` | ภายใน element |
| md | 12 | `3` | padding input/button |
| base | 16 | `4` | gap มาตรฐานระหว่าง element |
| lg | 24 | `6` | padding การ์ด, ช่องว่างระหว่างกลุ่ม |
| xl | 32 | `8` | ระยะระหว่าง section |
| 2xl | 48 | `12` | ระยะใหญ่ / บนล่างหน้า |
| 3xl | 64 | `16` | hero / breathing room ใหญ่ |

**กฎ:**
- ภายใน component ใช้ 8–16, ระหว่าง section ใช้ 24–48
- Padding การ์ดมาตรฐาน = `24px` (`p-6`)
- อย่าใช้เลขแปลก (13px, 17px, 25px) — snap เข้า grid เสมอ

---

## 5. Radius, Border, Shadow

### Radius (มุมโค้ง)
| ชื่อ | px | Tailwind | ใช้กับ |
|------|----|----|--------|
| sm | 8 | `rounded-lg` | input, button, badge |
| md | 12 | `rounded-xl` | การ์ด, modal, dropdown |
| lg | 16 | `rounded-2xl` | panel ใหญ่ |
| full | ∞ | `rounded-full` | pill, avatar, tag สถานะ |

> ค่ามาตรฐานของโปรเจกต์คือ `rounded-xl` (12px) — ตรงกับ agent portal ที่มีอยู่

### Border
- เส้นทั่วไป: `border border-gray-200` (1px)
- อย่าใช้เส้นหนา/สีจัด เว้นแต่ต้องการเน้นจริง

### Shadow (เงา — เบา สะอาด)
| ระดับ | Tailwind | ใช้กับ |
|-------|----------|--------|
| card | `shadow-sm` | การ์ดปกติ |
| raised | `shadow-md` | การ์ด hover, dropdown |
| overlay | `shadow-xl` | modal, popover |

> เงาต้องนุ่ม (สีดำ opacity ต่ำ) ห้ามเงาเข้ม/ฟุ้งเกิน

---

## 6. Layout

- **Sidebar admin:** กว้าง `288px` (`lg:w-72`), พื้น navy — ตาม agent portal
- **Content padding:** `24px` mobile (`p-6`), `40px` desktop (`lg:p-10`)
- **Max width เนื้อหา:** `max-w-7xl` (~1280px) สำหรับหน้า list/dashboard
- **Grid การ์ด:** `gap-6` (24px) ระหว่างการ์ด
- ทุกหน้า responsive: mobile `flex-col`, desktop `lg:flex-row`

---

## 7. Components — กฎมาตรฐาน

### Buttons
4 แบบ ห้ามเพิ่มนอกนี้:

| แบบ | ใช้เมื่อ | Style |
|-----|---------|-------|
| **Primary** | action หลัก 1 ตัว/หน้า | `bg-yellow text-navy font-semibold` |
| **Secondary** | action รอง | `border-2 border-navy text-navy` (hover: `bg-navy text-white`) |
| **Ghost** | action เบา (cancel) | `text-gray-600 hover:bg-gray-100` |
| **Danger** | ลบ/ยกเลิก | `bg-red-600 text-white` หรือ `text-red-600 border-red-200` |

- ขนาดมาตรฐาน: `px-4 py-2.5 rounded-xl text-sm font-semibold`
- Primary มีได้ **1 ตัวต่อพื้นที่** — หลายปุ่มเหลือง = สับสน
- ทุกปุ่มมี hover + focus + disabled state

### Inputs / Forms
- Field: `w-full px-3 py-2.5 rounded-lg border border-gray-200 text-base`
- Focus: `focus:border-navy focus:ring-2 focus:ring-navy/20`
- Label: `text-sm font-semibold text-navy mb-1.5`
- Helper/error: `text-sm` (error = `text-red-600`)
- ระยะระหว่าง field: `gap-4` (16px)
- Required แสดงด้วย `*` สี navy หรือ text เล็ก ไม่ใช่สีแดงล้วน

### Cards
- `bg-white rounded-xl border border-gray-200 shadow-sm p-6`
- หัวการ์ด: `text-xl font-semibold text-navy`

### Tables
- Header: `bg-navy text-white text-sm font-semibold` (หรือ `bg-light-gray text-navy` แบบเบา)
- Cell: `text-sm text-gray-700 px-4 py-3`
- แถวสลับ: `even:bg-gray-50` (ถ้าตารางยาว)
- Hover แถว: `hover:bg-yellow/5`
- Action ในแถว: icon button ghost

### Badges / Status
- Pill: `rounded-full px-3 py-1 text-sm font-semibold`
- ใช้คู่ semantic: success=`bg-green-50 text-green-600`, danger=`bg-red-50 text-red-600`, ฯลฯ

### Modal
- Overlay: `bg-black/40` + `backdrop-blur-sm`
- Panel: `bg-white rounded-xl shadow-xl max-w-lg w-full p-6`
- หัว modal: `text-xl font-semibold text-navy`
- ปิดด้วยปุ่ม X (ghost) มุมขวาบน + click overlay

---

## 8. States & Interaction

- **Hover:** เปลี่ยน bg/สีชัดพอเห็น + `transition-all duration-200`
- **Focus:** ต้องเห็น ring เสมอ (`focus:ring-2 focus:ring-navy/20` หรือ yellow) — ห้ามลบ outline โดยไม่ใส่แทน
- **Active nav:** `bg-yellow text-navy` (ตาม agent portal)
- **Disabled:** `opacity-50 cursor-not-allowed`
- **Loading:** spinner/skeleton — อย่าให้จอค้างเปล่า
- **Empty state:** มีข้อความ + ปุ่ม action เสมอ (อย่าโชว์ตารางว่างเฉยๆ)
- **Toast/feedback:** ทุก action (save/delete) ต้องมี feedback สำเร็จ/ล้มเหลว

---

## 9. Accessibility (ขั้นต่ำ)

- Contrast: navy-on-white / navy-on-yellow / white-on-navy ผ่าน AA — ห้าม gray อ่อนบนขาวสำหรับ text สำคัญ
- Touch target ≥ `40px` (ปุ่ม/ลิงก์บนมือถือ)
- ทุก input มี `<label>` ผูกจริง
- ทุกปุ่ม icon มี `aria-label`
- Focus visible เสมอ (ดูข้อ 8)

---

## 10. Do / Don't

**Do**
- ใช้ token จาก `src/index.css`
- Koulen เฉพาะหัวใหญ่, Be Vietnam Pro ที่เหลือ
- เหลือง = accent เท่าที่จำเป็น
- Snap ทุกระยะเข้า grid 4px

**Don't**
- อย่าใส่สี hex ตรงๆ ใน component (ใช้ token)
- อย่าใช้ font size / weight นอก scale
- อย่ามี primary button (เหลือง) หลายตัวในพื้นที่เดียว
- อย่าลบ focus outline โดยไม่ใส่ของแทน
- อย่าประดิษฐ์ radius/shadow/spacing ใหม่รายหน้า

---

## 11. Token cheat-sheet

```
สี      : bg-white / bg-light-gray (60) · bg-navy text-navy (30) · bg-yellow (10)
ฟอนต์   : font-heading (Koulen, หัวใหญ่) · font-body (Be Vietnam Pro)
ขนาด    : text-sm(14) · text-base(16) · text-xl(20) · text-3xl(30)
น้ำหนัก : normal(400) · font-semibold(600)
ระยะ    : 2·3·4·6·8·12  (8/12/16/24/32/48px)
มุม     : rounded-lg(8) · rounded-xl(12) · rounded-2xl(16) · rounded-full
เงา     : shadow-sm · shadow-md · shadow-xl
```
