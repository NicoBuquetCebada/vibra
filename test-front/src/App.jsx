import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react'
import Login from './pages/Login';
import Home from './pages/Home';
import { getToken } from './auth';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={getToken() ? <Navigate to="/home" /> : <Login />} />
        <Route path="/home" element={getToken() ? <Home /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
