import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Button, Container, TextField, Typography, Box, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Snackbar, IconButton, Tooltip, Paper, Switch
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { saveAs } from 'file-saver';


function App() {
  const [prompt, setPrompt] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Template List
const templates = [
  { name: "Blog Post", description: "Structured template for a blog post." },
  { name: "Social Media Post", description: "Template for Instagram/Facebook posts." },
  { name: "Report", description: "A simple report template with sections." },
];


  // Load history from local storage on initial load
  useEffect(() => {
    const savedHistory = localStorage.getItem('contentHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Function to generate content
  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      setSnackbarMessage('Please enter a prompt');
      setSnackbarOpen(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/generate-content', { prompt });
      const generatedContent = response.data.content;
      setContent(generatedContent);
      setWordCount(generatedContent.split(/\s+/).length);

      // Update history and save to local storage
      const newHistory = [{ title: prompt, content: generatedContent, date: new Date().toISOString() }, ...history];
      setHistory(newHistory);
      localStorage.setItem('contentHistory', JSON.stringify(newHistory));
      setPrompt('');
      setSnackbarMessage('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  // Function to save content to file
  const handleSaveContent = (content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'generated_content.txt');
  };

  // Delete history entry
  const handleDeleteHistory = (index) => {
    const newHistory = history.filter((_, i) => i !== index);
    setHistory(newHistory);
    localStorage.setItem('contentHistory', JSON.stringify(newHistory));
    setSnackbarMessage('History entry deleted');
    setSnackbarOpen(true);
  };

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: '#1976d2' },
      secondary: { main: '#f50057' },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ display: 'flex', height: '100vh', flexDirection: 'column', padding: 2 }}>
        {/* Header Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">AI Content Generator</Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="body1" sx={{ mr: 1 }}>Light Mode</Typography>
            <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
            <Typography variant="body1">Dark Mode</Typography>
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box display="flex" flex={1} mt={3}>
          {/* Content Generation Section */}
          <Box sx={{ flex: 3, pr: 2 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
              <Typography variant="h6" gutterBottom>Enter Prompt</Typography>
              <TextField
                label="Prompt"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleGenerateContent}
                disabled={loading}
                fullWidth
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Generate'}
              </Button>
              {/* Display generated content */}
              {content && (
                <Paper elevation={1} sx={{ padding: 2, marginTop: 2 }}>
                  <Typography variant="h6">Generated Content:</Typography>
                  <Typography variant="body1">{content}</Typography>
                  <Typography variant="caption">Word Count: {wordCount}</Typography>
                </Paper>
              )}
            </Paper>
          </Box>

          {/* Sidebar for History */}
          <Box sx={{ flex: 2, overflowY: 'auto', pl: 2 }}>
            <Typography variant="h6">History</Typography>
            {history.map((item, index) => (
              <Accordion key={index}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">{item.title}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>{item.content}</Typography>
                  <Box display="flex" justifyContent="flex-end" mt={1}>
                    <Tooltip title="Save">
                      <IconButton color="primary" onClick={() => handleSaveContent(item.content)}>
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="secondary" onClick={() => handleDeleteHistory(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Box>

        {/* Snackbar Notification */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Container>
    </ThemeProvider>
  );
}

export default App;
