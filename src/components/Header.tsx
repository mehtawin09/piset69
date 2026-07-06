import React from "react";
import { motion } from "motion/react";
import { GraduationCap, Sparkles, BookOpen, Settings, UserCheck } from "lucide-react";
import { AppSettings } from "../types";

interface HeaderProps {
  settings: AppSettings;
  isAdmin: boolean;
  onOpenAdmin: () => void;
  onLogoutAdmin: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Header({
  settings,
  isAdmin,
  onOpenAdmin,
  onLogoutAdmin,
  isDarkMode,
  onToggleDarkMode
}: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full glass rounded-3xl p-6 md:p-8 shadow-3d mb-8 overflow-hidden border border-white/20"
      style={{
        background: isDarkMode
          ? "linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(17, 24, 39, 0.9) 100%)"
          : `linear-gradient(135deg, ${settings.secondaryColor} 0%, #FFFFFF 100%)`
      }}
    >
      {/* Decorative gradient glowing spots */}
      <div 
        className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30" 
        style={{ backgroundColor: settings.primaryColor }}
      />
      <div 
        className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30" 
        style={{ backgroundColor: settings.accentColor }}
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
        {/* Center Info / Brand */}
        <div className="flex items-start gap-4">
          <div 
            className="p-4 rounded-2xl shadow-lg flex items-center justify-center text-white"
            style={{ backgroundColor: settings.primaryColor }}
          >
            <GraduationCap className="w-8 h-8 md:w-10 md:h-10 animate-bounce" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 text-[#E65100] bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300 border border-orange-200 dark:border-orange-900/50">
              <Sparkles className="w-3.5 h-3.5" /> ศูนย์การศึกษาพิเศษประจำอำเภอ
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white font-prompt">
              {settings.headerTitle}
            </h1>
            <h2 className="text-xl md:text-2xl font-medium mt-1 text-gray-800 dark:text-gray-200 font-kanit">
              {settings.headerSubtitle1}
            </h2>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 font-sarabun">
              {settings.headerSubtitle2}
            </p>
            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-500 mt-2 italic flex items-center gap-1">
              <BookOpen className="w-4 h-4 inline-block" />
              {settings.headerDetails}
            </p>
          </div>
        </div>

        {/* Action Controls / Dark Mode / Admin Panel */}
        <div className="flex items-center gap-3 self-end md:self-center">
          {/* Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:scale-105 transition shadow-sm"
            title="สลับโหมด มืด/สว่าง"
            id="theme-toggle-btn"
          >
            {isDarkMode ? "☀️ โหมดสว่าง" : "🌙 โหมดมืด"}
          </button>

          {/* Admin Login / Logout */}
          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border border-green-200">
                <UserCheck className="w-3.5 h-3.5" /> สิทธิ์ผู้ดูแลระบบ
              </span>
              <button
                onClick={onOpenAdmin}
                className="px-4 py-2.5 rounded-xl text-white font-medium hover:opacity-90 transition flex items-center gap-1 shadow-md hover:scale-102"
                style={{ backgroundColor: settings.primaryColor }}
                id="admin-dashboard-btn"
              >
                <Settings className="w-4 h-4" /> แดชบอร์ดจัดการ
              </button>
              <button
                onClick={onLogoutAdmin}
                className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium transition"
                id="logout-btn"
              >
                ออกระบบ
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdmin}
              className="px-4 py-2.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium transition flex items-center gap-1.5"
              id="login-btn"
            >
              <Settings className="w-4 h-4" /> ล็อกอินผู้ดูแล
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
