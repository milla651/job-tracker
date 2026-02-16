import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatSalary(min?: number | null, max?: number | null) {
  if (!min && !max) return null;
  
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  }
  if (min) {
    return `From ${formatter.format(min)}`;
  }
  return `Up to ${formatter.format(max!)}`;
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const STATUS_CONFIG = {
  WISHLIST: {
    label: "Wishlist",
    color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    icon: "⭐",
  },
  APPLIED: {
    label: "Applied",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: "📤",
  },
  PHONE_SCREEN: {
    label: "Phone Screen",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: "📞",
  },
  INTERVIEW: {
    label: "Interview",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    icon: "🎤",
  },
  TECHNICAL: {
    label: "Technical",
    color: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    icon: "💻",
  },
  OFFER: {
    label: "Offer",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: "📋",
  },
  ACCEPTED: {
    label: "Accepted",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    icon: "🎉",
  },
  REJECTED: {
    label: "Rejected",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    icon: "❌",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    color: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    icon: "↩️",
  },
  DISCARDED: {
    label: "Discarded",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    icon: "🗑️",
  },
} as const;
