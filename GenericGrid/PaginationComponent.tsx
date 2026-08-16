import * as React from "react";

interface IPaginationComponentProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const PaginationComponent: React.FunctionComponent<IPaginationComponentProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="cg-grid__pagination" role="navigation" aria-label="Pagination">
      <button
        type="button"
        className="cg-grid__page-button cg-grid__page-button--nav"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        Previous
      </button>
      <div className="cg-grid__page-list">
        {Array.from({ length: totalPages }, (_, index) => {
          const pageNumber = index + 1;
          const isCurrentPage = currentPage === pageNumber;

          return (
            <button
              key={pageNumber}
              type="button"
              className={isCurrentPage ? "cg-grid__page-button cg-grid__page-button--current" : "cg-grid__page-button"}
              onClick={() => onPageChange(pageNumber)}
              aria-current={isCurrentPage ? "page" : undefined}
              aria-label={`Go to page ${pageNumber}`}
            >
              {pageNumber}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="cg-grid__page-button cg-grid__page-button--nav"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        Next
      </button>
    </div>
  );
};

export default PaginationComponent;
