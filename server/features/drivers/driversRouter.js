import { Router } from 'express'
import { getDrivers } from './driversController.js'

const router = Router()

router.get('/', getDrivers)

export default router
