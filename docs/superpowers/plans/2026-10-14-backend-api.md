# Way Academy Backend API Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax for tracking. Фазуудыг дарааллаар нь хийнэ — Phase 0 бусдын урьдчилсан нөхцөл.

**Goal:** Одоо `localStorage` mock дээр ажиллаж байгаа Way Academy frontend-д бодит backend API бичиж холбох. Mock-ийн гэрээг (`src/api/client.ts`) суурь болгоно, гэхдээ гүйцэтгэлийн 3 зөрүүг (list DTO, N+1 явц, синхрон төлбөр) **одооноос** зөв болгоно.

**Tech Stack:** Node 22+, Fastify 5, Prisma 6, PostgreSQL 16, TypeScript strict, Zod (валидаци), argon2 (нууц үг), jose (JWT), Vitest (integration тест), Testcontainers эсвэл docker-compose (тестийн DB).

> **Версийн тэмдэглэл:** дээрх мажор версиуд энэ төлөвлөгөөг бичих үеийн чиг хандлагаар бичигдсэн. Phase 2-ын `npm install` хийх үед `npm view <pkg> version`-оор бодит хамгийн сүүлийн тогтвортой версийг шалгаж, зөрвөл төлөвлөгөөг шинэчилнэ.

**Урьдчилсан нөхцөл:** `src/api/client.ts` (одоогийн 10 методын гэрээ), `src/api/mock/mockApi.ts` (бизнес дүрмийн эталон), `src/api/mock/fixtures.ts` (seed-ийн эх өгөгдөл).

## Шийдвэрүүд (хэрэглэгчээр батлагдсан)

1. **Stack:** Node + Fastify + Prisma
2. **QPay:** одоо бодитоор холбохгүй. Гэхдээ backend-д **бодит асинхрон бүтэц** (invoice → `pending` → webhook → `paid`) тавина, провайдерыг fake-ээр хэрэгжүүлнэ. Дараа нь QPay credential тавихад код өөрчлөгдөхгүй.
3. **Гэрээ:** list DTO, batch явц, pagination-ийг одооноос зөв болгоно.
4. **Видео:** бүх хичээл **YouTube** дээр (unlisted), backend нь зөвхөн `youtubeId`-г хадгална.

### Видеоны шийдвэр ба хүлээн зөвшөөрсөн эрсдэл

**Сонголт:** бүх видео YouTube дээр unlisted хэлбэрээр. Зардал 0₮, adaptive bitrate үнэгүй (сул мобайл сүлжээнд чухал), ажлын хэмжээ хамгийн бага.

**Хүлээн зөвшөөрсөн эрсдэл:** YouTube-д хэрэглэгч тус бүрийн эрх шалгах механизм байхгүй. Unlisted линк нь хугацаа дуусдаггүй бөгөөд линк хүссэн хэн ч, нэвтрэхгүйгээр үзэх боломжтой. Төлсөн хэрэглэгч линкээ хуваалцвал paywall хүчингүй болно. Энэ эрсдэлийг **мэдсээр хүлээн зөвшөөрсөн** (MVP-г хурдан гаргаж эрэлт шалгах зорилгоор).

**Эрсдэлийг хязгаарлах арга (хэрэгжүүлнэ):** `youtubeId`-г эзэмшээгүй хэрэглэгчид **хэзээ ч буцаахгүй**. Ингэснээр санамсаргүй хүн API-гаас бүх видеоны ID-г хурааж авах боломжгүй болно — эрсдэл нь "төлсөн хүн линк хуваалцах" хэмжээнд хумигдана.

**Дараа хамгаалалт нэмэх бол:** `Lesson`-д `videoProvider` enum нэмж, `bunny`/`r2` хувилбарыг signed URL-тай зэрэгцүүлнэ. Өөрчлөлт нь `Lesson` схем, backend-ийн URL шийдэх хэсэг, `VideoPlayer.tsx` гэсэн 3 цэгт хумигдана.

## Global Constraints

- Алдааны хариу нь frontend-ийн `ApiErrorCode`-той нэг-нэгээр тааруулагдана:
  `VALIDATION`→400, `UNAUTHORIZED`→401, `FORBIDDEN`→403, `NOT_FOUND`→404, `UNKNOWN`→500.
  Хариуны бие: `{ "code": "...", "message": "..." }`. Message нь монголоор, хэрэглэгчид харуулахад тохиромжтой.
- **Нууц мэдээлэл хэзээ ч кодонд байхгүй.** `DATABASE_URL`, `JWT_SECRET` зэрэг нь env-ээс. Сервер **эхлэх үед** Zod-оор шалгаж, байхгүй бол шууд унана (fail fast).
- Бүх input системийн хил дээр Zod schema-гаар валидацилагдана (Fastify schema эсвэл handler дээр).
- Алдааны message дотоод дэлгэрэнгүйг (SQL, stack, файлын зам) **хэзээ ч гаргахгүй**. Дотоод дэлгэрэнгүйг зөвхөн сервер лог руу.
- `/auth/*` endpoint-ууд дээр rate limit (`@fastify/rate-limit`).
- Нууц үг argon2id-ээр hash хийгдэнэ. Plaintext хэзээ ч хадгалагдахгүй, лог руу хэзээ ч гарахгүй.
- Үнэ нь **бүхэл тоо, төгрөг** (`Int`). Хөвөгч тоо хэзээ ч хэрэглэхгүй.
- Эзэмшлийн шалгалт (enrollment) **сервер талд**. Клиентийн хүсэлтэд хэзээ ч итгэхгүй.
- TDD: endpoint бүрт тест нь хэрэгжүүлэлтээс **өмнө**. Хамрах хүрээ 80%+.
- Хамрахгүй: админ панел, бодит QPay, DRM/HLS, имэйл илгээх, refresh token ротаци, SSR.

---

## Phase 0 — Monorepo бүтэц + хуваалцсан гэрээ

**Яагаад:** backend-ийг frontend-тэй нэг repo-д байлгаж, API-ийн type-уудыг **хоёр тал хуваалцах**. Ингэснээр гэрээ зөрөхөд build шууд унана. Одоо frontend цэвэр, backend код бичигдээгүй тул бүтцийг өөрчлөх **хамгийн хямд үе** нь яг одоо.

**Онцгой анхаарах:** энэ фаз frontend-ийн бүх файлыг зөөнө. `git mv` ашиглаж түүхийг хадгална. Нэг удаагийн зардал.

```
wayonlineshop/Wayonlineshop/
  package.json            <- workspace root (private, dependencies байхгүй)
  apps/
    web/                  <- одоогийн frontend бүхэлдээ зөөгдөнө
    api/                  <- ШИНЭ Fastify backend
  packages/
    contract/             <- ШИНЭ: хуваалцсан type + Zod schema
  docker-compose.yml      <- ШИНЭ: PostgreSQL (dev + тест)
```

- [ ] **Step 1:** npm workspaces тохируулах. Root `package.json`: `{ "private": true, "workspaces": ["apps/*", "packages/*"] }`.
- [ ] **Step 2:** `git mv`-ээр frontend-ийг `apps/web/` руу зөөх (src, public, index.html, vite.config.ts, tsconfig*, playwright.config.ts, e2e, .env.e2e, .oxlintrc.json, package.json). `docs/` нь root-д үлдэнэ.
- [ ] **Step 3:** `apps/web` дээр `npm test && npm run build` → бүгд ногоон (зөөлт юу ч эвдээгүйг батлах). Унавал зам/alias-ийг засна.
- [ ] **Step 4:** `packages/contract` үүсгэх. Энд `Level`, `Lesson`, `Section`, `Course`, `CourseSummary`, `User`, `Order`, `Progress`, `CourseFilter`, `Paginated<T>`, `ApiErrorCode` болон эдгээрийн Zod schema. `apps/web/src/api/types.ts` нь эндээс re-export хийнэ.
- [ ] **Step 5:** `docker-compose.yml` — PostgreSQL 16, dev порт 5432, тест порт 5433.
- [ ] **Step 6: Commit** — `refactor: restructure into npm workspaces with shared contract package`

---

## Phase 1 — Гэрээний засвар (3 зөрүү)

**Interfaces:** `packages/contract` дээр type-ууд, `apps/web` дээр тэдгээрийг хэрэглэгч кодууд.

Гэрээний өөрчлөлтүүд:

| Өмнө | Дараа | Яагаад |
|---|---|---|
| `getCourses(f): Promise<Course[]>` | `getCourses(f): Promise<Paginated<CourseSummary>>` | list-д `sections` шаардлагагүй; pagination |
| — | `getCoursesByIds(ids): Promise<CourseSummary[]>` | сагс бүх каталогийг татахаа болино |
| `getMyCourses(): Promise<Course[]>` | `getMyCourses(): Promise<MyCourse[]>` | явц шингэсэн → N+1 арилна |
| `Order.status: 'paid'` | `'pending' \| 'paid' \| 'failed'` | асинхрон төлбөр |
| `checkout(ids): Promise<Order>` | `checkout(ids): Promise<PaymentIntent>` | invoice + QR буцаана |
| — | `getOrder(id): Promise<Order>` | төлбөрийн статус polling |
| `Lesson.videoUrl?: string` | `Lesson.youtubeId?: string` | YouTube embed; URL-ийн параметрийг клиент шийднэ |

> **Дарааллын тэмдэглэл:** `videoUrl` → `youtubeId` нэрийн солилт нь `VideoPlayer`-ийг зэрэг өөрчлөхийг шаардана (эс тэгвээс build унана). Тиймээс энэ хоёрыг **Phase 8-д нэг нэгж** болгон хийнэ, Phase 1-д `videoUrl` хэвээр үлдэнэ. Phase 1 нь зөвхөн каталог/явц/төлбөрийн гэрээг хөндөнө.
>
> Backend нь Phase 3-аас эхлэн `youtubeId`-г хэрэглэнэ. Phase 2–8-д frontend **mock дээр** ажиллаж байгаа тул хоёр тал зөрж байх нь асуудал биш — Phase 8-д contract+mock+player зэрэг солигдож, Phase 9-д бодит API-тай холбогдоход бүрэн нийцнэ.

```ts
// packages/contract
export interface CourseSummary {
  id: string; slug: string; title: string; price: number
  thumbnail: string; category: string; level: Level
  instructor: { name: string; avatar: string }
  lessonCount: number; totalDurationSec: number
}
export interface MyCourse extends CourseSummary {
  progressPercent: number       // сервер тооцоолно
  resumeLessonId: string | null
  completedLessonIds: string[]
}
export interface Paginated<T> { items: T[]; total: number; page: number; limit: number }
export interface PaymentIntent {
  orderId: string; status: 'pending'
  qr: { text: string; image: string }   // image нь data-URI эсвэл URL
  expiresAt: string                      // ISO
}
```

- [ ] **Step 1: Тест бичих** — `mockApi`-ийн тестүүдийг шинэ гэрээгээр шинэчилнэ (RED).
- [ ] **Step 2:** `packages/contract`-д шинэ type-ууд.
- [ ] **Step 3:** `mockApi.ts`-ийг шинэ гэрээнд нийцүүлэх. Fake төлбөр: `checkout` → `pending` order + fake QR, `getOrder` → 2 дахь дуудлагаас `paid`. Ингэснээр mock ч асинхрон урсгалыг дүрслэнэ.
- [ ] **Step 4:** Frontend-ийн хэрэглэгч кодуудыг засах:
  - `CatalogPage` — `data.items`, pagination UI
  - `useCartCourses` — `getCoursesByIds(courseIds)`, бүх каталог татахаа болино
  - `MyCoursesPage` — `useProgress` per-card **хасна**, `MyCourse.progressPercent` хэрэглэнэ
  - `CheckoutPage` — бодит QR зураг + статус polling (`getOrder`), "Төлсөн" товч арилна
  - `progress.ts` — `LearnPage`-д хэрэгтэй функцууд үлдэнэ (`nextLessonId` г.м.)
- [ ] **Step 5:** `npm test && npm run build && npm run e2e` → бүгд ногоон.
- [ ] **Step 6: Commit** — `refactor(contract): paginated catalog, batch progress, async payment`

---

## Phase 2 — Fastify суурь

- [ ] **Step 1:** `apps/api` scaffold. Fastify, TypeScript strict, `tsx` watch, Vitest.
- [ ] **Step 2:** `config.ts` — Zod-оор env валидаци (`DATABASE_URL`, `JWT_SECRET` (min 32 тэмдэгт), `PORT`, `CORS_ORIGIN`). Сервер эхлэхээс өмнө шалгана.
- [ ] **Step 3:** Алдааны нэгдсэн хөрвүүлэгч — `AppError(code, message)` → HTTP status + `{code, message}`. Гэнэтийн алдаа 500 `UNKNOWN`, дэлгэрэнгүй нь зөвхөн лог руу.
- [ ] **Step 4:** `@fastify/cors` (`CORS_ORIGIN`), `@fastify/helmet`, `@fastify/rate-limit`.
- [ ] **Step 5:** `GET /health` + түүний тест.
- [ ] **Step 6: Commit** — `feat(api): fastify skeleton with env validation and error mapping`

---

## Phase 3 — Prisma schema + seed

```prisma
model User     { id String @id @default(uuid()) name String email String @unique
                 passwordHash String createdAt DateTime @default(now())
                 orders Order[] enrollments Enrollment[] progress LessonProgress[] }
model Instructor { id String @id @default(uuid()) name String avatar String bio String
                 courses Course[] }
model Course   { id String @id @default(uuid()) slug String @unique title String
                 description String price Int thumbnail String category String
                 level Level instructorId String instructor Instructor @relation(...)
                 sections Section[] @@index([category, level]) }
model Section  { id String @id @default(uuid()) courseId String order Int title String
                 lessons Lesson[] }
model Lesson   { id String @id @default(uuid()) sectionId String order Int title String
                 durationSec Int isPreview Boolean @default(false) youtubeId String }
model Order    { id String @id @default(uuid()) userId String total Int
                 status OrderStatus @default(pending) provider String
                 providerInvoiceId String? createdAt DateTime @default(now())
                 items OrderItem[] }
model OrderItem { id String @id @default(uuid()) orderId String courseId String
                 priceAtPurchase Int }          // үнийн түүхийг хөлдөөнө
model Enrollment { id String @id @default(uuid()) userId String courseId String
                 orderId String createdAt DateTime @default(now())
                 @@unique([userId, courseId]) } // эрхийн цорын ганц үнэн
model LessonProgress { id String @id @default(uuid()) userId String lessonId String
                 completedAt DateTime @default(now())
                 @@unique([userId, lessonId]) }
enum Level { beginner intermediate advanced }
enum OrderStatus { pending paid failed }
```

**Гол шийдвэрүүд:**
- `Enrollment` нь `Order`-оос **тусдаа**. Төлбөр `paid` болоход enrollment үүснэ. Эрхийг order-оор бус enrollment-ээр шалгана — ингэснээр дараа нь бэлэг/купон/админ гараар эрх өгөхөд бүтэц өөрчлөгдөхгүй.
- `OrderItem.priceAtPurchase` — хичээлийн үнэ дараа өөрчлөгдсөн ч түүх зөв хэвээр.
- `Lesson.youtubeId` нь зөвхөн YouTube-ийн 11 тэмдэгтийн ID (бүтэн URL биш). Embed URL-ийг клиент угсарна — ингэснээр `nocookie`, `rel`, `origin` зэрэг параметрийг backend-д хатуу бичихгүй.
- `youtubeId`-г эзэмшээгүй хэрэглэгчид буцаахгүй (дээрх "хүлээн зөвшөөрсөн эрсдэл" хэсгийг үз).

- [ ] **Step 1:** schema бичих, `prisma migrate dev --name init`.
- [ ] **Step 2:** `prisma/seed.ts` — `apps/web/src/api/mock/fixtures.ts`-ийн 8 хичээл, 4 категори, 5 багшийг оруулах. Idempotent (`upsert`).
      Видеоны хувьд fixtures дээрх MDN-ийн MP4 линк ашиглагдахаа болино — хичээл тус бүрт **бодит YouTube ID** хэрэгтэй. Хэрэглэгч бичлэгүүдээ upload хийх хүртэл нийтийн demo ID-аар түр тавина (seed дээр `YOUTUBE_IDS` хүснэгт болгон тусгаарлаж, дараа нь солихыг хялбар болгоно).
      Боломж: `thumbnail`-ийг picsum-ийн оронд `https://i.ytimg.com/vi/<id>/maxresdefault.jpg`-ээр авч, зураг тусад нь байршуулах шаардлагыг арилгана.
- [ ] **Step 3:** Тестийн DB helper — тест хооронд truncate.
- [ ] **Step 4: Commit** — `feat(api): prisma schema and seed from frontend fixtures`

---

## Phase 4 — Нэвтрэлт

| Endpoint | Хариу |
|---|---|
| `POST /auth/register` | `{ user, token }` |
| `POST /auth/login` | `{ user, token }` |
| `GET /auth/me` | `User` |

- [ ] **Step 1: Тест бичих** (RED): бүртгэл → токен; давхар имэйл → 400 `VALIDATION`; буруу нууц үг → 401 `UNAUTHORIZED` (имэйл байгаа эсэхийг **таниулахгүй** ижил message); токенгүй `/auth/me` → 401; хүчингүй/хугацаа дууссан токен → 401; нууц үг хариуд **хэзээ ч** байхгүй.
- [ ] **Step 2:** argon2id hash, JWT (`jose`, HS256, 7 хоног, `sub`=userId).
- [ ] **Step 3:** `requireAuth` preHandler — `Authorization: Bearer <token>`-ийг шалгаж `req.user` тавина.
- [ ] **Step 4:** Имэйлийг хадгалахын өмнө `trim().toLowerCase()`. Нууц үг min 6 тэмдэгт (frontend-ийн `validation.ts`-тай тааруулах).
- [ ] **Step 5: Commit** — `feat(api): register, login, me with argon2 and jwt`

---

## Phase 5 — Каталог

| Endpoint | Тэмдэглэл |
|---|---|
| `GET /courses?q=&category=&level=&maxPrice=&page=&limit=` | `Paginated<CourseSummary>` |
| `GET /courses/by-ids?ids=a,b,c` | `CourseSummary[]`, сагсанд |
| `GET /courses/:slug` | `Course` (sections-тэй, videoUrl нь эрхээр шүүгдсэн) |
| `GET /categories` | `string[]` |

- [ ] **Step 1: Тест бичих** (RED): шүүлт бүр; `q` нь гарчиг/тайлбар/багшийн нэрээр; pagination; `limit` дээр хязгаар (max 50, хэтэрвэл 400); байхгүй slug → 404; **эзэмшээгүй хэрэглэгчид preview биш хичээлийн `youtubeId` байхгүй**; эзэмшигчид байгаа; `CourseSummary`-д `youtubeId` хэзээ ч байхгүй (list endpoint видеоны ID тараахгүй).
- [ ] **Step 2:** `q` хайлтыг Postgres `ILIKE` + `pg_trgm` индексээр (монгол текстэд кирилл регистр зөв ажиллахыг тест)
- [ ] **Step 3:** `present()`-ийн эквивалент сервер талд — `mockApi.ts:72`-ийн дүрмийг давтана. Enrollment-ээр шалгана.
- [ ] **Step 4: Commit** — `feat(api): catalog endpoints with filters, pagination and paywall`

---

## Phase 6 — Захиалга + fake төлбөр

| Endpoint | Тэмдэглэл |
|---|---|
| `POST /orders` | `{courseIds}` → `PaymentIntent` (`pending`) |
| `GET /orders/:id` | `Order` — polling |
| `POST /payments/webhook` | провайдер дуудна → `paid`, enrollment үүсгэнэ |

**Провайдерын абстракци:**
```ts
interface PaymentProvider {
  createInvoice(o: { orderId: string; amount: number }): Promise<{ invoiceId: string; qr: { text: string; image: string } }>
  verifyWebhook(req: { body: unknown; headers: Record<string, string> }): Promise<{ invoiceId: string; paid: boolean }>
}
```
`FakeProvider` (одоо) ба `QpayProvider` (дараа) — `PAYMENT_PROVIDER` env-ээр сонгогдоно. Endpoint-ийн код хоёуланд ижил.

- [ ] **Step 1: Тест бичих** (RED): нэвтрээгүй → 401; хоосон сагс → 400; **аль хэдийн эзэмшсэн хичээл order-оос хасагдана**; бүгд эзэмшсэн бол 400; `total` нь үнийн нийлбэр; webhook → `paid` + enrollment үүснэ; **ижил webhook 2 дахин ирэхэд enrollment давхардахгүй** (idempotent); хүчингүй webhook подпись → 400 ба статус хөдлөхгүй; бусдын order-ыг харах → 403/404.
- [ ] **Step 2:** `POST /orders` — үнийг **серверээс** авна (клиентийн үнэд итгэхгүй), `pending` order + `OrderItem`-ууд, провайдерын invoice.
- [ ] **Step 3:** Webhook — подпись шалгах, транзакцаар `paid` болгож enrollment `upsert` (idempotent), `@@unique([userId, courseId])` давхардлаас хамгаална.
- [ ] **Step 4:** FakeProvider — `/payments/webhook` руу 2 секундын дараа өөрөө дуудах (dev), эсвэл тестэд гараар дуудах.
- [ ] **Step 5: Commit** — `feat(api): orders with pending-to-paid flow and idempotent enrollment`

---

## Phase 7 — Миний хичээлүүд + явц

| Endpoint | Тэмдэглэл |
|---|---|
| `GET /me/courses` | `MyCourse[]` — явц шингэсэн, N+1 арилна |
| `GET /me/progress/:courseId` | `Progress` — LearnPage-д |
| `POST /me/progress/:courseId/lessons/:lessonId` | `Progress` |

- [ ] **Step 1: Тест бичих** (RED): эзэмшээгүй хичээлийн явц → 403 `FORBIDDEN`; байхгүй хичээл → 404; `progressPercent` зөв (0%, 33%, 100%); **ижил хичээлийг 2 дахин тэмдэглэхэд давхардахгүй**; тэр хичээлд хамаарахгүй `lessonId` → 404; `resumeLessonId` нь эхний дуусаагүй хичээл.
- [ ] **Step 2:** `/me/courses` нь **нэг** query-ээр (`groupBy` эсвэл join) явцыг тооцно — хичээл тутамд нэг query **биш**.
- [ ] **Step 3: Commit** — `feat(api): my courses with embedded progress and lesson completion`

---

## Phase 8 — YouTube embed тоглуулагч

Signed URL-ийн ажил **хамаарахгүй болсон** (YouTube сонгосон тул). Үүний оронд хоёр зүйл:

### 8a. Backend — `youtubeId`-г эрхээр шүүх

- [ ] **Step 1: Тест бичих** (RED): эзэмшигч `youtubeId` авна; эзэмшээгүй → preview биш хичээлд `youtubeId` **байхгүй**; preview хичээлд эрхгүйд ч байна; `CourseSummary`-д хэзээ ч байхгүй.
- [ ] **Step 2:** `present()`-ийн эквивалентыг `youtubeId` дээр хэрэгжүүлэх (Phase 5-д хийгдсэн бол зөвхөн батлах).

### 8b. Frontend — `VideoPlayer.tsx`-ийг iframe болгох

**Гол анхаарах зүйл:** одоогийн `<video>` tag нь `onEnded` event өгдөг бөгөөд `LearnPage.tsx:44` дээр үүгээр хичээлийг **автоматаар дууссан гэж тэмдэглэдэг**. Жирийн `<iframe>` нь event өгдөггүй тул энэ функц эвдэрнэ.

**Шийдэл:** YouTube **IFrame Player API**-г ашиглана (`https://www.youtube.com/iframe_api`), `onStateChange` дээр `PlayerState.ENDED`-г барина.

- [ ] **Step 1: Тест бичих** (RED): `youtubeId` ирэхэд iframe рендерлэгдэх; `aria-label`-д хичээлийн нэр байх; `youtubeId` байхгүй үед тоглуулагч рендерлэгдэхгүй. YouTube API-г тестэд mock хийнэ (гадаад script тестэд татагдахгүй).
- [ ] **Step 2:** API script-ийг нэг л удаа ачаалах hook (`useYouTubeApi`) — хуудас хооронд дахин татахгүй.
- [ ] **Step 3:** `VideoPlayer`-ийг `youtubeId` хүлээн авдаг болгож, `onEnded`-г `onStateChange`-ээс гаргах. Embed параметрүүд:
  - `https://www.youtube-nocookie.com/embed/<id>` — cookie/tracking багасгасан домэйн
  - `rel=0` (төгсгөлд санал болгох видеог нэг каналд хязгаарлана), `playsinline=1` (iOS), `origin=<window.location.origin>`
- [ ] **Step 4:** `CourseDetailPage` болон `LearnPage`-ийн хэрэглээг шинэ prop-д тааруулах.
- [ ] **Step 5:** `npm test && npm run build && npm run e2e` → ногоон. E2E дээр `locator('video')` нь `iframe` болж өөрчлөгдөнө.
- [ ] **Step 6: Commit** — `feat(web): youtube iframe player with ended detection`

### YouTube-ийн хязгаарлалтууд (хүлээн зөвшөөрсөн)

- **`modestbranding` ажиллахаа больсон** — YouTube-ийн лого тоглуулагч дээр харагдана, нуух боломжгүй.
- **"Watch on YouTube" линк** тоглуулагч дээр гарна — хэрэглэгч YouTube руу гарч болно.
- **Сурталчилгаа** — каналыг монетизац хийгээгүй бол unlisted видеод ерөнхийдөө гарахгүй, гэхдээ YouTube эрхээ хадгална.
- **Тоглуулагчийн дизайныг хянах боломж бага** — төлбөртэй хичээлд premium мэдрэмж бага байж магад.

---

## Phase 9 — Frontend-ийг холбох

- [ ] **Step 1: Тест бичих** — `httpApi` тест (`fetch`-ийг mock, алдааны хөрвүүлэлт: 401→`UNAUTHORIZED` г.м., сүлжээний алдаа→`UNKNOWN`).
- [ ] **Step 2:** `apps/web/src/api/httpApi.ts` — `ApiClient`-ийн HTTP хэрэгжүүлэлт. `Authorization` header-ийг `getToken()`-ээс, JSON parse, алдааны бие → `ApiError`.
- [ ] **Step 3:** `createApi.ts` — `VITE_API_MODE=http` үед `createHttpApi({ baseUrl: VITE_API_URL, getToken })`. `mock` хувилбар **хэвээр үлдэнэ** (тест болон offline демод хэрэгтэй).
- [ ] **Step 4:** `env.d.ts`-д `VITE_API_URL` нэмэх. Vite dev proxy (`/api` → `localhost:3000`) эсвэл backend дээр CORS.
- [ ] **Step 5:** Unit тестүүд **mock-оор** хэвээр ажиллана (хурдан, DB шаардахгүй). E2E нь бодит backend + тестийн DB-ийн эсрэг.
- [ ] **Step 6:** `npm test && npm run build && npm run e2e` → бүгд ногоон.
- [ ] **Step 7: Commit** — `feat(web): http api client wired to backend`

---

## Phase 10 — Бэлэн болгох

- [ ] **Step 1:** `docker-compose.yml`-д api + db, `Dockerfile` (multi-stage).
- [ ] **Step 2:** `README.md` — суулгах, seed хийх, ажиллуулах заавар; env хувьсагчдын хүснэгт.
- [ ] **Step 3:** Хамрах хүрээ шалгах (80%+).
- [ ] **Step 4:** Нууц мэдээллийн аудит — кодонд hardcode секрет байхгүйг батлах.
- [ ] **Step 5: Commit** — `chore: docker setup and backend docs`

---

## Нээлттэй асуултууд

1. **Бодит YouTube ID-ууд хэзээ бэлэн болох вэ?** Seed-д 8 хичээлийн ID хэрэгтэй. Бэлэн болтол demo ID-аар түр тавина. Мөн бичлэгүүдийг **unlisted** болгож, тохиргоо дээр "Allow embedding"-ийг **заавал нээлттэй** байлгах шаардлагатай — хаалттай бол embed тоглохгүй.
2. **Багш нар контент оруулах уу?** Хэрэв тийм бол админ/багшийн эрх, upload урсгал хэрэгтэй — энэ төлөвлөгөөнд **хамрагдаагүй**, тусдаа фаз болно.
3. **Хичээл буцаах/төлбөр цуцлах** дүрэм? `Order.status`-д `refunded` нэмэх эсэх.
