import { Router } from 'express'
import { getVehicles, getVehicleFilters, getVehicleById, updateVehicleAssignment } from './vehiclesController.js'

const router = Router()

router.get('/filters', getVehicleFilters)
router.get('/', getVehicles)
router.get('/:id', getVehicleById)
router.put('/:id/assignment', updateVehicleAssignment)

export default router
