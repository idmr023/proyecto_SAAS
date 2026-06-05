import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export interface Column<T> {
  key: string
  header: string
  sortable?: boolean
  render: (item: T) => React.ReactNode
  cellClass?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  searchQuery?: string
  emptyMessage?: string
  loadingSkeletonCount?: number
  keyExtractor: (item: T) => string | number
}

export default function DataTable<T>({
  columns,
  data,
  loading = false,
  searchable = true,
  searchPlaceholder = "Buscar...",
  onSearch,
  searchQuery: externalSearchQuery,
  emptyMessage = "Sin datos",
  loadingSkeletonCount = 5,
  keyExtractor,
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState("")

  const isControlled = externalSearchQuery !== undefined
  const searchValue = isControlled ? externalSearchQuery : internalSearch

  const handleSearch = (value: string) => {
    if (isControlled) {
      onSearch?.(value)
    } else {
      setInternalSearch(value)
    }
  }

  const displayData = onSearch
    ? data
    : data.filter((item: any) => {
        if (!searchValue) return true
        const query = searchValue.toLowerCase()
        return columns.some((col) => {
          const val = item[col.key]
          return val != null && String(val).toLowerCase().includes(query)
        })
      })

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: loadingSkeletonCount }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {columns.map((col) => (
                    <Skeleton key={col.key} className="h-5 flex-1" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {displayData.map((item) => (
            <Card key={keyExtractor(item)} className="transition-all hover:shadow-sm hover:border-primary/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {columns.map((col) => (
                    <div key={col.key} className={cn("flex-1 min-w-0", col.cellClass)}>
                      {col.render(item)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
