# การปรับบล็อค 3 และ 4

- รัน `npm start` แล้วเปิด http://localhost:3000 (หากยังไม่มี dependencies ให้รัน `npm ci`)
- บล็อค 3 อ่าน `/listdonator.json` แสดง 5 รายการบริจาคสำเร็จล่าสุดในกันยายน 2026 ตามเวลา Asia/Bangkok ชื่อซ้ำได้หากเป็นคนละรายการ
- เปลี่ยนปีได้ที่ `DONOR_YEAR` ใน index.html
- บล็อค 4 ใช้ `data.allTime` ใน log.json กับเป้าหมาย 5,000 / 10,000 / 50,000 บาท หลอดเริ่มจาก 0 เมื่อยังไม่มียอด และจำกัดที่ 100%
- `/api/donations` บันทึกข้อมูลลง listdonator.json แล้ว ข้อมูลตั้งต้นคัดลอกจาก listdonatorlog.json เดิม
- หน้าเว็บเรียก `/api/profile` และ `/api/donations` เมื่อเปิดหรือรีเฟรชหน้า เพื่อรับข้อมูลล่าสุดและให้เซิร์ฟเวอร์สร้างไฟล์สำรอง
- ตรวจสอบการเรียง/จำกัดรายชื่อ ขอบเขตเดือนตามเวลาไทย ปี สถานะรายการ และการคำนวณหลอดแล้ว

## เตรียม deploy บน Render

- ใช้ `render.yaml` เพื่อสร้าง Free Web Service โดย Build Command คือ `npm ci` และ Start Command คือ `npm start`
- กรอก `EASYDONATE_BASE_URL` และ `EASYDONATE_API_KEY` ใน Render ตอนสร้าง Blueprint; ห้ามใส่ค่าเหล่านี้ลง GitHub
- `.env`, `log.json`, `listdonator.json` และ `listdonatorlog.json` ถูกระบุใน `.gitignore` แล้ว
- ไฟล์สำรองเป็นข้อมูลชั่วคราวของเซิร์ฟเวอร์; หน้าเว็บจึงไม่อ่านไฟล์เหล่านี้โดยตรง
