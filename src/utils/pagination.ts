export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * @param items 
 * @param page 
 * @param pageSize 
 */
export function paginate<T>(
  items: T[],
  page = 1,
  pageSize = 10
): PaginationResult<T> {
  page = Math.max(1, page);
  pageSize = Math.max(1, pageSize);
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const data = items.slice(start, end);
  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  };
}
