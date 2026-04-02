import { useState, useEffect } from 'react'
import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Chip, Typography,
  CircularProgress, Box, Alert, TextField, MenuItem,
  IconButton
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import { fundApi } from '../services/fundApi'

const riskColor = {
  Low: 'success',
  Medium: 'warning',
  High: 'error',
}

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

export default function FundsTable({ onChatOpen }) {
  const [funds, setFunds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    setLoading(true)
    const request = categoryFilter
      ? fundApi.getFundsByCategory(categoryFilter)
      : fundApi.getAllFunds()

    request
      .then(res => {
        console.log('API response:', res)
        console.log('API data:', res.data)
        setFunds(res.data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [categoryFilter])

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

      <TableContainer component={Paper} elevation={2}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              {['Fund name', 'Category', 'Risk', 'YTD', '1Y', '3Y', 'AUM (M€)', 'ISIN', 'AI Chat'].map(h => (
                <TableCell key={h} sx={{ color: 'white', fontWeight: 600 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {funds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
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
                    {fund.aum?.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {fund.isin}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary" onClick={() => onChatOpen(fund)}>
                      <SmartToyIcon fontSize="small" />
                    </IconButton>
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