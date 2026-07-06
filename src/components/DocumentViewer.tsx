import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Tv, 
  Globe, 
  ExternalLink, 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Printer, 
  UploadCloud, 
  Sliders, 
  FileBox, 
  Play, 
  Search,
  Eye,
  BookmarkCheck
} from "lucide-react";
import { Document, ViewerConfig } from "../types";

interface DocumentViewerProps {
  documents: Document[];
  activeDoc: Document | null;
  onSelectDoc: (doc: Document) => void;
  viewerConfig: ViewerConfig;
  onUploadSuccess: (newDoc: Document) => void;
  isDarkMode: boolean;
  isAdmin: boolean;
}

export default function DocumentViewer({
  documents,
  activeDoc,
  onSelectDoc,
  viewerConfig,
  onUploadSuccess,
  isDarkMode,
  isAdmin
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerContainerRef = useRef<HTMLDivElement>(null);

  // Helper to detect embed URL for Office / Google Slides / PDF
  const getEmbedUrl = (doc: Document) => {
    const url = doc.file_url;
    if (!url) return "";

    if (doc.file_type === "pdf") {
      // Return URL with zoom if applicable
      return url;
    }

    if (doc.file_type === "ppt" || doc.file_type === "pptx") {
      // Microsoft Office Online Viewer
      return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
    }

    if (doc.file_type === "gslide") {
      // Ensure Google Slide is embedded
      if (url.includes("/pub?")) {
        return url;
      }
      if (url.includes("/edit")) {
        return url.replace(/\/edit.*$/, "/embed?start=false&loop=false&delayms=3000");
      }
      return url;
    }

    if (doc.file_type === "drive") {
      // Google Drive File embed conversion
      if (url.includes("/view")) {
        return url.replace("/view", "/preview");
      }
      return url;
    }

    if (doc.file_type === "youtube") {
      // YouTube embed conversion
      if (url.includes("watch?v=")) {
        const videoId = url.split("v=")[1]?.split("&")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (url.includes("youtu.be/")) {
        const videoId = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${videoId}`;
      }
      return url;
    }

    return url;
  };

  // Zoom handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  const handleZoomReset = () => setZoom(100);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (viewerContainerRef.current?.requestFullscreen) {
        viewerContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Listen to standard fullscreen escape key change
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Print function
  const handlePrint = () => {
    if (!activeDoc) return;
    const printWindow = window.open(activeDoc.file_url, "_blank");
    if (printWindow) {
      printWindow.focus();
      printWindow.print();
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsDragging(false);
    setUploadProgress(10);
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setUploadProgress(40);
      try {
        const fileData = reader.result as string;
        const extension = file.name.split(".").pop()?.toLowerCase();
        let detectedType: any = "pdf";
        if (["ppt", "pptx"].includes(extension || "")) detectedType = "pptx";
        
        setUploadProgress(60);
        
        // Call backend upload endpoint
        const response = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName: file.name,
            fileType: detectedType,
            fileData: fileData
          })
        });
        
        setUploadProgress(80);
        const data = await response.json();
        
        if (data.success) {
          // Now create a document record in our database
          const docRes = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: file.name.replace(/\.[^/.]+$/, ""), // strip extension
              description: `ไฟล์อัปโหลดจากการลากวาง (${(file.size / (1024 * 1024)).toFixed(2)} MB)`,
              file_url: data.fileUrl,
              file_type: detectedType,
              category: "เอกสาร"
            })
          });
          
          const docData = await docRes.json();
          if (docData.success) {
            onUploadSuccess(docData.document);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(null), 1500);
          } else {
            alert("บันทึกเอกสารไม่สำเร็จ: " + docData.message);
            setUploadProgress(null);
          }
        } else {
          alert("อัปโหลดไฟล์ล้มเหลว: " + data.message);
          setUploadProgress(null);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
        setUploadProgress(null);
      }
    };
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Categories filter
  const categories = ["ทั้งหมด", "IEP", "คัดกรอง", "เอกสาร", "สื่อการสอน", "คู่มือ", "แบบฟอร์ม", "ประชุม", "ศูนย์การศึกษาพิเศษ", "หน่วยบริการ", "อื่น ๆ"];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ทั้งหมด" || doc.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Search & Filter Toolbar */}
      <div className="glass rounded-2xl p-4 shadow-sm border border-white/20">
        <div className="flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาเอกสาร/หมวดหมู่/คำอธิบาย..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A80] text-gray-800 dark:text-gray-100 font-sarabun"
              id="doc-search-input"
            />
          </div>

          {/* Drag-and-Drop Area (Compact for header/user convenience) */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.ppt,.pptx"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 text-gray-700 dark:text-gray-300 transition flex items-center gap-1.5 shadow-sm"
              id="upload-doc-compact-btn"
            >
              <UploadCloud className="w-3.5 h-3.5" /> ลากวางหรืออัปโหลดเอกสาร
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? "bg-gradient-to-r from-[#FF8A80] to-[#FFAB91] text-white shadow-sm scale-105"
                  : "bg-gray-100 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Grid (Viewer or empty) */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch flex-1">
        
        {/* Left Side: Document List (Quick switcher) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 font-prompt flex items-center gap-1.5">
              <FileBox className="w-4 h-4 text-[#FF8A80]" /> รายการเอกสารล่าสุด ({filteredDocuments.length})
            </h3>
          </div>
          
          <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400 font-sarabun">ไม่พบเอกสารตรงตามคำค้นหา</p>
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const isActive = activeDoc?.id === doc.id;
                return (
                  <motion.div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    whileHover={{ x: 4 }}
                    className={`p-3.5 rounded-xl cursor-pointer border transition-all duration-200 flex items-start gap-3 ${
                      isActive 
                        ? "bg-gradient-to-r from-[#FFF3F0] to-[#FFFFFF] dark:from-orange-950/20 dark:to-gray-900 border-[#FF8A80] shadow-sm" 
                        : "bg-white dark:bg-gray-800/80 hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-100 dark:border-gray-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg text-white ${
                      doc.file_type === 'pdf' ? 'bg-red-400' :
                      ['ppt', 'pptx', 'gslide'].includes(doc.file_type) ? 'bg-orange-400' :
                      doc.file_type === 'youtube' ? 'bg-rose-500' : 'bg-blue-400'
                    }`}>
                      {doc.file_type === "youtube" ? <Tv className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 uppercase">
                          {doc.category}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(doc.created_at).toLocaleDateString('th-TH', {day: 'numeric', month: 'short'})}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1 truncate font-prompt">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 font-sarabun">
                        {doc.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* QR Code generator for active document */}
          {activeDoc && (
            <div className="glass rounded-2xl p-4 border border-white/20 mt-2 flex items-center gap-4">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(activeDoc.file_url)}`} 
                alt="QR Code" 
                className="w-16 h-16 bg-white p-1 rounded-lg border border-gray-100"
              />
              <div>
                <h5 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 font-prompt">สแกนดูเอกสารบนมือถือ</h5>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 font-sarabun mt-0.5">เปิดลิงก์บนหน้าจอโทรศัพท์ของคุณ หรือครูนำไปจัดพริ้นต์ให้ผู้ปกครอง</p>
                <a 
                  href={activeDoc.file_url} 
                  target="_blank" 
                  referrerPolicy="no-referrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold mt-1.5 text-[#FF8A80] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" /> เปิดแท็บใหม่
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Document Embed Display Frame (70% width equivalent) */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">
          
          {/* Active File Metadata Header */}
          <div className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2.5 min-w-0">
              <Eye className="w-4 h-4 text-[#FF8A80] shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] font-semibold text-[#FF8A80] uppercase tracking-wider">กำลังแสดงผล</span>
                <h3 className="text-xs font-bold text-gray-900 dark:text-white truncate font-prompt">
                  {activeDoc ? activeDoc.title : "กรุณาเลือกเอกสารเพื่อเปิดแสดง"}
                </h3>
              </div>
            </div>

            {/* Custom Interactive Toolbar for active doc */}
            {activeDoc && (
              <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-900/50 p-1 rounded-xl">
                {activeDoc.file_type === "pdf" && (
                  <>
                    <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="ซูมออก">
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-bold px-1 text-gray-500">{zoom}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="ซูมเข้า">
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handleZoomReset} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="ซูมเริ่มต้น">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-[1px] h-4 bg-gray-200 dark:bg-gray-800 mx-1"></div>
                    <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="สั่งพิมพ์ด่วน">
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
                
                <a 
                  href={activeDoc.file_url} 
                  download 
                  target="_blank"
                  referrerPolicy="no-referrer"
                  className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" 
                  title="ดาวน์โหลดเอกสารลงเครื่อง"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>

                <button onClick={toggleFullscreen} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400" title="ขยายเต็มหน้าจอ">
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* The Embed Frame Stage */}
          <div 
            ref={viewerContainerRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative flex-1 bg-gray-200 dark:bg-gray-950 flex flex-col items-center justify-center transition-all duration-300 ${
              viewerConfig.shadow
            } ${
              isDragging ? "ring-4 ring-offset-2 ring-[#FF8A80] scale-[0.98]" : ""
            }`}
            style={{
              height: viewerConfig.height || "600px",
              borderRadius: viewerConfig.borderRadius || "16px",
              overflow: "hidden"
            }}
          >
            {uploadProgress !== null && (
              <div className="absolute inset-0 bg-white/95 dark:bg-gray-900/95 z-50 flex flex-col items-center justify-center p-6 text-center">
                <UploadCloud className="w-12 h-12 text-[#FF8A80] animate-bounce mb-3" />
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-prompt">กำลังอัปโหลดเอกสารสู่ระบบคลาวด์...</h4>
                <div className="w-64 h-2.5 bg-gray-100 rounded-full mt-3 overflow-hidden border border-gray-200">
                  <div className="h-full bg-gradient-to-r from-[#FF8A80] to-[#F4D35E] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="text-[10px] font-semibold text-gray-400 mt-2">{uploadProgress}% ดำเนินการแล้ว</span>
              </div>
            )}

            {isDragging && (
              <div className="absolute inset-0 bg-[#FFF3F0]/90 dark:bg-orange-950/85 z-40 flex flex-col items-center justify-center p-6 border-4 border-dashed border-[#FF8A80]">
                <UploadCloud className="w-16 h-16 text-[#FF8A80] animate-pulse mb-3" />
                <h4 className="text-lg font-bold text-[#FF8A80] font-prompt">วางไฟล์ได้เลยที่นี่!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">รองรับเอกสาร PDF, PPT และ PPTX เท่านั้น ระบบจะทำการจัดเก็บและเปิดให้อัตโนมัติ</p>
              </div>
            )}

            {activeDoc ? (
              <div className="w-full h-full relative" style={{ transform: activeDoc.file_type === "pdf" ? `scale(${zoom / 100})` : "none", transformOrigin: "top center", transition: "transform 0.1s" }}>
                <iframe
                  src={getEmbedUrl(activeDoc)}
                  className="w-full h-full border-none"
                  title={activeDoc.title}
                  allowFullScreen
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg mb-4">
                  <FileText className="w-8 h-8 text-[#FF8A80] animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 font-prompt">ไม่พบไฟล์เปิดค้างไว้</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1.5 font-sarabun">
                  เลือกเอกสารคู่มือ แผนการเรียน IEP หรือไฟล์นำเสนอ PPT จากแถบด้านซ้าย หรือลากไฟล์ PDF มาวางตรงนี้เพื่อเพิ่มใหม่ในคลิกเดียว
                </p>
                
                {/* Visual drag indicator */}
                <div className="mt-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 text-[10px] text-gray-400 flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#FF8A80]" />
                  <span>สามารถควบคุมสไตล์ ความกว้าง ความสูง และเงาจากแถบแก้ไขแอดมินได้ตลอดเวลา</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
