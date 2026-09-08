require('dotenv').config();
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const express = require('express');
const cors = require('cors'); // ต้องติดตั้งเพิ่มเพื่ออนุญาตให้หน้าเว็บดึงข้อมูลได้
const app = express();
const port = Number(process.env.PORT) || 3000;
const backupPath = path.join(__dirname, 'log.json');
const donatorBackupPath = path.join(__dirname, 'listdonator.json');

app.use(cors()); // อนุญาตให้ Frontend ดึงข้อมูลจากเซิร์ฟเวอร์นี้ได้

// ให้บริการหน้าเว็บ และ health check สำหรับแพลตฟอร์ม deploy
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// เขียนไฟล์ชั่วคราวก่อน แล้วค่อยแทนที่ไฟล์จริง เพื่อไม่ให้ไฟล์สำรองค้างเป็น JSON ที่ไม่สมบูรณ์
async function backupJson(data, destinationPath) {
    const temporaryPath = `${destinationPath}.${process.pid}.${randomUUID()}.tmp`;

    try {
        await fs.writeFile(temporaryPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
        await fs.rename(temporaryPath, destinationPath);
    } catch (error) {
        await fs.unlink(temporaryPath).catch(() => {});
        throw error;
    }
}

// สร้าง Route รอให้ฝั่ง Frontend มาเรียกใช้
app.get('/api/profile', async (req, res) => {
    try {
        const response = await fetch(`${process.env.EASYDONATE_BASE_URL}/donations/stats`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.EASYDONATE_API_KEY}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "ดึงข้อมูลจาก EasyDonate ล้มเหลว" });
        }

        const data = await response.json();
        await backupJson(data, backupPath); // สำรอง JSON ฉบับเต็มล่าสุดไว้ใน log.json
        res.json(data); // ส่งข้อมูลที่ได้กลับไปให้ Frontend
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ส่งรายชื่อผู้โดเนทจาก EasyDonate ให้ Frontend เรียกใช้
app.get('/api/donations', async (req, res) => {
    try {
        const response = await fetch(`${process.env.EASYDONATE_BASE_URL}/donations`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.EASYDONATE_API_KEY}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "ดึงรายชื่อผู้โดเนทจาก EasyDonate ล้มเหลว" });
        }

        const data = await response.json();
        await backupJson(data, donatorBackupPath); // สำรอง JSON ฉบับเต็มล่าสุดไว้ใน listdonator.json
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`เซิร์ฟเวอร์ทำงานที่พอร์ต ${port}`));
