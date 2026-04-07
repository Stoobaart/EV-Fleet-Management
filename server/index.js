import express from 'express'
import cors from 'cors'
import analyticsRouter from './features/analytics/analyticsRouter.js'
import vehiclesRouter from './features/vehicles/vehiclesRouter.js'
import driversRouter from './features/drivers/driversRouter.js'

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/analytics', analyticsRouter)
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/drivers', driversRouter)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
