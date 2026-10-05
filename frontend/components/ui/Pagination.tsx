import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const total = Number(totalPages) || 1;
  if (total <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (total <= maxVisiblePages) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', total);
      } else if (currentPage >= total - 2) {
        pages.push(1, '...', total - 3, total - 2, total - 1, total);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', total);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 w-full select-none font-sans">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-[#0b4d35] disabled:hover:border-[#bdd3ba] transition-all duration-200 shadow-xs cursor-pointer"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`flex items-center justify-center w-9 h-9 rounded-full font-sans font-bold text-xs md:text-sm transition-all duration-200 ${
            page === currentPage
              ? 'bg-[#0b4d35] text-white border border-[#0b4d35] shadow-sm'
              : page === '...'
              ? 'bg-transparent text-[#0b4d35]/60 cursor-default'
              : 'bg-surface border border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35] cursor-pointer'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === total}
        className="flex items-center justify-center w-9 h-9 rounded-full bg-surface border border-[#bdd3ba] text-[#0b4d35] hover:bg-[#0b4d35] hover:text-white hover:border-[#0b4d35] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-surface disabled:hover:text-[#0b4d35] disabled:hover:border-[#bdd3ba] transition-all duration-200 shadow-xs cursor-pointer"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
