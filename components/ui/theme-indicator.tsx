"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/context/theme-context"

interface ThemeIndicatorProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function ThemeIndicator({ size = "md", showText = false, className = "" }: ThemeIndicatorProps) {
  const { isDarkMode } = useTheme()

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className={`${sizeClasses[size]} transition-all duration-500 transform ${isDarkMode ? 'rotate-180' : 'rotate-0'}`}>
          {isDarkMode ? (
            <Sun className={`${sizeClasses[size]} text-yellow-500 animate-pulse`} />
          ) : (
            <Moon className={`${sizeClasses[size]} text-gray-600 dark:text-gray-300`} />
          )}
        </div>
        <div className={`absolute inset-0 ${sizeClasses[size]} bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full opacity-0 ${isDarkMode ? 'opacity-100' : ''} transition-opacity duration-300`}></div>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300`}>
          {isDarkMode ? "Oscuro" : "Claro"}
        </span>
      )}
    </div>
  )
} 