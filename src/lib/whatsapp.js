/**
 * Monta um link wa.me. Telefones locais ((47) 99812-4431) recebem o DDI 55;
 * números que já vêm com DDI passam intactos.
 */
export function whatsappLink(phone, message = '') {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (!digits) return null

  const withCountry = digits.length <= 11 ? `55${digits}` : digits
  const query = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${withCountry}${query}`
}
