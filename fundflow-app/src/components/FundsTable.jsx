import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Typography,
  CircularProgress, Box, Alert, TextField, MenuItem
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import { fundApi } from '../services/fundApi'

// Maps risk level to MUI Chip color
const riskColor = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
}

// Shows a green or red trend icon + value depending on sign
function ReturnCell({ value }) {
  if (value == null) return <TableCell>—</TableCell>
  const positive = value >= 0
  return (
    <TableCell>
      <Box display="flex" alignItems="center" gap={0.5}>
        {positive
          ? <TrendingUpIcon fontSize="small" color="success" />
          : <TrendingDownIcon fontSize="small" color="error" />}
        <Typography
          variant="body2"
          color={positive ? 'success.main' : 'error.main'}
          fontWeight={500}>
          {value > 0 ? '+' : ''}{value.toFixed(2)}%
        </Typography>
      </Box>
    </TableCell>
  )
}

export default function FundsTable() {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  // Fetch funds on mount and when category filter changes
  useEffect(() => {
    setLoading(true)
    const request = categoryFilter
      ? fundApi.getFundsByCategory(categoryFilter)
      : fundApi.getAllFunds()

    request
      .then(res => setFunds(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [categoryFilter]) // re-runs every time categoryFilter changes

  if (loading) return (
    <Box display="flex" justifyContent="center" mt={4}>
      <CircularProgress />
    </Box>
  )

  if (error) return (
    <Alert severity="error" sx={{ mt: 2 }}>
      Failed to load funds: {error}
    </Alert>
  )

  return (
    <Box>
      {/* Filter */}
      <TextField
        select
        label="Filter by category"
        value={categoryFilter}
        onChange={e => setCategoryFilter(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 200 }}>
        <MenuItem value="">All categories</MenuItem>
        <MenuItem value="Equity">Equity</MenuItem>
        <MenuItem value="Bond">Bond</MenuItem>
        <MenuItem value="Mixed">Mixed</MenuItem>
        <MenuItem value="Money Market">Money Market</MenuItem>
      </TextField>

      {/* Table */}
      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {['Fund name', 'Category', 'Risk', 'YTD', '1Y', '3Y', 'AUM (M€)', 'ISIN'].map(h => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 600 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {funds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No funds found. Run the Python seeder to load data.
                </TableCell>
              </TableRow>
            ) : (
              funds.map(fund => (
                <TableRow key={fund.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {fund.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{fund.category}</TableCell>
                  <TableCell>
                    <Chip
                      label={fund.riskLevel}
                      color={riskColor[fund.riskLevel] || 'default'}
                      size="small"
                    />
                  </TableCell>
                  <ReturnCell value={fund.returnYtd} />
                  <ReturnCell value={fund.returnOneYear} />
                  <ReturnCell value={fund.returnThreeYear} />
                  <TableCell>
                    {fund.aum?.toLocaleString('de-US', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {fund.isin}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}