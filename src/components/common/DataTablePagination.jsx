"use client";

import styles from "./DataTablePagination.module.css";

export default function DataTablePagination({ table }) {
  const { pageIndex, pageSize } = table.getState().pagination;

  const totalRows = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();

  const startRow = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const endRow = Math.min((pageIndex + 1) * pageSize, totalRows);

  return (
    <div className={styles.footer}>
      {/* Rows per page */}
      <div className={styles.rowsPerPage}>
        Rows per page:
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
        >
          {[10, 20, 30, 50].map((size) => (
            <option
              key={size}
              value={size}
            >
              {size}
            </option>
          ))}
        </select>
      </div>

      {/* Showing X–Y of Z */}
      <div className={styles.pageInfo}>
        {startRow}–{endRow} of {totalRows}
      </div>

      {/* Page controls */}
      <div className={styles.controls}>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          ‹
        </button>

        {Array.from({ length: pageCount }, (_, i) => (
          <button
            key={i}
            onClick={() => table.setPageIndex(i)}
            className={i === pageIndex ? styles.active : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          ›
        </button>
      </div>
    </div>
  );
}
