import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './Pagination.css';

function Pagination({ currentPage = 1, totalPages = 312, onPageChange }) {
  const handlePageClick = (page) => {
    if (onPageChange && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">
            {page}
          </span>
        );
      }

      return (
        <button
          key={`page-${page}`}
          className={`page-num-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => handlePageClick(page)}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className="pagination-container">
      <button
        className="pagination-arrow-btn"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        aria-label="Previous Page"
      >
        <FiChevronLeft />
        <span>Previous</span>
      </button>

      <div className="pagination-pages">
        {renderPageNumbers()}
      </div>

      <button
        className="pagination-arrow-btn"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        aria-label="Next Page"
      >
        <span>Next</span>
        <FiChevronRight />
      </button>
    </div>
  );
}

export default Pagination;
