import { useState } from 'react'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AppBar, Toolbar, Typography, Container, Box } from '@mui/material'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import FundsTable from './components/FundsTable'
import ChatDrawer from './components/ChatDrawer'

const theme = createTheme({
  palette: {
    primary: { main: '#003781' },
    secondary: { main: '#e84e0f' },
    background: { default: '#f5f7fa' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
})

export default function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedFund, setSelectedFund] = useState(null)

  const handleChatOpen = (fund) => {
    setSelectedFund(fund)
    setChatOpen(true)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <AccountBalanceIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" fontWeight={600}>FundFlow</Typography>
          <Typography variant="body2" sx={{ ml: 1, opacity: 0.7 }}>
            Asset Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Typography variant="h5" fontWeight={600}>Investment Funds</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Click the AI icon on any fund to open the chat advisor
            </Typography>
          </Box>
          <FundsTable onChatOpen={handleChatOpen} />
        </Container>
      </Box>

      <ChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        fund={selectedFund}
      />
    </ThemeProvider>
  )
}