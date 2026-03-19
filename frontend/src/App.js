// ajuste deploy
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chat from './components/Chat/UnifiedChat';
import Kanban from './pages/Kanban';
import Settings from './pages/Settings';
import Pricing from './pages/Pricing';

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Pricing />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
        <Route path="/chat" element={user ? <Chat user={user} /> : <Navigate to="/login" />} />
        <Route path="/kanban" element={user ? <Kanban user={user} /> : <Navigate to="/login" />} />
        <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;