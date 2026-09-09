# EasyDonate Dashboard

Node.js/Express dashboard สำหรับแสดงข้อมูล EasyDonate และสำรองข้อมูลล่าสุดเป็น JSON

## รันบนเครื่อง

1. คัดลอกค่า `EASYDONATE_BASE_URL` และ `EASYDONATE_API_KEY` ลง `.env` (ไฟล์นี้ไม่ถูก commit)
2. รัน `npm ci`
3. รัน `npm run build`
4. รัน `npm start` แล้วเปิด `http://localhost:3000`

## เก็บโค้ดบน GitHub

`.gitignore` ป้องกันไม่ให้ `.env`, `node_modules` และไฟล์สำรอง JSON ถูกอัปโหลดอยู่แล้ว ตรวจสอบก่อน push ด้วย `git status` แล้วจึงสร้าง repository และ push โค้ดขึ้น GitHub

> ห้าม commit หรือ push `.env` เพราะมี API key ของ EasyDonate

## Deploy บน Railway

1. สร้างโปรเจกต์ใหม่บน Railway แล้วเลือก **Deploy from GitHub repo** และเลือก repository นี้
2. ใน service variables เพิ่ม `EASYDONATE_BASE_URL` และ `EASYDONATE_API_KEY` โดยคัดลอกค่าจาก `.env` ในเครื่อง (ไม่ต้องเพิ่ม `PORT` เพราะ Railway กำหนดให้เอง)
3. ตั้งค่า Build Command เป็น `npm ci && npm run build`, Start Command เป็น `npm start` และ Healthcheck Path เป็น `/health`
4. สร้าง public domain ของ service แล้วเปิด URL นั้นเพื่อตรวจหน้า dashboard

### เก็บไฟล์สำรองให้คงอยู่

Railway มี filesystem ชั่วคราวในแต่ละ deployment จึงต้องเพิ่ม **Volume** หากต้องการเก็บ `log.json` และ `listdonator.json` ข้ามการ redeploy ให้ mount Volume ที่ `/data` กับ service นี้ โค้ดจะตรวจ `RAILWAY_VOLUME_MOUNT_PATH` และบันทึกไฟล์สำรองลง Volume โดยอัตโนมัติ

ทุกครั้งที่ push เข้า branch ที่เชื่อมต่อ Railway ระบบจะ build และ deploy เวอร์ชันใหม่โดยอัตโนมัติ
