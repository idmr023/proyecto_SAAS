import { createContext, useContext, useState, useRef, useEffect, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectContextType {
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextType | undefined>(undefined)

function useSelect() {
  const ctx = useContext(SelectContext)
  if (!ctx) throw new Error("useSelect must be used within Select")
  return ctx
}

export function Select({ value, onValueChange, children, disabled }: { value?: string; onValueChange: (value: string) => void; children: ReactNode; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <SelectContext.Provider value={{ value: value || "", onValueChange, open, setOpen }}>
      <div className={cn(disabled && "pointer-events-none opacity-50")}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string; children: ReactNode }) {
  const { open, setOpen } = useSelect()
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  )
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = useSelect()
  return <span className={value ? "text-foreground" : "text-muted-foreground"}>{value || placeholder}</span>
}

export function SelectContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open } = useSelect()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        useSelect().setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { value: selectedValue, onValueChange, setOpen } = useSelect()
  const isSelected = selectedValue === value

  return (
    <div
      role="option"
      aria-selected={isSelected}
      onClick={() => { onValueChange(value); setOpen(false) }}
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground",
        isSelected && "bg-accent text-accent-foreground",
        className
      )}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </span>
      {children}
    </div>
  )
}
