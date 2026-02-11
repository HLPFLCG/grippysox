/* ============================================
   GRIPPY SOX CLUB — Main JavaScript
   ============================================ */

(function() {
  'use strict';

  // ---- Scroll Reveal ----
  function initScrollReveal() {
    var revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');

    if (!revealElements.length) return;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  // ---- Sticky Header ----
  function initStickyHeader() {
    var header = document.getElementById('site-header');
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener('scroll', function() {
      var currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav-main');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      toggle.classList.toggle('open');
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    nav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Cart Drawer ----
  function initCartDrawer() {
    var cartToggle = document.getElementById('cart-toggle');
    var cartDrawer = document.getElementById('cart-drawer');
    var cartOverlay = document.getElementById('cart-overlay');
    var cartClose = document.getElementById('cart-close');

    if (!cartToggle || !cartDrawer) return;

    function openCart() {
      cartDrawer.classList.add('open');
      if (cartOverlay) cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      cartDrawer.classList.remove('open');
      if (cartOverlay) cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') closeCart();
    });

    // Expose for Shopify integration
    window.GrippySox = window.GrippySox || {};
    window.GrippySox.openCart = openCart;
    window.GrippySox.closeCart = closeCart;
  }

  // ---- Newsletter Form ----
  function initNewsletter() {
    var form = document.getElementById('newsletter-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var email = form.querySelector('input[type="email"]').value;
      if (email) {
        // Replace with your email service integration
        var button = form.querySelector('button');
        var originalText = button.textContent;
        button.textContent = 'Thank You!';
        button.disabled = true;
        form.querySelector('input').disabled = true;
        form.querySelector('input').value = '';

        setTimeout(function() {
          button.textContent = originalText;
          button.disabled = false;
          form.querySelector('input').disabled = false;
        }, 3000);
      }
    });
  }

  // ---- Smooth Scroll for Anchor Links ----
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href === '#') return;

        var target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---- Product Card Quick Add ----
  function initQuickAdd() {
    document.querySelectorAll('.shopify-buy-button').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var productId = this.getAttribute('data-product');

        // If Shopify Buy SDK is initialized, use it
        if (window.GrippySox && window.GrippySox.addToCart) {
          window.GrippySox.addToCart(productId);
        } else {
          // Fallback: show feedback
          var originalText = this.textContent;
          this.textContent = 'Added!';
          this.style.pointerEvents = 'none';

          var self = this;
          setTimeout(function() {
            self.textContent = originalText;
            self.style.pointerEvents = '';
          }, 1500);

          // Update cart count for demo
          var cartCount = document.getElementById('cart-count');
          if (cartCount) {
            var count = parseInt(cartCount.textContent) + 1;
            cartCount.textContent = count;
            cartCount.classList.add('visible');
          }
        }
      });
    });
  }

  // ---- Size Selector ----
  function initSizeSelector() {
    document.querySelectorAll('.size-options').forEach(function(container) {
      container.querySelectorAll('.size-option').forEach(function(option) {
        option.addEventListener('click', function() {
          container.querySelectorAll('.size-option').forEach(function(o) {
            o.classList.remove('active');
          });
          this.classList.add('active');
        });
      });
    });
  }

  // ---- Color Swatch Selector ----
  function initColorSwatches() {
    document.querySelectorAll('.color-swatches').forEach(function(container) {
      container.querySelectorAll('.color-swatch').forEach(function(swatch) {
        swatch.addEventListener('click', function() {
          container.querySelectorAll('.color-swatch').forEach(function(s) {
            s.classList.remove('active');
          });
          this.classList.add('active');
        });
      });
    });
  }

  // ---- Quantity Selector ----
  function initQuantitySelector() {
    document.querySelectorAll('.qty-selector').forEach(function(selector) {
      var input = selector.querySelector('input');
      var minusBtn = selector.querySelector('[data-action="decrease"]');
      var plusBtn = selector.querySelector('[data-action="increase"]');

      if (!input || !minusBtn || !plusBtn) return;

      minusBtn.addEventListener('click', function() {
        var val = parseInt(input.value) || 1;
        if (val > 1) input.value = val - 1;
      });

      plusBtn.addEventListener('click', function() {
        var val = parseInt(input.value) || 1;
        input.value = val + 1;
      });

      input.addEventListener('change', function() {
        var val = parseInt(this.value);
        if (isNaN(val) || val < 1) this.value = 1;
      });
    });
  }

  // ---- Product Gallery Thumbnails ----
  function initProductGallery() {
    document.querySelectorAll('.product-gallery').forEach(function(gallery) {
      var thumbs = gallery.querySelectorAll('.product-gallery__thumb');
      var mainImage = gallery.querySelector('.product-gallery__main');

      thumbs.forEach(function(thumb) {
        thumb.addEventListener('click', function() {
          thumbs.forEach(function(t) { t.classList.remove('active'); });
          this.classList.add('active');
          // In production, swap the main image source
          if (mainImage) {
            var color = this.getAttribute('data-color');
            if (color) {
              mainImage.style.background = color;
            }
          }
        });
      });
    });
  }

  // ---- Facility Form ----
  function initFacilityForm() {
    var form = document.getElementById('facility-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.textContent;

      submitBtn.textContent = 'Sending...';
      submitBtn.disabled = true;

      // Simulate form submission — replace with real endpoint
      setTimeout(function() {
        submitBtn.textContent = 'Sample Kit Requested!';
        submitBtn.style.background = 'var(--color-success)';

        var formFields = form.querySelectorAll('input, textarea, select');
        formFields.forEach(function(field) { field.disabled = true; });

        // Show success message
        var successMsg = document.createElement('div');
        successMsg.className = 'mt-6';
        successMsg.style.cssText = 'background: var(--color-primary-50); color: var(--color-primary); padding: var(--space-4) var(--space-6); border-radius: var(--radius-md); font-weight: 600;';
        successMsg.textContent = 'Thank you! We\'ll ship your free sample kit within 2-3 business days.';
        form.appendChild(successMsg);
      }, 1500);
    });
  }

  // ---- Blog Filter Tabs ----
  function initBlogFilters() {
    var filterBtns = document.querySelectorAll('[data-filter]');
    if (!filterBtns.length) return;

    filterBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');

        filterBtns.forEach(function(b) { b.classList.remove('active'); });
        this.classList.add('active');

        document.querySelectorAll('[data-category]').forEach(function(item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  // ---- Initialize Everything ----
  function init() {
    initScrollReveal();
    initStickyHeader();
    initMobileMenu();
    initCartDrawer();
    initNewsletter();
    initSmoothScroll();
    initQuickAdd();
    initSizeSelector();
    initColorSwatches();
    initQuantitySelector();
    initProductGallery();
    initFacilityForm();
    initBlogFilters();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
