# การติดตั้งและ Deploy ระบบ CRM - Indo Smile South Services

## สรุประบบ CRM ที่สร้างเสร็จแล้ว

### ✅ Backend (PHP + MySQL)
- **Database Schema** - ตารางทั้งหมด 7 ตาราง (tours, bookings, admin_users, customers, ฯลฯ)
- **REST API** - Endpoints สำหรับ tours และ bookings management
- **Authentication** - ระบบ login/logout ด้วย PHP sessions
- **Models** - Tour, Booking, Admin models

### ✅ Admin Dashboard
- **หน้า Login** - ระบบเข้าสู่ระบบสำหรับแอดมิน
- **Dashboard Overview** - สรุปสถิติการจอง, รายได้
- **Tour Management** - เพิ่ม/แก้ไข/ลบ ทัวร์
- **Booking Management** - ดูและจัดการการจองทั้งหมด

### ✅ Frontend Integration
- **React Component** - อัพเดทแล้วให้ดึงข้อมูลจาก API
- **API Integration** - เชื่อมต่อกับ backend API

---

## ขั้นตอนการติดตั้ง

### 1. อัพโหลดไฟล์ Backend ขึ้น Server

ใช้ FTP Client (FileZilla) หรือ cPanel File Manager:

```
/public_html/
  └── backend/
      ├── admin/
      │   ├── index.html
      │   ├── style.css
      │   └── app.js
      ├── api/v1/
      │   ├── auth.php
      │   ├── tours.php
      │   ├── bookings.php
      │   └── helpers.php
      ├── config/
      │   ├── config.php
      │   └── Database.php
      ├── models/
      │   ├── Tour.php
      │   ├── Booking.php
      │   └── Admin.php
      ├── uploads/
      │   └── tours/
      ├── .htaccess
      └── database_schema.sql
```

### 2. สร้าง Database

1. เข้า **cPanel** → **phpMyAdmin**
2. Database นี้มีอยู่แล้ว: `sevensmile_indosmile`
3. คลิก tab **"Import"**
4. เลือกไฟล์ `database_schema.sql`
5. คลิก **"Go"** เพื่อ execute

ระบบจะสร้าง:
- ✅ ตารางทั้งหมด 7 ตาราง
- ✅ Admin user เริ่มต้น
- ✅ ทัวร์ตัวอย่าง 8 ทัวร์
- ✅ การตั้งค่าเริ่มต้น

### 3. ตั้งค่า Permissions

ใช้ cPanel File Manager หรือ FTP:

```bash
chmod 755 backend/
chmod 755 backend/uploads/
chmod 755 backend/uploads/tours/
```

**⚠️ ห้าม chmod 777** - ไม่ปลอดภัย!

### 4. ทดสอบระบบ

#### ทดสอบ API:
เปิด browser ไปที่:
```
https://indosmilesouthservices.com/backend/api/v1/tours.php?type=inbound
```

ควรได้ JSON response กลับมา

#### เข้า Admin Dashboard:
```
URL: https://indosmilesouthservices.com/backend/admin/
Username: admin
Password: admin123
```

**⚠️ สำคัญมาก:** เปลี่ยน password ทันทีหลัง login ครั้งแรก!

### 5. Deploy React Frontend

```bash
# Build React app
cd D:\INDO SMILE SOUTH SERVICES\Web\official-web
npm run build

# Upload folder 'dist' ไปที่ server
/public_html/
  └── dist/  (หรือเปลี่ยนชื่อเป็น public_html ถ้าเป็น root)
```

---

## การใช้งาน Admin Dashboard

### เข้าสู่ระบบ
1. เปิด `https://indosmilesouthservices.com/backend/admin/`
2. Login ด้วย username: `admin`, password: `admin123`
3. เปลี่ยน password ใน Settings

### จัดการทัวร์
1. คลิกเมนู **"Tours"** ด้านซ้าย
2. คลิก **"+ Add New Tour"** เพื่อเพิ่มทัวร์ใหม่
3. กรอกข้อมูล:
   - ชื่อทัวร์
   - ปลายทาง
   - ประเภท (Inbound/Outbound/Incentive)
   - ราคา
   - จำนวนวัน/คืน
   - รายละเอียด
   - Highlights
   - รายการที่รวม/ไม่รวม
4. คลิก **"Save Tour"**

### จัดการการจอง
1. คลิกเมนู **"Bookings"**
2. ดูการจองทั้งหมด
3. สามารถ:
   - **Confirm** - ยืนยันการจอง
   - **Cancel** - ยกเลิกการจอง
   - กรอง/ค้นหา

---

## API Endpoints

### Tours
```
GET  /api/v1/tours.php                  - ดูทัวร์ทั้งหมด
GET  /api/v1/tours.php?id={id}          - ดูทัวร์เฉพาะ
GET  /api/v1/tours.php?type=inbound     - กรองตามประเภท
POST /api/v1/tours.php                  - สร้างทัวร์ใหม่ (admin)
PUT  /api/v1/tours.php?id={id}          - แก้ไขทัวร์ (admin)
DELETE /api/v1/tours.php?id={id}        - ลบทัวร์ (admin)
```

### Bookings
```
GET  /api/v1/bookings.php               - ดูการจองทั้งหมด (admin)
GET  /api/v1/bookings.php?stats=1       - ดูสถิติ (admin)
POST /api/v1/bookings.php               - สร้างการจองใหม่ (public)
PUT  /api/v1/bookings.php?id={id}&action=confirm  - ยืนยันการจอง (admin)
PUT  /api/v1/bookings.php?id={id}&action=cancel   - ยกเลิกการจอง (admin)
```

### Authentication
```
POST /api/v1/auth.php/login    - Login
POST /api/v1/auth.php/logout   - Logout
GET  /api/v1/auth.php/check    - ตรวจสอบ session
GET  /api/v1/auth.php/me       - ข้อมูล user ปัจจุบัน
```

---

## ฟีเจอร์ที่ได้

### Admin Dashboard
- ✅ Login/Logout ปลอดภัย
- ✅ Dashboard แสดงสถิติ
- ✅ CRUD ทัวร์ (เพิ่ม/แก้ไข/ลบ)
- ✅ จัดการการจองทั้งหมด
- ✅ ยืนยัน/ยกเลิกการจอง
- ✅ ค้นหาและกรองข้อมูล
- ✅ Responsive design

### Frontend
- ✅ ดึงข้อมูลทัวร์จาก API
- ✅ แสดงทัวร์แบบ real-time
- ✅ ระบบจองทัวร์
- ✅ Loading และ error handling

### Security
- ✅ Password hashing (bcrypt)
- ✅ SQL injection protection (PDO prepared statements)
- ✅ XSS protection (sanitization)
- ✅ CORS configuration
- ✅ Session management

---

## การอัพเดทข้อมูลทัวร์

### วิธีที่ 1: ผ่าน Admin Dashboard (แนะนำ)
1. Login เข้า Admin
2. ไปที่หน้า Tours
3. คลิก **"Edit"** ที่ทัวร์ที่ต้องการแก้ไข
4. เปลี่ยนแปลงข้อมูล
5. คลิก **"Save Tour"**

### วิธีที่ 2: ผ่าน API
```javascript
// ตัวอย่าง JavaScript
const updateTour = async (tourId) => {
  const response = await fetch(`https://indosmilesouthservices.com/backend/api/v1/tours.php?id=${tourId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // สำหรับ session
    body: JSON.stringify({
      name: 'Tour Name Updated',
      price: 20000,
      // ... fields อื่นๆ
    })
  });

  const data = await response.json();
  console.log(data);
};
```

---

## Troubleshooting

### ปัญหา: Database Connection Error
**วิธีแก้:**
- ตรวจสอบ `backend/config/config.php`
- ตรวจสอบว่า database credentials ถูกต้อง
- ตรวจสอบว่า MySQL service ทำงาน

### ปัญหา: CORS Error
**วิธีแก้:**
- ตรวจสอบ `backend/config/config.php`
- เพิ่ม domain ของคุณใน `ALLOWED_ORIGINS`
- ตรวจสอบไฟล์ `.htaccess`

### ปัญหา: 404 Not Found
**วิธีแก้:**
- ตรวจสอบว่าไฟล์อัพโหลดครบ
- ตรวจสอบ path ใน URL
- ตรวจสอบ Apache mod_rewrite เปิดอยู่

### ปัญหา: Session หลุด
**วิธีแก้:**
- ตรวจสอบ PHP session configuration
- ตรวจสอบ cookies enabled
- Clear browser cache

### ปัญหา: อัพโหลดรูปไม่ได้
**วิธีแก้:**
- ตรวจสอบ folder permissions (755)
- ตรวจสอบ PHP `upload_max_filesize`
- ตรวจสอบว่ามีโฟลเดอร์ `backend/uploads/tours/`

---

## การ Backup

### Backup Database
1. เข้า phpMyAdmin
2. เลือก database `sevensmile_indosmile`
3. คลิก tab **"Export"**
4. เลือก format: SQL
5. คลิก **"Go"**
6. บันทึกไฟล์ไว้ปลอดภัย

**แนะนำ:** Backup ทุกวัน หรืออย่างน้อยสัปดาห์ละครั้ง

### Backup Files
Backup โฟลเดอร์:
- `/backend/uploads/` - รูปภาพทัวร์
- `/backend/config/config.php` - การตั้งค่า

---

## ขั้นตอนถัดไป (Optional)

### 1. ตั้งค่า Email Notifications
- แก้ไข `backend/api/v1/bookings.php`
- เพิ่ม PHP mail() function
- ส่งอีเมลยืนยันการจองให้ลูกค้า

### 2. เพิ่ม Payment Gateway
- Integrate PromptPay / Bank Transfer
- หรือ Online Payment (Omise, 2C2P)

### 3. เพิ่มฟีเจอร์ Report
- สร้างหน้า Reports ใน Admin
- Export CSV/PDF

### 4. Multi-language Support
- เพิ่มภาษาไทย + อังกฤษ
- ใช้ i18n library

---

## ข้อมูลการติดต่อ

หากมีปัญหาหรือข้อสงสัย:
- ตรวจสอบ `backend/README.md` สำหรับรายละเอียดเพิ่มเติม
- ดู API documentation ใน README
- ติดต่อ developer หรือ system administrator

---

## Version
**1.0.0** - Initial Release (2025-12-15)

## สรุป

คุณได้สร้างระบบ CRM สำหรับจัดการทัวร์สำเร็จแล้ว! ระบบนี้ช่วยให้:
- ✅ แอดมินสามารถเพิ่ม/แก้ไข/ลบทัวร์ได้ง่ายๆ ผ่าน Dashboard
- ✅ ไม่ต้องแก้โค้ดเพื่ออัพเดทข้อมูล
- ✅ จัดการการจองได้อย่างมีระบบ
- ✅ มีฐานข้อมูลที่เป็นระเบียบ
- ✅ สามารถ scale ได้ในอนาคต

ขอให้ใช้งานอย่างมีความสุข! 🎉
