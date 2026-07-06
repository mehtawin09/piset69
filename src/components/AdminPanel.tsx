import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Lock, 
  Settings, 
  FileText, 
  Link as LinkIcon, 
  LayoutGrid, 
  Palette, 
  CloudLightning, 
  Plus, 
  Edit, 
  Trash2, 
  Database, 
  Activity, 
  X,
  Sparkles,
  Info,
  Cloud,
  CloudOff,
  RefreshCw
} from "lucide-react";
import { Document, LinkItem, ViewerConfig, AppSettings, ActivityLog, SyncStatus } from "../types";

interface AdminPanelProps {
  documents: Document[];
  links: LinkItem[];
  viewerConfig: ViewerConfig;
  settings: AppSettings;
  activityLogs: ActivityLog[];
  onAddDocument: (doc: any) => Promise<void>;
  onEditDocument: (id: string, doc: any) => Promise<void>;
  onDeleteDocument: (id: string) => Promise<void>;
  onAddLink: (link: any) => Promise<void>;
  onEditLink: (id: string, link: any) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  onUpdateConfig: (config: Partial<ViewerConfig>, settings?: Partial<AppSettings>) => Promise<void>;
  onClose: () => void;
  isDarkMode: boolean;
  onRefresh?: () => Promise<void>;
  syncStatus?: SyncStatus | null;
}

export default function AdminPanel({
  documents,
  links,
  viewerConfig,
  settings,
  activityLogs,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onUpdateConfig,
  onClose,
  isDarkMode,
  onRefresh,
  syncStatus
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<"docs" | "links" | "layout" | "sync" | "logs">("docs");
  
  // Document form states
  const [docId, setDocId] = useState<string | null>(null);
  const [docTitle, setDocTitle] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docType, setDocType] = useState<any>("pdf");
  const [docCat, setDocCat] = useState("เอกสาร");

  // Link form states
  const [linkId, setLinkId] = useState<string | null>(null);
  const [linkTitle, setLinkTitle] = useState("");
  const [linkDesc, setLinkDesc] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkIcon, setLinkIcon] = useState("Link");
  const [linkColor, setLinkColor] = useState("#FF8A80");
  const [linkWidth, setLinkWidth] = useState<any>("medium");
  const [linkCat, setLinkCat] = useState("อื่น ๆ");

  // Layout states (Viewer size & border style)
  const [vHeight, setVHeight] = useState(viewerConfig.height || "600px");
  const [vRadius, setVRadius] = useState(viewerConfig.borderRadius || "16px");
  const [vShadow, setVShadow] = useState(viewerConfig.shadow || "shadow-2xl");

  // General details
  const [headerTitle, setHeaderTitle] = useState(settings.headerTitle);
  const [headerSub1, setHeaderSub1] = useState(settings.headerSubtitle1);
  const [headerSub2, setHeaderSub2] = useState(settings.headerSubtitle2);
  const [headerDetails, setHeaderDetails] = useState(settings.headerDetails);

  // Cloud Sync configurations
  const [sheetId, setSheetId] = useState(settings.sheetId);
  const [scriptUrl, setScriptUrl] = useState(settings.scriptUrl);
  const [driveUrl, setDriveUrl] = useState(settings.driveFolderUrl);

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handlePullFromGoogle = async () => {
    if (!scriptUrl || !scriptUrl.startsWith("http")) {
      return alert("กรุณาระบุและบันทึก Google Apps Script Web App Exec URL ก่อนดึงข้อมูล");
    }
    setIsSyncing(true);
    try {
      const response = await fetch("/api/sync/pull", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        alert("ดึงข้อมูลอัปเดตล่าสุดจาก Google Sheets สำเร็จเรียบร้อยแล้ว!");
        if (onRefresh) {
          await onRefresh();
        }
      } else {
        alert("ไม่สามารถดึงข้อมูลได้สำเร็จ: " + result.message);
      }
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handlePushToGoogle = async () => {
    if (!scriptUrl || !scriptUrl.startsWith("http")) {
      return alert("กรุณาระบุและบันทึก Google Apps Script Web App Exec URL ก่อนดึงข้อมูล");
    }
    setIsSyncing(true);
    try {
      const response = await fetch("/api/sync/push", { method: "POST" });
      const result = await response.json();
      if (result.success) {
        alert("ส่งอัปเดตและสำรองข้อมูลทั้งหมดขึ้น Google Sheets เรียบร้อยแล้ว!");
      } else {
        alert("ไม่สามารถอัปโหลดข้อมูลได้: " + result.message);
      }
    } catch (err: any) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Document Submit
  const handleDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle || !docUrl) return alert("กรุณากรอกชื่อและลิงก์ของเอกสาร");
    setIsLoading(true);
    
    const payload = {
      title: docTitle,
      description: docDesc,
      file_url: docUrl,
      file_type: docType,
      category: docCat
    };

    try {
      if (docId) {
        await onEditDocument(docId, payload);
      } else {
        await onAddDocument(payload);
      }
      // Reset
      setDocId(null);
      setDocTitle("");
      setDocDesc("");
      setDocUrl("");
      setDocType("pdf");
      setDocCat("เอกสาร");
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  // Link Submit
  const handleLinkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkTitle || !linkUrl) return alert("กรุณากรอกชื่อและ URL ของลิงก์");
    setIsLoading(true);

    const payload = {
      title: linkTitle,
      description: linkDesc,
      url: linkUrl,
      icon: linkIcon,
      color: linkColor,
      width: linkWidth,
      category: linkCat
    };

    try {
      if (linkId) {
        await onEditLink(linkId, payload);
      } else {
        await onAddLink(payload);
      }
      // Reset
      setLinkId(null);
      setLinkTitle("");
      setLinkDesc("");
      setLinkUrl("");
      setLinkIcon("Link");
      setLinkColor("#FF8A80");
      setLinkWidth("medium");
      setLinkCat("อื่น ๆ");
    } catch (err) {
      alert("เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  };

  // Layout Config Update
  const handleConfigUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdateConfig(
        { height: vHeight, borderRadius: vRadius, shadow: vShadow },
        {
          headerTitle,
          headerSubtitle1: headerSub1,
          headerSubtitle2: headerSub2,
          headerDetails,
          sheetId,
          scriptUrl,
          driveFolderUrl: driveUrl
        }
      );
      alert("บันทึกการปรับตั้งค่าระบบเรียบร้อยแล้ว");
    } catch (err) {
      alert("ล้มเหลว");
    } finally {
      setIsLoading(false);
    }
  };

  // Set editing document
  const startEditDoc = (doc: Document) => {
    setDocId(doc.id);
    setDocTitle(doc.title);
    setDocDesc(doc.description);
    setDocUrl(doc.file_url);
    setDocType(doc.file_type);
    setDocCat(doc.category);
  };

  // Set editing link
  const startEditLink = (link: LinkItem) => {
    setLinkId(link.id);
    setLinkTitle(link.title);
    setLinkDesc(link.description);
    setLinkUrl(link.url);
    setLinkIcon(link.icon);
    setLinkColor(link.color);
    setLinkWidth(link.width);
    setLinkCat(link.category);
  };

  const categories = ["IEP", "คัดกรอง", "เอกสาร", "สื่อการสอน", "คู่มือ", "แบบฟอร์ม", "ประชุม", "ศูนย์การศึกษาพิเศษ", "หน่วยบริการ", "อื่น ๆ"];
  const docTypes = ["pdf", "ppt", "pptx", "gslide", "drive", "youtube", "web_embed"];
  const iconOptions = ["ClipboardCheck", "Users", "Monitor", "FileSignature", "FileUpload", "Receipt", "Globe", "BookOpen", "GraduationCap", "Settings", "HelpCircle", "Heart", "Star"];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-gray-100 dark:border-gray-800"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#FF8A80] animate-spin" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-gray-900 dark:text-white font-prompt">แดชบอร์ดควบคุมผู้ดูแลระบบ</h2>
                
                {/* Cloud Sync Status Indicator */}
                {syncStatus ? (
                  syncStatus.synced ? (
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-[10px] font-bold font-sarabun cursor-help shrink-0 shadow-sm transition-all hover:opacity-90"
                      title={`${syncStatus.message}\nอัปเดตล่าสุด: ${new Date(syncStatus.lastCheck).toLocaleTimeString("th-TH")}`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </span>
                      <Cloud className="w-3 h-3" />
                      <span>เชื่อมต่อระบบ Google Sheets แล้ว 🌐</span>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50/80 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/20 text-[10px] font-bold font-sarabun cursor-help shrink-0 shadow-sm transition-all hover:opacity-90"
                      title={`${syncStatus.message}\nระบบสลับไปใช้ฐานข้อมูล Local บนเซิร์ฟเวอร์สำรองโดยอัตโนมัติ`}
                    >
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                      </span>
                      <CloudOff className="w-3 h-3" />
                      <span>ใช้งานฐานข้อมูลสำรอง (Local)</span>
                    </div>
                  )
                ) : (
                  <div 
                    className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-50 dark:bg-gray-850 text-gray-500 dark:text-gray-400 text-[10px] font-bold font-sarabun cursor-help shrink-0 shadow-sm"
                    title="กำลังเชื่อมโยงข้อมูล..."
                  >
                    <RefreshCw className="w-3 h-3 animate-spin text-gray-400" />
                    <span>กำลังตรวจสอบการซิงค์...</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-gray-400 font-sarabun mt-0.5">เพิ่ม แก้ไขข้อมูล จัดการ Layout ของเว็บบอร์ดศูนย์การเรียนรู้</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Side Tabs */}
          <div className="w-full md:w-56 bg-gray-50 dark:bg-gray-950 p-4 border-r border-gray-100 dark:border-gray-800 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible">
            <button
              onClick={() => setActiveTab("docs")}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "docs"
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <FileText className="w-4 h-4" /> จัดการเอกสาร PDF/PPT
            </button>
            <button
              onClick={() => setActiveTab("links")}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "links"
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <LinkIcon className="w-4 h-4" /> จัดการลิงก์เชื่อมโยง
            </button>
            <button
              onClick={() => setActiveTab("layout")}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "layout"
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> ตั้งค่า Layout & หัวเว็บ
            </button>
            <button
              onClick={() => setActiveTab("sync")}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "sync"
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Database className="w-4 h-4" /> ระบบเชื่อมโยง Sheet Cloud
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === "logs"
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-md scale-102"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Activity className="w-4 h-4" /> บันทึกกิจกรรมย้อนหลัง
            </button>
          </div>

          {/* Main Working Panel Scrollable */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-gray-900 font-sarabun">
            
            {/* TAB 1: MANAGE DOCUMENTS */}
            {activeTab === "docs" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#FF8A80]" /> จัดเก็บบันทึกเอกสาร
                  </h3>
                  <p className="text-[11px] text-gray-400">สร้างหรือแก้ไขแผนจัดการศึกษา IEP, สื่อ, คู่มือ, หรือ Google Slide เพื่อแสดงตรงหน้าต่างหลัก</p>
                </div>

                <form onSubmit={handleDocSubmit} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ชื่อเอกสาร *</label>
                      <input
                        type="text"
                        value={docTitle}
                        onChange={(e) => setDocTitle(e.target.value)}
                        placeholder="เช่น แบบประเมินคัดกรอง คป.01"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">หมวดหมู่เอกสาร</label>
                      <select
                        value={docCat}
                        onChange={(e) => setDocCat(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">คำอธิบายประกอบ</label>
                    <input
                      type="text"
                      value={docDesc}
                      onChange={(e) => setDocDesc(e.target.value)}
                      placeholder="เช่น ข้อมูลเช็คลิสต์และการเซ็นลายชื่อ"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ลิงก์ URL ปลายทางของไฟล์ (PDF, Google Drive, YouTube, Presentation) *</label>
                      <input
                        type="url"
                        value={docUrl}
                        onChange={(e) => setDocUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ประเภทไฟล์</label>
                      <select
                        value={docType}
                        onChange={(e) => setDocType(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        {docTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    {docId && (
                      <button
                        type="button"
                        onClick={() => {
                          setDocId(null);
                          setDocTitle("");
                          setDocDesc("");
                          setDocUrl("");
                          setDocType("pdf");
                          setDocCat("เอกสาร");
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold"
                      >
                        ยกเลิกแก้ไข
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Plus className="w-4 h-4" /> {docId ? "อัปเดตข้อมูลเอกสาร" : "เพิ่มเอกสารเข้าแดชบอร์ด"}
                    </button>
                  </div>
                </form>

                {/* Docs List */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">ชื่อเอกสาร</th>
                        <th className="p-3">ประเภท</th>
                        <th className="p-3">หมวดหมู่</th>
                        <th className="p-3 text-right">ดำเนินการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {documents.map(doc => (
                        <tr key={doc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="p-3 font-semibold text-gray-900 dark:text-white truncate max-w-xs">{doc.title}</td>
                          <td className="p-3 uppercase font-mono text-[10px]">{doc.file_type}</td>
                          <td className="p-3">{doc.category}</td>
                          <td className="p-3 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditDoc(doc)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("คุณแน่ใจหรือไม่ที่จะลบเอกสารนี้?")) {
                                  onDeleteDocument(doc.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: MANAGE LINKS */}
            {activeTab === "links" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-[#FF8A80]" /> จัดการลิงก์เชื่อมโยง
                  </h3>
                  <p className="text-[11px] text-gray-400">สร้างปุ่มลิงก์เว็บบริการด่วน 3 มิติ สำหรับครูหรือร้านค้าหน่วยบริการที่มาร่วมมือ</p>
                </div>

                <form onSubmit={handleLinkSubmit} className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ชื่อปุ่มลิงก์ *</label>
                      <input
                        type="text"
                        value={linkTitle}
                        onChange={(e) => setLinkTitle(e.target.value)}
                        placeholder="เช่น ระบบลงทะเบียนสื่อ สพฐ."
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">หมวดหมู่ลิงก์</label>
                      <select
                        value={linkCat}
                        onChange={(e) => setLinkCat(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">คำอธิบายปุ่มย่อย</label>
                    <input
                      type="text"
                      value={linkDesc}
                      onChange={(e) => setLinkDesc(e.target.value)}
                      placeholder="เช่น บันทึกผลสื่อการเรียนรู้ออนไลน์สำหรับครู"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">ลิงก์เว็บ URL ปลายทาง *</label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ขนาดปุ่มลิงก์</label>
                      <select
                        value={linkWidth}
                        onChange={(e) => setLinkWidth(e.target.value as any)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="small">เล็ก (Small)</option>
                        <option value="medium">กลาง (Medium)</option>
                        <option value="large">ใหญ่ (Large)</option>
                        <option value="xl">ใหญ่พิเศษ (Extra Large)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ไอคอนแสดงแทน</label>
                      <select
                        value={linkIcon}
                        onChange={(e) => setLinkIcon(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">สีแบรนด์เด่น (Hex)</label>
                      <div className="flex gap-1">
                        <input
                          type="color"
                          value={linkColor}
                          onChange={(e) => setLinkColor(e.target.value)}
                          className="w-10 h-9 p-0.5 border border-gray-200 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={linkColor}
                          onChange={(e) => setLinkColor(e.target.value)}
                          className="flex-1 text-xs p-2 rounded-xl border"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    {linkId && (
                      <button
                        type="button"
                        onClick={() => {
                          setLinkId(null);
                          setLinkTitle("");
                          setLinkDesc("");
                          setLinkUrl("");
                          setLinkIcon("Link");
                          setLinkColor("#FF8A80");
                          setLinkWidth("medium");
                          setLinkCat("อื่น ๆ");
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold"
                      >
                        ยกเลิกแก้ไข
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Plus className="w-4 h-4" /> {linkId ? "อัปเดตปุ่มลิงก์" : "สร้างปุ่มลิงก์เชื่อมโยง"}
                    </button>
                  </div>
                </form>

                {/* Links List */}
                <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">ชื่อปุ่มลิงก์</th>
                        <th className="p-3">หมวดหมู่</th>
                        <th className="p-3">สีปุ่ม</th>
                        <th className="p-3">ขนาด</th>
                        <th className="p-3 text-right">จัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {links.map(l => (
                        <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                          <td className="p-3 font-semibold text-gray-900 dark:text-white truncate max-w-xs">{l.title}</td>
                          <td className="p-3">{l.category}</td>
                          <td className="p-3 font-mono">
                            <span className="inline-block w-3.5 h-3.5 rounded border border-gray-200 mr-1.5 align-middle" style={{ backgroundColor: l.color }}></span>
                            {l.color}
                          </td>
                          <td className="p-3 uppercase font-mono text-[10px]">{l.width}</td>
                          <td className="p-3 text-right flex items-center justify-end gap-1">
                            <button
                              onClick={() => startEditLink(l)}
                              className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/20"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("คุณแน่ใจที่จะลบลิงก์นี้หรือไม่?")) {
                                  onDeleteLink(l.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: LAYOUT CONFIG */}
            {activeTab === "layout" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-[#FF8A80]" /> ปรับแต่งสัดส่วนบอร์ดและหัวข้อ Header
                  </h3>
                  <p className="text-[11px] text-gray-400">ตั้งค่าความสูงกรอบมองเอกสารทางด้านซ้าย ตกแต่งเงา ลายมุมและเนื้อหาข้อความบนหัวเว็บอย่างอิสระ</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                  <span className="text-xs font-bold text-[#FF8A80] block border-b pb-1.5">1. สไตล์กรอบมองหน้าเอกสาร (Left Document Area)</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ความสูงกรอบแสดง (Height)</label>
                      <input
                        type="text"
                        value={vHeight}
                        onChange={(e) => setVHeight(e.target.value)}
                        placeholder="เช่น 600px หรือ 70vh"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">สัดส่วนรัศมีมนมุม (Border Radius)</label>
                      <select
                        value={vRadius}
                        onChange={(e) => setVRadius(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="0px">ไม่มีมุมมน (0px)</option>
                        <option value="8px">น้อย (8px)</option>
                        <option value="16px">ปานกลาง (16px)</option>
                        <option value="24px">มากพิเศษ (24px)</option>
                        <option value="9999px">วงกลมรี (9999px)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">มิติเงาหลังบอร์ด (Shadow depth)</label>
                      <select
                        value={vShadow}
                        onChange={(e) => setVShadow(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      >
                        <option value="shadow-none">ไม่มีเงาเลย</option>
                        <option value="shadow-sm">เงาน้อย</option>
                        <option value="shadow-lg">เงาปกติ</option>
                        <option value="shadow-2xl">เงาลึกหนา 3D</option>
                      </select>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-[#FF8A80] block border-b pb-1.5 mt-2">2. ปรับแต่งเนื้อหาของแผงหน้าชื่อสถาบันบน Header</span>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ข้อความหลักแถวที่ 1 (Header Title)</label>
                      <input
                        type="text"
                        value={headerTitle}
                        onChange={(e) => setHeaderTitle(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">สถาบันย่อยแถวที่ 2 (Subtitle 1)</label>
                        <input
                          type="text"
                          value={headerSub1}
                          onChange={(e) => setHeaderSub1(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 mb-1">เขตพื้นที่แถวที่ 3 (Subtitle 2)</label>
                        <input
                          type="text"
                          value={headerSub2}
                          onChange={(e) => setHeaderSub2(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">ข้อมูลรายละเอียดเพิ่มเติมพอร์ทัล</label>
                      <textarea
                        value={headerDetails}
                        onChange={(e) => setHeaderDetails(e.target.value)}
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4 border-t pt-4">
                    <button
                      type="button"
                      onClick={handleConfigUpdate}
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Palette className="w-4 h-4" /> บันทึกการเปลี่ยนแปลงดีไซน์ทั้งหมด
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GOOGLE SHEET SYNC CONFIG */}
            {activeTab === "sync" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#FF8A80]" /> ระบบพอร์ทัลฐานข้อมูลเสรี (Google Sheets & Drive)
                  </h3>
                  <p className="text-[11px] text-gray-400">ควบคุมและกำหนดจุดเชื่อมโยงจัดเก็บเอกสารและลิงก์ด่วนไว้ที่คลาวด์ร่วมกับ Google Sheets API ส่วนตัว</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/40 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 rounded-xl flex gap-2">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-[10px] leading-relaxed">
                      <strong>ข้อมูลการบูรณาการ:</strong> ระบบนี้ถูกตั้งค่าให้รองรับการเชื่อมข้อมูลไปเก็บไว้ที่ Google Drive และมีสคริปต์เชื่อมโยง Apps Script สื่อกลาง ท่านสามารถเปลี่ยน URL และ ID แผ่นตารางงานเพื่อจัดเก็บข้อมูลระยะยาวได้ทันที
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Google Sheet ID ของศูนย์</label>
                      <input
                        type="text"
                        value={sheetId}
                        onChange={(e) => setSheetId(e.target.value)}
                        placeholder="เช่น 1v4-UIHj5ddVDB-qZEOs_FI_F8aOQ3v-qAYHnMDOhkG0"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Google Appscript Web App Exec URL (ใช้ในการ POST/GET)</label>
                      <input
                        type="url"
                        value={scriptUrl}
                        onChange={(e) => setScriptUrl(e.target.value)}
                        placeholder="https://script.google.com/macros/s/.../exec"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">โฟลเดอร์ฝากไฟล์ Google Drive ของศูนย์</label>
                      <input
                        type="url"
                        value={driveUrl}
                        onChange={(e) => setDriveUrl(e.target.value)}
                        placeholder="https://drive.google.com/drive/folders/..."
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">ฟังก์ชันควบคุมและการทำงานร่วมกันกับ Cloud</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handlePullFromGoogle}
                        disabled={isSyncing}
                        className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CloudLightning className="w-4 h-4" />
                        {isSyncing ? "กำลังเชื่อมต่อ..." : "ดึงข้อมูลจาก Google Sheets (Pull Latest)"}
                      </button>
                      <button
                        type="button"
                        onClick={handlePushToGoogle}
                        disabled={isSyncing}
                        className="px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Database className="w-4 h-4" />
                        {isSyncing ? "กำลังส่งข้อมูล..." : "ส่ง/สำรองข้อมูลไปยัง Google Sheets (Push Local)"}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center leading-normal mt-1">
                      * หมายเหตุ: ในกรณีทั่วไป ระบบจะทำการเชื่อมโยงข้อมูลและส่งข้อมูลอัปเดตไปบันทึกที่ Google Sheets ให้อัตโนมัติในทุกๆ การเปลี่ยนแปลงข้อมูลของท่าน
                    </p>
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-4 border-t pt-4">
                    <a 
                      href={driveUrl} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="text-xs text-green-600 hover:underline flex items-center gap-1 font-bold"
                    >
                      📁 เข้าชมโฟลเดอร์ Google Drive ของศูนย์เพื่อจัดเก็บไฟล์เพิ่ม
                    </a>
                    
                    <button
                      type="button"
                      onClick={handleConfigUpdate}
                      disabled={isLoading}
                      className="px-5 py-2 rounded-xl text-white text-xs font-bold shadow-md hover:opacity-90 flex items-center gap-1"
                      style={{ backgroundColor: settings.primaryColor }}
                    >
                      <Palette className="w-4 h-4" /> บันทึกการเชื่อมโยงข้อมูล
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: ACTIVITY LOGS */}
            {activeTab === "logs" && (
              <div className="flex flex-col gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-[#FF8A80]" /> บันทึกร่องรอยการแก้ไขกิจกรรมระบบ (Activity Log)
                  </h3>
                  <p className="text-[11px] text-gray-400">ประวัติร่องรอยการแก้ไข เพิ่มลบไฟล์ และล็อกอินเข้าระบบโดยผู้ดูแลศูนย์ฯ</p>
                </div>

                <div className="flex flex-col gap-2 max-h-[450px] overflow-y-auto pr-1">
                  {activityLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className="p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 rounded-xl flex items-center justify-between gap-4 text-xs font-sarabun"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-700 dark:text-gray-300">[{log.user}]</span>
                        <span className="text-gray-600 dark:text-gray-400">{log.action}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {new Date(log.timestamp).toLocaleString("th-TH")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </motion.div>
    </div>
  );
}
