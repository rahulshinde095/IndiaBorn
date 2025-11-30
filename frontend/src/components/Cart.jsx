import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/format'
import './Cart.css'

export default function Cart() {
  const { cart, subtotal, taxes, total, removeFromCart } = useCart()

  return (
    <aside className="cart" id="cartPanel">
      <h3>Your bag</h3>
      <div id="cartItems">
        {cart.length === 0 ? (
          <p>Your bag is empty.</p>
        ) : (
          cart.map(item => (
            <div key={item.productId} className="cart__item">
              <div>
                <strong>{item.name}</strong>
                <p>{item.quantity} x {formatCurrency(item.price)}</p>
              </div>
              <button
                className="button button--ghost"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
      <div className="cart__totals">
        <div>
          <span>Subtotal</span>
          <strong id="cartSubtotal">{formatCurrency(subtotal)}</strong>
        </div>
        <div>
          <span>Shipping</span>
          <strong>FREE</strong>
        </div>
        <div>
          <span>Taxes</span>
          <strong id="cartTaxes">{formatCurrency(taxes)}</strong>
        </div>
        <div className="grand">
          <span>Total</span>
          <strong id="cartTotal">{formatCurrency(total)}</strong>
        </div>
      </div>
    </aside>
  )
}

