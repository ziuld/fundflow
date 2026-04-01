import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import FundsTable from './components/FundsTable'

// Belfius brand colors — blue primary, clean white background
const theme = createTheme({
  palette: {
    primary: {
      main: '#003781',   // Belfius blue
    },
    secondary: {
      main: '#e84e0f',   // Belfius orange accent
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* normalizes browser default styles */}

      {/* Top navigation bar */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600}>
            FundFlow
          </Typography>
          <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
            Asset Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main content */}
      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">

          {/* Page header */}
          <Box mb={3}>
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Investment Funds
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Real-time fund performance and risk overview
            </Typography>
          </Box>

          {/* Funds table */}
          <FundsTable />

        </Container>
      </Box>
    </ThemeProvider>
  )
}