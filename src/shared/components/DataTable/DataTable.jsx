import { AutoSizer, List } from "react-virtualized";
import "react-virtualized/styles.css";
import "./DataTable.scss";

const ROW_HEIGHT = 45;
const TABLE_HEIGHT = 600;
const OVERSCAN = 5;

export function DataTable({ columns, data, sortBy, order, onSort, onRowClick, isPending }) {
  function rowRenderer({ index, key, style }) {
    const row = data[index];
    return (
      <div
        key={key}
        style={style}
        className={`data-table__row${onRowClick ? ' data-table__row--clickable' : ''}`}
        onClick={onRowClick ? () => onRowClick(row) : undefined}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className="data-table__cell"
            style={col.width ? { flex: `0 0 ${col.width}px` } : undefined}
          >
            {col.render ? col.render(row) : row[col.key]}
          </div>
        ))}
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="data-table-wrapper data-table-wrapper--loading" style={{ height: TABLE_HEIGHT }}>
        <div className="data-table__spinner" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <div className="data-table__head">
        {columns.map((col) => (
          <div
            key={col.key}
            className={`data-table__th${col.sortable ? " data-table__th--sortable" : ""}`}
            style={col.width ? { flex: `0 0 ${col.width}px` } : undefined}
            onClick={col.sortable ? () => onSort(col.key) : undefined}
          >
            {col.label}
            {col.sortable && sortBy === col.key && (
              <span className="data-table__sort-icon">
                {order === "asc" ? " ↑" : " ↓"}
              </span>
            )}
          </div>
        ))}
      </div>

      <AutoSizer disableHeight>
        {({ width }) => (
          <List
            width={width}
            height={TABLE_HEIGHT}
            rowCount={data.length}
            rowHeight={ROW_HEIGHT}
            rowRenderer={rowRenderer}
            overscanRowCount={OVERSCAN}
          />
        )}
      </AutoSizer>
    </div>
  );
}
