/**
 * Disposable and Temporary Email Detection Utility
 * Enforces client-side validation to reject known temporary/disposable email domains.
 * Note: Server-side validation boundary (Edge Function / Database Trigger) should also enforce this in production.
 */

const KNOWN_DISPOSABLE_DOMAINS = new Set([
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'mailinator.com',
  '10minutemail.com',
  '10minutemail.net',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'trashmail.org',
  'sharklasers.com',
  'getairmail.com',
  'burnermail.io',
  'dispostable.com',
  'fakeinbox.com',
  'mohmal.com',
  'crazymailing.com',
  'tempail.com',
  'generator.email',
  'mytemp.email',
  'maildrop.cc',
  'inboxkitten.com',
  'dropmail.me',
  'nada.ltd',
  'getnada.com',
  'emailondeck.com',
  'minuteinbox.com',
  'fakemailgenerator.com'
]);

/**
 * Validates whether an email address is syntactically valid and not from a known disposable provider.
 * @param {string} email
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateEmailAddress(email) {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email address is required.' };
  }

  const normalized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(normalized)) {
    return { isValid: false, error: 'Please enter a valid email address.' };
  }

  const domain = normalized.split('@')[1];
  if (KNOWN_DISPOSABLE_DOMAINS.has(domain)) {
    return {
      isValid: false,
      error: 'Temporary or disposable email addresses are not supported. Please use a permanent personal or business email.'
    };
  }

  return { isValid: true, error: null };
}
