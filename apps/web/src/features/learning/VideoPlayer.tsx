/** Видео тоглуулагчийг энд тусгаарлав — дараа нь HLS/embed рүү шилжихэд зөвхөн энэ файл өөрчлөгдөнө */
export function VideoPlayer({ src, title, onEnded }: { src: string; title: string; onEnded?: () => void }) {
  return (
    <video
      key={src}
      controls
      src={src}
      aria-label={title}
      onEnded={onEnded}
      className="aspect-video w-full rounded-xl bg-black"
    />
  )
}
