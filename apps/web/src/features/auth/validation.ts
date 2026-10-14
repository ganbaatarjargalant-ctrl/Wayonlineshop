export function validateEmail(v: string): string | null {
  return /^\S+@\S+\.\S+$/.test(v.trim()) ? null : 'Имэйл буруу байна'
}

export function validatePassword(v: string): string | null {
  return v.length >= 6 ? null : 'Нууц үг хамгийн багадаа 6 тэмдэгт байна'
}

export function validateName(v: string): string | null {
  return v.trim() ? null : 'Нэрээ оруулна уу'
}
