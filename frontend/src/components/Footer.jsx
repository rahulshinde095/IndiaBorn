import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer footer--mega">
      <a href="#" className="footer__top">TOP OF PAGE</a>
      <div className="footer__grid">
        <div>
          <h4>Your Indiaborn™</h4>
          <a href="#order-history">Your orders</a>
          <a href="#collections">Your lists</a>
          <a href="#story">Recently viewed</a>
          <a href="#checkout">Customer service</a>
        </div>
        <div>
          <h4>Services & Apps</h4>
          <a href="#checkout">Indiaborn™ Pay</a>
          <a href="#collections">Live trunk shows</a>
          <Link to="/admin">Admin</Link>
          <a href="#collections">Returns</a>
        </div>
        <div>
          <h4>Connect</h4>
          <a href="tel:+919834559443">+91 98345 59443</a>
          <a href="mailto:Indiaborn97@gmail.com">Indiaborn97@gmail.com</a>
          <a
            href="https://www.instagram.com/indiaborn_tm?igsh=MXFuYjVkYnZodTg5ZQ=="
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="#">Conditions of use</a>
          <a href="#">Privacy notice</a>
          <a href="#">Interest-based ads</a>
        </div>
      </div>
      <p className="footer__note">© 2025 Indiaborn™, crafted in India with love.</p>
    </footer>
  )
}

