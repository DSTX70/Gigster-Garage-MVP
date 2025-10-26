import { useState } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useMoodPalette } from "@/hooks/useMoodPalette"
import { cn } from "@/lib/utils"

export function MoodPaletteSwitcher({ className, size = "default" }: { 
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const [open, setOpen] = useState(false)
  const { currentMood, palette, changeMood, availableMoods } = useMoodPalette()

  const buttonSizes = {
    sm: "h-8 w-8",
    default: "h-9 w-9", 
    lg: "h-10 w-10"
  }

  const iconSizes = {
    sm: "h-3 w-3",
    default: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            buttonSizes[size],
            "relative overflow-hidden border-2 transition-all duration-200",
            className
          )}
          style={{
            background: `linear-gradient(135deg, ${palette.colors.primary} 0%, ${palette.colors.secondary} 100%)`,
            borderColor: palette.colors.primary,
          }}
          data-testid="mood-palette-switcher"
        >
          <Palette className={cn(iconSizes[size], "text-white")} />
          <span className="sr-only">Change mood palette</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end" data-testid="mood-palette-popover">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Mood-Based Color Palette</h4>
            <p className="text-xs text-muted-foreground">
              Choose a color theme that matches your current mood and enhances your productivity
            </p>
          </div>
          
          <div className="grid gap-2">
            {availableMoods.map((mood) => (
              <div
                key={mood.name}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md",
                  currentMood === mood.name 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => {
                  changeMood(mood.name)
                  setOpen(false)
                }}
                data-testid={`mood-option-${mood.name}`}
              >
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                  style={{
                    background: `linear-gradient(135deg, ${mood.colors.primary} 0%, ${mood.colors.secondary} 100%)`
                  }}
                >
                  {mood.emoji}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{mood.label}</span>
                    {currentMood === mood.name && (
                      <Check className="h-4 w-4 text-primary" data-testid={`mood-selected-${mood.name}`} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {mood.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Current Mood</span>
              <Badge 
                variant="secondary" 
                className="text-xs"
                style={{
                  backgroundColor: `${palette.colors.primary}15`,
                  color: palette.colors.primary,
                  borderColor: `${palette.colors.primary}25`
                }}
                data-testid="current-mood-badge"
              >
                {palette.emoji} {palette.label}
              </Badge>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export function MoodPaletteIndicator({ showLabel = false }: { showLabel?: boolean }) {
  const { palette } = useMoodPalette()
  
  return (
    <div className="flex items-center gap-2" data-testid="mood-palette-indicator">
      <div 
        className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
        style={{
          background: `linear-gradient(135deg, ${palette.colors.primary} 0%, ${palette.colors.secondary} 100%)`
        }}
        title={`Current mood: ${palette.label}`}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground">
          {palette.emoji} {palette.label}
        </span>
      )}
    </div>
  )
}