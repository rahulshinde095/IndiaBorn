import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Admin from './pages/Admin'
import './App.css'

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
          </Route>
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  )
}

export default App

