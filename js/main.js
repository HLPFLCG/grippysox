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
    var ticking = false;

    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          var currentScroll = window.pageYOffset;
          if (currentScroll > 50) {
            header.classList.add('scrolled');
          } else {
            header.classList.remove('scrolled');
          }
          lastScroll = currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ---- Mobile Menu ----
  function initMobileMenu() {
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('nav-main');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
      var isOpen = nav.classList.contains('open');
      toggle.classList.toggle('open');
      nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', !isOpen);
      nav.setAttribute('aria-hidden', isOpen);
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    });

    // Close menu when clicking a nav link
    nav.querySelectorAll('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        toggle.classList.remove('open');
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        nav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }

  // ---- Cart Drawer with Focus Trap ----
  function initCartDrawer() {
    var cartToggle = document.getElementById('cart-toggle');
    var cartDrawer = document.getElementById('cart-drawer');
    var cartOverlay = document.getElementById('cart-overlay');
    var cartClose = document.getElementById('cart-close');

    if (!cartToggle || !cartDrawer) return;

    var previousFocusEl = null;

    function getFocusableElements() {
      return cartDrawer.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
    }

    function trapFocus(e) {
      var focusable = getFocusableElements();
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    function openCart() {
      previousFocusEl = document.activeElement;
      cartDrawer.classList.add('open');
      cartDrawer.setAttribute('aria-hidden', 'false');
      if (cartOverlay) cartOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      cartDrawer.addEventListener('keydown', trapFocus);
      // Focus the close button
      if (cartClose) {
        setTimeout(function() { cartClose.focus(); }, 100);
      }
      announceToScreenReader('Cart opened');
    }

    function closeCart() {
      cartDrawer.classList.remove('open');
      cartDrawer.setAttribute('aria-hidden', 'true');
      if (cartOverlay) cartOverlay.classList.remove('open');
      document.body.style.overflow = '';
      cartDrawer.removeEventListener('keydown', trapFocus);
      if (previousFocusEl) previousFocusEl.focus();
      announceToScreenReader('Cart closed');
    }

    cartToggle.addEventListener('click', openCart);
    if (cartClose) cartClose.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && cartDrawer.classList.contains('open')) closeCart();
    });

    // Expose for Shopify integration
    window.GrippySox = window.GrippySox || {};
    window.GrippySox.openCart = openCart;
    window.GrippySox.closeCart = closeCart;
  }

  // ---- ARIA Live Announcements ----
  function announceToScreenReader(message) {
    var liveRegion = document.getElementById('aria-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'aria-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = '';
    setTimeout(function() { liveRegion.textContent = message; }, 100);
  }

  // ---- Newsletter Form ----
  function initNewsletter() {
    var forms = document.querySelectorAll('#newsletter-form, [data-newsletter]');
    forms.forEach(function(form) {
      form.addEventListener('submit', function(e) {
        e.preventDefault();
        var email = form.querySelector('input[type="email"]').value;
        if (email) {
          var button = form.querySelector('button');
          var originalText = button.textContent;
          button.textContent = 'Thank You!';
          button.disabled = true;
          form.querySelector('input[type="email"]').disabled = true;
          form.querySelector('input[type="email"]').value = '';
          announceToScreenReader('Thank you for subscribing! Check your email for your 10% off code.');

          setTimeout(function() {
            button.textContent = originalText;
            button.disabled = false;
            form.querySelector('input[type="email"]').disabled = false;
          }, 3000);
        }
      });
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
          var headerOffset = 80;
          var elementPosition = target.getBoundingClientRect().top;
          var offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
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
          this.setAttribute('aria-busy', 'false');
          this.style.pointerEvents = 'none';
          announceToScreenReader(productId.replace(/-/g, ' ') + ' added to cart');

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
      container.setAttribute('role', 'radiogroup');
      container.querySelectorAll('.size-option').forEach(function(option) {
        option.setAttribute('role', 'radio');
        option.setAttribute('aria-checked', option.classList.contains('active') ? 'true' : 'false');
        option.addEventListener('click', function() {
          container.querySelectorAll('.size-option').forEach(function(o) {
            o.classList.remove('active');
            o.setAttribute('aria-checked', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-checked', 'true');
          announceToScreenReader('Size ' + this.textContent.trim() + ' selected');
        });
      });
    });
  }

  // ---- Color Swatch Selector ----
  function initColorSwatches() {
    document.querySelectorAll('.color-swatches').forEach(function(container) {
      container.setAttribute('role', 'radiogroup');
      container.setAttribute('aria-label', 'Color options');
      container.querySelectorAll('.color-swatch').forEach(function(swatch) {
        swatch.setAttribute('role', 'radio');
        swatch.setAttribute('aria-checked', swatch.classList.contains('active') ? 'true' : 'false');
        swatch.addEventListener('click', function() {
          container.querySelectorAll('.color-swatch').forEach(function(s) {
            s.classList.remove('active');
            s.setAttribute('aria-checked', 'false');
          });
          this.classList.add('active');
          this.setAttribute('aria-checked', 'true');
          var colorName = this.getAttribute('title') || this.getAttribute('aria-label') || 'selected';
          announceToScreenReader('Color ' + colorName + ' selected');
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
        if (val > 1) {
          input.value = val - 1;
          announceToScreenReader('Quantity: ' + (val - 1));
        }
      });

      plusBtn.addEventListener('click', function() {
        var val = parseInt(input.value) || 1;
        input.value = val + 1;
        announceToScreenReader('Quantity: ' + (val + 1));
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

      thumbs.forEach(function(thumb, index) {
        thumb.setAttribute('aria-label', 'View color option ' + (index + 1));
        thumb.addEventListener('click', function() {
          thumbs.forEach(function(t) { t.classList.remove('active'); t.setAttribute('aria-current', 'false'); });
          this.classList.add('active');
          this.setAttribute('aria-current', 'true');
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

  // ---- Accessible Accordion ----
  function initAccordion() {
    document.querySelectorAll('.accordion-trigger').forEach(function(trigger, i) {
      var content = trigger.nextElementSibling;
      if (!content) return;

      var id = 'accordion-panel-' + i;
      var triggerId = 'accordion-trigger-' + i;
      trigger.id = triggerId;
      content.id = id;
      trigger.setAttribute('aria-expanded', content.classList.contains('open') ? 'true' : 'false');
      trigger.setAttribute('aria-controls', id);
      content.setAttribute('role', 'region');
      content.setAttribute('aria-labelledby', triggerId);

      // Remove inline onclick if present
      trigger.removeAttribute('onclick');

      trigger.addEventListener('click', function() {
        var isOpen = content.classList.contains('open');
        trigger.classList.toggle('open');
        content.classList.toggle('open');
        trigger.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      });

      // Keyboard support
      trigger.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          trigger.click();
        }
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
      submitBtn.setAttribute('aria-busy', 'true');

      setTimeout(function() {
        submitBtn.textContent = 'Sample Kit Requested!';
        submitBtn.style.background = 'var(--color-success)';
        submitBtn.setAttribute('aria-busy', 'false');

        var formFields = form.querySelectorAll('input, textarea, select');
        formFields.forEach(function(field) { field.disabled = true; });

        var successMsg = document.createElement('div');
        successMsg.className = 'mt-6';
        successMsg.setAttribute('role', 'alert');
        successMsg.style.cssText = 'background: var(--color-primary-50); color: var(--color-primary); padding: var(--space-4) var(--space-6); border-radius: var(--radius-md); font-weight: 600;';
        successMsg.textContent = 'Thank you! We\'ll ship your free sample kit within 2-3 business days.';
        form.appendChild(successMsg);
        announceToScreenReader('Sample kit requested successfully. We will ship within 2-3 business days.');
      }, 1500);
    });
  }

  // ---- Blog Filter Tabs ----
  function initBlogFilters() {
    var filterBtns = document.querySelectorAll('[data-filter]');
    if (!filterBtns.length) return;

    filterBtns.forEach(function(btn) {
      btn.setAttribute('role', 'tab');
      btn.addEventListener('click', function() {
        var filter = this.getAttribute('data-filter');

        filterBtns.forEach(function(b) {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');

        var visibleCount = 0;
        document.querySelectorAll('[data-category]').forEach(function(item) {
          if (filter === 'all' || item.getAttribute('data-category') === filter) {
            item.style.display = '';
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });
        announceToScreenReader('Showing ' + visibleCount + ' ' + (filter === 'all' ? '' : filter + ' ') + 'items');
      });
    });
  }

  // ---- Back to Top Button ----
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          if (window.pageYOffset > 600) {
            btn.classList.add('visible');
          } else {
            btn.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Focus the skip link or first heading after scroll
      setTimeout(function() {
        var firstHeading = document.querySelector('h1');
        if (firstHeading) {
          firstHeading.setAttribute('tabindex', '-1');
          firstHeading.focus({ preventScroll: true });
        }
      }, 500);
    });
  }

  // ---- Set ARIA Current on Active Nav ----
  function initAriaCurrent() {
    document.querySelectorAll('.nav-link.active').forEach(function(link) {
      link.setAttribute('aria-current', 'page');
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
    initAccordion();
    initFacilityForm();
    initBlogFilters();
    initBackToTop();
    initAriaCurrent();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
