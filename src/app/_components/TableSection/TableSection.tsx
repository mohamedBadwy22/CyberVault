import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/src/components/ui/pagination";
import { TableSectionProps } from "@/src/types/types";


export default function TableSection({
  title,
  description,
  columns,
  rows,
  state,
  emptyMessage,
  filterLabel = "Filter",
  filterOptions = ["All"],
  page,
  setPage,
  isFinished,
  setIsFinished,
  setFilterValue,
}: TableSectionProps) {
  const shouldRenderRows = state === "data" && rows.length > 0;

  return (
    <section className="space-y-4">
      <div className="rounded-lg bg-white shadow-md sm:rounded-lg">
        <div className="border-b border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* title and description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>

            {/* filter control */}
            <div className="w-full m-2 sm:w-auto">
              <label className="sr-only" htmlFor={`${title}-filter`}>
                {filterLabel}
              </label>
              <select
                id={`${title}-filter`}
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                defaultValue={filterOptions[0]}
                onChange={(e) => setFilterValue(e.target.value)}
              >
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* table content */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-170 text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-700">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-4 py-3 ${column.headerClassName ?? ""}`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {state === "loading"
                ? Array.from({ length: 6 }).map((_, rowIndex) => (
                    <tr
                      key={`skeleton-${rowIndex}`}
                      className="border-b border-gray-100 bg-white"
                    >
                      {columns.map((column, columnIndex) => (
                        <td
                          key={`${column.key}-${columnIndex}`}
                          className={`px-4 py-3 ${column.cellClassName ?? ""}`}
                        >
                          <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                : null}

              {state === "empty" ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : null}

              {shouldRenderRows
                ? rows.map((row, rowIndex) => (
                    <tr
                      key={`row-${rowIndex}`}
                      className="border-b border-gray-100 bg-white transition-colors hover:bg-gray-50"
                    >
                      {columns.map((column) => (
                        <td
                          key={`${column.key}-${rowIndex}`}
                          className={`px-4 py-3 align-middle ${column.cellClassName ?? ""}`}
                        >
                          {row[column.key] ?? "--"}
                        </td>
                      ))}
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>

              {/* pagination component */}
        <div className="flex  border-t border-gray-200 p-4 justify-center">
          <Pagination className="mx-0 w-auto justify-start sm:justify-end">
            <PaginationContent>

              {page === 1 ? <></> : <>
              <PaginationItem>
                <PaginationPrevious href={'#'} onClick={()=>{setPage(page-1);
                  setIsFinished(false);
                }} />
              </PaginationItem>

              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              </>}

              <PaginationItem>
                <PaginationLink href="#" isActive>
                  {page}
                </PaginationLink>
              </PaginationItem>


              {isFinished ? <></> : (
                <>
                <PaginationItem>
                <PaginationLink href="#" onClick={()=>setPage(page+1)}>
                  {page+1}
                </PaginationLink>
                </PaginationItem>

                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              
              <PaginationItem>
                <PaginationNext href={'#'} onClick={()=>setPage(page+1)} />
              </PaginationItem>
                </>)}

            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </section>
  );
}

