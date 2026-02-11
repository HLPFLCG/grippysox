/* ============================================
   GRIPPY SOX CLUB — Shopify Buy Button SDK
   ============================================

   SETUP INSTRUCTIONS:
   ===================
   1. Go to your Shopify Admin > Sales Channels > Buy Button
   2. If not installed, add the Buy Button sales channel
   3. Replace the placeholder values below:
      - SHOPIFY_DOMAIN: your-store.myshopify.com
      - STOREFRONT_ACCESS_TOKEN: from Buy Button channel settings
      - PRODUCT_IDS: your actual Shopify product IDs

   The Buy Button SDK creates embeddable product components
   (add-to-cart buttons, product details, full carts) that
   work on any website outside of Shopify's hosted storefront.
   ============================================ */

(function() {
  'use strict';

  // ================================================================
  // CONFIGURATION — Update these with your Shopify store details
  // ================================================================
  var CONFIG = {
    // Your Shopify store domain (e.g., 'grippy-sox-club.myshopify.com')
    domain: 'YOUR_STORE.myshopify.com',

    // Storefront Access Token from Shopify Admin > Apps > Buy Button
    storefrontAccessToken: 'YOUR_STOREFRONT_ACCESS_TOKEN',

    // Map your product slugs to Shopify product GIDs
    // Find these in Shopify Admin > Products > click product > look at URL
    // The numeric ID in the URL is what you need (e.g., 7654321098765)
    // Format: 'gid://shopify/Product/YOUR_PRODUCT_ID'
    products: {
      'comfort-classic':   'gid://shopify/Product/PRODUCT_ID_1',
      'grounding-grip':    'gid://shopify/Product/PRODUCT_ID_2',
      'resilience-bundle': 'gid://shopify/Product/PRODUCT_ID_3',
      'calm-crew':         'gid://shopify/Product/PRODUCT_ID_4',
      'brave-ankle':       'gid://shopify/Product/PRODUCT_ID_5',
      'cozy-cuff':         'gid://shopify/Product/PRODUCT_ID_6'
    },

    // Collection ID for the "All Products" collection
    collectionId: 'gid://shopify/Collection/COLLECTION_ID'
  };

  // ================================================================
  // SHOPIFY BUY SDK LOADER
  // ================================================================

  var scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';

  function loadScript(url, callback) {
    var script = document.createElement('script');
    script.async = true;
    script.src = url;
    script.onload = callback;
    script.onerror = function() {
      console.warn('Grippy Sox: Shopify Buy Button SDK failed to load. Running in demo mode.');
      initDemoMode();
    };
    (document.getElementsByTagName('head')[0] || document.body).appendChild(script);
  }

  // ================================================================
  // SHOPIFY CLIENT + CART INITIALIZATION
  // ================================================================

  var shopifyClient = null;
  var shopifyCart = null;

  function initShopify() {
    if (CONFIG.domain === 'YOUR_STORE.myshopify.com') {
      console.info(
        'Grippy Sox: Shopify not configured yet. Running in demo mode.\n' +
        'To connect your Shopify store, update the CONFIG object in js/shopify-buy.js'
      );
      initDemoMode();
      return;
    }

    loadScript(scriptURL, function() {
      if (typeof ShopifyBuy === 'undefined') {
        initDemoMode();
        return;
      }

      shopifyClient = ShopifyBuy.buildClient({
        domain: CONFIG.domain,
        storefrontAccessToken: CONFIG.storefrontAccessToken
      });

      // Create a new checkout (cart)
      shopifyClient.checkout.create().then(function(checkout) {
        shopifyCart = checkout;
        bindShopifyButtons();
        bindCheckoutButton();
      });
    });
  }

  // ================================================================
  // BIND SHOPIFY ACTIONS TO UI
  // ================================================================

  function bindShopifyButtons() {
    // Bind all "Add to Cart" / "Quick Add" / "Buy Now" buttons
    document.querySelectorAll('[data-product]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var slug = this.getAttribute('data-product');
        var productGid = CONFIG.products[slug];

        if (!productGid || !shopifyClient || !shopifyCart) return;

        var self = this;
        var originalText = self.textContent;
        self.textContent = 'Adding...';
        self.disabled = true;

        // Fetch the product to get variant ID
        shopifyClient.product.fetch(productGid).then(function(product) {
          var variant = product.variants[0]; // Default to first variant

          // Check if a size is selected on the page
          var selectedSize = document.querySelector('.size-option.active');
          if (selectedSize && product.variants.length > 1) {
            var sizeVal = selectedSize.textContent.trim();
            for (var i = 0; i < product.variants.length; i++) {
              if (product.variants[i].title.indexOf(sizeVal) !== -1) {
                variant = product.variants[i];
                break;
              }
            }
          }

          // Get quantity
          var qtyInput = document.querySelector('.qty-selector input');
          var quantity = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

          var lineItemsToAdd = [{
            variantId: variant.id,
            quantity: quantity
          }];

          return shopifyClient.checkout.addLineItems(shopifyCart.id, lineItemsToAdd);
        }).then(function(checkout) {
          shopifyCart = checkout;
          updateCartUI(checkout);

          self.textContent = 'Added!';
          setTimeout(function() {
            self.textContent = originalText;
            self.disabled = false;
          }, 1500);

          // Open cart drawer
          if (window.GrippySox && window.GrippySox.openCart) {
            window.GrippySox.openCart();
          }
        }).catch(function(err) {
          console.error('Error adding to cart:', err);
          self.textContent = originalText;
          self.disabled = false;
        });
      });
    });
  }

  function bindCheckoutButton() {
    var checkoutBtn = document.getElementById('checkout-btn');
    if (!checkoutBtn) return;

    checkoutBtn.addEventListener('click', function() {
      if (shopifyCart && shopifyCart.webUrl) {
        window.location.href = shopifyCart.webUrl;
      }
    });
  }

  // ================================================================
  // CART UI UPDATES
  // ================================================================

  function updateCartUI(checkout) {
    var itemCount = checkout.lineItems.length;
    var subtotal = checkout.subtotalPrice
      ? parseFloat(checkout.subtotalPrice.amount || checkout.subtotalPrice)
      : 0;

    // Update cart count badge
    var cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
      var totalQty = 0;
      checkout.lineItems.forEach(function(item) {
        totalQty += item.quantity;
      });
      cartCountEl.textContent = totalQty;
      cartCountEl.classList.toggle('visible', totalQty > 0);
    }

    // Update cart subtotal
    var subtotalEl = document.getElementById('cart-subtotal');
    if (subtotalEl) {
      subtotalEl.textContent = '$' + subtotal.toFixed(2);
    }

    // Show/hide footer
    var cartFooter = document.getElementById('cart-footer');
    if (cartFooter) {
      cartFooter.style.display = itemCount > 0 ? '' : 'none';
    }

    // Render cart items
    var cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return;

    if (itemCount === 0) {
      cartItemsContainer.innerHTML =
        '<div class="cart-drawer__empty">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:64px;height:64px;margin:0 auto var(--space-4);opacity:0.3">' +
            '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>' +
            '<path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>' +
          '</svg>' +
          '<h4 class="h4">Your cart is empty</h4>' +
          '<p class="mt-2 color-muted" style="font-size:var(--text-sm)">Looks like you haven\'t added any cozy socks yet.</p>' +
          '<a href="pages/shop.html" class="btn btn--primary mt-6">Start Shopping</a>' +
        '</div>';
      return;
    }

    var html = '';
    checkout.lineItems.forEach(function(item) {
      var price = item.variant && item.variant.price
        ? parseFloat(item.variant.price.amount || item.variant.price)
        : 0;
      var imgSrc = item.variant && item.variant.image ? item.variant.image.src : '';

      html +=
        '<div class="cart-item">' +
          '<div class="cart-item__image" style="' + (imgSrc ? 'background-image:url(' + imgSrc + ');background-size:cover;' : '') + '"></div>' +
          '<div class="cart-item__info">' +
            '<div class="cart-item__title">' + item.title + '</div>' +
            '<div class="cart-item__variant">' + (item.variant ? item.variant.title : '') + ' &middot; Qty: ' + item.quantity + '</div>' +
            '<div class="cart-item__price">$' + (price * item.quantity).toFixed(2) + '</div>' +
          '</div>' +
        '</div>';
    });

    cartItemsContainer.innerHTML = html;
  }

  // ================================================================
  // DEMO MODE (when Shopify is not yet configured)
  // ================================================================

  function initDemoMode() {
    var demoCart = {
      items: [],
      get subtotal() {
        return this.items.reduce(function(sum, item) {
          return sum + (item.price * item.quantity);
        }, 0);
      },
      get totalQty() {
        return this.items.reduce(function(sum, item) {
          return sum + item.quantity;
        }, 0);
      }
    };

    var productData = {
      'comfort-classic':   { title: 'The Comfort Classic', price: 14.99 },
      'grounding-grip':    { title: 'The Grounding Grip', price: 17.99 },
      'resilience-bundle': { title: 'The Resilience Bundle', price: 39.99 },
      'calm-crew':         { title: 'The Calm Crew', price: 15.99 },
      'brave-ankle':       { title: 'The Brave Ankle', price: 12.99 },
      'cozy-cuff':         { title: 'The Cozy Cuff', price: 16.99 }
    };

    window.GrippySox = window.GrippySox || {};
    window.GrippySox.addToCart = function(slug) {
      var product = productData[slug];
      if (!product) return;

      // Check if already in cart
      var existing = null;
      for (var i = 0; i < demoCart.items.length; i++) {
        if (demoCart.items[i].slug === slug) {
          existing = demoCart.items[i];
          break;
        }
      }

      var qtyInput = document.querySelector('.qty-selector input');
      var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;

      if (existing) {
        existing.quantity += qty;
      } else {
        demoCart.items.push({
          slug: slug,
          title: product.title,
          price: product.price,
          quantity: qty,
          size: getSelectedSize()
        });
      }

      updateDemoCartUI(demoCart);

      if (window.GrippySox.openCart) {
        window.GrippySox.openCart();
      }
    };

    function getSelectedSize() {
      var active = document.querySelector('.size-option.active');
      return active ? active.textContent.trim() : 'M';
    }

    function updateDemoCartUI(cart) {
      // Update badge
      var cartCountEl = document.getElementById('cart-count');
      if (cartCountEl) {
        cartCountEl.textContent = cart.totalQty;
        cartCountEl.classList.toggle('visible', cart.totalQty > 0);
      }

      // Update subtotal
      var subtotalEl = document.getElementById('cart-subtotal');
      if (subtotalEl) {
        subtotalEl.textContent = '$' + cart.subtotal.toFixed(2);
      }

      // Show/hide footer
      var cartFooter = document.getElementById('cart-footer');
      if (cartFooter) {
        cartFooter.style.display = cart.items.length > 0 ? '' : 'none';
      }

      // Render items
      var container = document.getElementById('cart-items');
      if (!container) return;

      if (cart.items.length === 0) {
        container.innerHTML =
          '<div class="cart-drawer__empty">' +
            '<h4 class="h4">Your cart is empty</h4>' +
            '<p class="mt-2 color-muted" style="font-size:var(--text-sm)">Looks like you haven\'t added any cozy socks yet.</p>' +
            '<a href="pages/shop.html" class="btn btn--primary mt-6">Start Shopping</a>' +
          '</div>';
        return;
      }

      var html = '';
      cart.items.forEach(function(item) {
        html +=
          '<div class="cart-item">' +
            '<div class="cart-item__image"></div>' +
            '<div class="cart-item__info">' +
              '<div class="cart-item__title">' + item.title + '</div>' +
              '<div class="cart-item__variant">Size: ' + item.size + ' &middot; Qty: ' + item.quantity + '</div>' +
              '<div class="cart-item__price">$' + (item.price * item.quantity).toFixed(2) + '</div>' +
            '</div>' +
          '</div>';
      });

      container.innerHTML = html;
    }

    // Bind checkout button for demo
    var checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        alert(
          'Shopify Checkout\n\n' +
          'To enable real checkout, update the CONFIG object in js/shopify-buy.js with your Shopify store credentials.\n\n' +
          'Demo cart total: $' + demoCart.subtotal.toFixed(2)
        );
      });
    }
  }

  // ================================================================
  // INIT
  // ================================================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShopify);
  } else {
    initShopify();
  }

})();
