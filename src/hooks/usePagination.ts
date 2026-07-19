import { useEffect, useState } from 'react';

export function usePagination<T>(items: T[], recordsPerPage: number, resetKey?: unknown) {
    const [page, setPage] = useState<number>(1);

    // Reset to page 1 whenever the reset key (e.g. a search term) changes
    useEffect(() => {
        setPage(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetKey]);

    const totalPages = Math.ceil(items.length / recordsPerPage) || 1;
    const safePage = Math.min(page, totalPages);
    const lastIndex = safePage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const currentRecords = items.slice(firstIndex, lastIndex);

    return { page: safePage, setPage, totalPages, currentRecords };
}
