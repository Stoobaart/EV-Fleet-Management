import { Router } from 'express'
import { getVehicles } from './vehiclesController.js'

const router = Router()

router.get('/', getVehicles)

export default router
