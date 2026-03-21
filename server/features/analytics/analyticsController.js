const analyticsData = {
  totalVehicles: 42,
  totalDrivers: 38,
}

export function getAnalytics(req, res) {
  res.json(analyticsData)
}
