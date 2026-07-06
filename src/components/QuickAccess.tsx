import React, { useState } from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";
import { 
  ClipboardCheck, 
  Users, 
  Monitor, 
  FileSignature, 
  FileUp, 
  Receipt, 
  Sparkles, 
  Star, 
  ExternalLink, 
  QrCode, 
  Info,
  Layers,
  ChevronRight,
  Heart,
  Plus
} from "lucide-react";
import { LinkItem, AppSettings } from "../types";

interface QuickAccessProps {
  links: LinkItem[];
  settings: AppSettings;
  onLinkClick: (link: LinkItem) => void;
  isAdmin: boolean;
  onDeleteLink?: (id: string) => void;
  onEditLink?: (link: LinkItem) => void;
  isDarkMode: boolean;
  searchQuery: string;
}

export default function QuickAccess({
  links,
  settings,
  onLinkClick,
  isAdmin,
  onDeleteLink,
  onEditLink,
  isDarkMode,
  searchQuery
}: QuickAccessProps) {
  const [activeTab, setActiveTab] = useState<"iep-process" | "links">("iep-process");
  const [selectedCategory, setSelectedCategory] = useState<string>("ทั้งหมด");
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("favorite_links");
    return saved ? JSON.parse(saved) : [];
  });
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [activeProcessStep, setActiveProcessStep] = useState<number | null>(null);

  // Toggle favorite link
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let newFavs = [...favorites];
    if (newFavs.includes(id)) {
      newFavs = newFavs.filter(fav => fav !== id);
    } else {
      newFavs.push(id);
    }
    setFavorites(newFavs);
    localStorage.setItem("favorite_links", JSON.stringify(newFavs));
  };

  // Helper to dynamically render any Lucide icon
  const renderIcon = (iconName: string, className: string = "w-5 h-5") => {
    const IconComponent = (Icons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    // Fallback icons
    if (iconName === "ClipboardCheck") return <ClipboardCheck className={className} />;
    if (iconName === "Users") return <Users className={className} />;
    if (iconName === "Monitor") return <Monitor className={className} />;
    if (iconName === "FileSignature") return <FileSignature className={className} />;
    if (iconName === "FileUpload") return <FileUp className={className} />;
    if (iconName === "Receipt") return <Receipt className={className} />;
    return <Icons.Link className={className} />;
  };

  // 1. IEP Process Steps Static/Dynamic definitions
  const iepSteps = [
    {
      stepNum: "01",
      title: "ประเมิน/คัดกรอง",
      details: "ครูผู้ทำการคัดกรองจะต้องผ่านการอบรมจาก ศกศ. และมีรหัสผู้คัดกรองอย่างเป็นทางการ พร้อมลงนามรับรองครบทั้ง 2 คน",
      color: "#FF8A80",
      icon: "ClipboardCheck",
      requirements: [
        "ครูผ่านการอบรมผู้คัดกรองและมีรหัสผู้คัดกรอง",
        "ลงนามรับรองครบทั้ง 2 คนในแบบคัดกรอง",
        "แนบหลักฐานวุฒิบัตรผู้คัดกรอง"
      ]
    },
    {
      stepNum: "02",
      title: "ประชุมจัดทำแผน IEP",
      details: "ผู้ปกครองรับทราบ ยินยอม และลงนามร่วมกับคณะกรรมการจัดทำแผน ประกอบด้วยครู ผู้บริหาร และผู้เกี่ยวข้อง ครบถ้วน",
      color: "#FF8A80",
      icon: "Users",
      requirements: [
        "เชิญผู้ปกครองลงนามรับทราบและเข้าร่วมประชุม",
        "ครูและผู้มีส่วนเกี่ยวข้องลงลายมือชื่อครบถ้วน",
        "ระบุวันเริ่มต้นและสิ้นสุดแผนอย่างชัดเจน"
      ]
    },
    {
      stepNum: "03",
      title: "โปรแกรม IEP Online",
      details: "กรอกข้อมูลนักเรียน แผนการเรียน IEP ลงในโปรแกรมระบบคลาวด์หลังจากผ่านการประชุมเห็นชอบเรียบร้อยแล้ว",
      color: "#FF8A80",
      icon: "Monitor",
      requirements: [
        "เข้าโปรแกรมระบบ IEP Online ส่วนกลาง สพฐ.",
        "ระบุวิชาและทักษะการเรียนรู้ที่สอนเสริม",
        "พิมพ์แบบแผนจากระบบตรวจสอบข้อมูลอีกครั้ง"
      ]
    },
    {
      stepNum: "04",
      title: "เอกสาร คป.01",
      details: "จัดเตรียมใบส่งตัว คป.01 ให้ผู้ปกครองและผู้อำนวยการลงลายมือชื่อ (กรณีผู้อำนวยการไปราชการ ให้ผู้รักษาการแทนลงนามรับรอง)",
      color: "#FF8A80",
      icon: "FileSignature",
      requirements: [
        "ใบคำร้องขอรับความช่วยเหลือคนพิการทางการศึกษา (คป.01)",
        "ผู้ปกครองลงลายมือชื่อรับรอง",
        "ผู้อำนวยการลงนาม (หรือผู้รักษาราชการแทนที่ได้แต่งตั้ง)"
      ]
    },
    {
      stepNum: "05",
      title: "ส่งแผนและเอกสาร ศกศ.พร.",
      details: "เจ้าหน้าที่ของศูนย์การศึกษาพิเศษตรวจและแก้ไขเอกสารให้สมบูรณ์ครบถ้วน จากนั้นดำเนินการอนุมัติพริ้นต์คูปองบริการ",
      color: "#FF8A80",
      icon: "FileUpload",
      requirements: [
        "ส่งแฟ้มแผน IEP พร้อมรูปถ่ายนักเรียน",
        "เจ้าหน้าที่ตรวจสอบการอนุมัติและคัดกรองถูกต้อง",
        "ระบบจัดพิมพ์ใบเสนอขอคูปองช่วยเหลือ"
      ]
    },
    {
      stepNum: "06",
      title: "เขียนคูปอง C / เบิกสื่อ B",
      details: "บันทึกการให้บริการสอนเสริมส่งกลับที่ ศกศ.พร. เพื่อเบิกงบประมาณ ส่วนคูปอง B นำไปเบิกซื้อสื่อการเรียนการสอนจากร้านค้าหน่วยบริการที่ลงทะเบียน",
      color: "#FF8A80",
      icon: "Receipt",
      requirements: [
        "คูปองสอนเสริม (C) เขียนรายละเอียดการเข้าช่วยสอน",
        "คูปองเบิกสื่อ (B) มูลค่า 2,000 บาท/คน/ปี",
        "นำไปเบิกร้านค้าที่สมัครเข้าร่วมเป็นหน่วยบริการอย่างเป็นทางการ"
      ]
    }
  ];

  // Filters links based on search queries and categories
  const filteredLinks = links.filter(l => {
    const matchesSearch = 
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "ทั้งหมด" || l.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Sort links to put favorites on top
  const sortedLinks = [...filteredLinks].sort((a, b) => {
    const aFav = favorites.includes(a.id) ? 1 : 0;
    const bFav = favorites.includes(b.id) ? 1 : 0;
    if (aFav !== bFav) return bFav - aFav;
    return a.position - b.position;
  });

  const categories = ["ทั้งหมด", "IEP", "คัดกรอง", "เอกสาร", "สื่อการสอน", "คู่มือ", "แบบฟอร์ม", "ประชุม", "ศูนย์การศึกษาพิเศษ", "หน่วยบริการ", "อื่น ๆ"];

  // Size Tailwind class mapping for 3D buttons
  const getSizeClass = (size: string) => {
    switch (size) {
      case "small":
        return "text-xs py-2 px-3 min-h-[44px]";
      case "large":
        return "text-base py-4 px-5 min-h-[72px] font-bold";
      case "xl":
        return "text-lg py-5 px-6 min-h-[84px] font-extrabold";
      case "medium":
      default:
        return "text-sm py-3 px-4 min-h-[56px] font-semibold";
    }
  };

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-gray-800/80 p-1 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <button
          onClick={() => setActiveTab("iep-process")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-prompt transition-all ${
            activeTab === "iep-process"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
          id="tab-iep-process"
        >
          🎓 ขั้นตอนการทำ IEP (01-06)
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-prompt transition-all ${
            activeTab === "links"
              ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
          }`}
          id="tab-links"
        >
          🔗 ลิงก์ด่วน / หน่วยบริการ
        </button>
      </div>

      {activeTab === "iep-process" ? (
        /* 1. IEP PROCESS MENU (01-06 CARDS 3D) */
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 font-prompt flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#FF8A80]" /> ขั้นตอนการจัดการศึกษารายบุคคล IEP
            </h3>
            <span className="text-[10px] text-gray-400 font-sarabun">คลิกการ์ดเพื่อขยายข้อกำหนด</span>
          </div>

          <div className="grid grid-cols-1 gap-3 max-h-[560px] overflow-y-auto pr-1 scrollbar-thin">
            {iepSteps.map((step, idx) => {
              const isExpanded = activeProcessStep === idx;
              return (
                <motion.div
                  key={step.stepNum}
                  onClick={() => setActiveProcessStep(isExpanded ? null : idx)}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="relative overflow-hidden cursor-pointer rounded-2xl transition-all duration-300 border bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-3d hover:shadow-xl group"
                  style={{
                    borderLeft: `5px solid ${step.color}`
                  }}
                >
                  <div className="p-4 flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md font-bold text-sm"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.stepNum}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white font-prompt group-hover:text-[#FF8A80] transition-colors">
                          {step.title}
                        </h4>
                        <div className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200">
                          {renderIcon(step.icon, "w-4 h-4 text-[#FF8A80]")}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed font-sarabun">
                        {step.details}
                      </p>
                    </div>
                  </div>

                  {/* Expanded Requirements Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700/60 pt-3 bg-gray-50 dark:bg-gray-800/40"
                    >
                      <span className="text-[10px] font-bold text-[#FF8A80] uppercase flex items-center gap-1 mb-2">
                        <Info className="w-3 h-3" /> เช็คลิสต์ตรวจสอบความสมบูรณ์
                      </span>
                      <ul className="flex flex-col gap-1.5 pl-1.5">
                        {step.requirements.map((req, rIdx) => (
                          <li key={rIdx} className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2 font-sarabun">
                            <span className="text-[#FF8A80] font-bold mt-0.5">✓</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-end">
                        <span className="text-[10px] bg-[#FFF3F0] dark:bg-orange-950/20 text-[#FF8A80] px-2.5 py-0.5 rounded-full font-bold">
                          ศกศ. สพฐ. แพร่ 1
                        </span>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ) : (
        /* 2. DYNAMIC LINK SYSTEM */
        <div className="flex flex-col gap-4">
          
          {/* Quick Filters */}
          <div className="flex items-center justify-between gap-1">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 font-prompt flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#FF8A80]" /> ลิงก์เว็บบริการด่วน ({sortedLinks.length})
            </h3>
            
            {/* Category selector */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-[10px] font-bold border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#FF8A80]"
              id="link-category-filter"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
            {sortedLinks.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-400 font-sarabun">ไม่พบลิงก์เว็บบริการตามตัวกรอง</p>
              </div>
            ) : (
              sortedLinks.map((link) => {
                const isFavorite = favorites.includes(link.id);
                const isHovered = hoveredLink === link.id;

                return (
                  <motion.div
                    key={link.id}
                    onMouseEnter={() => setHoveredLink(link.id)}
                    onMouseLeave={() => setHoveredLink(null)}
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl overflow-hidden shadow-3d hover:shadow-xl transition-all duration-300 cursor-pointer border border-white/20"
                    style={{
                      background: isDarkMode 
                        ? "linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)"
                        : "linear-gradient(135deg, #FFFFFF 0%, #FFFDFD 100%)"
                    }}
                    onClick={() => onLinkClick(link)}
                  >
                    {/* Glow effect on hover */}
                    {isHovered && (
                      <div 
                        className="absolute inset-0 opacity-15 blur-xl transition-opacity duration-300 rounded-2xl"
                        style={{ backgroundColor: link.color }}
                      />
                    )}

                    <div className="p-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* 3D themed Icon with background circle */}
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg relative"
                          style={{ 
                            background: `linear-gradient(135deg, ${link.color} 0%, ${link.color}CC 100%)`,
                            boxShadow: `0 4px 14px ${link.color}40`
                          }}
                        >
                          {renderIcon(link.icon, "w-6 h-6")}
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-white animate-ping" />
                        </div>

                        {/* Title & Desc */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                              {link.category}
                            </span>
                            {isFavorite && (
                              <span className="text-amber-500 text-[10px] font-bold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" /> แนะนำ
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white font-prompt mt-1 line-clamp-1">
                            {link.title}
                          </h4>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500 font-sarabun mt-0.5 line-clamp-1">
                            {link.description || "คลิกเพื่อไปที่เว็บบริการปลายทาง"}
                          </p>
                        </div>
                      </div>

                      {/* Floating Buttons / Quick Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Favorite button */}
                        <button
                          onClick={(e) => toggleFavorite(link.id, e)}
                          className={`p-2 rounded-xl border transition-all ${
                            isFavorite 
                              ? "bg-amber-50 border-amber-200 text-amber-500" 
                              : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isFavorite ? "fill-current" : ""}`} />
                        </button>

                        {/* QR Code trigger to view popover */}
                        <div className="relative group/qr">
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-400 hover:text-[#FF8A80] transition-all"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          
                          {/* Hover QR Card Popover */}
                          <div className="absolute right-0 bottom-full mb-2 hidden group-hover/qr:block bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 text-center w-40">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(link.url)}`} 
                              alt="Link QR Code"
                              className="w-24 h-24 mx-auto p-1 bg-white rounded-lg border"
                            />
                            <span className="text-[9px] font-bold text-gray-800 dark:text-gray-200 font-prompt block mt-1.5">สแกนเชื่อมต่อด่วน</span>
                          </div>
                        </div>

                        {/* Arrow Link */}
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30 flex items-center justify-end gap-2">
                        {onEditLink && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditLink(link); }}
                            className="text-[10px] font-bold text-blue-500 hover:underline"
                          >
                            แก้ไขลิงก์
                          </button>
                        )}
                        {onDeleteLink && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteLink(link.id); }}
                            className="text-[10px] font-bold text-red-500 hover:underline"
                          >
                            ลบ
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
          
          {/* Quick instructions for visitors */}
          <div className="p-3 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-yellow-950/10 rounded-2xl border border-orange-100/50 dark:border-yellow-900/20 flex gap-2.5 items-start mt-2">
            <Info className="w-4 h-4 text-[#FF8A80] shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-gray-600 dark:text-gray-300 font-sarabun">
              <strong>สิทธิประโยชน์:</strong> ร้านค้า หน่วยงาน หรือคณะครูท่านใดที่ต้องการเพิ่มช่องทางลิงก์หน่วยบริการด่วน สามารถแจ้งแอดมินหรือพิมพ์คำขอลงใน <strong>AI Assistant</strong> ได้ทันที
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
