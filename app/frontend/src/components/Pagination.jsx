import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination Component with ellipsis for long page ranges
 * 
 * Props:
 * - currentPage: Current page number
 * - totalPages: Total number of pages
 * - onPageChange: Callback when page changes
 * - disabled: Whether pagination is disabled
 */
const Pagination = ({ currentPage, totalPages, onPageChange, disabled = false }) => {
  if (totalPages <= 1) return null;

  // Generate page numbers with ellipsis for long ranges
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page buttons (excluding ellipsis and prev/next)
    const halfVisible = Math.floor(maxVisible / 2);

    if (totalPages <= maxVisible + 2) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let start = Math.max(2, currentPage - halfVisible);
      let end = Math.min(totalPages - 1, currentPage + halfVisible);

      // Adjust if near the beginning or end
      if (currentPage <= halfVisible + 1) {
        end = Math.min(totalPages - 1, maxVisible);
      } else if (currentPage >= totalPages - halfVisible) {
        start = Math.max(2, totalPages - maxVisible);
      }

      // Add ellipsis before if needed
      if (start > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis after if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-500">
                ...
              </span>
            );
          }

          return (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={disabled}
              className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                currentPage === page
                  ? 'bg-de-primary text-white'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Trang tiếp"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Page Info */}
      <div className="ml-4 text-sm text-gray-600">
        Trang <span className="font-semibold">{currentPage}</span> trên{' '}
        <span className="font-semibold">{totalPages}</span>
      </div>
    </div>
  );
};

export default Pagination;
