"use client";

import React from "react";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (nextPage: number) => void;
  onPageSizeChange: (nextPageSize: number) => void;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 20, 50],
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = totalItems === 0 ? 0 : Math.min(currentPage * pageSize, totalItems);

  const pagesToShow = React.useMemo(() => {
    const maxButtons = 5;
    const half = Math.floor(maxButtons / 2);
    let from = Math.max(1, currentPage - half);
    const to = Math.min(totalPages, from + maxButtons - 1);
    from = Math.max(1, to - maxButtons + 1);
    const arr: number[] = [];
    for (let i = from; i <= to; i += 1) arr.push(i);
    return arr;
  }, [currentPage, totalPages]);

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-primary/10 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="page-size-select">
          Por página
        </label>
        <select
          id="page-size-select"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-lg border border-slate-200 px-2 text-sm font-semibold text-slate-700"
          title="Cantidad por página"
        >
          {pageSizeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="text-sm font-semibold text-slate-500">
          {start}-{end} de {totalItems}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          Anterior
        </button>

        {pagesToShow.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            className={`h-9 min-w-9 rounded-lg px-3 text-sm font-bold ${
              item === currentPage
                ? "bg-primary text-white"
                : "border border-slate-200 text-slate-700"
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-700 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default PaginationControls;
