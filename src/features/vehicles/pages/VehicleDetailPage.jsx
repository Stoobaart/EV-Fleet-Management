import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router'
import { useVehicle, useVehicleImage, useUpdateVehicleAssignment } from '../api/useVehicles'
import { MAKE_DOMAINS } from '../../../shared/data/makeDomains'
import { ErrorBoundary } from '../../../shared/components/ErrorBoundary/ErrorBoundary'
import { AssignmentModal } from '../components/AssignmentModal'
import './VehicleDetailPage.scss'

export default function VehicleDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state } = useLocation()
  const backLabel = `← Back to ${state?.from ?? 'Vehicles'}`
  const { data, isPending, refetch } = useVehicle(id)
  const { data: wikiImageUrl } = useVehicleImage(data?.make, data?.model)
  const { mutate: updateAssignment, isPending: isUpdatingAssignment, isError: isAssignmentError, error: assignmentError } = useUpdateVehicleAssignment(id)
  const [modalOpen, setModalOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <main className="vehicle-detail">
      <button className="vehicle-detail__back" onClick={() => navigate(-1)}>
        {backLabel}
      </button>

      <ErrorBoundary>
        {data?.error ? (
          <p className="vehicle-detail__error">
            {data.error}
            <button className="vehicle-detail__retry" onClick={refetch}>Retry</button>
          </p>
        ) : isPending ? (
          <div className="vehicle-detail__spinner" aria-label="Loading" />
        ) : data ? (
          <div className="vehicle-detail__sections">
            <section className="vehicle-detail__section">
              {wikiImageUrl ? (
                <>
                  {!imageLoaded && (
                    <div className="vehicle-detail__image-skeleton" aria-hidden="true" />
                  )}
                  <img
                    className="vehicle-detail__image vehicle-detail__image--wiki"
                    src={wikiImageUrl}
                    alt={`${data.year} ${data.make} ${data.model}`}
                    onLoad={() => setImageLoaded(true)}
                    style={imageLoaded ? undefined : { display: 'none' }}
                  />
                </>
              ) : MAKE_DOMAINS[data.make] ? (
                <img
                  className="vehicle-detail__image vehicle-detail__image--favicon"
                  src={`https://www.google.com/s2/favicons?domain=${MAKE_DOMAINS[data.make]}&sz=128`}
                  alt={data.make}
                />
              ) : null}
              <h1 className="vehicle-detail__title">
                {data.year} {data.make} {data.model}
              </h1>
              <dl className="vehicle-detail__info">
                <dt>Plate</dt>
                <dd>{data.licensePlate}</dd>
                <dt>Colour</dt>
                <dd>{data.colour}</dd>
                <dt>Range</dt>
                <dd>{data.range} mi</dd>
                <dt>Status</dt>
                <dd className={`vehicle-detail__status vehicle-detail__status--${data.status}`}>
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </dd>
              </dl>
            </section>

            <section className="vehicle-detail__section">
              <h2 className="vehicle-detail__section-title">Driver</h2>
              <p className="vehicle-detail__driver-name">{data.driver}</p>
              <button className="vehicle-detail__cta" type="button" onClick={() => setModalOpen(true)}>
                Update assignment
              </button>
            </section>
          </div>
        ) : null}
      </ErrorBoundary>

      {isAssignmentError && (
        <p className="vehicle-detail__mutation-error">{assignmentError?.message ?? 'Assignment update failed'}</p>
      )}

      {modalOpen && data && !data.error && (
        <AssignmentModal
          driver={data.driver}
          onAssign={(driverId) => { updateAssignment(driverId); setModalOpen(false) }}
          onUnassign={() => { updateAssignment(null); setModalOpen(false) }}
          onClose={() => setModalOpen(false)}
          isPending={isUpdatingAssignment}
        />
      )}
    </main>
  )
}
