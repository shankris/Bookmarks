"use client";

import { flexRender } from "@tanstack/react-table";
import { ChevronUp, ChevronDown } from "lucide-react";

import TableSearch from "@/components/common/TableSearch";
import DataTablePagination from "@/components/common/DataTablePagination";

import styles from "./BookmarkList.module.css"; // reuse same CSS

export default function BookmarkTableView({ table, search, setSearch }) {
  return (
    <>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          {/* ================= HEADER ================= */}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortState = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={`${styles.th} ${canSort ? styles.sortable : ""}`}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                    >
                      <div className={styles.thContent}>
                        <span className={styles.headerText}>{flexRender(header.column.columnDef.header, header.getContext())}</span>

                        {sortState === "asc" && (
                          <ChevronUp
                            size={16}
                            className={styles.sortIcon}
                          />
                        )}
                        {sortState === "desc" && (
                          <ChevronDown
                            size={16}
                            className={styles.sortIcon}
                          />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          {/* ================= BODY ================= */}
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={styles.tr}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={`${styles.td} ${cell.column.columnDef.meta?.cellClassName || ""}`}
                    data-label={flexRender(cell.column.columnDef.header, cell.getContext())}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📄 Pagination */}
      <DataTablePagination table={table} />
    </>
  );
}
