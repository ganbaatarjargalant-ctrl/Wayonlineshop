# Онлайн сургалтын платформ — Frontend дизайн (spec)

- **Огноо:** 2026-10-12
- **Төлөв:** Батлагдсан (дизайн), хэрэгжүүлэлт эхлээгүй
- **Хүрээ:** Зөвхөн frontend. Backend, төлбөрийн интеграц энэ spec-д орохгүй.

---

## 1. Зорилго

Бэлэн байгаа видео хичээлүүдийг вэб дээр байршуулж зарах платформын **frontend**-ийг
барих. Дөрвөн хөтөлбөрийн чиглэл:

| # | Хөтөлбөр | slug |
|---|---|---|
| 1 | AI Agent Developer | `ai-agent-developer` |
| 2 | Business Agent | `business-agent` |
| 3 | Marketing Developer | `marketing-developer` |
| 4 | Data Analyst | `data-analyst` |

Монетизацийн модель: **хөтөлбөр тус бүрээр нэг удаа төлж авах** (subscription биш).
Үнэ нь хөтөлбөр тус бүрт өөр, төгрөгөөр.

Амжилтын шалгуур: сурагч нүүр хуудаснаас хөтөлбөрөө олж, силлабусыг нь судалж,
үнэгүй хичээлийг үзэж, худалдан авалтын CTA хүртэл явж чадна. Худалдан авсны дараа
суралцах орчинд хичээлүүдээ дарааллаар үзэж, явц нь хадгалагдаж, материалаа татаж,
100% дуусгахад сертификат авах төлөв харна.

---

## 2. Хүрээ

### Орох

- Нүүр хуудас (landing)
- Хөтөлбөрийн дэлгэрэнгүй хуудас × 4 (нэг template, slug-аар)
- Суралцах орчин (видео player + силлабус sidebar)
- 404 хуудас
- Үзсэн явцын хадгалалт (localStorage, `api/` layer-ийн цаана)
- Хичээлийн материал татах линк (PDF, код, холбоос)
- Сертификатын **төлөв** — 100% хүрэхэд суралцах орчинд баяр хүргэх блок +
  "Сертификат авах" товч
- Mock дата + `api/` adapter layer

### Орохгүй (дараагийн spec-үүд)

- Backend, database, API сервер
- QPay интеграц, төлбөрийн бодит урсгал
- Нэвтрэх / бүртгүүлэх хуудас (auth)
- Сурагчийн dashboard
- Admin панел
- Сертификатын PDF үүсгэх, сертификатын хуудас
- Шалгалт / quiz
- Чат, форум, live хичээл, affiliate

---

## 3. Шийдвэрүүд ба шалтгаан

| Шийдвэр | Сонголт | Шалтгаан |
|---|---|---|
| Build / stack | Vite + React + TypeScript + Tailwind + React Router | Backend байхгүй, SSR шаардлагагүй. Next.js-ийн гол ашиг (API routes, SSR) энэ хүрээнд хэрэггүй. |
| Дата | Mock TS файл + `api/` adapter layer | Backend нь баталгаатай дараагийн шат. Adapter layer нь тэр шатны зардлыг нэг хавтас солих хэмжээнд багасгана. |
| Дата fetching | TanStack Query | Mock үед ч `loading`/`error` төлөв бодитоор ажиллана. HTTP болоход query key-ууд өөрчлөгдөхгүй. |
| Global store | Байхгүй | TanStack Query + URL + локал state хангалттай. Redux/Zustand нэмэх шалтгаан байхгүй (YAGNI). |
| Видео host | YouTube unlisted, `VideoSource` adapter-ийн цаана | Зардалгүй, хурдан. Эрсдэлийг доорх хэсэгт тэмдэглэв. |
| Явцын хадгалалт | localStorage, `api/progress.ts`-ийн цаана | Сервер гарахад интерфейс нь ижил хэвээр. |
| Дизайн систем | Notion (`awesome-design-md`) | Боловсролын платформд батлагдсан төрх. 4 чиглэл техникээс бизнес хүртэл байгаа тул аль ч аудиторид дөтөөгүй. Кирилл найдвартай. |
| Контентийн валидаци | zod schema `api/` layer-ийн гаралт дээр | Дутуу/буруу дата нь цайсан дэлгэц болохын оронд тодорхой error болж барина. Дараа серверийн хариуг ижил schema шалгана. |

### Мэдэгдэж байгаа эрсдэл: YouTube unlisted

Төлбөртэй контентыг YouTube unlisted дээр тавих нь:

1. Видеоны линк тараагдвал **хэн ч үзэж болно** — техникийн хамгаалалт байхгүй.
2. YouTube-ийн ToS дагуу unlisted видеог paywall-ын цаана тавих нь эрсдэлтэй.

Энэ нь зардлыг хөнгөвчлөх зориудын шийдвэр. Эрсдэлийг хязгаарлахын тулд видеоны эх
сурвалж `VideoSource` interface-ийн цаана бүрэн тусгаарлагдана (§9). Bunny Stream
эсвэл Vimeo Pro-рүү нүүхэд шинэ adapter + шинэ player implementation л бичигдэнэ —
бусад код хөдлөхгүй.

---

## 4. Дата модель

```ts
type ProgramSlug =
  | 'ai-agent-developer'
  | 'business-agent'
  | 'marketing-developer'
  | 'data-analyst'

// `src/data/programs.ts`-д бичигддэг хэлбэр — тооцоологдох талбаргүй
type ProgramContent = {
  id: string
  slug: ProgramSlug
  title: string
  tagline: string              // нэг мөр, карт дээр
  description: string          // дэлгэрэнгүй хуудсанд
  level: 'beginner' | 'intermediate' | 'advanced'
  priceMnt: number             // төгрөг, бүхэл тоо
  outcomes: string[]           // "Юу сурах вэ" — 5-7 мөр
  audience: string[]           // "Хэнд тохирох вэ"
  instructor: Instructor
  heroImage: string
  modules: Module[]
}

// `api/programs.ts`-ийн гаралт — component-ууд зөвхөн үүнийг хардаг
type Program = ProgramContent & {
  totalDurationSec: number     // модулиудаас тооцоологдоно
  lessonCount: number          // модулиудаас тооцоологдоно
}

type Instructor = {
  id: string
  name: string
  title: string
  bio: string
  avatar: string
}

type Module = {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
}

type Lesson = {
  id: string
  title: string
  durationSec: number
  video: VideoRef
  isFreePreview: boolean
  resources: Resource[]
}

type VideoRef = { provider: 'youtube'; videoId: string }

type Resource = {
  id: string
  title: string
  type: 'pdf' | 'code' | 'link'
  url: string
}

type LessonProgress = {
  lessonId: string
  completed: boolean
  lastPositionSec: number
  updatedAt: string            // ISO
}

type ProgramProgress = {
  programId: string
  lessons: LessonProgress[]
}
```

`totalDurationSec` болон `lessonCount` нь `ProgramContent`-д байхгүй —
`api/programs.ts` нь модулиудаас тооцоолж `Program` болгон буцаана. Ингэснээр
хичээл нэмэхэд хоёр газар зэрэг засах шаардлага гарахгүй.

zod schema нь `api/` layer-ийн **гаралт** дээр ажиллана, өөрөөр хэлбэл
`ProgramSchema` нь тооцоологдсон `Program`-ийг шалгана. `ProgramContentSchema` нь
mock датаг оролтод шалгана — хоёр schema-ийн нэг нь нөгөөгөөсөө `.extend()`-ээр
гарна, давхардсан тодорхойлолт бичихгүй.

---

## 5. API layer — системийн хил

Бүх дата авалт `src/api/` дор гурван модулиар дамжина. Component-ууд эдгээрээс
өөр ямар ч дата эх сурвалжийг мэдэхгүй.

| Модуль | Функцууд | Одоогийн implementation | Дараа |
|---|---|---|---|
| `api/programs.ts` | `listPrograms(): Promise<Program[]>`, `getProgramBySlug(slug): Promise<Program>` | `src/data/programs.ts` mock массив | `GET /programs`, `GET /programs/:slug` |
| `api/progress.ts` | `getProgress(programId): Promise<ProgramProgress>`, `markComplete(programId, lessonId): Promise<ProgramProgress>`, `savePosition(programId, lessonId, sec): Promise<void>` | localStorage | `GET/PATCH /progress` |
| `api/enrollment.ts` | `isEnrolled(programId): Promise<boolean>`, `enroll(programId): Promise<void>` | localStorage flag | `GET /me/enrollments`, QPay урсгал |

Явц байхгүй хөтөлбөрт `getProgress` нь хоосон `lessons: []`-тэй `ProgramProgress`
буцаана — `null` биш, error биш. Тиймээс явцын bar 0%-ээс эхлэхэд тусдаа салаа
логик бичих шаардлагагүй.

**Дүрмүүд:**

- Гурвуулаа `Promise` буцаана — mock үед ч. Тиймээс TanStack Query-ийн
  `isLoading` / `isError` төлөвүүд одооноос бодитоор туршигдана.
- Гаралт дээр zod schema-аар `parse` хийгдэнэ. Schema нь `src/api/schemas.ts`-д,
  дата болон (дараа) серверийн хариу хоёуланд нь нэг л schema хэрэглэгдэнэ.
- Mutation-ууд хуучин объектыг засахгүй, **шинэ объект** буцаана
  (`markComplete` → шинэ `LessonProgress[]`). Дараа optimistic update нэмэхэд
  энэ хэлбэр шаардлагатай болно.
- `enroll()` нь одоохондоо localStorage flag тавина. QPay гарахад зөвхөн энэ
  функцын дотоод солигдоно.

**Query key-ууд** (HTTP болоход хэвээр):

```
['programs']
['programs', slug]
['progress', programId]
['enrollment', programId]
```

---

## 6. Хавтасны бүтэц

```
src/
  app/
    router.tsx           route тодорхойлолт
    providers.tsx        QueryClient, ErrorBoundary
    RootLayout.tsx       header / footer
  features/
    catalog/
      HomePage.tsx
      ProgramPage.tsx
      components/        ProgramCard, OutcomeGrid, SyllabusAccordion,
                         PurchaseCard, InstructorBlock, FaqAccordion
    learning/
      LearningPage.tsx
      components/        LearningLayout, SyllabusSidebar, LessonPlayer,
                         ResourceList, LessonNav, ProgressBar, CompletionBlock
  api/
    programs.ts  progress.ts  enrollment.ts  schemas.ts
  data/
    programs.ts          4 хөтөлбөрийн mock контент
    instructors.ts
  components/ui/
    Button, Card, Badge, Accordion, Skeleton, ErrorCard, Icon
  lib/
    video/               VideoSource interface + youtube adapter
    format.ts            хугацаа, үнэ формат
    storage.ts           localStorage wrapper (унших/бичих хамгаалалттай)
  styles/
    tokens.css           Notion токенууд CSS хувьсагчаар
```

Файл бүр 200–400 мөрийн хүрээнд. Нэг файл 800 мөрөөс хэтэрвэл тэр нь хэтэрхий
олон зүйл хийж байгаагийн шинж — хуваана.

---

## 7. Route-ууд ба хуудсууд

```
/                          HomePage
/programs/:slug            ProgramPage
/learn/:slug/:lessonId     LearningPage
*                          NotFoundPage
```

### 7.1 Нүүр хуудас

Дарааллаар:

1. **Hero** — `brand-navy` band, гол мессеж (`hero-display`), дэд мөр, үндсэн CTA
2. **4 хөтөлбөрийн карт** — нэг grid. Карт бүр: нэр, tagline, level badge,
   нийт хугацаа, хичээлийн тоо, үнэ, "Дэлгэрэнгүй". Фон нь хөтөлбөрийн tint (§11)
3. **"Яаж ажилладаг"** — 3 шат (сонгох → төлөх → хугацаагүй үзэх)
4. **Багш нар** — `listPrograms()`-ийн `instructor` талбаруудаас `id`-аар
   давхардлыг хасаж гаргана. Хоёр хөтөлбөр нэг багштай байж болно
5. **FAQ accordion**
6. **Доод CTA**

Дата: `listPrograms()`. 4 карт нь нэг `ProgramCard` component.

### 7.2 Хөтөлбөрийн дэлгэрэнгүй

Хоёр баганат layout. Баруун талд **sticky `PurchaseCard`**: үнэ, "Худалдан авах"
CTA, "Юу орсон" жагсаалт (хичээлийн тоо, нийт хугацаа, материал, сертификат,
хугацаагүй хандалт).

Зүүн багана дарааллаар:

1. **Hero** — нэр, tagline, level, нийт хугацаа. Хөтөлбөрийн tint сул accent болж
2. **"Юу сурах вэ"** — `outcomes` grid
3. **"Хэнд тохирох"** — `audience`
4. **Силлабус accordion** — модуль бүр нээгдэж хичээлүүдээ харуулна. Хичээл бүрт
   нэр + хугацаа. `isFreePreview: true` бол "Үнэгүй үзэх" badge, дарахад
   `/learn/:slug/:lessonId`-руу хөтөлнө
5. **Багш**
6. **FAQ**

`PurchaseCard`-ийн CTA нь `onPurchase()` гэсэн нэг функц дуудна. Одоогийн
implementation: `enroll(programId)` → суралцах орчны эхний хичээл руу шилжүүлнэ.
QPay гарахад зөвхөн энэ функц өөрчлөгдөнө.

Байхгүй slug → `NotFoundPage`. Таамагласан redirect хийхгүй.

### 7.3 Суралцах орчин

`brand-navy` суурьтай, хоёр хэсэгт хуваагдсан layout.

**Sidebar:**

- Хөтөлбөрийн нэр + нүүр руу буцах
- `ProgressBar` — "12/40 хичээл · 30%"
- Модуль бүрээр хичээлийн жагсаалт:
  - үзсэн → ✓
  - одоогийнх → онцолсон
  - түгжээтэй (`isFreePreview: false` ба `isEnrolled === false`) → 🔒, дарагдахгүй
- Мобайл дээр drawer болж хумигдана (focus trap, Esc-ээр хаагдана)

**Main:**

- `LessonPlayer` (§9)
- Хичээлийн нэр + модулийн нэр
- "Үзсэн болгох" товч (аль хэдийн үзсэн бол "Үзсэн ✓" төлөв)
- `ResourceList` — материал бүр нэр, төрлийн icon, татах линк
- `LessonNav` — "Өмнөх / Дараагийн хичээл"
- Бүх хичээл дуусмагц `CompletionBlock` — баяр хүргэх + "Сертификат авах" товч.
  Товч нь энэ spec-д зөвхөн төлөв; PDF үүсгэх нь дараагийн spec

Хичээл дуусахад дараагийнх sidebar-т онцлогдоно. **Автоматаар тоглуулахгүй** —
хэрэглэгч өөрөө шийднэ.

Түгжээтэй хичээлийн `lessonId`-тай URL-д шууд орвол → хөтөлбөрийн дэлгэрэнгүй
хуудсанд буцаана.

---

## 8. Төлөв (state)

| Төрөл | Хаана |
|---|---|
| Дата (`programs`, `progress`, `enrollment`) | TanStack Query |
| Одоогийн хичээл | **URL** (`:lessonId`) |
| Sidebar drawer нээлттэй эсэх, accordion | Component-ийн локал state |

Одоогийн хичээлийг URL-д байлгаснаар линк хуваалцах, refresh хийх, browser-ийн
back дарах — бүгд нэмэлт код бичихгүйгээр ажиллана.

Global store хэрэглэхгүй.

---

## 9. Видео adapter

```ts
// lib/video/VideoSource.ts
interface VideoSource {
  buildEmbedUrl(ref: VideoRef, opts: { start?: number }): string
}
```

`lib/video/youtube.ts` нь `youtube-nocookie.com` домэйн, `rel=0`,
`modestbranding=1` параметрүүдтэй URL бүтээнэ.

`<LessonPlayer video={ref} startAt={sec} onEnded={} onPosition={} />` component
**л** YouTube-ийн талаар мэднэ:

- YouTube IFrame API-аар `onStateChange` → `ENDED` → `onEnded()` → `markComplete`
- 5 секунд тутам `getCurrentTime()` → `onPosition(sec)` → `savePosition` (debounce)
- Component unmount болоход хамгийн сүүлийн позицийг хадгална

Bunny/Vimeo-рүү нүүх = шинэ adapter + шинэ player implementation. `LessonPlayer`-ийн
props нь өөрчлөгдөхгүй, `features/learning`-ийн бусад код хөдлөхгүй.

---

## 10. Error handling

| Тохиолдол | Хэрэглэгч юу харах | Техникийн зан |
|---|---|---|
| Байхгүй slug | 404 хуудас | `getProgramBySlug` → `NotFoundError` |
| Дата авалт нурав | Inline error карт + "Дахин оролдох" товч, монгол текст | TanStack Query `isError`, retry |
| Контентийн дата буруу хэлбэртэй | Dev: тодорхой error. Prod: тэр хэсэг нь error карт болно | zod `ContentValidationError` |
| Видео нээгдэхгүй (хасагдсан / private болсон) | Player-ийн оронд fallback карт: "Видео одоогоор нээгдэхгүй байна" + мэдэгдэх заавар | IFrame API `onError` |
| localStorage ажиллахгүй (private mode) | Нэг удаагийн мэдэгдэл: "Явц хадгалагдахгүй" | `lib/storage.ts` → in-memory fallback, апп нурахгүй |
| Түгжээтэй хичээлийн URL | Хөтөлбөрийн дэлгэрэнгүй хуудсанд буцаана | route guard |

Дүрэм: **ямар ч error нам гүм залгигдахгүй.** Хэрэглэгчид монгол хэлээр ойлгомжтой
мессеж, console-д дэлгэрэнгүй context.

Route тус бүрт error boundary + root дээр нэг. Нэг хуудас нурахад бүх апп
цайрахгүй.

---

## 11. Визуал систем — Notion

Эх сурвалж: `C:\Users\Dell\awesome-design-md\design-md\notion\DESIGN.md`.
**Энэ файлд байхгүй өнгө нэмэхгүй.**

### Өнгө (`styles/tokens.css`-д CSS хувьсагчаар)

| Токен | Hex |
|---|---|
| `primary` | `#5645d4` |
| `primary-pressed` | `#4534b3` |
| `on-primary` | `#ffffff` |
| `brand-navy` | `#0a1530` |
| `brand-navy-mid` | `#1a2a52` |
| `canvas` | `#ffffff` |
| `surface` | `#f6f5f4` |
| `surface-soft` | `#fafaf9` |
| `ink` | `#1a1a1a` |
| `charcoal` | `#37352f` |
| `slate` | `#5d5b54` |
| `steel` | `#787671` |
| `hairline` | `#e5e3df` |
| `hairline-strong` | `#c8c4be` |
| `link-blue` | `#0075de` |
| `on-dark` | `#ffffff` |
| `on-dark-muted` | `#a4a097` |

### Хөтөлбөр ↔ card tint

| Хөтөлбөр | Tint | Hex |
|---|---|---|
| AI Agent Developer | `card-tint-lavender` | `#e6e0f5` |
| Business Agent | `card-tint-sky` | `#dcecfa` |
| Marketing Developer | `card-tint-peach` | `#ffe8d4` |
| Data Analyst | `card-tint-mint` | `#d9f3e1` |

Tint дээрх текст үргэлж `charcoal` `#37352f`. Хөтөлбөрийн дэлгэрэнгүй хуудас
өөрийн tint-ээ hero-ийн сул accent болгоно — 4 хуудас нэг системийн дотор ялгарна.

`primary` `#5645d4`-ийг зөвхөн CTA, focus ring, активе төлөвт. Чимэглэлд
хэрэглэхгүй.

### Фонт

**Inter** (Google Fonts, latin + **cyrillic** subset). Шалтгаан: Notion Sans нь
Notion-ийн хувийн фонт, DESIGN.md-д заасан fallback нь `Inter, -apple-system,
system-ui, Segoe UI, Helvetica, sans-serif`. Inter кирилл бүрэн дэмждэг.

Type scale — яг DESIGN.md-ийн алхмууд, дундуур өөрийн хэмжээ зохиохгүй:

| Токен | px / weight / line-height / letter-spacing |
|---|---|
| `hero-display` | 80 / 600 / 1.05 / -2px |
| `display-lg` | 56 / 600 / 1.10 / -1px |
| `heading-1` | 48 / 600 / 1.15 / -0.5px |
| `heading-2` | 36 / 600 / 1.20 / -0.5px |
| `heading-3` | 28 / 600 / 1.25 |
| `heading-4` | 22 / 600 / 1.30 |
| `heading-5` | 18 / 600 / 1.40 |
| `subtitle` | 18 / 400 / 1.50 |
| `body-md` | 16 / 400 / 1.55 |
| `body-sm` | 14 / 400 / 1.50 |
| `caption` | 13 / 400 / 1.40 |
| `micro-uppercase` | 11 / 600 / 1.40 / +1px |
| `button-md` | 14 / 500 / 1.30 |

### Геометр ба зай

- Товч: `rounded.md` **8px** — **pill биш.** Notion-ийг бусдаас ялгадаг гол зүйл
- Карт: `rounded.lg` 12px, `1px solid hairline`
- Товчны padding: `10px 18px`
- Картны padding: `spacing.xl` 24px (жирийн) / `spacing.xxl` 32px (feature)
- Зайн шат: 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 px
- Хэсгийн хоорондох зай: `section-sm` 48 / `section` 64 / `section-lg` 96 /
  `hero` 120

### Горим

DESIGN.md-д navy hero band-аас гадна бүрэн dark-mode токен задлагдаагүй. Тиймээс:

- Нүүр ба хөтөлбөрийн хуудсууд → **light mode** (`canvas` суурь)
- Суралцах орчин → `brand-navy` `#0a1530` суурь, `on-dark` текст — видео үзэхэд
  тохиромжтой. Энэ нь шинэ өнгө зохиосон биш, DESIGN.md-ийн hero band токен

### Responsive

Mobile-first. Чухал тасралтууд:

- Хөтөлбөрийн 4 карт: 1 багана → 2 (≥768px) → 4 (≥1280px)
- Хөтөлбөрийн дэлгэрэнгүй: `PurchaseCard` нь мобайл дээр hero-ийн доор, desktop-д
  (≥1024px) баруун sticky багана
- Суралцах орчин: sidebar нь <1024px-д drawer, ≥1024px-д байнгын багана

---

## 12. Тест стратеги

Vitest + React Testing Library. Хамрах хүрээ **80%+**.

**Unit**

- `format.ts` — хугацаа (`3725` → `"1ц 2м"`), үнэ (`490000` → `"490,000₮"`)
- Явцын хувь бодолт (0 хичээл, бүгд дуусгасан, дутуу гэх мэт хязгаарын тохиолдол)
- zod schema — зөв дата pass, дутуу/буруу дата `ContentValidationError`
- `lib/video/youtube.ts` — `buildEmbedUrl` зөв домэйн, параметр, `start`

**Component**

- `ProgramCard` — дата зөв харуулна, tint зөв, линк зөв
- `SyllabusAccordion` — нээх/хаах, `isFreePreview` badge, түгжээтэй хичээл
  дарагдахгүй
- `SyllabusSidebar` — ✓ / онцолсон / 🔒 гурван төлөв
- `ProgressBar` — "12/40 хичээл · 30%"
- `LessonPlayer` — adapter mock-той, `onEnded` → callback дуудагдана
- `ErrorCard` — retry товч дарахад callback дуудагдана

**Integration** (`api/` layer-ийн fake-тэй)

- Суралцах урсгал бүтнээрээ: "Үзсэн болгох" дарах → sidebar-т ✓ гарах →
  явцын bar өөрчлөгдөх → дахин mount хийхэд хадгалагдсан байх
- Силлабусын үнэгүй хичээл дарах → суралцах орчин зөв хичээл дээр нээгдэх
- Худалдан авах CTA → `enroll()` → суралцах орчны эхний хичээл
- Байхгүй slug → 404
- Түгжээтэй хичээлийн URL → хөтөлбөрийн хуудсанд буцаана

`api/` layer нь шууд mock хийгддэг тул MSW хэрэггүй.

**Хүртээмж (accessibility)**

- Accordion keyboard-оор удирдагдана (Enter / Space / сумтай)
- Drawer-д focus trap, Esc-ээр хаагдана
- Focus ring `primary` өнгөөр, хаана ч нуугдахгүй
- Tint дээрх `charcoal` текстийн контраст AA давна

---

## 13. Хүлээн авах шалгуур

1. Нүүр хуудас 4 хөтөлбөрийг mock датанаас зөв өнгөтэйгөөр харуулна
2. Хөтөлбөрийн 4 хуудас бүгд ажиллана, силлабус нээгдэнэ, үнэгүй хичээл
   тэмдэглэгдсэн
3. Үнэгүй хичээл дарахад суралцах орчин тэр хичээл дээр нээгдэнэ
4. "Үзсэн болгох" → sidebar ✓, явцын bar өөрчлөгдөнө, refresh хийсний дараа хэвээр
5. Хичээл видео дуусахад автоматаар үзсэн болж тэмдэглэгдэнэ
6. Материалын татах линкүүд харагдаж, зөв `url`-руу хөтөлнө
7. Бүх хичээл дуусгахад `CompletionBlock` гарна
8. Худалдан авалтгүй хөтөлбөрийн төлбөртэй хичээл түгжээтэй
9. Байхгүй slug, нурсан дата, нээгдэхгүй видео — гурвуулаа ойлгомжтой монгол
   мессежтэй, апп нурахгүй
10. Мобайл (375px) болон desktop (1440px) хоёуланд layout хэвийн
11. `npm run build` цэвэр, TypeScript error байхгүй
12. Тестийн хамрах хүрээ 80%+
13. `grep`-ээр баталгаажуулсан: `tokens.css` дотор `#5645d4`, `#0a1530` болон 4
    tint байгаа, DESIGN.md-д байхгүй hex код байхгүй

---

## 14. Дараагийн spec-үүд

Дараалал:

1. **Backend + auth** — Postgres schema, нэвтрэх/бүртгүүлэх, `api/` layer-ийг
   HTTP болгох
2. **QPay интеграц** — QR үүсгэх, callback webhook, enrollment бичих
3. **Admin панел** — хөтөлбөр/модуль/хичээл нэмэх, YouTube ID болон материал
   хавсаргах, үнэ тавих
4. **Сурагчийн dashboard + сертификат** — авсан хөтөлбөрүүд, PDF сертификат үүсгэх
5. **Видео host нүүлгэх** — Bunny Stream / Vimeo Pro, signed URL
   (`VideoSource` adapter)
