import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Trash2, 
  Settings, 
  FileText, 
  Bot, 
  GraduationCap, 
  Sparkles, 
  Layers, 
  Info,
  Calendar,
  Sliders,
  CheckCircle,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";

import { Document, LinkItem, ViewerConfig, AppSettings, ActivityLog, User } from "./types";
import Header from "./components/Header";
import StatsDashboard from "./components/StatsDashboard";
import DocumentViewer from "./components/DocumentViewer";
import QuickAccess from "./components/QuickAccess";
import AdminPanel from "./components/AdminPanel";
import SearchAssistant from "./components/SearchAssistant";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

export default function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [viewerConfig, setViewerConfig] = useState<ViewerConfig>({
    width: "100%",
    height: "600px",
    borderRadius: "16px",
    shadow: "shadow-2xl"
  });
  const [settings, setSettings] = useState<AppSettings>({
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
  });
  const [stats, setStats] = useState({
    views: 1200,
    documents: 0,
    links: 0,
    users: 15
  });
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Auth & Mode states
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isShowingLogin, setIsShowingLogin] = useState<boolean>(false);
  const [isShowingAdminDashboard, setIsShowingAdminDashboard] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // App active selection states
  const [activeDoc, setActiveDoc] = useState<Document | null>(null);
  
  // Search query (passed to both lists if desired)
  const [searchQuery, setSearchQuery] = useState("");
  
  // Toast notifications
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Banner slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  const bannerSlides = [
    {
      title: "ยินดีต้อนรับสู่แดชบอร์ดศูนย์การศึกษาพิเศษ",
      desc: "ระบบจัดทำแผนการศึกษาเฉพาะบุคคล IEP และขอรับสื่อ เทคโนโลยี สิ่งอำนวยความสะดวก เพื่อพัฒนาคุณภาพชีวิตเด็กพิการอย่างเป็นระบบ",
      btnText: "ดูเอกสารทั้งหมด",
      tag: "โรงเรียนบ้านร้องกวาง (จันทิมาคม)"
    },
    {
      title: "01-06 ขั้นตอนตรวจสอบสิทธิประโยชน์ผู้เรียน",
      desc: "ประเมิน คัดกรอง ประชุม วางแผน ส่งต่อ ศกศ. อนุมัติคูปองการเรียนการสอนเสริม และคูปองเบิกสื่อการเรียนรู้อย่างถูกต้องรวดเร็ว",
      btnText: "ดูขั้นตอน IEP",
      tag: "สพป.แพร่ เขต 1"
    }
  ];

  // Fetch initial app data
  const fetchAppData = async () => {
    try {
      const res = await fetch("/api/data");
      const data = await res.json();
      if (data) {
        setDocuments(data.documents || []);
        setLinks(data.links || []);
        setViewerConfig(data.viewerConfig || viewerConfig);
        setSettings(data.settings || settings);
        setStats(data.stats || stats);
        setActivityLogs(data.activityLogs || []);
        
        // Auto-select first document if available
        if (data.documents && data.documents.length > 0 && !activeDoc) {
          setActiveDoc(data.documents[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching initial app state:", err);
      showToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ระบบควบคุมได้ จะใช้ข้อมูลออฟไลน์ชั่วคราว");
    }
  };

  useEffect(() => {
    fetchAppData();

    // Increment visitor count
    const incrementVisitor = async () => {
      try {
        const res = await fetch("/api/stats/increment", { method: "POST" });
        const data = await res.json();
        if (data.success) {
          setStats(prev => ({ ...prev, views: data.views }));
        }
      } catch (e) {
        console.warn("Could not increment visitor stats.");
      }
    };
    incrementVisitor();
  }, []);

  // Banner slider automatic interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Show Toast helper
  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // 1. LOGIN HANDLER
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailInput = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
    const passwordInput = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsAdmin(true);
        setIsShowingLogin(false);
        setIsShowingAdminDashboard(true); // Open panel automatically
        showToast("success", "เข้าสู่ระบบในฐานะผู้ดูแลสำเร็จ");
        fetchAppData();
      } else {
        showToast("error", data.message || "รหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      showToast("error", "การติดต่อล้มเหลว");
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setIsShowingAdminDashboard(false);
    showToast("info", "ออกจากระบบผู้ดูแลเรียบร้อยแล้ว");
  };

  // 2. DOCUMENT CRUD HANDLERS
  const handleAddDocument = async (docPayload: any) => {
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docPayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `บันทึกเอกสาร "${docPayload.title}" สำเร็จ!`);
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "บันทึกเอกสารล้มเหลว");
    }
  };

  const handleEditDocument = async (id: string, docPayload: any) => {
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docPayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `แก้ไขข้อมูลเอกสารเสร็จสมบูรณ์`);
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "การอัปเดตเอกสารล้มเหลว");
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("info", "ลบเอกสารสำเร็จ");
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "การลบเอกสารล้มเหลว");
    }
  };

  // 3. LINK CRUD HANDLERS
  const handleAddLink = async (linkPayload: any) => {
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkPayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `สร้างปุ่มลิงก์เว็บบริการด่วน "${linkPayload.title}" สำเร็จ!`);
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "การสร้างปุ่มลิงก์ล้มเหลว");
    }
  };

  const handleEditLink = async (id: string, linkPayload: any) => {
    try {
      const res = await fetch(`/api/links/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(linkPayload)
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `อัปเดตข้อมูลลิงก์แล้ว`);
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "การอัปเดตปุ่มลิงก์ล้มเหลว");
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      const res = await fetch(`/api/links/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("info", "ลบปุ่มลิงก์สำเร็จ");
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "ลบลิงก์ล้มเหลว");
    }
  };

  // 4. CONFIG / THEME / SETTINGS UPDATE HANDLER
  const handleUpdateConfig = async (configPayload: Partial<ViewerConfig>, settingsPayload?: Partial<AppSettings>) => {
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ viewerConfig: configPayload, settings: settingsPayload })
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "บันทึกการปรับตั้งค่า Layout และชื่อสถาบันสำเร็จ");
        fetchAppData();
      } else {
        showToast("error", data.message);
      }
    } catch (err) {
      showToast("error", "ปรับตั้งค่าไม่สำเร็จ");
    }
  };

  const handleLinkClick = (link: LinkItem) => {
    window.open(link.url, "_blank", "noopener,noreferrer");
    showToast("info", `เปิดเว็บบริการ: ${link.title}`);
  };

  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 pb-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 flex flex-col gap-6">
          
          {/* 1. Header Section */}
          <Header
            settings={settings}
            isAdmin={isAdmin}
            onOpenAdmin={() => {
              if (isAdmin) {
                setIsShowingAdminDashboard(true);
              } else {
                setIsShowingLogin(true);
              }
            }}
            onLogoutAdmin={handleLogout}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          />

          {/* 2. Banner/Slider Notice Block */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-3d h-48 md:h-40 bg-gradient-to-r from-orange-400 via-pink-400 to-amber-300 dark:from-orange-950 dark:via-red-950 dark:to-yellow-950 text-white flex items-center p-6 md:p-8">
            <div className="absolute -right-20 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl flex flex-col justify-center">
              <span className="text-[9px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full font-bold w-max mb-2">
                📢 ประกาศและแนวปฏิบัติ: {bannerSlides[currentSlide].tag}
              </span>
              <h2 className="text-sm md:text-base font-extrabold tracking-tight font-prompt line-clamp-1">
                {bannerSlides[currentSlide].title}
              </h2>
              <p className="text-[11px] md:text-xs text-white/80 font-sarabun mt-1 line-clamp-2 leading-relaxed">
                {bannerSlides[currentSlide].desc}
              </p>
            </div>
            
            {/* Slide switch buttons */}
            <div className="absolute bottom-4 right-4 flex gap-1.5 z-20">
              {bannerSlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlide === idx ? "bg-white w-6" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* 3. Statistics Panel Counter */}
          <StatsDashboard
            views={stats.views}
            documentsCount={stats.documents}
            linksCount={stats.links}
            usersCount={stats.users}
            primaryColor={settings.primaryColor}
          />

          {/* 4. Main Two-Section Responsive Layout */}
          <main className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-start">
            
            {/* Left Section (70% equivalent - col span 7) */}
            <section className="lg:col-span-7 flex flex-col gap-6">
              <div className="glass rounded-3xl p-6 shadow-3d border border-white/20 bg-white dark:bg-gray-900/40">
                <DocumentViewer
                  documents={documents}
                  activeDoc={activeDoc}
                  onSelectDoc={(doc) => {
                    setActiveDoc(doc);
                    showToast("info", `แสดงผลเอกสาร: ${doc.title}`);
                  }}
                  viewerConfig={viewerConfig}
                  onUploadSuccess={(newDoc) => {
                    showToast("success", `อัปโหลดและจัดเก็บเอกสารเรียบร้อยแล้ว`);
                    fetchAppData();
                    setActiveDoc(newDoc);
                  }}
                  isDarkMode={isDarkMode}
                  isAdmin={isAdmin}
                />
              </div>
            </section>

            {/* Right Section (30% equivalent - col span 3) */}
            <section className="lg:col-span-3 flex flex-col gap-6">
              <div className="glass rounded-3xl p-6 shadow-3d border border-white/20 bg-white dark:bg-gray-900/40">
                <QuickAccess
                  links={links}
                  settings={settings}
                  onLinkClick={handleLinkClick}
                  isAdmin={isAdmin}
                  onDeleteLink={handleDeleteLink}
                  onEditLink={(link) => {
                    setIsShowingAdminDashboard(true);
                  }}
                  isDarkMode={isDarkMode}
                  searchQuery={searchQuery}
                />
              </div>
            </section>

          </main>

          {/* 5. AI Search Assistant & Bottom Banner */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
            <div className="md:col-span-2">
              <SearchAssistant
                onSelectDoc={(doc) => {
                  setActiveDoc(doc);
                  showToast("info", `เปิดเอกสารแนะนำ: ${doc.title}`);
                  window.scrollTo({ top: 350, behavior: "smooth" });
                }}
                onLinkClick={handleLinkClick}
                primaryColor={settings.primaryColor}
              />
            </div>

            {/* Quick Contact & Info Card */}
            <div className="glass rounded-3xl p-5 shadow-3d border border-white/20 flex flex-col justify-between bg-[#FFF3F0]/20 dark:bg-orange-950/5">
              <div className="flex flex-col gap-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#FF8A80] bg-orange-100/60 dark:bg-orange-950/20 w-max">
                  <GraduationCap className="w-3.5 h-3.5" /> บริการให้คำปรึกษาเด็กพิเศษ
                </span>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white font-prompt">
                  ติดต่อฝ่ายสนับสนุน IEP ประจำสโมสร
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-sarabun leading-relaxed">
                  หากท่านพบอุปสรรคหรือต้องการรายงานข้อบกพร่องในแบบฟอร์มคัดกรอง คป.01 หรือขั้นตอนส่งเอกสารที่ ศกศ.พร. สามารถติดต่อผ่านกลุ่มงานช่วยเหลือระยะแรกเริ่ม (EI) ได้ทันที
                </p>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <div className="flex justify-between text-[11px] font-mono p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-400">อีเมลทางการ:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">methawinin1971@gmail.com</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono p-2 bg-white dark:bg-gray-800 rounded-lg">
                    <span className="text-gray-400">เบอร์หน่วยบริการ:</span>
                    <span className="font-bold text-gray-700 dark:text-gray-300">054-522122 (ศกศ.พร.)</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 text-center mt-4 border-t pt-2.5 font-sarabun flex items-center justify-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-[#FF8A80]" />
                <span>แผงควบคุมสิทธิ์เสรี บมจ.โรงเรียนบ้านร้องกวาง</span>
              </div>
            </div>
          </section>

        </div>

        {/* --- OVERLAY MODAL 1: ADMIN LOGIN --- */}
        <AnimatePresence>
          {isShowingLogin && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-gray-800"
              >
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-950/20 text-[#FF8A80] flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white font-prompt">ล็อกอินสิทธิ์ผู้ดูแลระบบ</h3>
                  <p className="text-[11px] text-gray-400 font-sarabun mt-1">ล็อกอินเพื่อแก้ไขปุ่มลิงก์ และอัปโหลดไฟล์ PDF/PPT เอกสาร</p>
                </div>

                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 font-sarabun text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">ชื่อบัญชีผู้ใช้ (Email/User)</label>
                    <input
                      name="email"
                      type="text"
                      defaultValue="admin"
                      required
                      placeholder="กรอกชื่อผู้ใช้ หรือ admin"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">รหัสผ่านบัญชีควบคุม (Password)</label>
                    <input
                      name="password"
                      type="password"
                      defaultValue="admin123"
                      required
                      placeholder="กรอกรหัสผ่าน หรือ admin123"
                      className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 rounded-xl text-[10px] leading-relaxed mb-1.5">
                    <strong>ข้อแนะนำ:</strong> รหัสเริ่มต้นคือ บัญชี <strong>admin</strong> และ รหัสผ่าน <strong>admin123</strong> เพื่อความสะดวกในการตรวจอบแอปของท่าน
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsShowingLogin(false)}
                      className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 transition"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl text-white font-bold shadow-md hover:opacity-95 transition"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      เข้าสู่ระบบ
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- OVERLAY MODAL 2: ADMIN MANAGEMENT DASHBOARD --- */}
        <AnimatePresence>
          {isShowingAdminDashboard && (
            <AdminPanel
              documents={documents}
              links={links}
              viewerConfig={viewerConfig}
              settings={settings}
              activityLogs={activityLogs}
              onAddDocument={handleAddDocument}
              onEditDocument={handleEditDocument}
              onDeleteDocument={handleDeleteDocument}
              onAddLink={handleAddLink}
              onEditLink={handleEditLink}
              onDeleteLink={handleDeleteLink}
              onUpdateConfig={handleUpdateConfig}
              onClose={() => setIsShowingAdminDashboard(false)}
              isDarkMode={isDarkMode}
            />
          )}
        </AnimatePresence>

        {/* --- TOAST FLOATING NOTIFICATIONS --- */}
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm">
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              className={`p-3.5 rounded-2xl shadow-xl border flex items-start gap-2.5 text-xs font-sarabun text-white ${
                toast.type === "success" ? "bg-emerald-500 border-emerald-400" :
                toast.type === "error" ? "bg-rose-500 border-rose-400" :
                "bg-slate-800 border-slate-700"
              }`}
            >
              {toast.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div>
                <p className="font-bold">{toast.type === "success" ? "ดำเนินการสำเร็จ" : "แจ้งเตือนระบบ"}</p>
                <p className="text-[11px] opacity-90 mt-0.5">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}

// Simple Lock icon replacement since we use raw dynamic imports if wanted or standard Lucide
function Lock({ className }: { className?: string }) {
  return <Sliders className={className} />;
}
