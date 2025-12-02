import { useState } from 'react'
import ProductGrid from '../components/ProductGrid'
import Checkout from '../components/Checkout'
import OrderHistory from '../components/OrderHistory'
import Story from '../components/Story'

export default function Home() {
  const [priceFilter, setPriceFilter] = useState('all')

  return (
    <>
      <ProductGrid priceFilterFromHeader={priceFilter} />
      <Story />
      <Checkout />
      <OrderHistory />
    </>
  )
}

