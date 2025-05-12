import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from '../src/pages/SplashScreen'
import Login from '../src/pages/LoginPage'
import Home from '../src/pages/HomePage'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
            <Routes>
                <Route path='/' element={<SplashScreen/>} />
                <Route path='/login' element={<Login/>} />
                <Route path='/home' element={<Home/>} />
            </Routes>
        </Router>
  </StrictMode>,
)
