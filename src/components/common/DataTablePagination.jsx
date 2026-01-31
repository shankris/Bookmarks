"use client";

import styles from "./DataTablePagination.module.css";
import { ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from "lucide-react";

export default function DataTablePagination({ table }) {
  const { pageIndex, pageSize } = table.getState().pagination;

  const totalRows = table.getPrePaginationRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className={styles.footer}>
      <div className={styles.pageInfo}>
        {startRow}–{endRow} of {totalRows}
      </div>

      <div className={styles.controls}>
        {/* First */}
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label='First page'
        >
          <ChevronFirst size={18} />
        </button>

        {/* Previous */}
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label='Previous page'
        >
          <ChevronLeft size={18} />
        </button>

        {/* Page numbers (smart) */}
        {(() => {
          const pages = [];
          const windowSize = 2; // pages before & after current

          const start = Math.max(0, pageIndex - windowSize);
          const end = Math.min(pageCount - 1, pageIndex + windowSize);

          // Always show first page
          if (start > 0) {
            pages.push(
              <button
                key={0}
                onClick={() => table.setPageIndex(0)}
              >
                1
              </button>,
            );
            if (start > 1) pages.push(<span key='start-ellipsis'>…</span>);
          }

          // Middle window
          for (let i = start; i <= end; i++) {
            pages.push(
              <button
                key={i}
                onClick={() => table.setPageIndex(i)}
                disabled={i === pageIndex}
                className={i === pageIndex ? styles.active : ""}
              >
                {i + 1}
              </button>,
            );
          }

          // Always show last page
          if (end < pageCount - 1) {
            if (end < pageCount - 2) pages.push(<span key='end-ellipsis'>…</span>);
            pages.push(
              <button
                key={pageCount - 1}
                onClick={() => table.setPageIndex(pageCount - 1)}
              >
                {pageCount}
              </button>,
            );
          }

          return pages;
        })()}

        {/* Next */}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label='Next page'
        >
          <ChevronRight size={18} />
        </button>

        {/* Last */}
        <button
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label='Last page'
        >
          <ChevronLast size={18} />
        </button>
      </div>
    </div>
  );
}
