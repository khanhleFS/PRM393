import { useSearchContext } from '../context/search-context'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from 'lucide-react'

export function SearchPagination() {
  const { currentPage, setCurrentPage, totalPages } = useSearchContext()

  return (
    <section className="mt-12 mb-8 animate-fade-slide-up select-none">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          
          {/* First Page */}
          <button 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"
          >
            <ChevronsLeft className="size-5" />
          </button>
          
          {/* Prev Page */}
          <button 
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft className="size-5" />
          </button>
          
          {/* Select Dropdown Page Selector */}
          <div className="relative flex items-center">
            <select 
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="appearance-none bg-surface-container-high border border-outline/20 rounded-lg pl-4 pr-10 py-2 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {Array.from({ length: totalPages }, (_, idx) => (
                <option key={idx + 1} value={idx + 1} className="bg-surface-container-high text-on-surface">
                  Trang {idx + 1} / {totalPages}
                </option>
              ))}
            </select>
            <ChevronDown className="size-4 absolute right-3 pointer-events-none text-primary/60" />
          </div>
          
          {/* Next Page */}
          <button 
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="size-5" />
          </button>
          
          {/* Last Page */}
          <button 
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container disabled:opacity-30 cursor-pointer"
          >
            <ChevronsRight className="size-5" />
          </button>

        </div>
        
        <p className="text-xs font-medium text-on-surface-variant/60 select-none">
          Đang hiển thị trang {currentPage} trên tổng số {totalPages} trang
        </p>
      </div>
    </section>
  )
}
