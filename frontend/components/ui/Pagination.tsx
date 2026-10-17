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
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#12151F] border border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#181C28] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#12151F] disabled:hover:text-[#A69B82] disabled:hover:border-[rgba(212,175,55,0.25)] transition-all duration-200 shadow-sm cursor-pointer"
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
          className={`flex items-center justify-center w-9 h-9 rounded-xl font-heading font-black text-xs md:text-sm transition-all duration-200 ${
            page === currentPage
              ? 'btn-gold-metallic text-[#090A0E] shadow-[0_0_15px_rgba(212,175,55,0.4)]'
              : page === '...'
              ? 'bg-transparent text-[#A69B82]/50 cursor-default'
              : 'bg-[#12151F] border border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#181C28] cursor-pointer'
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === total}
        className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#12151F] border border-[rgba(212,175,55,0.25)] text-[#A69B82] hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#181C28] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#12151F] disabled:hover:text-[#A69B82] disabled:hover:border-[rgba(212,175,55,0.25)] transition-all duration-200 shadow-sm cursor-pointer"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
