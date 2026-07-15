# Walkthrough Guide — Booking System (1-on-1)

คู่มือเดินหน้าจอ นั่งคุยกันสองคน คลิกไป พูดไป

**วิธีอ่าน**
- 🖱️ = สิ่งที่คุณคลิก / เปิด
- 💬 = สิ่งที่คุณพูด (พูดตามได้เลย หรือพูดด้วยคำตัวเองก็ได้)
- 📝 = โน้ตของคุณ ไม่ต้องพูด

ไม่ต้องพูดทุกบรรทัด เลือกที่จำเป็น เขาถามแทรกได้ตลอด

---

## เตรียมก่อนเริ่ม (5 นาที)

📝 **เปิดแท็บไว้ 3 อัน**
1. หน้าทัวร์บนเว็บ (หน้าลูกค้า)
2. Admin Panel → หน้า Bookings
3. Agent Portal → หน้า login

📝 **เตรียม booking ทดสอบไว้ 2 อัน**
- อันหนึ่งเป็น `pending` — ไว้กด Confirm ให้ดูสด
- อันหนึ่งเป็น `paid` แล้ว — ไว้โชว์ตอนจบว่าหน้าตาเป็นไง

📝 **ถ้ามี agent test account** เตรียม login ไว้ด้วย ถ้าไม่มี ใช้หน้า admin โชว์แทนได้

---

# ตอนที่ 1 — ฝั่งลูกค้า

## เปิดเรื่อง

💬 **"Let me show you how a booking actually works. I'll click through it, and you tell me if anything doesn't make sense."**

💬 **"There are four steps. Two of them the system does. Two of them we do."**

📝 _ตั้งธงไว้ก่อนเลยว่ามีงานที่คนต้องทำ_

---

## 1. ลูกค้ากรอกฟอร์ม

🖱️ **เปิดแท็บหน้าทัวร์ → ชี้ไปที่ฟอร์มด้านขวา**

💬 **"So this is what a customer sees. Just a normal tour page."**

💬 **"On the right, this is the booking form. Name, phone, email, the date they want to travel, how many people."**

🖱️ **กรอกข้อมูลจริงๆ ให้ดู ใส่ชื่อเขาก็ได้จะได้ขำๆ**

💬 **"Let me use your name. Okay — and I'll click 'Book Now'."**

🖱️ **กด Book Now**

---

## 2. หน้า Status เด้งขึ้นมา

💬 **"See? It jumps straight to this page."**

🖱️ **ชี้ที่ booking reference ด้านบน**

💬 **"This is the booking number. The customer keeps this."**

🖱️ **ชี้ที่แถบ 3 จุด**

💬 **"And this bar shows where they are. Three steps — request received, confirmed, paid."**

💬 **"Right now they're on step one."**

🖱️ **ชี้ที่กล่องเหลือง "Awaiting confirmation"**

💬 **"And it tells them clearly — don't pay yet, we're checking availability."**

💬 **"They can bookmark this page and come back any time. It always shows the latest."**

📝 _ถ้าเขาถาม "ทำไมไม่ให้จ่ายเลย" → ตอบว่า "Because we haven't checked if the date is free yet. We don't want to take money for a tour we can't run."_

---

## 3. เมลออก 2 ฉบับ

🖱️ **เปิดเมล — ทั้งของลูกค้าและของ office (เตรียม inbox ไว้ก่อน)**

💬 **"Two emails just went out."**

🖱️ **ชี้เมลลูกค้า**

💬 **"The customer gets this one. 'We got your booking.' It has the trip details and the booking number."**

💬 **"No pay button. On purpose."**

🖱️ **ชี้เมล admin**

💬 **"And we get this one. 'New booking.' It's telling us — go look at it."**

---

## 4. เราเข้าไปยืนยัน ⭐

🖱️ **สลับไปแท็บ Admin Panel → Bookings**

💬 **"Okay so now I'm in the admin panel. This is us, not the customer."**

🖱️ **ชี้ booking ที่เพิ่งสร้าง**

💬 **"There it is. Status says 'pending'."**

🖱️ **เปิด booking ขึ้นมา**

💬 **"Now here's the part I really want you to remember."**

💬 **"Before I click anything, I have to check one thing myself — is that date actually free?"**

💬 **"The system doesn't check that. It has no idea. A person has to check."**

📝 _หยุดตรงนี้ ให้เขาย่อยก่อน_

💬 **"Let's say the date is free. So I click Confirm."**

🖱️ **กด Confirm**

💬 **"Done. And look —"**

🖱️ **สลับกลับไปหน้า status ของลูกค้า → refresh**

💬 **"The customer's page changed. Step two is done. And now there's a Pay Now button."**

🖱️ **เปิดเมลลูกค้าฉบับที่ 2**

💬 **"And they got an email with the same button."**

---

## 5. จุดที่ต้องย้ำ

💬 **"Now — what happens if nobody clicks Confirm?"**

📝 _รอให้เขาเดา_

💬 **"Nothing. The customer never gets a Pay button. The booking just sits there forever."**

💬 **"They think we're ignoring them. And they call us."**

💬 **"So — Confirm is the thing that unlocks payment. That's the one click that matters."**

---

## 6. ลูกค้าจ่ายเงิน

🖱️ **กลับไปหน้า status → กด Pay Now**

💬 **"So they click this."**

🖱️ **หน้า Stripe ขึ้นมา**

💬 **"And it takes them to Stripe. Card payment. We never touch their card details — that's Stripe's job, not ours."**

📝 _ถ้าอยากจ่ายจริงในโหมด test ใช้บัตร 4242 4242 4242 4242 / วันหมดอายุอนาคต / CVC อะไรก็ได้_

🖱️ **จ่ายเสร็จ → เด้งกลับมาหน้า status**

💬 **"And they land back here. Green bar. Paid."**

🖱️ **ชี้แถบ 3 จุด**

💬 **"All three steps done."**

🖱️ **เปิดเมล 2 ฉบับ**

💬 **"Customer gets a receipt. And we get an email saying the money came in."**

---

## 7. กรณีลูกค้ากดยกเลิกกลางทาง

💬 **"Oh — and if they get to Stripe and change their mind, and close it?"**

💬 **"Nothing breaks. The booking is still there. They just come back and pay later. No need to book again."**

---

## 8. จ่ายสด / โอน

🖱️ **เปิด booking อีกอันใน admin → ชี้ปุ่ม Mark as Paid**

💬 **"Sometimes people pay cash. Or they transfer to our bank."**

💬 **"In that case I just click this. Pick cash, or bank transfer."**

💬 **"And the system does the rest — sends the receipt, marks it confirmed. Same as if they paid by card."**

---

## 9. ขั้นสุดท้าย — โทรหาลูกค้า

💬 **"One last thing. The booking is paid, but we're not done."**

💬 **"Someone has to call the customer. Tell them where to wait, what time we pick them up."**

💬 **"The system doesn't do that. We do."**

---

## สรุปสั้นๆ ก่อนเปลี่ยนเรื่อง

💬 **"So that's the customer side. The system sends five emails, takes the money, handles the receipt."**

💬 **"But two things are on us — check the date and click Confirm, and call them about pickup."**

💬 **"Anything you want me to go back to?"**

📝 _หยุดถามตรงนี้จริงๆ อย่ารีบไป part 2_

---

# ตอนที่ 2 — ฝั่ง Agent

## เปิดเรื่องด้วยการบอกความจริงก่อน

💬 **"Okay, agents. This one is very different, and I want to be honest with you upfront."**

💬 **"Agents cannot book online. The portal just shows them prices. That's it."**

💬 **"Everything else is done by hand."**

📝 _บอกก่อนเลย ไม่งั้นเขาจะนั่งรอปุ่มจองที่ไม่มี_

---

## 1. เราสร้าง account ให้เขา

🖱️ **Admin Panel → Agents → Add Agent**

💬 **"Agents can't sign up. We create the account for them."**

🖱️ **กรอกชื่อบริษัท + email**

💬 **"I just need the company name and their email. That's the minimum."**

🖱️ **กด Save → dialog password เด้งขึ้นมา**

💬 **"And the system makes two things."**

🖱️ **ชี้ agent code**

💬 **"An agent code — it takes the company initials. 'Sunrise Travel' becomes S-T-V."**

🖱️ **ชี้ password**

💬 **"And a password."**

⚠️ 💬 **"Now — this password shows once. Right here. If I close this window, it's gone."**

💬 **"I can't look it up later. Nobody can. Not even me."**

💬 **"If I lose it, I have to generate a new one."**

📝 _นี่คือจุดที่คนพลาดบ่อยสุด ย้ำหน่อย_

---

## 2. กดส่งเมลให้เขา

🖱️ **ชี้ปุ่ม "Email to Agent" ใน dialog เดียวกัน**

💬 **"While this is still on screen, I click this. And now they get their login by email."**

🖱️ **กด → โชว์เมลที่ agent ได้**

💬 **"Agent code, login email, temporary password, and a button to sign in."**

💬 **"I don't have to do this right away. Sometimes we set up an account and only let them in next week. That's fine."**

🖱️ **กลับไปหน้า list → ชี้ flag "not sent"**

💬 **"But if I forget, the system flags it. See this? It means this agent still doesn't know their password."**

---

## 3. ตั้งราคาให้เขา

🖱️ **ชี้ปุ่ม Rates ในแถวของ agent**

💬 **"Now the prices. Every agent has their own price. We call it the net rate."**

🖱️ **เปิด Rates modal → เพิ่มทัวร์ + ใส่ราคา**

💬 **"So I pick a tour, and I type their price. Adult and child."**

💬 **"Different agents get different prices. That's normal."**

⚠️ 💬 **"And here's the trap."**

💬 **"If a tour has no rate, the agent can't see that tour at all."**

💬 **"Not just the price — the whole tour. It's invisible to them."**

💬 **"So if I create an account and forget the rates, they log in and the page is empty."**

💬 **"They see nothing. Then they call us and ask if the account is broken."**

📝 _เล่าเหมือนเรื่องที่เคยเกิด เขาจะจำง่ายกว่า_

---

## 4. Agent เข้ามาใช้

🖱️ **สลับไปแท็บ Agent Portal → login ด้วย test account**

💬 **"Okay, now I'm the agent. This is what they see."**

🖱️ **login**

💬 **"First time, it makes them change the password. Then they're in."**

🖱️ **หน้า Tours**

💬 **"And here are their tours. Only the ones we gave them a rate for."**

🖱️ **เปิดทัวร์สักอัน → ชี้กล่อง Your Contract Rate**

💬 **"Their price. Adult, child."**

💬 **"And they never see our real selling price. Never."**

💬 **"That's deliberate — they resell our tours, so they shouldn't know what we charge the public."**

📝 _ให้เหตุผล ไม่ใช่แค่บอกกฎ เขาจะเก็ต_

---

## 5. Agent อยากจอง

🖱️ **ชี้กล่อง "To book" ด้านล่างขวา**

💬 **"So they found a tour they like. Now what?"**

💬 **"There's no book button. It just says — email our reservations team."**

💬 **"So they email us, or they call. And then one of us types the booking in by hand."**

💬 **"Yeah. It's manual. We know. It's on the list."**

📝 _ยอมรับตรงๆ ดีกว่าแก้ตัว_

---

# ปิดท้าย

💬 **"So — two very different things."**

💬 **"Customer side, the system does a lot. But it won't move without us clicking Confirm."**

💬 **"Agent side, the system does almost nothing. It shows prices. Everything else is us."**

💬 **"Make sense? Anything you want to see again?"**

---

# ถ้าเขาถาม — คำตอบเตรียมไว้

**"Can you delete a booking?"**
💬 **"No, only cancel. We keep the record."**

**"Can someone pay twice by accident?"**
💬 **"No, the system blocks it once it's paid."**

**"What if the customer loses the payment email?"**
💬 **"There's a resend button. Totally safe — the link doesn't expire."**

**"Can an agent see another agent's price?"**
💬 **"No. Only their own."**

**"What if we stop working with an agent?"**
💬 **"We switch the account off. They lose access immediately — not on next login, immediately."**

**"Do agents get an email when we change their price?"**
💬 **"No. We have to tell them ourselves."**

**"When can agents book online?"**
💬 **"Not built yet. Right now it's email and phone."**

**"Who checks if the date is free?"**
💬 **"A person. Always. The system has no idea about availability."**

---

# โพยใบเดียว — เปิดค้างไว้ข้างๆ

| | Customer | Agent |
|---|---|---|
| Sign up themselves? | Yes | No — we create it |
| Book online? | Yes | **No** — email / phone |
| Pay online? | Yes (Stripe) | No |
| Emails from system | 3 | 1 |
| **We must do** | Confirm the date | Send login + set rates |
| **If we forget** | They can't pay | They see an empty page |

**คำที่ใช้บ่อย ถ้าลืม**
- ยืนยัน = **confirm**
- ยังไม่ได้จ่าย = **unpaid** / **not paid yet**
- ราคาสำหรับ agent = **net rate**
- ราคาขายจริง = **selling price**
- ทำมือ = **by hand** / **manual**
- ตรวจว่าว่างไหม = **check availability**
- เด้งกลับมา = **it takes them back**
