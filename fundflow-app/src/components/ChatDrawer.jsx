import { useState, useRef, useEffect } from 'react'
import {
  Drawer, Box, Typography, TextField, IconButton,
  List, ListItem, Paper, CircularProgress, Divider, Chip
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import { chatApi } from '../services/chatApi'

const DRAWER_WIDTH = 400

export default function ChatDrawer({ open, onClose, fund }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Reset messages when a different fund is selected
  useEffect(() => {
    if (fund) {
      setMessages([{
        role: 'assistant',
        text: `Hello! I'm your AI advisor for **${fund.name}**. Ask me anything about this fund.`
      }])
    }
  }, [fund?.id])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Add user message immediately to the UI
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setLoading(true)

    try {
      const res = await chatApi.sendMessage(fund.id, userMessage)
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  // Send on Enter key (Shift+Enter for new line)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: DRAWER_WIDTH } }}>

      {/* Header */}
      <Box sx={{
        p: 2,
        backgroundColor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <SmartToyIcon />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              AI Fund Advisor
            </Typography>
            {fund && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {fund.name}
              </Typography>
            )}
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Fund context chips */}
      {fund && (
        <Box sx={{ px: 2, py: 1, backgroundColor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" gap={1} flexWrap="wrap">
            <Chip label={fund.category} size="small" variant="outlined" />
            <Chip label={`Risk: ${fund.riskLevel}`} size="small" variant="outlined"
              color={fund.riskLevel === 'High' ? 'error' : fund.riskLevel === 'Medium' ? 'warning' : 'success'} />
            <Chip label={`YTD: ${fund.returnYtd > 0 ? '+' : ''}${fund.returnYtd?.toFixed(2)}%`}
              size="small" variant="outlined"
              color={fund.returnYtd >= 0 ? 'success' : 'error'} />
          </Box>
        </Box>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        <List disablePadding>
          {messages.map((msg, i) => (
            <ListItem key={i} disablePadding sx={{
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              mb: 1.5
            }}>
              <Box display="flex" alignItems="flex-start" gap={1}
                flexDirection={msg.role === 'user' ? 'row-reverse' : 'row'}>

                {/* Avatar */}
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: msg.role === 'user' ? 'primary.main' : 'grey.200',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {msg.role === 'user'
                    ? <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                    : <SmartToyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                </Box>

                {/* Bubble */}
                <Paper elevation={0} sx={{
                  p: 1.5,
                  maxWidth: '75%',
                  backgroundColor: msg.role === 'user' ? 'primary.main' : 'grey.100',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: msg.role === 'user'
                    ? '16px 4px 16px 16px'
                    : '4px 16px 16px 16px',
                }}>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            </ListItem>
          ))}

          {/* Loading indicator */}
          {loading && (
            <ListItem disablePadding sx={{ mb: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Box sx={{
                  width: 28, height: 28, borderRadius: '50%',
                  backgroundColor: 'grey.200',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <SmartToyIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Box>
                <Paper elevation={0} sx={{ p: 1.5, backgroundColor: 'grey.100', borderRadius: '4px 16px 16px 16px' }}>
                  <CircularProgress size={16} />
                </Paper>
              </Box>
            </ListItem>
          )}
          <div ref={bottomRef} />
        </List>
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'flex-end' }}>
        <TextField
          fullWidth
          multiline
          maxRows={3}
          size="small"
          placeholder="Ask about this fund..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <IconButton
          color="primary"
          onClick={sendMessage}
          disabled={!input.trim() || loading}
          sx={{ flexShrink: 0 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Drawer>
  )
}