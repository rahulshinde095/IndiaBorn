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

export default function ProductGrid({ categoryFilter = null, subcategoryFilter = null }) {
  const outletContext = useOutletContext() || {}
  const { searchQuery, categoryFilter: contextCategoryFilter, subcategoryFilter: contextSubcategoryFilter, priceFilter } = outletContext
  
  // Use props if provided, otherwise use context (for flexibility)
  const activeCategoryFilter = categoryFilter || contextCategoryFilter || null
  const activeSubcategoryFilter = subcategoryFilter || contextSubcategoryFilter || null
  const priceRange = priceFilter || 'all'
  
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [imageErrors, setImageErrors] = useState({})
  const [imageLoading, setImageLoading] = useState({})
  const [expandedDescriptions, setExpandedDescriptions] = useState({})
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const { addToCart } = useCart()

  useEffect(() => {
    productApi.getAll().then(setProducts)
  }, [])

  const getImageUrl = (product) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5184';
    let imageUrl = product.images?.find(i => i.isPrimary)?.url ||
      product.images?.[0]?.url ||
      '/assets/brand-logo.jpeg'
    
    if (imageUrl.startsWith('/')) {
      imageUrl = `${API_URL}${imageUrl}`
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

    console.log('Filtering products:', {
      totalProducts: products.length,
      activeCategoryFilter,
      activeSubcategoryFilter,
      sampleProduct: products[0]
    })

    const filtered = products.filter(product => {
      const haystack = `${product.name} ${product.description}`.toLowerCase()
      const matchesSearch = !searchLower || haystack.includes(searchLower)
      const effectivePrice = Number(product.salePrice ?? product.price)
      const matchesRange =
        !range ||
        (effectivePrice >= range.min &&
          (Number.isFinite(range.max) ? effectivePrice <= range.max : true))

      // Category filtering (case-insensitive)
      const matchesCategory = !activeCategoryFilter || 
        (product.category && product.category.toLowerCase() === activeCategoryFilter.toLowerCase())
      
      // Subcategory filtering (checks subCategory, sport, and gender fields, case-insensitive)
      const matchesSubcategory = !activeSubcategoryFilter || 
        (product.subCategory && product.subCategory.toLowerCase() === activeSubcategoryFilter.toLowerCase()) ||
        (product.sport && product.sport.toLowerCase() === activeSubcategoryFilter.toLowerCase()) ||
        (product.gender && product.gender.toLowerCase() === activeSubcategoryFilter.toLowerCase())

      const matches = matchesSearch && matchesRange && matchesCategory && matchesSubcategory
      
      // Debug logging for first product
      if (product === products[0]) {
        console.log('First product filter check:', {
          productName: product.name,
          productCategory: product.category,
          productGender: product.gender,
          productSport: product.sport,
          matchesCategory,
          matchesSubcategory,
          finalMatch: matches
        })
      }

      return matches
    })

    console.log('Filtered results:', filtered.length)

    // Add consistent review count to each product
    const filteredWithReviews = filtered.map(product => ({
      ...product,
      reviewCount: product.reviewCount || Math.floor(Math.random() * 500) + 10
    }))

    setFilteredProducts(filteredWithReviews)
  }, [products, searchQuery, priceRange, activeCategoryFilter, activeSubcategoryFilter])

  return (
    <section id="collections" className="section">
      <div className="section__header">
        <p className="eyebrow">Your One-Stop Shop for Everything</p>
        <h2>Sports, Fashion & Lifestyle - All in One Place</h2>
        <p>Premium sports equipment, trendy clothing, and quality products for every need</p>
        {(activeCategoryFilter || activeSubcategoryFilter) && (
          <div style={{ marginTop: '1rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Active Filter: </strong>
            {activeCategoryFilter && <span>{activeCategoryFilter}</span>}
            {activeSubcategoryFilter && <span> → {activeSubcategoryFilter}</span>}
            <button 
              onClick={() => window.location.reload()} 
              style={{ marginLeft: '1rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            <p>No products found.</p>
            {products.length === 0 ? (
              <p style={{ marginTop: '1rem' }}>
                The database is empty. Please add products through the <a href="/admin" style={{ color: '#c9a668' }}>Admin Panel</a>.
              </p>
            ) : (
              <p style={{ marginTop: '1rem' }}>
                Try adjusting your filters or search criteria.
                {(activeCategoryFilter || activeSubcategoryFilter) && (
                  <span> Current filter: {activeCategoryFilter} {activeSubcategoryFilter && `→ ${activeSubcategoryFilter}`}</span>
                )}
              </p>
            )}
          </div>
        ) : (
          filteredProducts.map(product => {
            const original = Number(product.price)
            const current = Number(product.salePrice ?? product.price)
            const hasDiscount = product.salePrice !== null && product.salePrice !== undefined && current < original
            const discountPercent = hasDiscount ? Math.round((1 - current / original) * 100) : null
            
            const imageUrl = getImageUrl(product)
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5184';
            const fallbackUrl = `${API_URL}/assets/brand-logo.jpeg`

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
                    className="product__image product__image--clickable"
                    onLoad={() => handleImageLoad(product.id)}
                    onError={() => handleImageError(product.id)}
                    onClick={() => setFullscreenImage({ url: imageErrors[product.id] ? fallbackUrl : imageUrl, name: product.name, product: product })}
                    style={{ display: imageLoading[product.id] ? 'none' : 'block', cursor: 'pointer' }}
                    title="Click to view fullscreen"
                  />
                </div>
                <button
                  className="product__cart-btn"
                  onClick={() => addToCart(product)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 3.5H3.5L5.5 11.5H13.5L15.5 5.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="14" r="1" fill="currentColor"/>
                    <circle cx="12" cy="14" r="1" fill="currentColor"/>
                  </svg>
                  Add to Cart
                </button>
                <div className="product__body">
                  <h3 className="product__title">{product.name}</h3>
                  {(product.brand || product.sport || product.gender) && (
                    <div className="product__meta">
                      {product.brand && <span className="meta-badge">{product.brand}</span>}
                      {product.sport && <span className="meta-badge">{product.sport}</span>}
                      {product.gender && <span className="meta-badge">{product.gender}</span>}
                    </div>
                  )}
                  {product.availableSizes && product.availableSizes.length > 0 && (
                    <div className="product__sizes">
                      <small>Sizes: {product.availableSizes.join(', ')}</small>
                    </div>
                  )}
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
      
      {fullscreenImage && (
        <div className="fullscreen-modal" onClick={() => setFullscreenImage(null)}>
          <div className="fullscreen-modal__content" onClick={(e) => e.stopPropagation()}>
            <button className="fullscreen-modal__close" onClick={() => setFullscreenImage(null)} aria-label="Close">
              ×
            </button>
            <img src={fullscreenImage.url} alt={fullscreenImage.name} className="fullscreen-modal__image" />
            <div className="fullscreen-modal__info">
              <p className="fullscreen-modal__caption">{fullscreenImage.name}</p>
              <button 
                className="fullscreen-modal__cart-btn"
                onClick={() => {
                  addToCart(fullscreenImage.product);
                  setFullscreenImage(null);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 3.5H3.5L5.5 11.5H13.5L15.5 5.5H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="14" r="1" fill="currentColor"/>
                  <circle cx="12" cy="14" r="1" fill="currentColor"/>
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

