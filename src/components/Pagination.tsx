import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

const Pagination: React.FC<Props> = ({
  page,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange
}) => {

  const pageSizes = [10, 25, 50, 100];

  const getPages = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    if (page > 3) pages.push("...");

    for (let i = page - 1; i <= page + 1; i++) {
      if (i > 1 && i < totalPages) pages.push(i);
    }

    if (page < totalPages - 2) pages.push("...");

    pages.push(totalPages);

    return pages;
  };

  const pages = getPages();

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t bg-white flex-wrap gap-4">

      {/* LEFT : Showing + Page Size */}
      <div className="flex items-center gap-4 text-sm text-gray-600">

        <div>
          Showing <span className="font-semibold">{start}</span> to{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{totalItems}</span>
        </div>

        {/* PAGE SIZE SELECT */}
        <div className="flex items-center gap-2">
          <span>Rows:</span>

          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="border rounded-md px-2 py-1 text-sm"
          >
            {pageSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

        </div>

      </div>

      {/* CENTER : Pagination */}
      <div className="flex items-center gap-2">

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={i} className="px-2 text-gray-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`px-3 py-1 rounded-md text-sm ${
                page === p
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="px-3 py-1 border rounded-lg text-sm disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>

      </div>

    </div>
  );
};

export default Pagination;