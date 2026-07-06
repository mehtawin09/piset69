import React from "react";
import { motion } from "motion/react";
import { Eye, FileText, Link as LinkIcon, Users, Calendar } from "lucide-react";

interface StatsProps {
  views: number;
  documentsCount: number;
  linksCount: number;
  usersCount: number;
  primaryColor: string;
}

export default function StatsDashboard({
  views,
  documentsCount,
  linksCount,
  usersCount,
  primaryColor
}: StatsProps) {
  const statItems = [
    {
      label: "จำนวนการเข้าชมเว็บ",
      value: views,
      icon: Eye,
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      textColor: "text-blue-500",
      prefix: ""
    },
    {
      label: "เอกสารเผยแพร่ทั้งหมด",
      value: documentsCount,
      icon: FileText,
      bgColor: "bg-red-50 dark:bg-red-950/20",
      textColor: "text-red-500",
      prefix: "ไฟล์"
    },
    {
      label: "ลิงก์ด่วน / แหล่งบริการ",
      value: linksCount,
      icon: LinkIcon,
      bgColor: "bg-amber-50 dark:bg-amber-950/20",
      textColor: "text-amber-500",
      prefix: "รายการ"
    },
    {
      label: "ครูและเจ้าหน้าที่ในเครือข่าย",
      value: usersCount,
      icon: Users,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      textColor: "text-emerald-500",
      prefix: "ท่าน"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full mb-8">
      {statItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="glass rounded-2xl p-4 md:p-5 flex items-center justify-between shadow-3d border border-white/20 hover:scale-102 transition-transform cursor-pointer"
          >
            <div className="min-w-0">
              <span className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 block font-sarabun font-semibold">
                {item.label}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white font-prompt">
                  {item.value.toLocaleString()}
                </span>
                <span className="text-[10px] text-gray-400 font-sarabun">{item.prefix}</span>
              </div>
            </div>
            
            <div className={`p-3 rounded-xl shrink-0 ${item.bgColor} ${item.textColor}`}>
              <IconComponent className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
