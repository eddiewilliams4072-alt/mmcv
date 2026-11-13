/* ==========================================================================
   MMCV – shared page behaviour
   --------------------------------------------------------------------------
   Powers: central config injection, mobile navigation, FAQ accordion,
   mobile "call" bar, contact form validation + EmailJS submission.

   Everything here is progressive enhancement: pages remain readable and
   navigable without JavaScript.
   ========================================================================== */
(function () {
  'use strict';

  var CFG = window.MMCV_CONFIG || {};

  /* ===================================================================== */
  /* 1. Central configuration injection                                    */
  /* ===================================================================== */

  function digitsOnly(value) {
    return String(value || '').replace(/[^\d+]/g, '');
  }

  function hasValue(value) {
    return typeof value === 'string' && value.trim() !== '';
  }

  function applyPhone() {
    var phone = CFG.phone || {};
    var configured = hasValue(phone.tel) || hasValue(phone.display);
    var displayText = hasValue(phone.display)
      ? phone.display
      : (hasValue(phone.tel) ? phone.tel : (phone.placeholderText || 'Phone number not configured'));

    // Plain text slots (e.g. footer "Call us: <span>").
    document.querySelectorAll('[data-mmcv="phone"]').forEach(function (el) {
      el.textContent = displayText;
    });

    // Clickable tel: links.
    document.querySelectorAll('[data-mmcv-tel]').forEach(function (el) {
      if (configured && hasValue(phone.tel)) {
        var raw = digitsOnly(phone.tel);
        el.setAttribute('href', 'tel:' + (raw.charAt(0) === '+' ? raw : '+' + raw));
        el.removeAttribute('aria-disabled');
        el.removeAttribute('title');
        return;
      }
      el.removeAttribute('href');
      el.setAttribute('data-placeholder', 'true');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('title', 'The company phone number has not been configured yet.');
    });
  }

  function applyEmail() {
    var email = CFG.email || {};
    var configured = hasValue(email.address);
    var displayText = configured ? email.address : (email.placeholderText || 'Email address not configured');

    document.querySelectorAll('[data-mmcv="email"]').forEach(function (el) {
      el.textContent = displayText;
    });

    document.querySelectorAll('[data-mmcv-email]').forEach(function (el) {
      if (configured) {
        el.setAttribute('href', 'mailto:' + email.address);
        el.removeAttribute('data-placeholder');
        el.removeAttribute('aria-disabled');
        el.removeAttribute('title');
        return;
      }
      el.removeAttribute('href');
      el.setAttribute('data-placeholder', 'true');
      el.setAttribute('aria-disabled', 'true');
      el.setAttribute('title', 'The company email address has not been configured yet.');
    });
  }

  function applyHours() {
    var hours = CFG.hours || {};
    var lines = hours.lines || [];
    document.querySelectorAll('[data-mmcv-hours]').forEach(function (host) {
      host.innerHTML = '';
      lines.forEach(function (line) {
        var li = document.createElement('li');
        var day = document.createElement('span');
        var time = document.createElement('span');
        day.textContent = line.day;
        time.textContent = line.time;
        if (!hours.isConfigured) { time.setAttribute('data-placeholder', 'true'); }
        li.appendChild(day);
        li.appendChild(time);
        host.appendChild(li);
      });
    });
  }

  function applyScalarConfig() {
    var map = {
      siteUrl: (CFG.brand || {}).siteUrl,
      effectiveDate: (CFG.disclosure || {}).effectiveDate,
      governingLaw: (CFG.disclosure || {}).governingLaw,
      address: ((CFG.office || {}).lines || []).join(', '),
      registration: ((CFG.office || {}).registrationLines || [])[0] || ''
    };

    Object.keys(map).forEach(function (key) {
      var value = map[key];
      if (!hasValue(value)) { return; }
      document.querySelectorAll('[data-mmcv="' + key + '"]').forEach(function (el) {
        el.textContent = value;
      });
    });
  }

  function applyApplicationLinks() {
    if (!hasValue(CFG.applicationUrl)) { return; }
    document
      .querySelectorAll('[data-mmcv-application], a[href="index.html#mortgageForm"], a[href="#mortgageForm"]')
      .forEach(function (el) { el.setAttribute('href', CFG.applicationUrl); });
  }

  function applyFooterYear() {
    document.querySelectorAll('[data-mmcv-year]').forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ===================================================================== */
  /* 2. Mobile navigation                                                  */
  /* ===================================================================== */

  function initMobileNav() {
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('primaryNav');
    if (!toggle || !nav) { return; }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        toggle.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (!nav.classList.contains('is-open')) { return; }
      if (nav.contains(event.target) || toggle.contains(event.target)) { return; }
      closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth > 980) { closeMenu(); }
    });
  }

  /* ===================================================================== */
  /* 3. FAQ accordion (progressive enhancement over native <details>)       */
  /* ===================================================================== */

  function initFaqAccordion() {
    document.querySelectorAll('[data-faq-group]').forEach(function (group) {
      var items = group.querySelectorAll('details.faq-item');
      items.forEach(function (item) {
        item.addEventListener('toggle', function () {
          if (!item.open) { return; }
          items.forEach(function (other) {
            if (other !== item && other.open) { other.open = false; }
          });
        });
      });
    });
  }

  /* ===================================================================== */
  /* 4. Mobile call bar                                                    */
  /* ===================================================================== */

  function initCallBar() {
    var bar = document.getElementById('callBar');
    if (!bar) { return; }

    var phone = CFG.phone || {};
    var configured = hasValue(phone.tel) || hasValue(phone.display);
    var STORAGE_KEY = 'mmcv-call-bar-dismissed';

    var dismissed = false;
    try { dismissed = window.sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (err) { dismissed = false; }

    // Never show a call bar that cannot place a call.
    if (!configured || dismissed) { bar.remove(); return; }

    document.body.classList.add('has-call-bar');

    var closeBtn = document.getElementById('callBarClose');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        document.body.classList.remove('has-call-bar');
        try { window.sessionStorage.setItem(STORAGE_KEY, '1'); } catch (err) { /* ignore */ }
        bar.remove();
      });
    }
  }

  /* ===================================================================== */
  /* 5. Contact form                                                       */
  /* ===================================================================== */

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var PHONE_RE = /^[+()\d][\d\s().-]{7,}$/;

  function setFieldError(field, message) {
    var errorEl = document.getElementById(field.id + '-error');
    if (message) {
      field.setAttribute('aria-invalid', 'true');
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('is-visible');
      }
      return false;
    }
    field.removeAttribute('aria-invalid');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('is-visible');
    }
    return true;
  }

  function validateField(field) {
    var value = (field.value || '').trim();

    if (field.type === 'checkbox') {
      if (field.hasAttribute('required') && !field.checked) {
        return setFieldError(field, 'Please confirm this to continue.');
      }
      return setFieldError(field, null);
    }
    if (field.hasAttribute('required') && value === '') {
      return setFieldError(field, 'This field is required.');
    }
    if (field.type === 'email' && value !== '' && !EMAIL_RE.test(value)) {
      return setFieldError(field, 'Enter a valid email address, for example name@example.com.');
    }
    if (field.type === 'tel' && value !== '' && !PHONE_RE.test(value)) {
      return setFieldError(field, 'Enter a valid phone number, for example (800) 555-1234.');
    }
    if (field.hasAttribute('minlength') && value.length > 0) {
      var min = parseInt(field.getAttribute('minlength'), 10);
      if (value.length < min) {
        return setFieldError(field, 'Please enter at least ' + min + ' characters.');
      }
    }
    return setFieldError(field, null);
  }

  function initContactForm() {
    var form = document.getElementById('contactForm');
    if (!form) { return; }

    var submitBtn = form.querySelector('[type="submit"]');
    var successEl = document.getElementById('contactSuccess');
    var errorEl = document.getElementById('contactError');
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
      .filter(function (el) { return el.type !== 'hidden' && el.type !== 'submit' && el.type !== 'checkbox'; });
    var checkboxes = Array.prototype.slice.call(form.querySelectorAll('input[type="checkbox"]'))
      .filter(function (el) { return el.hasAttribute('required'); });
    var validatable = fields.concat(checkboxes);

    validatable.forEach(function (field) {
      var onBlur = field.type === 'checkbox' ? 'change' : 'blur';
      field.addEventListener(onBlur, function () { validateField(field); });
      if (field.type !== 'checkbox') {
        field.addEventListener('input', function () {
          if (field.getAttribute('aria-invalid') === 'true') { validateField(field); }
        });
      }
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      if (successEl) { successEl.classList.remove('is-visible'); }
      if (errorEl) { errorEl.classList.remove('is-visible'); }

      var firstInvalid = null;
      validatable.forEach(function (field) {
        var ok = validateField(field);
        if (!ok && !firstInvalid) { firstInvalid = field; }
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (errorEl) {
          errorEl.textContent = 'Please correct the highlighted fields and try again.';
          errorEl.classList.add('is-visible');
        }
        return;
      }

      var data = {};
      fields.forEach(function (field) { data[field.name] = (field.value || '').trim(); });

      var emailCfg = CFG.emailjs || {};
      var templateId = (emailCfg.contactTemplateId && emailCfg.contactTemplateId.trim()) ||
        emailCfg.eligibilityTemplateId;

      if (!window.emailjs || !emailCfg.serviceId || !templateId) {
        // Integration is not reachable. Fail loudly instead of faking success.
        if (errorEl) {
          errorEl.textContent = 'We could not send your message right now. Please call our team instead. (Form integration not configured.)';
          errorEl.classList.add('is-visible');
        }
        return;
      }

      if (submitBtn) {
        submitBtn.classList.add('is-loading');
        submitBtn.setAttribute('aria-busy', 'true');
        submitBtn.disabled = true;
      }

      var params = {
        from_name: data.full_name,
        name: data.full_name,
        full_name: data.full_name,
        reply_to: data.email,
        email: data.email,
        phone: data.phone,
        contact: data.phone,
        mortgage_company: data.mortgage_company || 'Not provided',
        state: data.state,
        message: data.message,
        reason_hardship: data.message,
        page_source: 'Contact Us page'
      };

      window.emailjs
        .send(emailCfg.serviceId, templateId, params)
        .then(function () {
          form.reset();
          if (successEl) {
            successEl.classList.add('is-visible');
            successEl.setAttribute('tabindex', '-1');
            successEl.focus();
            successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        .catch(function (err) {
          if (window.console && console.error) { console.error('EmailJS error:', err); }
          if (errorEl) {
            errorEl.classList.add('is-visible');
            errorEl.setAttribute('tabindex', '-1');
            errorEl.focus();
            errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        })
        .then(function () {
          if (submitBtn) {
            submitBtn.classList.remove('is-loading');
            submitBtn.removeAttribute('aria-busy');
            submitBtn.disabled = false;
          }
        });
    });
  }

  /* ===================================================================== */
  /* Boot                                                                  */
  /* ===================================================================== */

  function boot() {
    applyPhone();
    applyEmail();
    applyHours();
    applyScalarConfig();
    applyApplicationLinks();
    applyFooterYear();
    initMobileNav();
    initFaqAccordion();
    initCallBar();
    initContactForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
