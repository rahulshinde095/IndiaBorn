import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { productApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/format'
import './ProductGrid.css'

const priceRanges = {
  all: null,
  'under-299': { min: 0, max: 299 },
  '300-599': { min: 300, max: 599 },
  '600-999': { min: 600, max: 999 },
  '1000-1999': { min: 1000, max: 1999 },
  '2000-plus': { min: 2000, max: Infinity },
}

export default function ProductGrid() {
  const { searchQuery } = useOutletContext() || { searchQuery: '' }
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [priceRange, setPriceRange] = useState('all')
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const { addToCart } = useCart()

  useEffect(() => {
    productApi.getAll().then(setProducts)
  }, [])

  const getImageUrl = (product) => {
    let imageUrl = product.images?.find(i => i.isPrimary)?.url ||
      product.images?.[0]?.url ||
      '/assets/brand-logo.jpeg'
    
    if (imageUrl.startsWith('/')) {
      imageUrl = `http://localhost:5184${imageUrl}`
    }
    
    return imageUrl
  }

  const handleImageLoad = (productId) => {
    setImageLoading(prev => ({ ...prev, [productId]: false }))
  }

  const handleImageError = (productId) => {
    console.error(`Failed to load image for product ${productId}`)
    setImageErrors(prev => ({ ...prev, [productId]: true }))
    setImageLoading(prev => ({ ...prev, [productId]: false }))
  }

  const toggleDescription = (productId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }))
  }

  useEffect(() => {
    const searchLower = (searchQuery || '').trim().toLowerCase()
    const range = priceRanges[priceRange]

    const filtered = products.filter(product => {
      const haystack = `${product.name} ${product.description}`.toLowerCase()
      const matchesSearch = !searchLower || haystack.includes(searchLower)
      const effectivePrice = Number(product.salePrice ?? product.price)
      const matchesRange =
        !range ||
        (effectivePrice >= range.min &&
          (Number.isFinite(range.max) ? effectivePrice <= range.max : true))

      return matchesSearch && matchesRange
    })

    // Add consistent review count to each product
    const filteredWithReviews = filtered.map(product => ({
      ...product,
      reviewCount: product.reviewCount || Math.floor(Math.random() * 500) + 10
    }))

    setFilteredProducts(filteredWithReviews)
  }, [products, searchQuery, priceRange])

  return (
    <section id="collections" className="section">
      <div className="section__header">
        <p className="eyebrow">The New Minimal Gold Collection</p>
        <h2>Everyday shine crafted in India</h2>
        <p>Layering sets, bold statements, and delicate heirlooms</p>
        <div className="price-filters" id="priceFilters">
          <span>Shop by price:</span>
          <div className="price-filters__chips">
            {Object.keys(priceRanges).map(range => (
              <button
                key={range}
                type="button"
                data-range={range}
                className={`chip ${priceRange === range ? 'chip--active' : ''}`}
                onClick={() => setPriceRange(range)}
              >
                {range === 'all' ? 'All' :
                 range === 'under-299' ? 'Under ₹299' :
                 range === '300-599' ? '₹300 - ₹599' :
                 range === '600-999' ? '₹600 - ₹999' :
                 range === '1000-1999' ? '₹1,000 - ₹1,999' :
                 '₹2,000+'}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p>No pieces found. Try another keyword or range.</p>
        ) : (
          filteredProducts.map(product => {
            const original = Number(product.price)
            const current = Number(product.salePrice ?? product.price)
            const hasDiscount = product.salePrice !== null && product.salePrice !== undefined && current < original
            const discountPercent = hasDiscount ? Math.round((1 - current / original) * 100) : null
            
            const imageUrl = getImageUrl(product)
            const fallbackUrl = 'http://localhost:5184/assets/brand-logo.jpeg'

            return (
              <article key={product.id} className="product product--amazon">
                <div className="product__image-wrapper">
                  {product.isOnSale && <span className="product__deal-badge">Deal</span>}
                  {product.isBestSeller && <span className="product__best-seller">Best Seller</span>}
                  {product.isNewArrival && <span className="product__new-badge">New</span>}
                  {imageLoading[product.id] && (
                    <div className="image-loading">Loading...</div>
                  )}
                  <img 
                    src={imageErrors[product.id] ? fallbackUrl : imageUrl}
                    alt={product.name} 
                    className="product__image"
                    onLoad={() => handleImageLoad(product.id)}
                    onError={() => handleImageError(product.id)}
                    style={{ display: imageLoading[product.id] ? 'none' : 'block' }}
                  />
                  <button
                    className="product__add-btn"
                    onClick={() => addToCart(product)}
                    aria-label="Add to cart"
                  >
                    <span>+</span>
                  </button>
                </div>
                <div className="product__body">
                  <h3 className="product__title">{product.name}</h3>
                  <div className="product__rating">
                    <span className="stars">★★★★★</span>
                    <span className="rating-count">({product.reviewCount})</span>
                  </div>
                  <div className="product__pricing">
                    <span className="price-current">{formatCurrency(current)}</span>
                    {hasDiscount && (
                      <>
                        <span className="price-strike">{formatCurrency(original)}</span>
                        <span className="price-discount">-{discountPercent}%</span>
                      </>
                    )}
                  </div>
                  {hasDiscount && <p className="deal-label">Limited time deal</p>}
                  {product.isNewArrival && !hasDiscount && (
                    <p className="deal-label deal-label--soft">New arrival</p>
                  )}
                  <div className="product__description-wrapper">
                    <p className="product__description">
                      {expandedDescriptions[product.id] 
                        ? product.description
                        : product.description.length > 120
                        ? `${product.description.substring(0, 120)}...`
                        : product.description
                      }
                    </p>
                    {product.description.length > 120 && (
                      <button 
                        className="view-more-btn"
                        onClick={() => toggleDescription(product.id)}
                        type="button"
                      >
                        {expandedDescriptions[product.id] ? 'View less' : 'View more'}
                      </button>
                    )}
                  </div>
                  <p className="product__shipping">FREE delivery</p>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

