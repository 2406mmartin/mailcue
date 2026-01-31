/**
 * Email Signature Removal Utility
 *
 * Removes common email signatures from message bodies to keep ticket content clean.
 * Handles various signature patterns including:
 * - Standard signature delimiters (-- \n)
 * - "Sent from" footers (mobile devices)
 * - Common signature phrases
 * - HTML-to-text artifacts
 */

const SIGNATURE_PATTERNS = [
  // Standard email signature delimiter (RFC 3676)
  /^--\s*$/m,

  // "Sent from" patterns (mobile devices)
  /^sent from (my )?(iphone|ipad|android|mobile|blackberry)/im,
  /^get outlook for (ios|android)/im,

  // Common signature introductions
  /^(best regards?|kind regards?|sincerely|thanks?|cheers|warm regards?|cordially),?\s*$/im,

  // Email client footers
  /^(this email was sent from|this message was sent using)/im,

  // Confidentiality notices (often part of signatures)
  /^(confidential|disclaimer|this (email|message) (is|may be))/im,

  // Social media/contact blocks
  /^(follow (me|us) on|connect with (me|us))/im,
];

/**
 * Removes email signatures from message text
 * @param text The email message body
 * @returns The message with signatures removed
 */
export function removeSignature(text: string | undefined): string | undefined {
  if (!text) return text;

  let cleaned = text;
  let signatureStartIndex = -1;

  // Split into lines for processing
  const lines = cleaned.split('\n');

  // Check each pattern
  for (const pattern of SIGNATURE_PATTERNS) {
    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i].trim())) {
        // Found a signature marker
        if (signatureStartIndex === -1 || i < signatureStartIndex) {
          signatureStartIndex = i;
        }
      }
    }
  }

  // If we found a signature, truncate at that point
  if (signatureStartIndex !== -1) {
    cleaned = lines.slice(0, signatureStartIndex).join('\n');
  }

  // Additional cleanup for common patterns that appear after quoted replies
  // Remove everything after "On ... wrote:" pattern (quoted email thread)
  const quotedReplyPattern = /^On .+ wrote:$/im;
  const quotedReplyMatch = cleaned.match(quotedReplyPattern);
  if (quotedReplyMatch && quotedReplyMatch.index !== undefined) {
    cleaned = cleaned.substring(0, quotedReplyMatch.index);
  }

  // Remove email quote blocks that start with ">"
  const quoteBlockStart = cleaned.search(/^>/m);
  if (quoteBlockStart !== -1) {
    cleaned = cleaned.substring(0, quoteBlockStart);
  }

  // Trim trailing whitespace and newlines
  cleaned = cleaned.trimEnd();

  return cleaned;
}

/**
 * Advanced signature detection using heuristics
 * Looks for common patterns like multiple lines with contact info
 */
export function removeSignatureAdvanced(text: string | undefined): string | undefined {
  if (!text) return text;

  // First apply basic signature removal
  let cleaned = removeSignature(text);
  if (!cleaned) return cleaned;

  const lines = cleaned.split('\n');

  // Heuristic: Look for blocks with high density of contact patterns
  const contactPatterns = [
    /[\w.+-]+@[\w.-]+\.\w+/,           // Email addresses
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/, // Phone numbers (US format)
    /\b\+?\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{1,9}\b/, // International phone
    /https?:\/\/[^\s]+/,                 // URLs
    /linkedin\.com|twitter\.com|facebook\.com/i, // Social media
  ];

  // Find consecutive lines with contact info (likely signature block)
  let contactBlockStart = -1;
  let consecutiveContactLines = 0;
  let firstContactLineIndex = -1;

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;

    const hasContactInfo = contactPatterns.some(pattern => pattern.test(line));

    if (hasContactInfo) {
      consecutiveContactLines++;
      firstContactLineIndex = i; // Keep updating to find the first contact line
      if (consecutiveContactLines >= 2) {
        contactBlockStart = i;
      }
    } else {
      // Check if this could be part of a signature block (name, title, etc.)
      const isPotentialSignatureLine = line.length < 50 &&
        !line.match(/[.!?]$/) && // Not a sentence ending with punctuation
        (i < lines.length - 1); // Not the last line

      if (isPotentialSignatureLine && consecutiveContactLines > 0 && firstContactLineIndex !== -1) {
        // Count lines between this potential signature line and first contact line
        const gapSize = firstContactLineIndex - i;

        // If gap is small (1-3 lines), this is likely part of the signature
        if (gapSize <= 3) {
          contactBlockStart = i;
          // Don't reset the counter, keep looking upward
        } else {
          // Gap is too large, stop here
          break;
        }
      } else if (consecutiveContactLines >= 2) {
        break; // We found our signature block
      } else {
        consecutiveContactLines = 0;
        firstContactLineIndex = -1;
      }
    }
  }

  // Remove contact block if found
  if (contactBlockStart !== -1 && contactBlockStart < lines.length - 1) {
    cleaned = lines.slice(0, contactBlockStart).join('\n').trimEnd();
  }

  return cleaned;
}
