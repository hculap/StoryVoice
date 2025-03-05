/**
 * Dawn JS v1.0.0
 * JavaScript helpers for the Dawn CSS Framework
 */

(function() {
    'use strict';
  
    // Initialize all Dawn components when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize all components
      Dawn.init();
    });
  
    // Main Dawn object
    window.Dawn = {
      /**
       * Initialize all Dawn components
       */
      init: function() {
        this.initFAQ();
        this.initSmoothScroll();
        this.initMobileMenu();
        this.initFormValidation();
        this.initScrollAnimations();
        this.initNavbarScroll();
      },
  
      /**
       * Initialize FAQ accordion functionality
       */
      initFAQ: function() {
        const faqItems = document.querySelectorAll('.dawn-faq-item');
        
        if (!faqItems.length) return;
        
        // Set up click listeners
        faqItems.forEach(item => {
          const question = item.querySelector('.dawn-faq-question');
          if (!question) return;
          
          question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other items
            faqItems.forEach(faqItem => {
              faqItem.classList.remove('active');
              const answer = faqItem.querySelector('.dawn-faq-answer');
              if (answer) {
                answer.style.maxHeight = null;
              }
            });
            
            // Toggle current item
            if (!isActive) {
              item.classList.add('active');
              const answer = item.querySelector('.dawn-faq-answer');
              if (answer) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
              }
            }
          });
        });
        
        // Initialize any FAQ items that should be open initially
        faqItems.forEach(item => {
          if (item.classList.contains('active')) {
            const answer = item.querySelector('.dawn-faq-answer');
            if (answer) {
              answer.style.maxHeight = answer.scrollHeight + 'px';
            }
          }
        });
      },
  
      /**
       * Initialize smooth scrolling for anchor links
       */
      initSmoothScroll: function() {
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        
        if (!anchorLinks.length) return;
        
        anchorLinks.forEach(anchor => {
          anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              // Offset for fixed header (80px by default)
              const offset = 80;
              const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;
              
              window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
              });
            }
          });
        });
      },
  
      /**
       * Initialize mobile menu toggle functionality
       */
      initMobileMenu: function() {
        const mobileToggle = document.querySelector('.dawn-mobile-toggle');
        const mobileMenu = document.querySelector('.dawn-mobile-menu');
        
        if (!mobileToggle || !mobileMenu) return;
        
        mobileToggle.addEventListener('click', function() {
          this.classList.toggle('active');
          mobileMenu.classList.toggle('active');
          
          // Toggle body scroll
          if (mobileMenu.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
          } else {
            document.body.style.overflow = '';
          }
        });
        
        // Close mobile menu when clicking links
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
          link.addEventListener('click', function() {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
          });
        });
        
        // Handle resize events (close menu if window is resized larger)
        window.addEventListener('resize', function() {
          if (window.innerWidth > 768 && mobileMenu.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = '';
          }
        });
      },
  
      /**
       * Initialize form validation
       */
      initFormValidation: function() {
        const forms = document.querySelectorAll('.dawn-form, .dawn-form-inline');
        
        if (!forms.length) return;
        
        forms.forEach(form => {
          form.addEventListener('submit', function(e) {
            let isValid = true;
            
            // Check all required inputs
            const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]');
            requiredInputs.forEach(input => {
              if (!input.value.trim()) {
                isValid = false;
                input.classList.add('dawn-input-error');
                
                // Add error message if it doesn't exist
                let errorMsg = input.parentNode.querySelector('.dawn-input-error-msg');
                if (!errorMsg) {
                  errorMsg = document.createElement('div');
                  errorMsg.className = 'dawn-input-error-msg';
                  errorMsg.textContent = 'To pole jest wymagane';
                  input.parentNode.appendChild(errorMsg);
                }
              } else {
                input.classList.remove('dawn-input-error');
                const errorMsg = input.parentNode.querySelector('.dawn-input-error-msg');
                if (errorMsg) {
                  errorMsg.remove();
                }
              }
            });
            
            // Email validation
            const emailInputs = form.querySelectorAll('input[type="email"]');
            emailInputs.forEach(input => {
              if (input.value.trim() && !this.isValidEmail(input.value)) {
                isValid = false;
                input.classList.add('dawn-input-error');
                
                // Add error message if it doesn't exist
                let errorMsg = input.parentNode.querySelector('.dawn-input-error-msg');
                if (!errorMsg) {
                  errorMsg = document.createElement('div');
                  errorMsg.className = 'dawn-input-error-msg';
                  errorMsg.textContent = 'Wprowadź poprawny adres email';
                  input.parentNode.appendChild(errorMsg);
                } else {
                  errorMsg.textContent = 'Wprowadź poprawny adres email';
                }
              }
            });
            
            if (!isValid) {
              e.preventDefault();
            }
          }.bind(this));
        });
      },
  
      /**
       * Initialize scroll animations
       */
      initScrollAnimations: function() {
        const animatedElements = document.querySelectorAll('.dawn-animate-on-scroll');
        
        if (!animatedElements.length) return;
        
        const checkIfInView = () => {
          animatedElements.forEach(element => {
            // If already animated, skip
            if (element.classList.contains('animated')) return;
            
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
              element.classList.add('animated');
            }
          });
        };
        
        // Check on initial load
        checkIfInView();
        
        // Check on scroll
        window.addEventListener('scroll', checkIfInView);
      },
  
      /**
       * Initialize navbar scroll effect
       */
      initNavbarScroll: function() {
        const navbar = document.querySelector('.dawn-navbar');
        
        if (!navbar) return;
        
        window.addEventListener('scroll', function() {
          if (window.scrollY > 50) {
            navbar.classList.add('dawn-navbar-scrolled');
          } else {
            navbar.classList.remove('dawn-navbar-scrolled');
          }
        });
      },
  
      /**
       * Helper: Check if email is valid
       */
      isValidEmail: function(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      },
  
      /**
       * Create a notification/toast message
       * @param {string} message - The message to display
       * @param {string} type - The type of notification (success, error, warning, info)
       * @param {number} duration - Duration in milliseconds
       */
      notify: function(message, type = 'info', duration = 3000) {
        // Create notification container if it doesn't exist
        let container = document.querySelector('.dawn-notifications');
        if (!container) {
          container = document.createElement('div');
          container.className = 'dawn-notifications';
          document.body.appendChild(container);
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `dawn-notification dawn-notification-${type}`;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.className = 'dawn-notification-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', function() {
          notification.classList.add('dawn-notification-hiding');
          setTimeout(() => {
            notification.remove();
          }, 300);
        });
        notification.appendChild(closeBtn);
        
        // Add to container
        container.appendChild(notification);
        
        // Auto-remove after duration
        if (duration > 0) {
          setTimeout(() => {
            notification.classList.add('dawn-notification-hiding');
            setTimeout(() => {
              notification.remove();
            }, 300);
          }, duration);
        }
        
        return notification;
      },
  
      /**
       * Toggle accordion
       * @param {HTMLElement} element - The accordion header element
       */
      toggleAccordion: function(element) {
        const parent = element.parentNode;
        const content = element.nextElementSibling;
        
        if (!parent || !content) return;
        
        const isActive = parent.classList.contains('active');
        
        // Close all other accordions in the same group
        const siblings = parent.parentNode.querySelectorAll('.dawn-accordion-item');
        siblings.forEach(sibling => {
          if (sibling !== parent) {
            sibling.classList.remove('active');
            const siblingContent = sibling.querySelector('.dawn-accordion-content');
            if (siblingContent) {
              siblingContent.style.maxHeight = null;
            }
          }
        });
        
        // Toggle current accordion
        if (isActive) {
          parent.classList.remove('active');
          content.style.maxHeight = null;
        } else {
          parent.classList.add('active');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      },
  
      /**
       * Add a modal to the page
       * @param {string} content - HTML content for the modal
       * @param {Object} options - Modal options
       */
      modal: function(content, options = {}) {
        const defaults = {
          title: '',
          closeButton: true,
          width: 'auto',
          onOpen: null,
          onClose: null
        };
        
        const settings = { ...defaults, ...options };
        
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'dawn-modal-backdrop';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'dawn-modal';
        if (settings.width !== 'auto') {
          modal.style.width = settings.width;
        }
        
        // Create modal content
        let modalHtml = '';
        
        if (settings.title || settings.closeButton) {
          modalHtml += '<div class="dawn-modal-header">';
          if (settings.title) {
            modalHtml += `<h4 class="dawn-modal-title">${settings.title}</h4>`;
          }
          if (settings.closeButton) {
            modalHtml += '<button class="dawn-modal-close">&times;</button>';
          }
          modalHtml += '</div>';
        }
        
        modalHtml += `<div class="dawn-modal-body">${content}</div>`;
        
        modal.innerHTML = modalHtml;
        
        // Add to document
        backdrop.appendChild(modal);
        document.body.appendChild(backdrop);
        document.body.classList.add('dawn-modal-open');
        
        // Prevent body scrolling
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = scrollbarWidth + 'px';
        
        // Show with animation
        setTimeout(() => {
          backdrop.classList.add('active');
          modal.classList.add('active');
        }, 10);
        
        // Close button functionality
        const closeBtn = modal.querySelector('.dawn-modal-close');
        if (closeBtn) {
          closeBtn.addEventListener('click', function() {
            closeModal();
          });
        }
        
        // Close on backdrop click
        backdrop.addEventListener('click', function(e) {
          if (e.target === backdrop) {
            closeModal();
          }
        });
        
        // Close on ESC key
        document.addEventListener('keydown', function(e) {
          if (e.key === 'Escape') {
            closeModal();
          }
        });
        
        // Close modal function
        function closeModal() {
          backdrop.classList.remove('active');
          modal.classList.remove('active');
          
          setTimeout(() => {
            document.body.classList.remove('dawn-modal-open');
            document.body.style.paddingRight = '';
            backdrop.remove();
            
            if (typeof settings.onClose === 'function') {
              settings.onClose();
            }
          }, 300);
        }
        
        // Run onOpen callback
        if (typeof settings.onOpen === 'function') {
          settings.onOpen();
        }
        
        // Return object with control methods
        return {
          close: closeModal,
          getElement: () => modal
        };
      },
  
      /**
       * Initialize tabs
       * @param {string} selector - Selector for the tabs container
       */
      initTabs: function(selector = '.dawn-tabs') {
        const tabContainers = document.querySelectorAll(selector);
        
        if (!tabContainers.length) return;
        
        tabContainers.forEach(container => {
          const tabs = container.querySelectorAll('.dawn-tab');
          const panels = container.querySelectorAll('.dawn-tab-panel');
          
          tabs.forEach((tab, index) => {
            tab.addEventListener('click', function() {
              // Deactivate all tabs
              tabs.forEach(t => t.classList.remove('active'));
              panels.forEach(p => p.classList.remove('active'));
              
              // Activate clicked tab
              tab.classList.add('active');
              if (panels[index]) {
                panels[index].classList.add('active');
              }
            });
          });
          
          // Activate first tab if none is active
          if (!container.querySelector('.dawn-tab.active')) {
            if (tabs[0]) {
              tabs[0].classList.add('active');
            }
            if (panels[0]) {
              panels[0].classList.add('active');
            }
          }
        });
      }
    };
  })();