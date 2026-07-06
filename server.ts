import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Path for server-side durable JSON file persistence
const DB_FILE = path.join(process.cwd(), "db.json");

// Default state of the database
const DEFAULT_STATE = {
  documents: [
    {
      id: "doc-1",
      title: "แบบฟอร์มการคัดกรองคนพิการทางการศึกษา (คป.01)",
      description: "แบบฟอร์มมาตรฐานสำหรับการประเมินคัดกรองนักเรียนที่มีความต้องการจำเป็นพิเศษ โดยครูผู้ผ่านการอบรม",
      file_url: "https://www.kusol.org/file/คป01-คัดกรอง.pdf",
      file_type: "pdf" as const,
      category: "แบบฟอร์ม",
      created_at: new Date().toISOString()
    },
    {
      id: "doc-2",
      title: "คู่มือแนวทางการจัดทำแผนการจัดการศึกษาเฉพาะบุคคล (IEP)",
      description: "คู่มืออธิบายขั้นตอนการประชุม การลงลายมือชื่อผู้ปกครองและคณะกรรมการอย่างถูกต้องตามระเบียบ",
      file_url: "https://www.phraespecial.go.th/manual/IEP-Manual-2026.pdf",
      file_type: "pdf" as const,
      category: "คู่มือ",
      created_at: new Date().toISOString()
    },
    {
      id: "doc-3",
      title: "สไลด์แนะนำโปรแกรมระบบ IEP Online",
      description: "การสอนกรอกข้อมูลและขั้นตอนบันทึกผ่านระบบคลาวด์ของ สพฐ. ทีละขั้นตอน",
      file_url: "https://docs.google.com/presentation/d/e/2PACX-1vTshG5y7T7n8oG6r1vG6W4T_W-8n_r-F3w8W_O2rX_eF_L8mO/embed?start=false&loop=false&delayms=3000",
      file_type: "gslide" as const,
      category: "สื่อการสอน",
      created_at: new Date().toISOString()
    }
  ],
  links: [
    {
      id: "link-1",
      title: "ระบบลงทะเบียนคัดกรองผู้เรียน สพฐ.",
      description: "สำหรับครูคัดกรองที่ผ่านการอบรม ล็อกอินเข้าระบบลงทะเบียนและประเมินผลออนไลน์",
      url: "https://screening.obec.go.th",
      icon: "ClipboardCheck",
      color: "#FF8A80",
      width: "large" as const,
      category: "คัดกรอง",
      position: 1,
      created_at: new Date().toISOString()
    },
    {
      id: "link-2",
      title: "ระบบ IEP Online สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
      description: "พอร์ทัลหลักในการบันทึกและจัดการแผน IEP ทั่วประเทศ",
      url: "https://iep.obec.go.th",
      icon: "Monitor",
      color: "#FF8A80",
      width: "large" as const,
      category: "IEP",
      position: 2,
      created_at: new Date().toISOString()
    },
    {
      id: "link-3",
      title: "เว็บไซต์ศูนย์การศึกษาพิเศษประจำจังหวัดแพร่",
      description: "เข้าชมข่าวสาร ดาวน์โหลดแบบฟอร์ม ติดต่อเบิกสื่อการเรียนรู้",
      url: "https://www.phraespecial.go.th",
      icon: "Globe",
      color: "#F4D35E",
      width: "medium" as const,
      category: "ศูนย์การศึกษาพิเศษ",
      position: 3,
      created_at: new Date().toISOString()
    },
    {
      id: "link-4",
      title: "คลังดาวน์โหลดแบบฟอร์มคูปองการศึกษา B และ C",
      description: "ดาวน์โหลดเอกสารสำหรับกรอกข้อมูลการให้บริการสอนเสริมและการขอรับสื่อ",
      url: "https://www.phraespecial.go.th/download-forms",
      icon: "FileText",
      color: "#FF8A80",
      width: "medium" as const,
      category: "แบบฟอร์ม",
      position: 4,
      created_at: new Date().toISOString()
    }
  ],
  stats: {
    views: 1420,
    documents: 3,
    links: 4,
    users: 15
  },
  activityLogs: [
    {
      id: "log-1",
      user: "System",
      action: "เริ่มต้นระบบบริหารจัดการแผนการจัดการศึกษาเฉพาะบุคคล (IEP) สำเร็จ",
      timestamp: new Date().toISOString()
    }
  ],
  viewerConfig: {
    width: "100%",
    height: "600px",
    borderRadius: "16px",
    shadow: "shadow-2xl"
  },
  settings: {
    primaryColor: "#FF8A80",
    secondaryColor: "#FFF3F0",
    accentColor: "#F4D35E",
    headerTitle: "ศูนย์การศึกษาพิเศษประจำอำเภอ",
    headerSubtitle1: "โรงเรียนบ้านร้องกวาง (จันทิมาคม)",
    headerSubtitle2: "สำนักงานเขตพื้นที่การศึกษาประถมศึกษาแพร่ เขต 1",
    headerDetails: "ระบบบริหารจัดการแผนการจัดการศึกษาเฉพาะบุคคล (IEP) และการให้บริการช่วยเหลือเด็กพิการ",
    sheetId: "1v4-UIHj5ddVDB-qZEOs_FI_F8aOQ3v-qAYHnMDOhkG0",
    scriptUrl: "https://script.google.com/macros/s/AKfycbyGS1j98Qxr_EF-MLxXHG4G37fOkXGFiBxGaGMgZ0ZqXv0blaD7t6-j6Lz5vmDxnNoI6w/exec",
    driveFolderUrl: "https://drive.google.com/drive/folders/1mMKPdgZLkwW786z19tsPu8yobUqm7uAR?usp=sharing"
  }
};

// Load database state from disk or initialize with DEFAULT_STATE
let dbState = { ...DEFAULT_STATE };
try {
  if (fs.existsSync(DB_FILE)) {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    dbState = JSON.parse(data);
    // Ensure all critical properties are present
    dbState.documents = dbState.documents || DEFAULT_STATE.documents;
    dbState.links = dbState.links || DEFAULT_STATE.links;
    dbState.stats = dbState.stats || DEFAULT_STATE.stats;
    dbState.activityLogs = dbState.activityLogs || DEFAULT_STATE.activityLogs;
    dbState.viewerConfig = dbState.viewerConfig || DEFAULT_STATE.viewerConfig;
    dbState.settings = dbState.settings || DEFAULT_STATE.settings;
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_STATE, null, 2), "utf-8");
  }
} catch (error) {
  console.error("Error initializing local JSON database:", error);
}

// Function to save state to DB_FILE and sync to Apps Script if possible
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
    // Automatically push state to Google Sheets Apps Script in background
    syncPushToGoogle();
  } catch (error) {
    console.error("Error writing database state to disk:", error);
  }
}

// Background pusher to Google Sheets Apps Script
let lastSyncStatus = {
  synced: false,
  lastCheck: new Date().toISOString(),
  message: "ยังไม่มีการเชื่อมต่อหรือซิงค์ข้อมูลกับ Google Sheets",
  type: "unknown" as "pull" | "push" | "unknown"
};

async function syncPushToGoogle() {
  const url = dbState.settings?.scriptUrl;
  if (!url || !url.startsWith("http")) {
    lastSyncStatus = {
      synced: false,
      lastCheck: new Date().toISOString(),
      message: "ยังไม่ได้ตั้งค่า Google Apps Script Web App URL",
      type: "push"
    };
    return;
  }
  try {
    console.log("Automatic Sync: pushing current local database state to Google Sheets...", url);
    const payload = {
      action: "sync",
      documents: dbState.documents,
      links: dbState.links,
      stats: dbState.stats,
      settings: dbState.settings,
      viewerConfig: dbState.viewerConfig
    };
    
    // Perform background fetch
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(res => {
      console.log(`Push sync to Google Sheets finished. Status: ${res.status}`);
      if (res.ok) {
        lastSyncStatus = {
          synced: true,
          lastCheck: new Date().toISOString(),
          message: "ซิงค์อัปโหลดข้อมูล (Push) ขึ้น Google Sheets สำเร็จเรียบร้อย",
          type: "push"
        };
      } else {
        lastSyncStatus = {
          synced: false,
          lastCheck: new Date().toISOString(),
          message: `การซิงค์อัปโหลดล้มเหลว (HTTP ${res.status})`,
          type: "push"
        };
      }
    }).catch(err => {
      console.warn("Background push sync warning:", err.message);
      lastSyncStatus = {
        synced: false,
        lastCheck: new Date().toISOString(),
        message: `ข้อผิดพลาดในการซิงค์อัปโหลด: ${err.message}`,
        type: "push"
      };
    });
  } catch (err: any) {
    console.error("Error in syncPushToGoogle setup:", err.message);
    lastSyncStatus = {
      synced: false,
      lastCheck: new Date().toISOString(),
      message: `ข้อผิดพลาดร้ายแรงในการซิงค์อัปโหลด: ${err.message}`,
      type: "push"
    };
  }
}

// Background puller from Google Sheets Apps Script
async function syncPullFromGoogle() {
  const url = dbState.settings?.scriptUrl;
  if (!url || !url.startsWith("http")) {
    console.log("No valid Google Apps Script URL specified yet for automatic pull sync.");
    lastSyncStatus = {
      synced: false,
      lastCheck: new Date().toISOString(),
      message: "ยังไม่ได้ตั้งค่า Google Apps Script Web App URL",
      type: "pull"
    };
    return false;
  }
  try {
    console.log("Automatic Sync: pulling state from Google Sheets...", url);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      const data = await response.json();
      if (data && (Array.isArray(data.documents) || Array.isArray(data.links))) {
        console.log("Successfully connected and loaded database state from Google Sheets Web App!");
        if (Array.isArray(data.documents)) dbState.documents = data.documents;
        if (Array.isArray(data.links)) dbState.links = data.links;
        if (data.settings) dbState.settings = { ...dbState.settings, ...data.settings };
        if (data.viewerConfig) dbState.viewerConfig = { ...dbState.viewerConfig, ...data.viewerConfig };
        if (data.stats) dbState.stats = { ...dbState.stats, ...data.stats };
        
        fs.writeFileSync(DB_FILE, JSON.stringify(dbState, null, 2), "utf-8");
        lastSyncStatus = {
          synced: true,
          lastCheck: new Date().toISOString(),
          message: "เชื่อมต่อและดึงข้อมูลอัปเดตล่าสุด (Pull) จาก Google Sheets สำเร็จ",
          type: "pull"
        };
        return true;
      } else {
        console.warn("Google Sheets returned response but documents/links arrays were not found or formatted differently.");
        lastSyncStatus = {
          synced: false,
          lastCheck: new Date().toISOString(),
          message: "ข้อมูลที่ดึงมาจาก Google Sheets ไม่ตรงตามรูปแบบที่กำหนด",
          type: "pull"
        };
      }
    } else {
      console.warn(`Failed to connect to Google Sheets Web App. HTTP Status: ${response.status}`);
      lastSyncStatus = {
        synced: false,
        lastCheck: new Date().toISOString(),
        message: `เชื่อมต่อกับ Google Sheets ไม่สำเร็จ (HTTP ${response.status})`,
        type: "pull"
      };
    }
  } catch (err: any) {
    console.warn("Could not pull state from Google Sheets (either not published or offline):", err.message);
    lastSyncStatus = {
      synced: false,
      lastCheck: new Date().toISOString(),
      message: `ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${err.message}`,
      type: "pull"
    };
  }
  return false;
}

// Lazy initialization of Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is missing. AI Search Assistant is limited.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Add a helper log function
function logActivity(user: string, action: string) {
  const log = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    user,
    action,
    timestamp: new Date().toISOString()
  };
  dbState.activityLogs.unshift(log);
  if (dbState.activityLogs.length > 100) {
    dbState.activityLogs.pop();
  }
  saveDB();
}

// API Routes
// 1. Fetch entire App Data (includes stats, settings, docs, links, etc.)
app.get("/api/data", (req, res) => {
  res.json({
    ...dbState,
    syncStatus: lastSyncStatus
  });
});

app.get("/api/sync/status", (req, res) => {
  res.json(lastSyncStatus);
});

// 2. Increment view count
app.post("/api/stats/increment", (req, res) => {
  dbState.stats.views += 1;
  saveDB();
  res.json({ success: true, views: dbState.stats.views });
});

// 3. User Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  // Default password is 'admin123'
  if (email === "admin" && password === "admin123") {
    res.json({
      success: true,
      user: {
        id: "admin-user",
        fullname: "ผู้ดูแลระบบศูนย์",
        role: "Administrator",
        email: "admin@rongkwang.ac.th"
      }
    });
    logActivity("Admin", "เข้าสู่ระบบสำเร็จ");
  } else {
    res.status(401).json({ success: false, message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
  }
});

// 4. Document management
app.post("/api/documents", (req, res) => {
  const { title, description, file_url, file_type, category } = req.body;
  if (!title || !file_url) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  const newDoc = {
    id: `doc-${Date.now()}`,
    title,
    description: description || "",
    file_url,
    file_type,
    category,
    created_at: new Date().toISOString()
  };
  dbState.documents.push(newDoc);
  dbState.stats.documents = dbState.documents.length;
  logActivity("Admin", `เพิ่มเอกสารใหม่: "${title}"`);
  res.json({ success: true, document: newDoc });
});

app.put("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, file_url, file_type, category } = req.body;
  const index = dbState.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "ไม่พบเอกสารที่ระบุ" });
  }
  dbState.documents[index] = {
    ...dbState.documents[index],
    title,
    description: description || "",
    file_url,
    file_type,
    category
  };
  logActivity("Admin", `แก้ไขข้อมูลเอกสาร: "${title}"`);
  res.json({ success: true, document: dbState.documents[index] });
});

app.delete("/api/documents/:id", (req, res) => {
  const { id } = req.params;
  const index = dbState.documents.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "ไม่พบเอกสารที่ระบุ" });
  }
  const deletedDoc = dbState.documents[index];
  dbState.documents.splice(index, 1);
  dbState.stats.documents = dbState.documents.length;
  logActivity("Admin", `ลบเอกสาร: "${deletedDoc.title}"`);
  res.json({ success: true });
});

// 5. Link management
app.post("/api/links", (req, res) => {
  const { title, description, url, icon, color, width, category } = req.body;
  if (!title || !url) {
    return res.status(400).json({ success: false, message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }
  const newLink = {
    id: `link-${Date.now()}`,
    title,
    description: description || "",
    url,
    icon: icon || "Link",
    color: color || "#FF8A80",
    width: width || "medium",
    category: category || "อื่น ๆ",
    position: dbState.links.length + 1,
    created_at: new Date().toISOString()
  };
  dbState.links.push(newLink);
  dbState.stats.links = dbState.links.length;
  logActivity("Admin", `เพิ่มลิงก์ใหม่: "${title}"`);
  res.json({ success: true, link: newLink });
});

app.put("/api/links/:id", (req, res) => {
  const { id } = req.params;
  const { title, description, url, icon, color, width, category, position } = req.body;
  const index = dbState.links.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "ไม่พบลักษณะลิงก์ที่ระบุ" });
  }
  dbState.links[index] = {
    ...dbState.links[index],
    title,
    description: description || "",
    url,
    icon: icon || "Link",
    color: color || "#FF8A80",
    width: width || "medium",
    category: category || "อื่น ๆ",
    position: typeof position === "number" ? position : dbState.links[index].position
  };
  logActivity("Admin", `แก้ไขข้อมูลลิงก์: "${title}"`);
  res.json({ success: true, link: dbState.links[index] });
});

app.delete("/api/links/:id", (req, res) => {
  const { id } = req.params;
  const index = dbState.links.findIndex(l => l.id === id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "ไม่พบลักษณะลิงก์ที่ระบุ" });
  }
  const deletedLink = dbState.links[index];
  dbState.links.splice(index, 1);
  dbState.stats.links = dbState.links.length;
  logActivity("Admin", `ลบลิงก์: "${deletedLink.title}"`);
  res.json({ success: true });
});

// Reorder links
app.post("/api/links/reorder", (req, res) => {
  const { reorderedLinks } = req.body;
  if (Array.isArray(reorderedLinks)) {
    reorderedLinks.forEach((l: any, i: number) => {
      const idx = dbState.links.findIndex(item => item.id === l.id);
      if (idx !== -1) {
        dbState.links[idx].position = i;
      }
    });
    dbState.links.sort((a, b) => a.position - b.position);
    saveDB();
    res.json({ success: true, links: dbState.links });
  } else {
    res.status(400).json({ success: false, message: "ข้อมูลลำดับไม่ถูกต้อง" });
  }
});

// 6. Settings & Config updates
app.post("/api/settings", (req, res) => {
  const { viewerConfig, settings } = req.body;
  if (viewerConfig) {
    dbState.viewerConfig = { ...dbState.viewerConfig, ...viewerConfig };
    logActivity("Admin", "ปรับแต่งขนาดและสไตล์ของกรอบแสดงผลเอกสาร");
  }
  if (settings) {
    dbState.settings = { ...dbState.settings, ...settings };
    logActivity("Admin", "อัปเดตข้อมูลการตั้งค่าเว็บไซต์และศูนย์ข้อมูลหลัก");
  }
  saveDB();
  res.json({ success: true, viewerConfig: dbState.viewerConfig, settings: dbState.settings });
});

// 7. Base64 File Upload and conversion to a link URL
app.post("/api/upload", (req, res) => {
  const { fileName, fileType, fileData } = req.body;
  if (!fileName || !fileData) {
    return res.status(400).json({ success: false, message: "กรุณาแนบไฟล์และชื่อไฟล์" });
  }
  
  // To keep it simple on server node memory and persistent across users, we can convert to base64 data url,
  // or we can write to a file in /public/uploads/ or local storage. Let's create an upload folder or keep in memory database.
  // We can write to the local directory `dist/uploads/` so Vite or Express can serve it!
  const uploadDir = path.join(process.cwd(), "dist", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const ext = path.extname(fileName) || (fileType === "pdf" ? ".pdf" : ".pptx");
  const uniqueName = `upload-${Date.now()}${ext}`;
  const filePath = path.join(uploadDir, uniqueName);
  
  try {
    const base64Data = fileData.replace(/^data:.*?;base64,/, "");
    fs.writeFileSync(filePath, base64Data, "base64");
    
    // Serve via absolute or relative URL
    const fileUrl = `/uploads/${uniqueName}`;
    res.json({ success: true, fileUrl, uniqueName });
    logActivity("System", `อัปโหลดไฟล์สำเร็จ: "${fileName}" -> "${uniqueName}"`);
  } catch (err: any) {
    console.error("Error writing uploaded file to disk:", err);
    // Fallback to returned dataURL
    res.json({ success: true, fileUrl: fileData });
  }
});

// 8. AI Search Assistant powered by Gemini
app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ success: false, message: "กรุณาระบุคำค้นหา" });
  }

  const ai = getAIClient();
  if (!ai) {
    // Basic server-side regex fallback if Gemini is not set up
    const query = prompt.toLowerCase();
    const matchedDocs = dbState.documents.filter(
      d => d.title.toLowerCase().includes(query) || d.description.toLowerCase().includes(query) || d.category.toLowerCase().includes(query)
    );
    const matchedLinks = dbState.links.filter(
      l => l.title.toLowerCase().includes(query) || l.description.toLowerCase().includes(query) || l.category.toLowerCase().includes(query)
    );
    return res.json({
      success: true,
      text: `[ระบบค้นหาจำลอง - ยังไม่เปิดใช้งาน คีย์ Gemini API]\n\nพบเอกสาร ${matchedDocs.length} รายการ และลิงก์สำคัญ ${matchedLinks.length} รายการที่ตรงกับการค้นหาของคุณ:\n${matchedDocs.map(d => `- เอกสาร: ${d.title}`).join("\n")}\n${matchedLinks.map(l => `- ลิงก์: ${l.title}`).join("\n")}`,
      matchedDocs,
      matchedLinks
    });
  }

  try {
    const context = {
      availableDocuments: dbState.documents.map(d => ({ id: d.id, title: d.title, desc: d.description, type: d.file_type, cat: d.category })),
      availableLinks: dbState.links.map(l => ({ id: l.id, title: l.title, desc: l.description, url: l.url, cat: l.category }))
    };

    const systemPrompt = `คุณคือผู้ช่วย AI อัจฉริยะ (AI Search Assistant) ประจำ "ศูนย์การศึกษาพิเศษประจำอำเภอ โรงเรียนบ้านร้องกวาง (จันทิมาคม) สพป.แพร่ 1"
หน้าที่ของคุณคือช่วยคุณครู ผู้บริหาร และผู้ปกครอง ค้นหาข้อมูล ตอบคำถามเกี่ยวกับการคัดกรองเด็กพิเศษ การจัดทำแผน IEP (01-06) คูปองสื่อ คูปองสอนเสริม และแบบฟอร์ม คป.01

นี่คือเอกสารและลิงก์ทั้งหมดที่มีอยู่ในระบบปัจจุบัน:
${JSON.stringify(context, null, 2)}

เมื่อผู้ใช้พิมพ์คำถามหรือคำค้นหา:
1. ตอบคำถามด้วยภาษาไทยที่เป็นมิตร สุภาพ และเป็นมืออาชีพ
2. แนะนำ "เอกสาร" หรือ "ลิงก์" ที่มีความเกี่ยวข้องสูงสุดจากรายการที่ให้ไปด้านบน
3. ให้สรุปขั้นตอนสั้นๆ ที่เหมาะสมกับคำถาม เช่น หากถามเกี่ยวกับคัดกรอง ให้แนะนำขั้นตอน 01 คัดกรอง คป.01 และลิงก์ลงทะเบียนผู้คัดกรอง
4. ตอบในรูปแบบโครงสร้างที่อ่านง่าย เป็นระเบียบ (ใช้ Markdown ได้)`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7
      }
    });

    const text = response.text || "ไม่พบคำตอบ";
    
    // Automatically match and extract recommended doc IDs and link IDs from the text context
    const matchedDocs = dbState.documents.filter(d => text.includes(d.title) || prompt.includes(d.category));
    const matchedLinks = dbState.links.filter(l => text.includes(l.title) || prompt.includes(l.category));

    res.json({
      success: true,
      text,
      matchedDocs,
      matchedLinks
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการประมวลผลด้วย AI", error: error.message });
  }
});

// 9. Manual Sync endpoints for Google Sheets
app.post("/api/sync/pull", async (req, res) => {
  const success = await syncPullFromGoogle();
  if (success) {
    logActivity("System", "เชื่อมต่อและดึงข้อมูลอัปเดตจาก Google Sheets สำเร็จ");
    res.json({ success: true, message: "อัปเดตข้อมูลจาก Google Sheets สำเร็จ", data: dbState });
  } else {
    res.status(500).json({ success: false, message: "ไม่สามารถดึงข้อมูลได้สำเร็จ กรุณาตรวจสอบสิทธิ์และการเชื่อมต่อเครือข่าย" });
  }
});

app.post("/api/sync/push", async (req, res) => {
  const url = dbState.settings?.scriptUrl;
  if (!url || !url.startsWith("http")) {
    return res.status(400).json({ success: false, message: "กรุณากำหนด Google Appscript Web App URL ในหน้าตั้งค่าก่อนซิงค์" });
  }
  try {
    const payload = {
      action: "sync",
      documents: dbState.documents,
      links: dbState.links,
      stats: dbState.stats,
      settings: dbState.settings,
      viewerConfig: dbState.viewerConfig
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      logActivity("Admin", "สั่งอัปโหลดแบ็คอัพข้อมูลด้วยตนเองขึ้น Google Sheets เรียบร้อย");
      res.json({ success: true, message: "ส่งข้อมูลขึ้น Google Sheets สำเร็จ" });
    } else {
      res.status(500).json({ success: false, message: `ส่งข้อมูลล้มเหลว สถานะ: ${response.status}` });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการเชื่อมโยงเครือข่าย", error: err.message });
  }
});

// Start server block
async function startServer() {
  // Trigger automatic pull from Google Sheets upon server startup
  try {
    await syncPullFromGoogle();
  } catch (e: any) {
    console.warn("Startup automatic sync pull did not succeed:", e.message);
  }

  // If in production mode, serve the static builds
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve static files from uploads folder
    const uploadDir = path.join(process.cwd(), "dist", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadDir));
    
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // In dev mode, mount Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    
    // Ensure development uploads directory exists and is served
    const devUploadDir = path.join(process.cwd(), "dist", "uploads");
    if (!fs.existsSync(devUploadDir)) {
      fs.mkdirSync(devUploadDir, { recursive: true });
    }
    app.use("/uploads", express.static(devUploadDir));
    
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is booted at http://0.0.0.0:${PORT}`);
  });
}

startServer();
