import { useState } from 'react'
import { orderApi } from '../services/api'
import { formatCurrency } from '../utils/format'
import './OrderHistory.css'

export default function OrderHistory() {
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const result = await orderApi.getHistory(email)
      setOrders(result)
    } catch (error) {
      console.error(error)
      setOrders([])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="section muted" id="order-history">
      <div className="section__header">
        <h2>Track past orders</h2>
        <p>
          Enter the email you used at checkout to see everything you've
          purchased.
        </p>
      </div>
      <form id="historyForm" className="history-form" onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="name@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="button button--ghost" type="submit" disabled={isLoading}>
          {isLoading ? 'Loading...' : 'View history'}
        </button>
      </form>
      <div id="historyResults" className="history-results">
        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          orders.map(order => (
            <div key={order.id} className="order-card">
              <strong>{order.referenceCode}</strong> &middot;{' '}
              {new Date(order.createdAt).toLocaleDateString()}
              <p>Status: {order.status}</p>
              <p>Total: {formatCurrency(order.total)}</p>
              {order.invoiceUrl && (
                <a 
                  href={`/api/orders/${order.id}/invoice`} 
                  download={`Invoice-${order.referenceCode}.pdf`}
                  className="button button--ghost"
                  style={{ marginTop: '10px', display: 'inline-block', padding: '8px 16px' }}
                >
                  📄 Download Invoice
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

