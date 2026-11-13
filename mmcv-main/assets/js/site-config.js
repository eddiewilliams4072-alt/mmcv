/* ==========================================================================
   MMCV – central site configuration
   --------------------------------------------------------------------------
   THIS IS THE SINGLE SOURCE OF TRUTH for values that appear on more than one
   page (phone number, email address, business hours, website address, form
   submission endpoints).

   Do NOT hardcode these values in individual pages. Every page includes this
   file and `site.js` fills the values into any element that carries a
   `data-mmcv`, `data-mmcv-tel`, `data-mmcv-email` or `data-mmcv-hours`
   attribute.

   ---------------------------------------------------------------------------
   IMPORTANT – PLACEHOLDERS
   ---------------------------------------------------------------------------
   The company has not supplied verified contact details. The values below are
   deliberately EMPTY placeholders. While a placeholder is empty the matching
   link is rendered as plain text (no `tel:`/`mailto:` href is emitted) and the
   page displays a visible "[... to be configured]" marker.

   Fill in the real, verified values before launch. Never invent a phone
   number, email address, physical address, business hours, licence or
   registration number.
   ========================================================================== */

window.MMCV_CONFIG = {
  /* ---------------------------------------------------------------- Brand */
  brand: {
    name: 'MMCV',
    fullName: 'MMCV – Free Mortgage Modification Counselling',
    tagline: 'Free Mortgage Modification Counselling',
    // Update once the production domain is confirmed.
    siteUrl: 'https://mmcv.vercel.app'
  },

  /* ------------------------------------------------------ Phone (REQUIRED) */
  phone: {
    // Digits only, including country code. Example: '18005551234'
    // TODO: replace with the company's verified phone number.
    tel: '',
    // Human readable display value. Example: '(800) 555-1234'
    // TODO: replace with the company's verified phone number.
    display: '',
    // Shown while `tel` is empty so the page is never misleading.
    placeholderText: '[Company phone number to be configured]'
  },

  /* ------------------------------------------------------ Email (REQUIRED) */
  email: {
    // TODO: replace with the company's verified contact email.
    address: '',
    placeholderText: '[Company email address to be configured]'
  },

  /* -------------------------------------------------- Business hours (REQ) */
  // TODO: replace with the company's verified business hours.
  hours: {
    isConfigured: false,
    lines: [
      { day: 'Monday – Friday', time: '[Hours to be configured]' },
      { day: 'Saturday', time: '[Hours to be configured]' },
      { day: 'Sunday', time: 'Closed' }
    ]
  },

  /* ------------------------------------------------ Address / registration */
  // TODO: replace with the company's verified mailing address and, where
  // applicable, its licence / registration details. Leave empty if unknown.
  office: {
    isConfigured: false,
    lines: ['[Mailing address to be configured]'],
    registrationLines: ['[Licence / registration details to be configured]']
  },

  /* ------------------------------------------------------------- Hours copy */
  disclosure: {
    // Replace with the effective date once the documents are approved.
    effectiveDate: '[Effective date to be configured]',
    // Replace after review by a qualified US attorney.
    governingLaw: '[Governing state / jurisdiction to be confirmed by counsel]'
  },

  /* ------------------------------------------------------------- Legal pages */
  // Path (relative to the site root) of the original homepage application
  // form. The form element in the existing index.html has id="mortgageForm",
  // so the anchor below scrolls straight to it. Do NOT build a second
  // application system.
  applicationUrl: 'index.html#mortgageForm',

  /* ------------------------------------------------- EmailJS integration */
  // The existing homepage already submits the eligibility/application form
  // through EmailJS. The contact form reuses the SAME account and service so
  // that only one integration has to be maintained.
  emailjs: {
    publicKey: 'Xb3XgneIWAQY_s5rj',
    serviceId: 'service_ulro3bd',
    // Template used by the existing homepage application form.
    eligibilityTemplateId: 'template_aplnv3e',
    // TODO: create a dedicated EmailJS template for the general contact form
    // (recommended: it should reference {{from_name}}, {{reply_to}},
    // {{phone}}, {{mortgage_company}}, {{state}} and {{message}}) and paste
    // its ID below. While this is empty the contact form falls back to
    // `eligibilityTemplateId`, which works but produces an email that is
    // missing some contact-specific fields.
    contactTemplateId: ''
  }
};
