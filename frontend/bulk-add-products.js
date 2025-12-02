// Bulk Add Products Script
// Run this with: node bulk-add-products.js

const API_URL = 'http://localhost:5184';

// Admin credentials
const ADMIN_EMAIL = 'admin@indiaborn.com';
const ADMIN_PASSWORD = 'ChangeMe123!';

const products = [
  // Sports Equipment - Cricket (3 Products)
  {
    name: "Professional Cricket Bat",
    description: "Premium English willow cricket bat with excellent balance and power. Perfect for professional players.",
    price: 3999,
    salePrice: null,
    inventoryCount: 25,
    category: "Sports Equipment",
    subCategory: "Cricket",
    productType: "Bat",
    sport: "Cricket",
    gender: "",
    material: "",
    brand: "SS",
    availableSizes: [],
    availableColors: [],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=500", altText: "Professional Cricket Bat", isPrimary: true }]
  },
  {
    name: "Leather Cricket Ball - Red",
    description: "High-quality leather cricket ball for professional matches. Four-piece construction with excellent seam.",
    price: 899,
    salePrice: null,
    inventoryCount: 50,
    category: "Sports Equipment",
    subCategory: "Cricket",
    productType: "Ball",
    sport: "Cricket",
    gender: "",
    material: "",
    brand: "SG",
    availableSizes: [],
    availableColors: ["Red"],
    isBestSeller: false,
    isNewArrival: true,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=500", altText: "Leather Cricket Ball", isPrimary: true }]
  },
  {
    name: "Cricket Batting Gloves",
    description: "Premium batting gloves with superior protection and comfort. High-density foam padding.",
    price: 1499,
    salePrice: null,
    inventoryCount: 40,
    category: "Sports Equipment",
    subCategory: "Cricket",
    productType: "Gloves",
    sport: "Cricket",
    gender: "",
    material: "",
    brand: "Kookaburra",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["White", "Black"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1593766787879-e8c78e09cec2?w=500", altText: "Cricket Batting Gloves", isPrimary: true }]
  },

  // Sports Equipment - Football (2 Products)
  {
    name: "FIFA Approved Football",
    description: "Official size 5 football with FIFA Quality certification. Excellent grip and durability.",
    price: 2499,
    salePrice: 1999,
    inventoryCount: 60,
    category: "Sports Equipment",
    subCategory: "Football",
    productType: "Ball",
    sport: "Football",
    gender: "",
    material: "",
    brand: "Adidas",
    availableSizes: ["5"],
    availableColors: ["White", "Black", "Blue"],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: true,
    images: [{ url: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=500", altText: "FIFA Approved Football", isPrimary: true }]
  },
  {
    name: "Football Training Cones Set",
    description: "Set of 10 durable training cones. Perfect for drills and practice sessions.",
    price: 599,
    salePrice: null,
    inventoryCount: 35,
    category: "Sports Equipment",
    subCategory: "Football",
    productType: "Training Equipment",
    sport: "Football",
    gender: "",
    material: "",
    brand: "Nike",
    availableSizes: [],
    availableColors: ["Orange", "Yellow"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500", altText: "Football Training Cones", isPrimary: true }]
  },

  // Sports Equipment - Tennis (2 Products)
  {
    name: "Professional Tennis Racket",
    description: "High-performance tennis racket with carbon fiber frame. Perfect balance of power and control.",
    price: 5999,
    salePrice: null,
    inventoryCount: 20,
    category: "Sports Equipment",
    subCategory: "Tennis",
    productType: "Racket",
    sport: "Tennis",
    gender: "",
    material: "",
    brand: "Wilson",
    availableSizes: [],
    availableColors: ["Red", "Black"],
    isBestSeller: true,
    isNewArrival: true,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=500", altText: "Professional Tennis Racket", isPrimary: true }]
  },
  {
    name: "Tennis Ball Can (3 Balls)",
    description: "Pack of 3 premium tennis balls with excellent bounce and durability.",
    price: 399,
    salePrice: null,
    inventoryCount: 100,
    category: "Sports Equipment",
    subCategory: "Tennis",
    productType: "Ball",
    sport: "Tennis",
    gender: "",
    material: "",
    brand: "Wilson",
    availableSizes: [],
    availableColors: ["Yellow"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500", altText: "Tennis Ball Can", isPrimary: true }]
  },

  // Sports Equipment - Gym & Fitness (3 Products)
  {
    name: "Adjustable Dumbbells Set",
    description: "Premium adjustable dumbbell set (5-25kg). Perfect for home gym workouts.",
    price: 4999,
    salePrice: null,
    inventoryCount: 15,
    category: "Sports Equipment",
    subCategory: "Gym & Fitness",
    productType: "Dumbbells",
    sport: "Gym & Fitness",
    gender: "",
    material: "",
    brand: "Reebok",
    availableSizes: [],
    availableColors: ["Black"],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500", altText: "Adjustable Dumbbells", isPrimary: true }]
  },
  {
    name: "Yoga Mat Premium",
    description: "Extra thick yoga mat with anti-slip surface. Perfect for yoga, pilates, and stretching.",
    price: 1299,
    salePrice: null,
    inventoryCount: 45,
    category: "Sports Equipment",
    subCategory: "Gym & Fitness",
    productType: "Yoga Mat",
    sport: "Gym & Fitness",
    gender: "",
    material: "",
    brand: "Liforme",
    availableSizes: [],
    availableColors: ["Purple", "Blue", "Pink", "Green"],
    isBestSeller: false,
    isNewArrival: true,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", altText: "Yoga Mat Premium", isPrimary: true }]
  },
  {
    name: "Resistance Bands Set",
    description: "Set of 5 resistance bands with varying resistance levels. Great for strength training.",
    price: 899,
    salePrice: null,
    inventoryCount: 55,
    category: "Sports Equipment",
    subCategory: "Gym & Fitness",
    productType: "Resistance Bands",
    sport: "Gym & Fitness",
    gender: "",
    material: "",
    brand: "TheraBand",
    availableSizes: [],
    availableColors: ["Multi"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500", altText: "Resistance Bands Set", isPrimary: true }]
  },

  // Clothing - Men (4 Products)
  {
    name: "Men's Running T-Shirt",
    description: "Breathable quick-dry running t-shirt with moisture-wicking technology. Perfect for workouts.",
    price: 1299,
    salePrice: null,
    inventoryCount: 80,
    category: "Clothing",
    subCategory: "Men",
    productType: "T-Shirt",
    gender: "Men",
    sport: "",
    material: "Polyester",
    brand: "Nike",
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    availableColors: ["Black", "Blue", "Red", "White"],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", altText: "Men's Running T-Shirt", isPrimary: true }]
  },
  {
    name: "Men's Training Shorts",
    description: "Comfortable training shorts with elastic waistband and side pockets.",
    price: 999,
    salePrice: null,
    inventoryCount: 70,
    category: "Clothing",
    subCategory: "Men",
    productType: "Shorts",
    gender: "Men",
    sport: "",
    material: "Polyester",
    brand: "Adidas",
    availableSizes: ["S", "M", "L", "XL", "XXL"],
    availableColors: ["Black", "Navy", "Gray"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500", altText: "Men's Training Shorts", isPrimary: true }]
  },
  {
    name: "Men's Track Jacket",
    description: "Classic track jacket with full zip and side pockets. Great for training and casual wear.",
    price: 2499,
    salePrice: 1999,
    inventoryCount: 40,
    category: "Clothing",
    subCategory: "Men",
    productType: "Jacket",
    gender: "Men",
    sport: "",
    material: "Polyester",
    brand: "Puma",
    availableSizes: ["M", "L", "XL", "XXL"],
    availableColors: ["Black", "Navy", "Red"],
    isBestSeller: false,
    isNewArrival: true,
    isOnSale: true,
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500", altText: "Men's Track Jacket", isPrimary: true }]
  },
  {
    name: "Men's Sports Tank Top",
    description: "Lightweight tank top for gym workouts. Breathable and comfortable fit.",
    price: 899,
    salePrice: null,
    inventoryCount: 65,
    category: "Clothing",
    subCategory: "Men",
    productType: "Tank Top",
    gender: "Men",
    sport: "",
    material: "Cotton Blend",
    brand: "Under Armour",
    availableSizes: ["S", "M", "L", "XL"],
    availableColors: ["Black", "Gray", "White"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500", altText: "Men's Sports Tank Top", isPrimary: true }]
  },

  // Clothing - Women (4 Products)
  {
    name: "Women's Sports Bra",
    description: "High-support sports bra with moisture-wicking fabric. Perfect for intense workouts.",
    price: 1499,
    salePrice: null,
    inventoryCount: 60,
    category: "Clothing",
    subCategory: "Women",
    productType: "Sports Bra",
    gender: "Women",
    sport: "",
    material: "Spandex",
    brand: "Nike",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: ["Black", "Pink", "Purple", "Blue"],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1556316384-12c35d30afa4?w=500", altText: "Women's Sports Bra", isPrimary: true }]
  },
  {
    name: "Women's Yoga Leggings",
    description: "High-waisted yoga leggings with four-way stretch. Non-see-through and squat-proof.",
    price: 2299,
    salePrice: null,
    inventoryCount: 75,
    category: "Clothing",
    subCategory: "Women",
    productType: "Leggings",
    gender: "Women",
    sport: "",
    material: "Spandex",
    brand: "Lululemon",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: ["Black", "Navy", "Maroon", "Gray"],
    isBestSeller: true,
    isNewArrival: true,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500", altText: "Women's Yoga Leggings", isPrimary: true }]
  },
  {
    name: "Women's Running Tank",
    description: "Lightweight running tank with breathable mesh panels. Perfect for summer workouts.",
    price: 1099,
    salePrice: null,
    inventoryCount: 55,
    category: "Clothing",
    subCategory: "Women",
    productType: "Tank Top",
    gender: "Women",
    sport: "",
    material: "Polyester",
    brand: "Adidas",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: ["White", "Pink", "Mint", "Purple"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?w=500", altText: "Women's Running Tank", isPrimary: true }]
  },
  {
    name: "Women's Training Shorts",
    description: "Comfortable training shorts with inner brief. Great for gym and outdoor activities.",
    price: 899,
    salePrice: null,
    inventoryCount: 50,
    category: "Clothing",
    subCategory: "Women",
    productType: "Shorts",
    gender: "Women",
    sport: "",
    material: "Polyester",
    brand: "Puma",
    availableSizes: ["XS", "S", "M", "L", "XL"],
    availableColors: ["Black", "Navy", "Gray", "Pink"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1574633502809-f9df7c5925e3?w=500", altText: "Women's Training Shorts", isPrimary: true }]
  },

  // Clothing - Kids (4 Products)
  {
    name: "Kids Football Jersey",
    description: "Comfortable football jersey for kids. Lightweight and breathable fabric.",
    price: 799,
    salePrice: null,
    inventoryCount: 45,
    category: "Clothing",
    subCategory: "Kids",
    productType: "Jersey",
    gender: "Kids",
    sport: "",
    material: "Polyester",
    brand: "Adidas",
    availableSizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    availableColors: ["Red", "Blue", "Yellow"],
    isBestSeller: false,
    isNewArrival: true,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1522057306606-f1a6b5f0f1f3?w=500", altText: "Kids Football Jersey", isPrimary: true }]
  },
  {
    name: "Kids Sports T-Shirt",
    description: "Comfortable cotton t-shirt for active kids. Perfect for daily wear and sports.",
    price: 599,
    salePrice: null,
    inventoryCount: 70,
    category: "Clothing",
    subCategory: "Kids",
    productType: "T-Shirt",
    gender: "Kids",
    sport: "",
    material: "Cotton",
    brand: "Nike",
    availableSizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y", "14-15Y"],
    availableColors: ["Blue", "Green", "Orange", "Black"],
    isBestSeller: true,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500", altText: "Kids Sports T-Shirt", isPrimary: true }]
  },
  {
    name: "Kids Track Pants",
    description: "Comfortable track pants with elastic waistband. Great for sports and casual wear.",
    price: 899,
    salePrice: null,
    inventoryCount: 55,
    category: "Clothing",
    subCategory: "Kids",
    productType: "Pants",
    gender: "Kids",
    sport: "",
    material: "Polyester",
    brand: "Puma",
    availableSizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    availableColors: ["Black", "Navy", "Gray"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=500", altText: "Kids Track Pants", isPrimary: true }]
  },
  {
    name: "Kids Swimming Shorts",
    description: "Quick-dry swimming shorts for kids. Comfortable fit with drawstring waist.",
    price: 699,
    salePrice: null,
    inventoryCount: 40,
    category: "Clothing",
    subCategory: "Kids",
    productType: "Swim Shorts",
    gender: "Kids",
    sport: "",
    material: "Polyester",
    brand: "Speedo",
    availableSizes: ["6-7Y", "8-9Y", "10-11Y", "12-13Y"],
    availableColors: ["Blue", "Red", "Green"],
    isBestSeller: false,
    isNewArrival: false,
    isOnSale: false,
    images: [{ url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500", altText: "Kids Swimming Shorts", isPrimary: true }]
  }
];

async function login() {
  console.log('🔐 Logging in as admin...');
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('✅ Login successful!');
  return data.token;
}

async function addProduct(product, token) {
  const response = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(product)
  });

  if (!response.ok) {
    throw new Error(`Failed to add ${product.name}: ${response.statusText}`);
  }

  return await response.json();
}

async function main() {
  try {
    console.log('🚀 Starting bulk product import...\n');
    
    // Login
    const token = await login();
    
    // Delete all existing products first
    console.log('🗑️  Deleting existing products...');
    const existingProducts = await fetch(`${API_URL}/api/products`).then(r => r.json());
    console.log(`Found ${existingProducts.length} products to delete`);
    for (const p of existingProducts) {
      await fetch(`${API_URL}/api/products/${p.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`  ✓ Deleted: ${p.name}`);
    }
    console.log('✅ All existing products deleted!\n');
    
    // Add products
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        console.log(`📦 Adding product ${i + 1}/${products.length}: ${product.name}`);
        await addProduct(product, token);
        successCount++;
        console.log(`   ✅ Success!`);
      } catch (error) {
        failCount++;
        console.log(`   ❌ Failed: ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Import Summary:');
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`   📦 Total: ${products.length}`);
    console.log('='.repeat(50));
    
    console.log('\n✨ Done! Check your admin panel at http://localhost:3000/admin');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
