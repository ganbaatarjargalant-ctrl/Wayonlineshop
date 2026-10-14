/** Зөвхөн сайт доторх зам руу шилжүүлнэ — гадаад URL (`https://`, `//`, `/\`) бол нүүр рүү */
export function safeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}
