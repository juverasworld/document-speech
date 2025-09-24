"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LucideIcon, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string
  change: string
  trend: "up" | "down" | "neutral"
  className?: string
}

export function StatsCard({ icon: Icon, label, value, change, trend, className }: StatsCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3" />
      case "down":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 bg-green-50 border-green-200 dark:text-green-400 dark:bg-green-900/20 dark:border-green-800"
      case "down":
        return "text-red-600 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800"
      default:
        return "text-muted-foreground bg-muted/50 border-border"
    }
  }

  return (
    <Card className={cn(
      "p-6 border-0 shadow-lg bg-gradient-to-br from-card to-card/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group hover:scale-105",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
              {value}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-border/50">
        <Badge 
          variant="outline" 
          className={cn("text-xs px-2 py-1 border", getTrendColor())}
        >
          {getTrendIcon()}
          <span className="ml-1">{change}</span>
        </Badge>
      </div>
    </Card>
  )
}