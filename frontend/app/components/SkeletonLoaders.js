'use client';

/**
 * Skeleton Loader para Cards
 */
export function CardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-header"></div>
      <div className="skeleton-body">
        <div className="skeleton-line"></div>
        <div className="skeleton-line short"></div>
      </div>
    </div>
  );
}

/**
 * Skeleton Loader para Tablas
 */
export function TableSkeleton({ rows = 5, columns = 6 }) {
  return (
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton-th"></div>
        ))}
      </div>
      <div className="skeleton-table-body">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="skeleton-row">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="skeleton-td"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton Grid para Dashboard
 */
export function GridSkeleton({ count = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
