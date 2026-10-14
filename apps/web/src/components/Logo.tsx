/** Way Academy тэмдэг: "W" хэлбэртэй зам, төгсгөлдөө зорилгын цэгтэй */
export function LogoMark({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <path
        d="M6.5 10 L11 22.5 L16 13 L21 22.5 L24.5 13"
        fill="none"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25.5" cy="8.5" r="2.6" className="fill-accent-400" />
    </svg>
  )
}

export function Logo({ alwaysShowName = false }: { alwaysShowName?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      <span className={`${alwaysShowName ? '' : 'hidden sm:inline'} text-lg font-extrabold tracking-tight text-brand-900`}>
        Way<span className="text-brand-600"> Academy</span>
      </span>
    </span>
  )
}
