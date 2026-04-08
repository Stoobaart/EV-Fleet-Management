import { List } from "react-window";
import "./DataTable.scss";

const ROW_HEIGHT = 45;
const OVERSCAN = 5;

function RowComponent({ index, style, data: rows, columns, onRowClick }) {
  const row = rows[index];
  return (
    <div
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

export function DataTable({ columns, data, sortBy, order, onSort, onRowClick, isPending }) {
  if (isPending) {
    return (
      <div className="data-table-wrapper data-table-wrapper--loading">
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

      <div className="data-table__list-container">
        <List
          rowCount={data.length}
          rowHeight={ROW_HEIGHT}
          rowComponent={RowComponent}
          rowProps={{ data, columns, onRowClick }}
          overscanCount={OVERSCAN}
        />
      </div>
    </div>
  );
}
