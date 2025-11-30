import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'

export default function Layout() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState(null)
  const [subcategoryFilter, setSubcategoryFilter] = useState(null)

  const handleCategoryFilter = (category, subcategory = null) => {
    setCategoryFilter(category)
    setSubcategoryFilter(subcategory)
  }

  return (
    <div>
      <Header onSearch={setSearchQuery} onCategoryFilter={handleCategoryFilter} />
      <main>
        <Outlet context={{ searchQuery, categoryFilter, subcategoryFilter }} />
      </main>
      <Footer />
    </div>
  )
}

