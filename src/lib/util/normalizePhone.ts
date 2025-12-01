export function normalizeBDPhoneNumber(phone: string): string {
    if (typeof phone !== 'string') return phone;
    
    let normalizedPhone = phone.trim().replace(/\s+/g, '');
    
    // Remove +88 country code if present
    if (normalizedPhone.startsWith('+88')) {
      normalizedPhone = normalizedPhone.substring(3);
    }
  
    
    return normalizedPhone;
  }