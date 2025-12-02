import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import './Header.css'

export default function Header({ onSearch, onCategoryFilter, onPriceFilter }) {
  const { cartCount } = useCart()
  const [searchValue, setSearchValue] = useState('')
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinCode, setPinCode] = useState('')
  const [pinMessage, setPinMessage] = useState('')
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showPriceDropdown, setShowPriceDropdown] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState('all')

  const handleCategoryClick = (category, subcategory = null) => {
    setShowCategoryDropdown(false)
    if (onCategoryFilter) {
      onCategoryFilter(category, subcategory)
    }
    // Scroll to products section
    const productsSection = document.getElementById('collections')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(searchValue)
    }
    // Scroll to products section
    const productsSection = document.getElementById('collections')
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleCheckPin = () => {
    if (!pinCode || pinCode.length !== 6) {
      setPinMessage('Please enter a valid 6-digit pin code')
      return
    }
    
    // Simulate pin code check
    const deliveryDays = Math.floor(Math.random() * 3) + 2 // 2-4 days
    setPinMessage(`✓ Delivery available in ${deliveryDays} days for pin code ${pinCode}`)
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setShowPinModal(false)
      setPinCode('')
      setPinMessage('')
    }, 3000)
  }

  return (
    <>
      <header className="nav nav--stacked">
      <div className="nav__top">
        <Link to="/" className="nav__logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src="/assets/brand-logo.jpeg" alt="Indiaborn logo" />
          <div>
            <strong>Indiaborn™</strong>
          </div>
        </Link>
        <div className="nav__icons">
          <a className="nav__link" href="#order-history">Sign in ›</a>
          <button
            className="icon-button icon-button--cart"
            aria-label="View cart"
            onClick={() => {
              const checkoutSection = document.getElementById('checkout')
              if (checkoutSection) {
                checkoutSection.scrollIntoView({ behavior: 'smooth' })
              }
            }}
          >
            <span className="icon-cart"></span>
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>

      <form className="nav__search" role="search" onSubmit={handleSearch}>
        <input
          id="searchInput"
          name="search"
          placeholder="Search Indiaborn™"
          aria-label="Search products"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value)
            if (onSearch) {
              onSearch(e.target.value)
            }
          }}
        />
        <button type="submit" aria-label="Search">
          <span className="icon-search"></span>
        </button>
      </form>

      <div className="nav__subnav">
        <span>Shop by</span>
        <nav>
          <div className="category-dropdown">
            <button 
              type="button"
              className="category-dropdown-btn"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              Category ▾
            </button>
            {showCategoryDropdown && (
              <div className="category-dropdown-menu">
                <a href="#collections" onClick={() => handleCategoryClick(null)}>All Products</a>
                
                <div className="category-submenu">
                  <span className="category-submenu-label">Jewelry ›</span>
                  <div className="category-submenu-items">
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Necklaces')}>Necklaces</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Earrings')}>Earrings</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Rings')}>Rings</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Bracelets')}>Bracelets</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Bangles')}>Bangles</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Jewelry', 'Anklets')}>Anklets</a>
                  </div>
                </div>
                
                <div className="category-submenu">
                  <span className="category-submenu-label">Sports Equipment ›</span>
                  <div className="category-submenu-items">
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Cricket')}>Cricket</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Football')}>Football</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Tennis')}>Tennis</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Badminton')}>Badminton</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Basketball')}>Basketball</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Hockey')}>Hockey</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Sports Equipment', 'Gym & Fitness')}>Gym & Fitness</a>
                  </div>
                </div>
                
                <div className="category-submenu">
                  <span className="category-submenu-label">Clothing ›</span>
                  <div className="category-submenu-items">
                    <a href="#collections" onClick={() => handleCategoryClick('Clothing', 'Men')}>Men</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Clothing', 'Women')}>Women</a>
                    <a href="#collections" onClick={() => handleCategoryClick('Clothing', 'Kids')}>Kids</a>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="category-dropdown">
            <button 
              type="button"
              className="category-dropdown-btn"
              onClick={() => setShowPriceDropdown(!showPriceDropdown)}
            >
              Price ▾
            </button>
            {showPriceDropdown && (
              <div className="category-dropdown-menu">
                <a href="#collections" onClick={() => {
                  setSelectedPrice('all');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('all');
                }}>All</a>
                <a href="#collections" onClick={() => {
                  setSelectedPrice('under-299');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('under-299');
                }}>Under ₹299</a>
                <a href="#collections" onClick={() => {
                  setSelectedPrice('300-599');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('300-599');
                }}>₹300 - ₹599</a>
                <a href="#collections" onClick={() => {
                  setSelectedPrice('600-999');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('600-999');
                }}>₹600 - ₹999</a>
                <a href="#collections" onClick={() => {
                  setSelectedPrice('1000-1999');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('1000-1999');
                }}>₹1,000 - ₹1,999</a>
                <a href="#collections" onClick={() => {
                  setSelectedPrice('2000-plus');
                  setShowPriceDropdown(false);
                  if (onPriceFilter) onPriceFilter('2000-plus');
                }}>₹2,000+</a>
              </div>
            )}
          </div>
          <a href="#collections">Deals</a>
          <Link to="/admin">Sell</Link>
          <a href="#story">Story</a>
          <a href="#order-history">Order History</a>
        </nav>
      </div>

      <div className="nav__location">
        <span>Delivering pan-India from Pimple Gurav, Pune</span>
        <button type="button" onClick={() => setShowPinModal(true)}>Check pin code</button>
      </div>

      {showPinModal && (
        <div className="pin-modal-overlay" onClick={() => setShowPinModal(false)}>
          <div className="pin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pin-modal-header">
              <h3>Check Delivery Availability</h3>
              <button 
                className="pin-modal-close" 
                onClick={() => setShowPinModal(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="pin-modal-body">
              <label htmlFor="pinCodeInput">Enter your pin code:</label>
              <div className="pin-input-group">
                <input
                  id="pinCodeInput"
                  type="text"
                  placeholder="e.g., 411027"
                  maxLength="6"
                  value={pinCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '')
                    setPinCode(value)
                    setPinMessage('')
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCheckPin()
                    }
                  }}
                />
                <button 
                  type="button" 
                  className="pin-check-btn"
                  onClick={handleCheckPin}
                >
                  Check
                </button>
              </div>
              {pinMessage && (
                <p className={`pin-message ${pinMessage.includes('✓') ? 'success' : 'error'}`}>
                  {pinMessage}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
    </>
  )
}

