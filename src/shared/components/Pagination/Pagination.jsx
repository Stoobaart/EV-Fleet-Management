import './Pagination.scss'

export function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="pagination">
      <button
        className="pagination__btn"
        onClick={onPrev}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        ← Prev
      </button>
      <span className="pagination__info">
        Page {page} of {totalPages}
      </span>
      <button
        className="pagination__btn"
        onClick={onNext}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        Next →
      </button>
    </div>
  )
}
