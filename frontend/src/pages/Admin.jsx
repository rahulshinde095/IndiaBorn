import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authApi, productApi, adminApi, uploadApi } from '../services/api'
import './Admin.css'

const STORAGE_KEY = 'indiaborn-admin-token'

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem(STORAGE_KEY))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [productMessage, setProductMessage] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    salePrice: '',
    inventory: '',
    category: '',
    subCategory: '',
    productType: '',
    gender: '',
    sport: '',
    material: '',
    brand: '',
    availableSizes: [],
    availableColors: [],
    imageUrl: '',
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
  })
  const [imageFile, setImageFile] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedImageUrl, setUploadedImageUrl] = useState('')

  useEffect(() => {
    if (token) {
      loadDashboard()
    }
  }, [token])

  const loadDashboard = async () => {
    try {
      const [overview, productsData, ordersData] = await Promise.all([
        adminApi.getOverview(token),
        productApi.getAll(),
        adminApi.getOrders(token),
      ])
      setStats(overview)
      setProducts(productsData)
      setOrders(ordersData)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      if (error.message.includes('401') || error.message.includes('403')) {
        handleLogout()
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setAuthMessage('Signing in...')
    try {
      const result = await authApi.login({ email, password })
      setToken(result.token)
      localStorage.setItem(STORAGE_KEY, result.token)
      setEmail('')
      setPassword('')
      setAuthMessage('')
    } catch (error) {
      setAuthMessage('Invalid credentials.')
    }
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem(STORAGE_KEY)
    setProducts([])
    setOrders([])
    setStats(null)
    setEditingProduct(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      salePrice: '',
      inventory: '',
      category: '',
      subCategory: '',
      productType: '',
      gender: '',
      sport: '',
      material: '',
      brand: '',
      availableSizes: [],
      availableColors: [],
      imageUrl: '',
      isBestSeller: false,
      isNewArrival: false,
      isOnSale: false,
    })
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    console.log('File selected:', file.name, 'Size:', file.size)
    setImageFile(file)
    setUploadingImage(true)
    setProductMessage(`Uploading ${file.name}...`)

    try {
      const result = await uploadApi.uploadImage(file, token)
      console.log('Upload successful:', result.url)
      
      setUploadedImageUrl(result.url)
      setFormData(prev => ({ ...prev, imageUrl: result.url }))
      setProductMessage(`✓ ${file.name} uploaded successfully!`)
    } catch (error) {
      console.error('Upload failed:', error)
      setImageFile(null)
      setUploadedImageUrl('')
      setProductMessage(`Failed to upload: ${error.message}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product.id)
    const existingImageUrl = product.images?.[0]?.url || ''
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      salePrice: product.salePrice?.toString() || '',
      inventory: product.inventoryCount.toString(),
      category: product.category || '',
      subCategory: product.subCategory || '',
      productType: product.productType || '',
      gender: product.gender || '',
      sport: product.sport || '',
      material: product.material || '',
      brand: product.brand || '',
      availableSizes: product.availableSizes || [],
      availableColors: product.availableColors || [],
      imageUrl: existingImageUrl,
      isBestSeller: product.isBestSeller || false,
      isNewArrival: product.isNewArrival || false,
      isOnSale: product.isOnSale || false,
    })
    setUploadedImageUrl(existingImageUrl)
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await productApi.delete(id, token)
      setProductMessage('Product deleted.')
      loadDashboard()
    } catch (error) {
      setProductMessage(`Error: ${error.message}`)
    }
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()

    if (!formData.imageUrl && !editingProduct) {
      setProductMessage('Please select and wait for image upload to complete.')
      return
    }

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        inventoryCount: Number(formData.inventory),
        category: formData.category || 'Sports Equipment',
        subCategory: formData.subCategory || '',
        productType: formData.productType || '',
        gender: formData.gender || '',
        sport: formData.sport || '',
        material: formData.material || '',
        brand: formData.brand || '',
        availableSizes: formData.availableSizes,
        availableColors: formData.availableColors,
        isBestSeller: formData.isBestSeller,
        isNewArrival: formData.isNewArrival,
        isOnSale: formData.isOnSale,
        images: formData.imageUrl
          ? [{ url: formData.imageUrl, altText: formData.name, isPrimary: true }]
          : [],
      }

      console.log('💾 Saving product with data:', data)
      console.log('📋 Form gender value:', formData.gender)
      console.log('📋 Data gender value:', data.gender)

      if (editingProduct) {
        await productApi.update(editingProduct, data, token)
      } else {
        await productApi.create(data, token)
      }

      setProductMessage('Product saved successfully!')
      setFormData({
        name: '',
        description: '',
        price: '',
        salePrice: '',
        inventory: '',
        category: '',
        subCategory: '',
        productType: '',
        gender: '',
        sport: '',
        material: '',
        brand: '',
        availableSizes: [],
        availableColors: [],
        imageUrl: '',
        isBestSeller: false,
        isNewArrival: false,
        isOnSale: false,
      })
      setEditingProduct(null)
      setImageFile(null)
      setUploadedImageUrl('')
      loadDashboard()
    } catch (error) {
      setProductMessage(`Error: ${error.message}`)
    }
  }

  if (!token) {
    return (
      <div className="section">
        <div className="card narrow">
          <h2>Secure sign in</h2>
          <form onSubmit={handleLogin}>
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="button" type="submit">
              Login
            </button>
            <p className="feedback">{authMessage}</p>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="section admin">
      <header className="nav">
        <div className="nav__logo">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none', color: 'inherit' }}>
            <img src="/assets/brand-logo.jpeg" alt="Indiaborn logo" />
            <span>Indiaborn™ Admin</span>
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="button button--ghost" style={{ textDecoration: 'none' }}>
            Back to Store
          </Link>
          <button className="button button--ghost" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="admin-grid">
        <article className="card">
          <h3>Quick stats</h3>
          {stats && (
            <div className="stats">
              <div>
                <small>Orders</small>
                <h3>{stats.totalOrders}</h3>
              </div>
              <div>
                <small>Revenue</small>
                <h3>₹{stats.revenue.toFixed(2)}</h3>
              </div>
              <div>
                <small>Products</small>
                <h3>{stats.products}</h3>
              </div>
              <div>
                <small>Low stock</small>
                <h3>{stats.lowInventory}</h3>
              </div>
            </div>
          )}
        </article>

        <article className="card">
          <h3>Create / Update Product</h3>
          <form onSubmit={handleSaveProduct}>
            <label>
              Name
              <input
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </label>
            <label>
              Price (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </label>
            <label>
              Sale price (₹)
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
              />
            </label>
            <label>
              Inventory
              <input
                type="number"
                min="0"
                required
                value={formData.inventory}
                onChange={(e) => setFormData({ ...formData, inventory: e.target.value })}
              />
            </label>
            <label>
              Category
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select a category</option>
                <option value="Jewelry">Jewelry</option>
                <option value="Sports Equipment">Sports Equipment</option>
                <option value="Clothing">Clothing</option>
              </select>
            </label>
            
            {formData.category === 'Jewelry' && (
              <>
                <label>
                  Jewelry Type
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    required
                  >
                    <option value="">Select jewelry type</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Rings">Rings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Bangles">Bangles</option>
                    <option value="Anklets">Anklets</option>
                  </select>
                </label>
                <label>
                  Metal Type
                  <input
                    type="text"
                    placeholder="e.g., Gold, Silver, Rose Gold, Platinum"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  />
                </label>
                <label>
                  Purity
                  <input
                    type="text"
                    placeholder="e.g., 18K, 22K, 925 Sterling Silver"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  />
                </label>
                <label>
                  Available Sizes (Optional)
                  <input
                    type="text"
                    placeholder="e.g., 6, 7, 8, 9 (for rings) or leave empty"
                    value={formData.availableSizes.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      availableSizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                  />
                </label>
              </>
            )}
            
            {formData.category === 'Sports Equipment' && (
              <>
                <label>
                  Sport Type
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    required
                  >
                    <option value="">Select sport</option>
                    <option value="Cricket">Cricket</option>
                    <option value="Football">Football</option>
                    <option value="Tennis">Tennis</option>
                    <option value="Badminton">Badminton</option>
                    <option value="Basketball">Basketball</option>
                    <option value="Hockey">Hockey</option>
                    <option value="Volleyball">Volleyball</option>
                    <option value="Table Tennis">Table Tennis</option>
                    <option value="Swimming">Swimming</option>
                    <option value="Athletics">Athletics</option>
                    <option value="Gym & Fitness">Gym & Fitness</option>
                  </select>
                </label>
                <label>
                  Product Type
                  <input
                    type="text"
                    placeholder="e.g., Bat, Ball, Racket, Shoes"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  />
                </label>
              </>
            )}
            
            {formData.category === 'Clothing' && (
              <>
                <label>
                  Gender
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </label>
                <label>
                  Clothing Type
                  <select
                    value={formData.subCategory}
                    onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                    required
                  >
                    <option value="">Select clothing type</option>
                    <option value="T-Shirts & Shirts">T-Shirts & Shirts</option>
                    <option value="Trousers & Jeans">Trousers & Jeans</option>
                    <option value="Ethnic Wear">Ethnic Wear</option>
                    <option value="Winter Wear">Winter Wear</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </label>
                <label>
                  Product Type
                  <input
                    type="text"
                    placeholder="e.g., T-Shirt, Jersey, Shorts, Trackpants"
                    value={formData.productType}
                    onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                  />
                </label>
                <label>
                  Material
                  <input
                    type="text"
                    placeholder="e.g., Cotton, Polyester, Dri-FIT"
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  />
                </label>
                <label>
                  Available Sizes
                  <input
                    type="text"
                    placeholder="e.g., XS, S, M, L, XL, XXL (comma-separated)"
                    value={formData.availableSizes.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      availableSizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                  />
                </label>
                <label>
                  Available Colors
                  <input
                    type="text"
                    placeholder="e.g., Black, White, Blue (comma-separated)"
                    value={formData.availableColors.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      availableColors: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                    })}
                  />
                </label>
              </>
            )}
            
            <label>
              Brand (Optional)
              <input
                type="text"
                placeholder="e.g., Nike, Adidas, Puma"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </label>
            <div className="upload-section">
              <label>Product Image</label>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileSelect}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <p className="upload-status uploading">⏳ Uploading image...</p>
                )}
                {formData.imageUrl && !uploadingImage && (
                  <div className="image-preview">
                    <img 
                      src={formData.imageUrl.startsWith('/') ? `http://localhost:5184${formData.imageUrl}` : formData.imageUrl} 
                      alt="Preview" 
                    />
                    <p className="upload-status success">✓ Image ready</p>
                  </div>
                )}
              </div>
              <small>
                Or enter image URL:{' '}
                <input
                  type="text"
                  placeholder="/assets/products/image.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </small>
            </div>
            <div className="switches">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isBestSeller}
                  onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                />
                Best seller
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isNewArrival}
                  onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                />
                New arrival
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => setFormData({ ...formData, isOnSale: e.target.checked })}
                />
                On sale
              </label>
            </div>
            <button className="button" type="submit">
              Save product
            </button>
            <p className="feedback">{productMessage}</p>
          </form>
        </article>

        <article className="card">
          <h3>Catalog</h3>
          <div>
            {products.length === 0 ? (
              <p>No products yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>₹{(p.salePrice ?? p.price).toFixed(2)}</td>
                      <td>{p.inventoryCount}</td>
                      <td>
                        <button onClick={() => handleEditProduct(p)}>Edit</button>
                        <button
                          className="button button--ghost"
                          onClick={() => handleDeleteProduct(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>

        <article className="card">
          <h3>Orders</h3>
          <div>
            {orders.length === 0 ? (
              <p>No orders.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.referenceCode}</td>
                      <td>{o.status}</td>
                      <td>₹{o.total.toFixed(2)}</td>
                      <td>{new Date(o.updatedAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

