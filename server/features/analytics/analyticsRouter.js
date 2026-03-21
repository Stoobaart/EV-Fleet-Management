import { Router } from 'express'
import { getAnalytics } from './analyticsController.js'

const router = Router()

router.get('/', getAnalytics)

export default router
