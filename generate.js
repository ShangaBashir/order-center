const fs = require('fs');
const path = require('path');

const header = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} - Global Order Center</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '#711612',
            bg: '#EBEAE8',
            accent: '#D4AF37',
            text: '#2C2C2C',
          },
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
          }
        }
      }
    }
  </script>
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #EBEAE8; color: #2C2C2C; }
    .btn-primary { background-color: #D4AF37; color: white; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; transition: background-color 0.2s; cursor: pointer; }
    .btn-primary:hover { background-color: #b5952f; }
    .btn-secondary { background-color: transparent; color: #711612; border: 1px solid #711612; padding: 0.75rem 1.5rem; border-radius: 0.375rem; font-weight: 500; display: inline-flex; align-items: center; justify-content: center; transition: all 0.2s; cursor: pointer; }
    .btn-secondary:hover { background-color: #711612; color: white; }
    .nav-link { color: #2C2C2C; transition: color 0.2s; font-weight: 500; }
    .nav-link:hover, .nav-link.active { color: #711612; }
    .hero-bg { background: linear-gradient(to right, rgba(235, 234, 232, 0.9), rgba(235, 234, 232, 0.6)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80') center/cover; }
  </style>
</head>
<body class="flex flex-col min-h-screen">
  <!-- Header -->
  <header class="bg-white shadow-sm sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        <!-- Logo -->
        <a href="index.html" class="flex-shrink-0 flex items-center gap-2">
          <i data-lucide="package" class="h-8 w-8 text-brand"></i>
          <span class="font-bold text-xl text-brand uppercase tracking-wider">Global Order</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex space-x-8">
          <a href="index.html" class="nav-link {nav_home}">Home</a>
          <a href="services.html" class="nav-link {nav_services}">Services</a>
          <a href="offers.html" class="nav-link {nav_offers}">Offers</a>
          <a href="about.html" class="nav-link {nav_about}">About</a>
          <a href="contact.html" class="nav-link {nav_contact}">Contact</a>
        </nav>

        <!-- Right Side -->
        <div class="hidden md:flex items-center space-x-6">
          <button class="text-text hover:text-brand transition"><i data-lucide="search" class="h-5 w-5"></i></button>
          
          <div class="relative group">
            <button class="flex items-center gap-1 text-text hover:text-brand transition">
              <i data-lucide="globe" class="h-5 w-5"></i> EN
            </button>
          </div>

          <a href="tracking.html" class="flex items-center gap-2 text-brand font-medium hover:text-accent transition">
            <i data-lucide="map-pin" class="h-5 w-5"></i>
            Track Order
          </a>
        </div>

        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center">
          <button id="mobile-menu-btn" class="text-text hover:text-brand">
            <i data-lucide="menu" class="h-6 w-6"></i>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Mobile Nav (Hidden by default) -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2 shadow-lg absolute w-full z-40">
      <a href="index.html" class="block py-2 nav-link {nav_home}">Home</a>
      <a href="services.html" class="block py-2 nav-link {nav_services}">Services</a>
      <a href="offers.html" class="block py-2 nav-link {nav_offers}">Offers</a>
      <a href="about.html" class="block py-2 nav-link {nav_about}">About</a>
      <a href="contact.html" class="block py-2 nav-link {nav_contact}">Contact</a>
      <a href="tracking.html" class="block py-2 text-brand font-medium"><i data-lucide="map-pin" class="inline h-4 w-4 mr-2"></i>Track Order</a>
    </div>
  </header>

  <main class="flex-grow">
`;

const footer = `
  </main>

  <!-- Footer -->
  <footer class="bg-white border-t border-gray-200 mt-16 pt-16 pb-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        <div>
          <div class="flex items-center gap-2 mb-4">
            <i data-lucide="package" class="h-6 w-6 text-brand"></i>
            <span class="font-bold text-lg text-brand uppercase tracking-wider">Global Order</span>
          </div>
          <p class="text-gray-600 mb-4">Your trusted partner for international shopping and shipping. We bring global products directly to your door.</p>
        </div>
        
        <div>
          <h4 class="font-semibold text-text mb-4">Quick Links</h4>
          <ul class="space-y-2">
            <li><a href="index.html" class="text-gray-600 hover:text-brand transition">Home</a></li>
            <li><a href="services.html" class="text-gray-600 hover:text-brand transition">Services</a></li>
            <li><a href="offers.html" class="text-gray-600 hover:text-brand transition">Offers</a></li>
            <li><a href="about.html" class="text-gray-600 hover:text-brand transition">About</a></li>
            <li><a href="contact.html" class="text-gray-600 hover:text-brand transition">Contact</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-text mb-4">Customer</h4>
          <ul class="space-y-2">
            <li><a href="tracking.html" class="text-gray-600 hover:text-brand transition">Track Order</a></li>
            <li><a href="#" class="text-gray-600 hover:text-brand transition">How It Works</a></li>
            <li><a href="#" class="text-gray-600 hover:text-brand transition">Shipping</a></li>
            <li><a href="#" class="text-gray-600 hover:text-brand transition">FAQ</a></li>
            <li><a href="contact.html" class="text-gray-600 hover:text-brand transition">Contact Support</a></li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-semibold text-text mb-4">Contact</h4>
          <ul class="space-y-2">
            <li class="flex items-center gap-2 text-gray-600"><i data-lucide="phone" class="h-4 w-4"></i> +1 234 567 890</li>
            <li class="flex items-center gap-2 text-gray-600"><i data-lucide="mail" class="h-4 w-4"></i> support@globalorder.com</li>
            <li class="flex items-center gap-2 text-gray-600"><i data-lucide="message-circle" class="h-4 w-4"></i> WhatsApp Support</li>
          </ul>
          <div class="flex space-x-4 mt-6">
            <a href="#" class="text-gray-400 hover:text-brand transition"><i data-lucide="facebook" class="h-5 w-5"></i></a>
            <a href="#" class="text-gray-400 hover:text-brand transition"><i data-lucide="instagram" class="h-5 w-5"></i></a>
            <a href="#" class="text-gray-400 hover:text-brand transition"><i data-lucide="twitter" class="h-5 w-5"></i></a>
          </div>
        </div>
      </div>
      
      <div class="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-500 text-sm">© 2026 Global Order. All rights reserved.</p>
        <div class="flex items-center gap-2 mt-4 md:mt-0 text-sm text-gray-500">
          <i data-lucide="globe" class="h-4 w-4"></i>
          <span>English | Arabic | Kurdish</span>
        </div>
      </div>
    </div>
  </footer>

  <script>
    lucide.createIcons();
    
    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if(btn && menu) {
      btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
      });
    }
  </script>
</body>
</html>
`;

const pages = {
    "index.html": {
        "title": "Home",
        "nav": "nav_home",
        "content": `
    <!-- Hero Section -->
    <section class="hero-bg py-24 lg:py-32 relative">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-2xl">
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-text leading-tight mb-6">
            Shop From Global Websites.<br>
            <span class="text-brand">We Bring It To You.</span>
          </h1>
          <p class="text-lg md:text-xl text-gray-700 mb-8">
            Order products from your favorite international websites and let us handle the purchasing, shipping, and delivery directly to your door.
          </p>
          <div class="flex flex-col sm:flex-row gap-4">
            <a href="services.html" class="btn-primary">Shop From Global Websites</a>
            <a href="tracking.html" class="btn-secondary">Track Your Order</a>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-text mb-4">How It Works</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Your international shopping experience simplified in a few easy steps.</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- Step 1 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="search" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">1. Find Your Product</h3>
            <p class="text-gray-600">Browse your favorite international stores and find what you want.</p>
          </div>
          <!-- Step 2 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="link" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">2. Send Us the Link</h3>
            <p class="text-gray-600">Share the product URL with us through our contact form or WhatsApp.</p>
          </div>
          <!-- Step 3 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="calculator" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">3. Get Your Price</h3>
            <p class="text-gray-600">We will calculate the final price including shipping and fees.</p>
          </div>
          <!-- Step 4 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="check-circle" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">4. Confirm Order</h3>
            <p class="text-gray-600">Approve the quote and we will proceed with the purchase.</p>
          </div>
          <!-- Step 5 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="plane" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">5. We Purchase & Ship</h3>
            <p class="text-gray-600">We buy the item and handle all international shipping logistics.</p>
          </div>
          <!-- Step 6 -->
          <div class="bg-bg p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
            <div class="w-16 h-16 bg-white text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <i data-lucide="package-check" class="h-8 w-8"></i>
            </div>
            <h3 class="text-xl font-bold mb-2">6. Receive Package</h3>
            <p class="text-gray-600">Get your items delivered directly to you. Track it anytime!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Global Websites Section -->
    <section class="py-20 bg-bg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-text mb-4">Shop From Your Favorite Global Websites</h2>
          <p class="text-gray-600 max-w-2xl mx-auto">We support all major international e-commerce platforms.</p>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-gray-800 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">SHEIN</div>
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-orange-500 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">Alibaba</div>
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-blue-900 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">Amazon</div>
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-red-600 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">AliExpress</div>
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-orange-600 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">Temu</div>
          <div class="bg-white py-8 px-4 rounded-xl shadow-sm text-center font-bold text-xl text-blue-600 flex items-center justify-center h-32 border border-gray-100 hover:shadow-md transition">eBay</div>
        </div>
        
        <div class="text-center">
          <a href="contact.html" class="btn-primary">Can't Find Your Website? Contact Us</a>
        </div>
      </div>
    </section>
`
    },
    "services.html": {
        "title": "Services",
        "nav": "nav_services",
        "content": `
    <section class="bg-brand py-16 text-white text-center">
      <h1 class="text-4xl font-bold mb-4">Our Services</h1>
      <p class="text-lg opacity-90 max-w-2xl mx-auto">Comprehensive purchasing and shipping solutions tailored for your international shopping needs.</p>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Service 1 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="shopping-bag" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">International Shopping</h3>
            <p class="text-gray-600 mb-6">Send us a product link and we purchase the item for you securely, handling all payment barriers.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

          <!-- Service 2 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="plane-takeoff" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">International Shipping</h3>
            <p class="text-gray-600 mb-6">We handle the complex international shipping process and bring products safely to your country.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

          <!-- Service 3 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="search" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">Product Sourcing</h3>
            <p class="text-gray-600 mb-6">Can't find it? We help you source and purchase specific products from international suppliers.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

          <!-- Service 4 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="shirt" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">SHEIN Shopping</h3>
            <p class="text-gray-600 mb-6">Dedicated service for ordering fashion, accessories, and home goods from SHEIN seamlessly.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

          <!-- Service 5 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="boxes" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">Alibaba & Wholesale</h3>
            <p class="text-gray-600 mb-6">Support for larger product quantities, business orders, and B2B purchases from Alibaba.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

          <!-- Service 6 -->
          <div class="border border-gray-100 rounded-2xl p-8 hover:shadow-lg transition bg-bg group">
            <i data-lucide="truck" class="h-10 w-10 text-accent mb-6 group-hover:scale-110 transition-transform"></i>
            <h3 class="text-2xl font-bold text-text mb-3">Local Delivery</h3>
            <p class="text-gray-600 mb-6">After the package arrives in your country, we provide fast local delivery directly to your address.</p>
            <a href="contact.html" class="text-brand font-medium hover:text-accent flex items-center gap-1">Learn More <i data-lucide="arrow-right" class="h-4 w-4"></i></a>
          </div>

        </div>
      </div>
    </section>
`
    },
    "offers.html": {
        "title": "Offers",
        "nav": "nav_offers",
        "content": `
    <section class="bg-brand py-16 text-white text-center">
      <h1 class="text-4xl font-bold mb-4">Exclusive Offers</h1>
      <p class="text-lg opacity-90 max-w-2xl mx-auto">Take advantage of our limited-time deals, shipping discounts, and special promotions.</p>
    </section>

    <section class="py-20 bg-bg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <!-- Offer Card 1 -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative hover:shadow-lg transition">
            <div class="absolute top-0 right-0 bg-accent text-white px-4 py-1 rounded-bl-lg font-bold text-sm">LIMITED TIME</div>
            <div class="p-8">
              <h3 class="text-xl font-bold text-brand mb-2">New Customer Promo</h3>
              <p class="text-gray-600 mb-4">Get a special discount on your first international shopping order with us.</p>
              <div class="text-3xl font-bold text-text mb-6">50% OFF <span class="text-sm text-gray-500 font-normal">shipping fee</span></div>
              <p class="text-sm text-gray-500 mb-6">Valid until Oct 31, 2026. T&Cs apply.</p>
              <a href="contact.html" class="btn-primary w-full text-center">Get This Offer</a>
            </div>
          </div>

          <!-- Offer Card 2 -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative border-accent border-2 hover:shadow-lg transition">
            <div class="absolute top-0 right-0 bg-accent text-white px-4 py-1 rounded-bl-lg font-bold text-sm">POPULAR</div>
            <div class="p-8">
              <h3 class="text-xl font-bold text-brand mb-2">SHEIN Special</h3>
              <p class="text-gray-600 mb-4">Zero processing fees for all SHEIN clothing and accessory orders this month.</p>
              <div class="text-3xl font-bold text-text mb-6">FREE <span class="text-sm text-gray-500 font-normal">processing</span></div>
              <p class="text-sm text-gray-500 mb-6">Valid for orders over $50.</p>
              <a href="contact.html" class="btn-primary w-full text-center">Get This Offer</a>
            </div>
          </div>

          <!-- Offer Card 3 -->
          <div class="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 relative hover:shadow-lg transition">
            <div class="p-8">
              <h3 class="text-xl font-bold text-brand mb-2">Wholesale Deal</h3>
              <p class="text-gray-600 mb-4">Discounted cargo rates for heavy shipments from Alibaba and suppliers.</p>
              <div class="text-3xl font-bold text-text mb-6">-20% <span class="text-sm text-gray-500 font-normal">on freight</span></div>
              <p class="text-sm text-gray-500 mb-6">For shipments over 50kg.</p>
              <a href="contact.html" class="btn-primary w-full text-center">Get This Offer</a>
            </div>
          </div>

        </div>
      </div>
    </section>
`
    },
    "tracking.html": {
        "title": "Track Order",
        "nav": "",
        "content": `
    <section class="py-16 bg-white">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <i data-lucide="map-pin" class="h-12 w-12 text-accent mx-auto mb-6"></i>
        <h1 class="text-4xl font-bold text-text mb-4">Track Your Order</h1>
        <p class="text-lg text-gray-600 mb-10">Enter your order or tracking number to see the current status of your package.</p>
        
        <form class="flex flex-col sm:flex-row gap-4 justify-center" onsubmit="event.preventDefault(); document.getElementById('tracking-result').classList.remove('hidden');">
          <input type="text" placeholder="Enter tracking number (e.g., GO-123456)" class="flex-grow max-w-md px-6 py-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent text-lg shadow-sm" required>
          <button type="submit" class="btn-primary text-lg">Track Order</button>
        </form>
      </div>
    </section>

    <!-- Tracking Result (Hidden by default) -->
    <section id="tracking-result" class="py-12 bg-bg hidden">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          <div class="flex flex-col md:flex-row justify-between border-b border-gray-100 pb-6 mb-8 gap-4">
            <div>
              <p class="text-sm text-gray-500">Order Number</p>
              <p class="text-xl font-bold text-text">GO-123456</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Status</p>
              <p class="text-xl font-bold text-accent">In Transit</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estimated Delivery</p>
              <p class="text-xl font-bold text-text">Oct 5, 2026</p>
            </div>
          </div>

          <!-- Timeline -->
          <div class="relative py-4 pl-4 md:pl-0">
            <!-- Line -->
            <div class="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -ml-px"></div>
            
            <div class="space-y-8 relative">
              <!-- Step 1 -->
              <div class="flex items-center md:justify-between w-full">
                <div class="hidden md:block w-5/12 text-right pr-8">
                  <p class="text-sm text-gray-500">Sep 20, 10:00 AM</p>
                </div>
                <div class="z-10 w-4 h-4 bg-brand rounded-full shadow border-4 border-white absolute left-4 md:left-1/2 -ml-2"></div>
                <div class="pl-12 md:pl-8 md:w-5/12">
                  <h4 class="font-bold text-brand">Order Received</h4>
                  <p class="text-sm text-gray-600 md:hidden">Sep 20, 10:00 AM</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex items-center md:justify-between w-full">
                <div class="hidden md:block w-5/12 text-right pr-8">
                  <p class="text-sm text-gray-500">Sep 21, 09:30 AM</p>
                </div>
                <div class="z-10 w-4 h-4 bg-brand rounded-full shadow border-4 border-white absolute left-4 md:left-1/2 -ml-2"></div>
                <div class="pl-12 md:pl-8 md:w-5/12">
                  <h4 class="font-bold text-brand">Purchased</h4>
                  <p class="text-sm text-gray-500">Item purchased from Amazon.</p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex items-center md:justify-between w-full">
                <div class="hidden md:block w-5/12 text-right pr-8">
                  <p class="text-sm text-gray-500">Sep 23, 14:15 PM</p>
                </div>
                <div class="z-10 w-6 h-6 bg-accent rounded-full shadow border-4 border-white absolute left-3 md:left-1/2 -ml-3 flex items-center justify-center"></div>
                <div class="pl-12 md:pl-8 md:w-5/12">
                  <h4 class="font-bold text-accent text-lg">In Transit</h4>
                  <p class="text-sm text-gray-500">Package has departed international facility.</p>
                </div>
              </div>

              <!-- Step 4 (Future) -->
              <div class="flex items-center md:justify-between w-full opacity-50">
                <div class="hidden md:block w-5/12 text-right pr-8">
                  <p class="text-sm text-gray-400">Pending</p>
                </div>
                <div class="z-10 w-4 h-4 bg-gray-300 rounded-full shadow border-4 border-white absolute left-4 md:left-1/2 -ml-2"></div>
                <div class="pl-12 md:pl-8 md:w-5/12">
                  <h4 class="font-bold text-gray-500">Arrived at Destination Country</h4>
                </div>
              </div>

              <!-- Step 5 (Future) -->
              <div class="flex items-center md:justify-between w-full opacity-50">
                <div class="hidden md:block w-5/12 text-right pr-8">
                  <p class="text-sm text-gray-400">Pending</p>
                </div>
                <div class="z-10 w-4 h-4 bg-gray-300 rounded-full shadow border-4 border-white absolute left-4 md:left-1/2 -ml-2"></div>
                <div class="pl-12 md:pl-8 md:w-5/12">
                  <h4 class="font-bold text-gray-500">Delivered</h4>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
`
    },
    "about.html": {
        "title": "About Us",
        "nav": "nav_about",
        "content": `
    <section class="bg-brand py-20 text-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 class="text-4xl md:text-5xl font-bold mb-6">About Global Order</h1>
            <p class="text-lg opacity-90 leading-relaxed mb-6">
              We connect customers in the local market with products from international websites, simplifying the complex purchasing and shipping process.
            </p>
          </div>
          <div class="bg-white/10 p-8 rounded-2xl border border-white/20">
            <h3 class="text-2xl font-bold mb-4 text-accent">Our Mission</h3>
            <p class="mb-6">To eliminate borders in e-commerce by providing reliable, transparent, and seamless international shopping solutions to our customers.</p>
            <h3 class="text-2xl font-bold mb-4 text-accent">Our Vision</h3>
            <p>To be the most trusted logistics and purchasing partner for global shopping in the region.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-20 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-text mb-12">How We Connect You to the World</h2>
        
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
          <div class="flex-1 bg-bg p-6 rounded-xl border border-gray-200 w-full shadow-sm">
            <i data-lucide="globe-2" class="h-8 w-8 text-brand mx-auto mb-3"></i>
            <h4 class="font-bold">Global Websites</h4>
          </div>
          <i data-lucide="arrow-right" class="hidden md:block text-gray-400 h-8 w-8"></i>
          <i data-lucide="arrow-down" class="md:hidden text-gray-400 h-8 w-8"></i>
          
          <div class="flex-1 bg-accent/10 p-6 rounded-xl border border-accent/20 w-full shadow-sm">
            <i data-lucide="briefcase" class="h-8 w-8 text-accent mx-auto mb-3"></i>
            <h4 class="font-bold text-accent">Our Service</h4>
          </div>
          <i data-lucide="arrow-right" class="hidden md:block text-gray-400 h-8 w-8"></i>
          <i data-lucide="arrow-down" class="md:hidden text-gray-400 h-8 w-8"></i>
          
          <div class="flex-1 bg-bg p-6 rounded-xl border border-gray-200 w-full shadow-sm">
            <i data-lucide="ship" class="h-8 w-8 text-brand mx-auto mb-3"></i>
            <h4 class="font-bold">Intl. Shipping</h4>
          </div>
          <i data-lucide="arrow-right" class="hidden md:block text-gray-400 h-8 w-8"></i>
          <i data-lucide="arrow-down" class="md:hidden text-gray-400 h-8 w-8"></i>
          
          <div class="flex-1 bg-bg p-6 rounded-xl border border-gray-200 w-full shadow-sm">
            <i data-lucide="home" class="h-8 w-8 text-brand mx-auto mb-3"></i>
            <h4 class="font-bold">Customer</h4>
          </div>
        </div>
      </div>
    </section>
`
    },
    "contact.html": {
        "title": "Contact",
        "nav": "nav_contact",
        "content": `
    <section class="py-20 bg-bg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div class="text-center mb-16">
          <h1 class="text-4xl font-bold text-text mb-4">Contact Us</h1>
          <p class="text-gray-600 max-w-2xl mx-auto">Have a product in mind? Send us the link and we'll help you order it.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-12 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          <!-- Contact Info -->
          <div class="bg-brand text-white p-10 md:col-span-1">
            <h3 class="text-2xl font-bold mb-8">Get In Touch</h3>
            
            <div class="space-y-6">
              <div class="flex items-start gap-4">
                <i data-lucide="map-pin" class="h-6 w-6 text-accent mt-1"></i>
                <div>
                  <h4 class="font-semibold text-lg">Location</h4>
                  <p class="opacity-80">123 Logistics Ave<br>Business District, City</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <i data-lucide="phone" class="h-6 w-6 text-accent mt-1"></i>
                <div>
                  <h4 class="font-semibold text-lg">Phone & WhatsApp</h4>
                  <p class="opacity-80">+1 234 567 890</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <i data-lucide="mail" class="h-6 w-6 text-accent mt-1"></i>
                <div>
                  <h4 class="font-semibold text-lg">Email</h4>
                  <p class="opacity-80">support@globalorder.com</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <i data-lucide="clock" class="h-6 w-6 text-accent mt-1"></i>
                <div>
                  <h4 class="font-semibold text-lg">Business Hours</h4>
                  <p class="opacity-80">Mon - Sat: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="p-10 md:col-span-2">
            <form onsubmit="event.preventDefault(); alert('Message sent!');">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input type="text" class="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" required>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input type="tel" class="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" required>
                </div>
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input type="email" class="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" required>
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Subject (or Product Link)</label>
                <input type="text" class="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm" placeholder="Paste your product link here...">
              </div>
              
              <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="4" class="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand shadow-sm"></textarea>
              </div>
              
              <button type="submit" class="btn-primary w-full md:w-auto">Send Message</button>
            </form>
          </div>
          
        </div>
      </div>
    </section>
`
    }
};

for (const [filename, data] of Object.entries(pages)) {
    let htmlContent = header
        .replace('{title}', data.title)
        .replace(/{nav_home}/g, data.nav === 'nav_home' ? 'active' : '')
        .replace(/{nav_services}/g, data.nav === 'nav_services' ? 'active' : '')
        .replace(/{nav_offers}/g, data.nav === 'nav_offers' ? 'active' : '')
        .replace(/{nav_about}/g, data.nav === 'nav_about' ? 'active' : '')
        .replace(/{nav_contact}/g, data.nav === 'nav_contact' ? 'active' : '')
        + data.content + footer;
    
    fs.writeFileSync(path.join(__dirname, filename), htmlContent, 'utf8');
}
console.log('Created HTML pages successfully.');
