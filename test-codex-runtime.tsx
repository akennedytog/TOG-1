import React, {
  Component,
  ReactNode,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

type SortDirection = 'asc' | 'desc';

type Primitive = string | number | boolean | null | undefined | Date;

type ColumnDef<T> = {
  key: keyof T;
  header: string;
  width: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: T[keyof T], row: T, rowIndex: number) => ReactNode;
  filterFn?: (value: T[keyof T], query: string, row: T) => boolean;
  sortFn?: (a: T, b: T) => number;
};

type FetchState<T> = {
  rows: T[];
  loading: boolean;
  error: Error | null;
};

type VirtualizedDataTableProps<T extends Record<string, unknown>> = {
  columns: ColumnDef<T>[];
  fetchRows: () => Promise<T[]>;
  rowHeight?: number;
  height?: number;
  overscan?: number;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  title?: string;
  emptyMessage?: string;
};

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class TableErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('VirtualizedDataTable crashed', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={styles.errorState} role="alert">
            <strong>Something went wrong.</strong>
            <div>{this.state.error?.message ?? 'Unknown error.'}</div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

function comparePrimitives(a: Primitive, b: Primitive): number {
  const left = a instanceof Date ? a.getTime() : a;
  const right = b instanceof Date ? b.getTime() : b;

  if (left == null && right == null) return 0;
  if (left == null) return -1;
  if (right == null) return 1;
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  if (typeof left === 'boolean' && typeof right === 'boolean') return Number(left) - Number(right);

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

function defaultFilter(value: unknown, query: string): boolean {
  if (!query) return true;
  if (value == null) return false;

  return String(value).toLowerCase().includes(query.trim().toLowerCase());
}

function LoadingSkeleton({ columns, rowHeight = 44 }: { columns: number; rowHeight?: number }) {
  return (
    <div style={styles.skeletonWrap} aria-busy="true" aria-live="polite">
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <div key={rowIndex} style={{ ...styles.skeletonRow, height: rowHeight }}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <div
              key={colIndex}
              style={{
                ...styles.skeletonCell,
                width: `${Math.max(80, 100 - colIndex * 8)}%`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function useRemoteRows<T>(fetchRows: () => Promise<T[]>): FetchState<T> & { reload: () => Promise<void> } {
  const [state, setState] = useState<FetchState<T>>({ rows: [], loading: true, error: null });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const rows = await fetchRows();
      setState({ rows, loading: false, error: null });
    } catch (error) {
      setState({ rows: [], loading: false, error: error as Error });
    }
  }, [fetchRows]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}

function VirtualizedDataTableInner<T extends Record<string, unknown>>({
  columns,
  fetchRows,
  rowHeight = 44,
  height = 520,
  overscan = 8,
  pageSizeOptions = [10, 25, 50, 100],
  initialPageSize = 25,
  title = 'Data table',
  emptyMessage = 'No results found.',
}: VirtualizedDataTableProps<T>) {
  const { rows, loading, error, reload } = useRemoteRows(fetchRows);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnFilters, setColumnFilters] = useState<Partial<Record<keyof T, string>>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const deferredGlobalFilter = useDeferredValue(globalFilter);
  const totalWidth = useMemo(() => columns.reduce((sum, column) => sum + column.width, 0), [columns]);

  const filteredRows = useMemo(() => {
    const globalQuery = deferredGlobalFilter.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesGlobal =
        !globalQuery ||
        columns.some((column) => {
          const value = row[column.key];
          return defaultFilter(value, globalQuery);
        });

      if (!matchesGlobal) return false;

      return columns.every((column) => {
        const query = columnFilters[column.key]?.trim();
        if (!query) return true;

        const value = row[column.key];
        return column.filterFn ? column.filterFn(value, query, row) : defaultFilter(value, query);
      });
    });
  }, [rows, columns, deferredGlobalFilter, columnFilters]);

  const sortedRows = useMemo(() => {
    if (!sortKey) return filteredRows;

    const column = columns.find((entry) => entry.key === sortKey);
    const sorted = [...filteredRows].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      if (column?.sortFn) return column.sortFn(a, b) * direction;
      return comparePrimitives(a[sortKey] as Primitive, b[sortKey] as Primitive) * direction;
    });

    return sorted;
  }, [filteredRows, sortKey, sortDirection, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  useEffect(() => {
    setCurrentPage(1);
    setScrollTop(0);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [deferredGlobalFilter, columnFilters, pageSize, sortKey, sortDirection]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const viewportHeight = Math.min(height, Math.max(rowHeight * 4, pageSize * rowHeight));
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(
    paginatedRows.length,
    Math.ceil((scrollTop + viewportHeight) / rowHeight) + overscan,
  );
  const visibleRows = paginatedRows.slice(startIndex, endIndex);
  const topSpacerHeight = startIndex * rowHeight;
  const bottomSpacerHeight = Math.max(0, (paginatedRows.length - endIndex) * rowHeight);

  const toggleSort = (key: keyof T) => {
    setSortKey((current) => {
      if (current !== key) {
        setSortDirection('asc');
        return key;
      }

      setSortDirection((direction) => (direction === 'asc' ? 'desc' : 'asc'));
      return key;
    });
  };

  if (loading) {
    return (
      <section style={styles.container} aria-label={title}>
        <div style={styles.toolbar}>
          <div>
            <h2 style={styles.title}>{title}</h2>
            <div style={styles.subtitle}>Loading rows…</div>
          </div>
        </div>
        <LoadingSkeleton columns={columns.length} rowHeight={rowHeight} />
      </section>
    );
  }

  if (error) {
    return (
      <section style={styles.container} aria-label={title}>
        <div style={styles.errorState} role="alert">
          <strong>Could not load table data.</strong>
          <div>{error.message}</div>
          <button type="button" style={styles.button} onClick={() => void reload()}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.container} aria-label={title}>
      <div style={styles.toolbar}>
        <div>
          <h2 style={styles.title}>{title}</h2>
          <div style={styles.subtitle}>
            {sortedRows.length} result{sortedRows.length === 1 ? '' : 's'}
          </div>
        </div>
        <div style={styles.toolbarControls}>
          <input
            aria-label="Global search"
            placeholder="Search all columns"
            style={styles.input}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
          <button type="button" style={styles.button} onClick={() => void reload()}>
            Refresh
          </button>
        </div>
      </div>

      <div style={styles.tableFrame}>
        <div style={{ ...styles.headerRow, minWidth: totalWidth }}>
          {columns.map((column) => {
            const isSorted = sortKey === column.key;
            return (
              <div key={String(column.key)} style={{ ...styles.headerCell, width: column.width }}>
                <button
                  type="button"
                  style={{
                    ...styles.headerButton,
                    cursor: column.sortable ? 'pointer' : 'default',
                  }}
                  onClick={() => column.sortable && toggleSort(column.key)}
                  disabled={!column.sortable}
                >
                  <span>{column.header}</span>
                  {column.sortable && (
                    <span style={styles.sortIndicator}>
                      {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                    </span>
                  )}
                </button>
                {column.filterable && (
                  <input
                    aria-label={`Filter ${column.header}`}
                    placeholder="Filter"
                    style={styles.columnFilter}
                    value={columnFilters[column.key] ?? ''}
                    onChange={(event) =>
                      setColumnFilters((current) => ({
                        ...current,
                        [column.key]: event.target.value,
                      }))
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        <div
          ref={scrollRef}
          style={{ ...styles.bodyViewport, height: viewportHeight }}
          onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        >
          <div style={{ ...styles.bodyInner, minWidth: totalWidth, height: paginatedRows.length * rowHeight }}>
            {topSpacerHeight > 0 && <div style={{ height: topSpacerHeight }} />}

            {visibleRows.length === 0 ? (
              <div style={styles.emptyState}>{emptyMessage}</div>
            ) : (
              visibleRows.map((row, visibleIndex) => {
                const rowIndex = startIndex + visibleIndex;
                return (
                  <div
                    key={rowIndex}
                    style={{ ...styles.dataRow, height: rowHeight }}
                    role="row"
                    aria-rowindex={rowIndex + 1}
                  >
                    {columns.map((column) => {
                      const cellValue = row[column.key];
                      return (
                        <div
                          key={String(column.key)}
                          style={{ ...styles.dataCell, width: column.width }}
                          role="cell"
                        >
                          {column.render
                            ? column.render(cellValue, row, rowIndex)
                            : cellValue == null
                              ? '—'
                              : String(cellValue)}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}

            {bottomSpacerHeight > 0 && <div style={{ height: bottomSpacerHeight }} />}
          </div>
        </div>
      </div>

      <div style={styles.paginationBar}>
        <div style={styles.paginationInfo}>
          Page {currentPage} of {totalPages}
        </div>
        <div style={styles.paginationControls}>
          <select
            aria-label="Rows per page"
            style={styles.select}
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
          <button
            type="button"
            style={styles.button}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
          >
            First
          </button>
          <button
            type="button"
            style={styles.button}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Prev
          </button>
          <button
            type="button"
            style={styles.button}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            Next
          </button>
          <button
            type="button"
            style={styles.button}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
          >
            Last
          </button>
        </div>
      </div>
    </section>
  );
}

export function VirtualizedDataTable<T extends Record<string, unknown>>(
  props: VirtualizedDataTableProps<T>,
) {
  return (
    <TableErrorBoundary>
      <VirtualizedDataTableInner {...props} />
    </TableErrorBoundary>
  );
}

type DemoRow = {
  id: number;
  name: string;
  email: string;
  department: string;
  score: number;
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
};

const demoColumns: ColumnDef<DemoRow>[] = [
  { key: 'id', header: 'ID', width: 80, sortable: true, filterable: true },
  { key: 'name', header: 'Name', width: 180, sortable: true, filterable: true },
  { key: 'email', header: 'Email', width: 260, sortable: true, filterable: true },
  { key: 'department', header: 'Department', width: 180, sortable: true, filterable: true },
  {
    key: 'score',
    header: 'Score',
    width: 120,
    sortable: true,
    filterable: true,
    render: (value) => <strong>{value as number}</strong>,
  },
  {
    key: 'status',
    header: 'Status',
    width: 140,
    sortable: true,
    filterable: true,
    render: (value) => (
      <span
        style={{
          ...styles.badge,
          background:
            value === 'active' ? '#DCFCE7' : value === 'pending' ? '#FEF3C7' : '#F3F4F6',
          color: value === 'active' ? '#166534' : value === 'pending' ? '#92400E' : '#374151',
        }}
      >
        {String(value)}
      </span>
    ),
  },
  {
    key: 'joinedAt',
    header: 'Joined',
    width: 160,
    sortable: true,
    filterable: true,
    sortFn: (a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime(),
    render: (value) => new Date(String(value)).toLocaleDateString(),
  },
];

export function VirtualizedDataTableDemo() {
  const fetchRows = useCallback(async (): Promise<DemoRow[]> => {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return Array.from({ length: 5000 }, (_, index) => ({
      id: index + 1,
      name: `Employee ${index + 1}`,
      email: `employee${index + 1}@example.com`,
      department: ['Engineering', 'Sales', 'Marketing', 'Finance'][index % 4],
      score: Math.round(((index * 17) % 1000) / 10),
      status: ['active', 'inactive', 'pending'][index % 3] as DemoRow['status'],
      joinedAt: new Date(Date.now() - index * 86400000).toISOString(),
    }));
  }, []);

  return (
    <VirtualizedDataTable
      title="Team performance"
      columns={demoColumns}
      fetchRows={fetchRows}
      height={480}
      rowHeight={48}
      overscan={10}
      initialPageSize={50}
      pageSizeOptions={[25, 50, 100, 250]}
      emptyMessage="No matching employees."
    />
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    padding: 16,
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    background: '#FFFFFF',
    color: '#111827',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  toolbarControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 4,
    color: '#6B7280',
    fontSize: 14,
  },
  input: {
    minWidth: 220,
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    outline: 'none',
  },
  select: {
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    background: '#FFF',
  },
  button: {
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    background: '#F9FAFB',
    cursor: 'pointer',
    fontWeight: 600,
  },
  tableFrame: {
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
  },
  headerRow: {
    display: 'flex',
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  headerCell: {
    padding: 12,
    borderRight: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  headerButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: 0,
    border: 'none',
    background: 'transparent',
    fontWeight: 700,
    textAlign: 'left',
  },
  sortIndicator: {
    marginLeft: 8,
    color: '#6B7280',
    fontSize: 12,
  },
  columnFilter: {
    padding: '8px 10px',
    borderRadius: 8,
    border: '1px solid #D1D5DB',
    outline: 'none',
  },
  bodyViewport: {
    overflow: 'auto',
    background: '#FFFFFF',
  },
  bodyInner: {
    position: 'relative',
  },
  dataRow: {
    display: 'flex',
    borderBottom: '1px solid #F3F4F6',
  },
  dataCell: {
    padding: '12px',
    borderRight: '1px solid #F3F4F6',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
  },
  paginationBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  paginationInfo: {
    color: '#4B5563',
    fontSize: 14,
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  emptyState: {
    padding: 32,
    color: '#6B7280',
  },
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 20,
    borderRadius: 12,
    background: '#FEF2F2',
    color: '#991B1B',
  },
  skeletonWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  skeletonRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: 12,
    alignItems: 'center',
  },
  skeletonCell: {
    height: 14,
    borderRadius: 999,
    background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 37%, #E5E7EB 63%)',
    backgroundSize: '400% 100%',
    animation: 'pulse 1.4s ease infinite',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'capitalize',
  },
};

export default VirtualizedDataTableDemo;
