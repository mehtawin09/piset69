import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  FileText, 
  ExternalLink, 
  ChevronRight,
  RefreshCw
} from "lucide-react";
import { Document, LinkItem } from "../types";

interface SearchAssistantProps {
  onSelectDoc: (doc: Document) => void;
  onLinkClick: (link: LinkItem) => void;
  primaryColor: string;
}

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  matchedDocs?: Document[];
  matchedLinks?: LinkItem[];
}

export default function SearchAssistant({
  onSelectDoc,
  onLinkClick,
  primaryColor
}: SearchAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "สวัสดีค่ะ! ยินดีต้อนรับสู่ผู้ช่วย AI อัจฉริยะ แดชบอร์ดคัดกรองจัดทำแผน IEP ยินดีช่วยเหลือครู ผู้ปกครอง และผู้บริหารในการสืบค้นข้อมูลคู่มือ ขั้นตอน 01-06 หรือแบบฟอร์มการคัดกรอง คป.01 ถามคำถามของท่านได้เลย เช่น 'ขั้นตอนคัดกรองต้องการลงนามกี่คน' หรือ 'ระบบ IEP Online กรอกข้อมูลช่วงไหน' หรือ 'ขอลิงก์แบบฟอร์ม คป.01'"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: input
    };

    setMessages(prev => [...prev, userMessage]);
    const promptToSend = input;
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend })
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-reply`,
          sender: "bot",
          text: data.text,
          matchedDocs: data.matchedDocs,
          matchedLinks: data.matchedLinks
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-reply`,
          sender: "bot",
          text: "ขออภัยค่ะ ระบบประมวลผลล้มเหลว กรุณาลองตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของท่านอีกครั้ง"
        }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-reply`,
        sender: "bot",
        text: "ขออภัยค่ะ เกิดข้อผิดพลาดทางเทคนิคในการติดต่อเซิร์ฟเวอร์ปัญญาประดิษฐ์"
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const sampleQuestions = [
    "ขอดูขั้นตอนจัดทำแผน IEP",
    "ดาวน์โหลดแบบฟอร์ม คป.01",
    "คู่มือครูผู้คัดกรอง",
    "ขอลิงก์ IEP Online ส่วนกลาง"
  ];

  return (
    <div className="glass rounded-3xl p-5 shadow-3d border border-white/20 flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b pb-3 border-gray-100 dark:border-gray-800">
        <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-[#FF8A80]">
          <Bot className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white font-prompt flex items-center gap-1.5">
            AI Search Assistant <span className="inline-block bg-[#FF8A80] text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase">Gemini 3.5</span>
          </h3>
          <p className="text-[10px] text-gray-400 font-sarabun">ผู้ช่วยปัญญาประดิษฐ์สืบค้นข้อมูลศูนย์แบบเรียลไทม์</p>
        </div>
      </div>

      {/* Messages Stage */}
      <div className="flex-1 overflow-y-auto mb-4 pr-1 flex flex-col gap-3 scrollbar-thin">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-2.5 max-w-[85%] ${
              msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
            }`}
          >
            <div className={`p-2 rounded-xl shrink-0 ${
              msg.sender === "user" ? "bg-orange-100 text-[#FF8A80]" : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sarabun whitespace-pre-line ${
                msg.sender === "user" 
                  ? "bg-gradient-to-br from-[#FF8A80] to-[#FFAB91] text-white rounded-tr-none shadow-sm" 
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none shadow-sm"
              }`}>
                {msg.text}
              </div>

              {/* Matched Documents and Links recommendations on bottom of Bot Message */}
              {(msg.matchedDocs && msg.matchedDocs.length > 0) && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-[#FF8A80]" /> เอกสารสอดคล้องแนะนำ:
                  </span>
                  {msg.matchedDocs.map(d => (
                    <button
                      key={d.id}
                      onClick={() => onSelectDoc(d)}
                      className="text-left text-[11px] p-2 bg-[#FFF3F0] dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/40 border border-orange-200/50 rounded-xl flex items-center justify-between font-prompt"
                    >
                      <span className="truncate text-[#FF8A80] font-bold">{d.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#FF8A80]" />
                    </button>
                  ))}
                </div>
              )}

              {(msg.matchedLinks && msg.matchedLinks.length > 0) && (
                <div className="flex flex-col gap-1.5 mt-1">
                  <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 text-blue-400" /> แหล่งเว็บบริการด่วน:
                  </span>
                  {msg.matchedLinks.map(l => (
                    <button
                      key={l.id}
                      onClick={() => onLinkClick(l)}
                      className="text-left text-[11px] p-2 bg-blue-50 dark:bg-blue-950/10 hover:bg-blue-100/50 border border-blue-200/50 rounded-xl flex items-center justify-between font-prompt"
                    >
                      <span className="truncate text-blue-600 dark:text-blue-400 font-bold">{l.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 self-start">
            <div className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-none">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0.4s]"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggest questions */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {sampleQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => setInput(q)}
            className="text-[10px] py-1 px-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 border border-gray-200/40"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Inputs Form */}
      <form onSubmit={handleSend} className="relative flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="พิมพ์ถามผู้ช่วย AI เกี่ยวกับการทำ IEP (01-06)..."
          className="flex-1 pr-10 pl-4 py-2.5 rounded-xl text-xs border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF8A80]"
          id="ai-assistant-input"
        />
        <button
          type="submit"
          className="absolute right-1.5 p-2 rounded-lg text-white hover:opacity-90 transition-all shadow-sm"
          style={{ backgroundColor: primaryColor }}
          id="ai-assistant-send-btn"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
