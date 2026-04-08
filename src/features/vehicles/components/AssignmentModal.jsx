import { createPortal } from 'react-dom'
import { useDrivers } from '../../drivers/api/useDrivers'
import { DataTable } from '../../../shared/components/DataTable/DataTable'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary/ErrorBoundary'
import './AssignmentModal.scss'

const COLUMNS = [
  { key: 'firstName', label: 'First Name', sortable: true },
  { key: 'lastName', label: 'Last Name', sortable: true },
  { key: 'email', label: 'Email', sortable: false },
]

export function AssignmentModal({ driver, onAssign, onUnassign, onClose, isPending }) {
  const isAssigned = driver && driver !== 'Unassigned'
  const { data, isPending: isLoadingDrivers, isError: isDriversError, error: driversError, refetch: refetchDrivers } = useDrivers({
    assignmentStatus: 'unassigned',
    enabled: !isAssigned,
  })
  const drivers = !isAssigned && Array.isArray(data) ? data : []

  return createPortal(
    <div className="assignment-modal__overlay" onClick={onClose}>
      <div
        className={`assignment-modal__panel${!isAssigned ? ' assignment-modal__panel--wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="assignment-modal__title">Update Assignment</h2>

        {(isAssigned || drivers.length > 0) && (
          <p className="assignment-modal__driver">
            {isAssigned ? (
              <>Current driver: <strong>{driver}</strong></>
            ) : (
              'No driver assigned — select one below'
            )}
          </p>
        )}

        {!isAssigned && (
          <ErrorBoundary>
            {isDriversError ? (
              <p className="assignment-modal__error">
                {driversError.message}
                <button className="assignment-modal__retry" onClick={refetchDrivers}>Retry</button>
              </p>
            ) : !isLoadingDrivers && drivers.length === 0 ? (
              <p className="assignment-modal__empty">No available drivers to assign</p>
            ) : (
              <div className="assignment-modal__drivers-table">
                <DataTable
                  columns={COLUMNS}
                  data={drivers}
                  onRowClick={(row) => { onAssign(row.id) }}
                  isPending={isLoadingDrivers}
                />
              </div>
            )}
          </ErrorBoundary>
        )}

        <div className="assignment-modal__actions">
          {isAssigned && (
            <button
              className="assignment-modal__unassign"
              type="button"
              onClick={onUnassign}
              disabled={isPending}
            >
              {isPending ? 'Unassigning…' : 'Unassign driver'}
            </button>
          )}
          <button className="assignment-modal__cancel" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
