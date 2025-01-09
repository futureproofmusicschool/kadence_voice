import React from 'react';
import ConfigForm from './components/ConfigForm';
import AudioChat from './components/AudioChat';
import { SessionProvider } from './contexts/SessionContext';

function App() {
  return (
    <SessionProvider>
      <div>
        <h1>Gemini Voice Chat</h1>
        <ConfigForm />
        <AudioChat />
      </div>
    </SessionProvider>
  );
}

export default App;