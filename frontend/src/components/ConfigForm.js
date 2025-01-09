import React, { useState, useContext } from 'react';
import { TextField, Button, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import api from '../services/api';
import { SessionContext } from '../contexts/SessionContext';

const ConfigForm = () => {
  const [voice, setVoice] = useState('Puck');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { setSessionData } = useContext(SessionContext);

  const voices = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/config', {
        voice,
        api_key: apiKey,
        session_id: "your_unique_session_id" // Replace with your session ID generation
      });
      setSessionData({ sessionId: response.data.session_id, token: response.data.token });
    } catch (err) {
      setError(err.message || 'Failed to set configuration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl fullWidth margin="normal">
        <InputLabel id="voice-label">Voice</InputLabel>
        <Select
          labelId="voice-label"
          value={voice}
          onChange={(e) => setVoice(e.target.value)}
          required
        >
          {voices.map((v) => (
            <MenuItem key={v} value={v}>
              {v}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="API Key"
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        fullWidth
        margin="normal"
        required
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? <CircularProgress size={24} /> : 'Submit'}
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default ConfigForm;