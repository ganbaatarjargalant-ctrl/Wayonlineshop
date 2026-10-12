# Way Academy Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Way Academy-ийн видео хичээл зардаг дэлгүүрийн React frontend-ийг mock API давхаргатайгаар бүтээх (хуудас 1–7).

**Architecture:** Vite SPA. UI бүх өгөгдлийг `ApiClient` interface-ээр, React context (`useApi()`) дамжуулж авна. Одоогоор ганц хэрэгжүүлэлт нь `createMockApi` бөгөөд `localStorage`-д өгөгдлөө хадгална. Серверийн өгөгдлийг TanStack Query, сагс болон нэвтрэлтийг persist хийсэн Zustand store удирдана. Маршрутууд `routes` массивт тодорхойлогдоно, app-д `createBrowserRouter`, тестэд `createMemoryRouter`-ээр ашиглана.

**Tech Stack:** Vite, React 19, TypeScript (strict), React Router v7 (`react-router`), @tanstack/react-query v5, Zustand v5, Tailwind CSS v4 (`@tailwindcss/vite`), Vitest + jsdom + @testing-library/react + user-event + jest-dom, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-12-way-academy-frontend-design.md`

## Global Constraints

- UI-ийн бүх текст монгол хэлээр. i18n байхгүй, текстийг шууд бичнэ.
- Үнэ нь төгрөгөөр, бүхэл тоо. Харуулахдаа `formatPrice(49000) === "49,000₮"` хэлбэртэй.
- TypeScript `strict: true`. Импортын alias: `@/` → `src/`.
- Компонентууд `src/api/mock/`-ийг шууд импортлохгүй, зөвхөн `useApi()`-аар хандана. Mock-ийг зөвхөн `src/app/main.tsx` болон тестийн helper импортлоно.
- `VITE_API_MODE`-ийн анхдагч утга `mock`. Өөр утга ирвэл `"HTTP API хараахан хэрэгжээгүй"` гэсэн Error шиднэ.
- Mock хүсэлтийн хоцрол: `VITE_MOCK_DELAY` тохируулаагүй бол 200–500ms санамсаргүй, `VITE_MOCK_DELAY=0` бол хоцролгүй. Unit тестэд `delay: 0`.
- `localStorage`-ийн түлхүүрүүд: `way.mock.users`, `way.mock.orders`, `way.mock.progress`, `way.auth`, `way.cart`.
- Mock токен нь `mock-token-<userId>` хэлбэртэй.
- Жишээ видео URL: `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4`
- Хамрахгүй: админ, жинхэнэ төлбөр, жинхэнэ нэвтрэлт, DRM/HLS, англи хэл, SSR.

## Review Focus

1. **Эвдэрсэн `localStorage` JSON** (`'{bad'`): app унахгүй, анхдагч утга руу шилжинэ. Task 2 (`readJson`) болон Task 5 (store-ууд) тестлэнэ.
2. **Монгол кирилл үсгийн том/жижиг ялгаа, хоосон зай агуулсан хайлт** (`"  REACT "`, `"ДИЗАЙН"`): `toLocaleLowerCase` + `trim` ашиглан тааруулна. Task 2 тестлэнэ.
3. **`?redirect=` дахь гадаад URL** (`https://evil.com`, `//evil.com`): зөвхөн `/`-ээр эхэлж, `//`-ээр эхлээгүй замыг хүлээн авна, бусад үед `/` руу шилжинэ. Task 9 тестлэнэ.
4. **"Төлсөн" товчийг давхар дарах:** хүсэлт явж байх үед товч идэвхгүй болж, захиалга ганцхан үүснэ. Task 10 тестлэнэ.
5. **Сагсанд аль хэдийн худалдаж авсан эсвэл байхгүй болсон хичээл:** сагсанд харагдахгүй, нийт дүнд орохгүй, `checkout`-д давхардахгүй. Task 4 болон Task 10 тестлэнэ.
6. **`/learn/:slug/:lessonId` дахь байхгүй lessonId:** "Хуудас олдсонгүй" харуулна. Task 11 тестлэнэ.

---

### Task 1: Төслийн суурь (scaffold)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/index.css`, `src/app/main.tsx`, `src/app/routes.tsx`, `src/app/Layout.tsx`, `src/test/setup.ts`, `.gitignore`
- Test: `src/app/routes.test.tsx`

**Interfaces:**
- Produces: `routes: RouteObject[]` (`src/app/routes.tsx`). `Layout` нь `<Outlet/>`-ийг агуулна. Дараагийн task-ууд энэ массивт маршрут нэмнэ.

- [ ] **Step 1:** Repo-ийн root хоосон биш (`docs/`, `.git` байгаа) тул түр хавтсанд scaffold хийнэ: `npm create vite@latest app-tmp -- --template react-ts`. Дараа нь `app-tmp/`-ийн бүх файлыг (далд файлуудыг оруулаад) root руу зөөж, `app-tmp/`-ийг устгаж, Vite-ийн demo файлуудыг (`src/App.tsx`, `src/App.css`, `src/assets/`) устгана.
- [ ] **Step 2:** Сангуудаа суулгана:
  `npm i react-router @tanstack/react-query zustand`
  `npm i -D tailwindcss @tailwindcss/vite vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test`
- [ ] **Step 3:** `vite.config.ts`-д `@tailwindcss/vite` plugin, `@` alias, `test: { environment: 'jsdom', setupFiles: ['src/test/setup.ts'], exclude: ['e2e/**', 'node_modules/**'] }` нэмнэ. `tsconfig.app.json`-д `paths: {"@/*": ["src/*"]}` болон `"types": ["vitest/globals", "@testing-library/jest-dom"]` нэмж, vitest-д `globals: true` тохируулна. `src/index.css` = `@import "tailwindcss";`. `src/test/setup.ts` нь `@testing-library/jest-dom/vitest`-ийг импортлоод `afterEach(() => localStorage.clear())` хийнэ. `index.html` нь `src/app/main.tsx`-ийг ачаална, `lang="mn"`, `<title>Way Academy</title>`. `package.json`-ийн scripts: `"test": "vitest run"`, `"e2e": "playwright test"`.
- [ ] **Step 4: Failing тест бичих:**

```tsx
// src/app/routes.test.tsx
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { routes } from './routes';

test('root renders layout with brand', () => {
  render(<RouterProvider router={createMemoryRouter(routes, { initialEntries: ['/'] })} />);
  expect(screen.getByText('Way Academy')).toBeInTheDocument();
});
```

- [ ] **Step 5:** `npx vitest run src/app/routes.test.tsx` → FAIL (`./routes` олдохгүй).
- [ ] **Step 6:** `routes` болон `Layout`-ийг хэрэгжүүлнэ. `Layout` нь `<header>` дотор "Way Academy" текст, `<main><Outlet/></main>` агуулна. `/` маршрутын index нь түр `<h1>Нүүр</h1>`. `main.tsx` нь `createBrowserRouter(routes)`-ийг render хийж, `index.css`-ийг импортлоно.
- [ ] **Step 7:** `npm test` → PASS, `npm run build` → алдаагүй.
- [ ] **Step 8: Commit** — `chore: scaffold Vite React TS app with Tailwind and Vitest`

---

### Task 2: API төрлүүд, storage helper, fixture, каталогийн mock

**Files:**
- Create: `src/api/types.ts`, `src/api/errors.ts`, `src/api/client.ts` (зөвхөн interface), `src/api/mock/storage.ts`, `src/api/mock/fixtures.ts`, `src/api/mock/mockApi.ts`
- Test: `src/api/mock/storage.test.ts`, `src/api/mock/catalog.test.ts`

**Interfaces:**
- Produces:
  - `types.ts`: `Level`, `Course`, `Section`, `Lesson`, `User`, `Order`, `Progress`. Талбаруудыг spec-ийн 4-р хэсгээс яг хуулна. Мөн `CourseFilter = { q?: string; category?: string; level?: Level }`.
  - `errors.ts`: `type ApiErrorCode = 'UNAUTHORIZED'|'NOT_FOUND'|'FORBIDDEN'|'VALIDATION'|'UNKNOWN'`; `class ApiError extends Error { code: ApiErrorCode }` (`constructor(code, message)`); `isApiError(e: unknown): e is ApiError`.
  - `client.ts`: `interface ApiClient`. Аргуудыг spec-ийн 3-р хэсгээс яг хуулна, гагцхүү `getCourses(filter?: CourseFilter)` төрөлтэй.
  - `storage.ts`: `readJson<T>(storage: Storage, key: string, fallback: T): T` (key байхгүй эсвэл JSON эвдэрсэн үед `fallback` буцаана), `writeJson(storage: Storage, key: string, value: unknown): void`.
  - `mockApi.ts`: `createMockApi(opts: { storage: Storage; getToken: () => string | null; delay?: number | [number, number] }): ApiClient`. Энэ task-д `getCourses`, `getCourse`, `getCategories`-ийг хэрэгжүүлнэ. Бусад аргууд `throw new Error('not implemented')` хэвээр үлдэнэ.
  - `fixtures.ts`: `courses: Course[]` (`videoUrl` бүгдэд бөглөгдсөн), `categories: string[] = ['Програмчлал', 'Дизайн', 'Маркетинг', 'Англи хэл']`.

**Fixture-ийн шаардлага (тестүүд үүнд түшиглэнэ):** нийт 8 хичээл, ангилал бүрд дор хаяж 1. Заавал байх хичээлүүд:
- `{ id: 'c1', slug: 'react-ekhlel', title: 'React эхлэл', price: 49000, category: 'Програмчлал', level: 'beginner' }`, 2 бүлэг, нийт 3 хичээл: `l1` (`isPreview: true`), `l2`, `l3`.
- `{ id: 'c2', slug: 'figma-undsen', title: 'Figma үндэс', price: 39000, category: 'Дизайн', level: 'beginner' }`, хамгийн багадаа 2 хичээл, preview байхгүй.
- `level: 'advanced'` түвшинтэй хичээл яг 1.
Бусад текст (тайлбар, багш) монголоор, чөлөөтэй.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
// storage.test.ts
test('readJson returns fallback for missing key', () => {
  expect(readJson(localStorage, 'x', [])).toEqual([]);
});
test('readJson returns fallback for corrupted JSON', () => {
  localStorage.setItem('x', '{bad');
  expect(readJson(localStorage, 'x', { a: 1 })).toEqual({ a: 1 });
});
test('writeJson then readJson roundtrips', () => {
  writeJson(localStorage, 'x', { a: 2 });
  expect(readJson(localStorage, 'x', null)).toEqual({ a: 2 });
});

// catalog.test.ts
const api = () => createMockApi({ storage: localStorage, getToken: () => null, delay: 0 });

test('getCourses returns all 8 without filter', async () => {
  expect(await api().getCourses()).toHaveLength(8);
});
test('getCourses filters by category and level', async () => {
  const r = await api().getCourses({ category: 'Дизайн' });
  expect(r.every(c => c.category === 'Дизайн')).toBe(true);
  expect(await api().getCourses({ level: 'advanced' })).toHaveLength(1);
});
test('search is case-insensitive, trimmed, matches title', async () => {
  const r = await api().getCourses({ q: '  REACT ' });
  expect(r.map(c => c.slug)).toContain('react-ekhlel');
  const r2 = await api().getCourses({ q: 'FIGMA ҮНДЭС' });
  expect(r2.map(c => c.slug)).toEqual(['figma-undsen']);
});
test('getCourse strips videoUrl except preview for anonymous', async () => {
  const c = await api().getCourse('react-ekhlel');
  const lessons = c.sections.flatMap(s => s.lessons);
  expect(lessons.find(l => l.id === 'l1')!.videoUrl).toBeDefined();
  expect(lessons.find(l => l.id === 'l2')!.videoUrl).toBeUndefined();
});
test('getCourse throws NOT_FOUND for unknown slug', async () => {
  await expect(api().getCourse('nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
});
test('getCategories returns the 4 categories', async () => {
  expect(await api().getCategories()).toEqual(['Програмчлал', 'Дизайн', 'Маркетинг', 'Англи хэл']);
});
```

- [ ] **Step 2:** `npx vitest run src/api` → FAIL.
- [ ] **Step 3:** Хэрэгжүүлэх. `q`-ийг `trim().toLocaleLowerCase('mn')` хийж, мөн адил хувиргасан `title` болон `description`-оос `includes`-ээр хайна. Буцаах өгөгдөл бүрийг `structuredClone` хийнэ, ингэснээр fixture хэзээ ч өөрчлөгдөхгүй. `videoUrl`-ийг нуухдаа "preview эсвэл тухайн хэрэглэгч худалдаж авсан" гэсэн нөхцөлийг ашиглана. Худалдан авалтыг Task 4-д нэмнэ, энэ task-д зөвхөн preview-ийг шалгана. Тиймээс `isOwned(courseId): boolean` дотоод helper-ийг одоохондоо `false` буцаадаг байдлаар үүсгэнэ. Хоцролын helper: `delay` нь тоо бол тэр хэмжээгээр, `[min, max]` бол хооронд нь санамсаргүй хүлээнэ, `0` бол `await Promise.resolve()`.
- [ ] **Step 4:** `npx vitest run src/api` → PASS.
- [ ] **Step 5: Commit** — `feat(api): add types, ApiClient interface, mock catalog with fixtures`

---

### Task 3: Mock нэвтрэлт

**Files:**
- Modify: `src/api/mock/mockApi.ts`
- Test: `src/api/mock/auth.test.ts`

**Interfaces:**
- Consumes: Task 2-ийн `createMockApi`, `ApiError`, `readJson`/`writeJson`.
- Produces: `register`, `login`, `getMe`, мөн `mockApi.ts`-ийн дотоод `requireUser(): User` helper. Энэ helper токен байхгүй эсвэл хүчингүй үед `UNAUTHORIZED` шиднэ, Task 4 үүнийг ашиглана. Хэрэглэгчид `way.mock.users`-д `{ id, name, email, password }` хэлбэрээр хадгалагдана. Mock тул нууц үгийг энгийн текстээр хадгална.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
let token: string | null = null;
const api = () => createMockApi({ storage: localStorage, getToken: () => token, delay: 0 });
beforeEach(() => { token = null; });

test('register returns user and mock token', async () => {
  const r = await api().register({ name: 'Бат', email: 'bat@test.mn', password: 'secret1' });
  expect(r.user).toMatchObject({ name: 'Бат', email: 'bat@test.mn' });
  expect(r.user).not.toHaveProperty('password');
  expect(r.token).toBe(`mock-token-${r.user.id}`);
});
test('register rejects duplicate email (case-insensitive) with VALIDATION', async () => {
  await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' });
  await expect(api().register({ name: 'B', email: 'A@test.mn', password: 'secret1' }))
    .rejects.toMatchObject({ code: 'VALIDATION', message: 'Энэ имэйл бүртгэлтэй байна' });
});
test('login with wrong password → UNAUTHORIZED', async () => {
  await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' });
  await expect(api().login({ email: 'a@test.mn', password: 'wrong00' }))
    .rejects.toMatchObject({ code: 'UNAUTHORIZED', message: 'Имэйл эсвэл нууц үг буруу байна' });
});
test('getMe uses token; no token → UNAUTHORIZED', async () => {
  await expect(api().getMe()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  const r = await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' });
  token = r.token;
  expect(await api().getMe()).toEqual(r.user);
});
test('unknown token → UNAUTHORIZED', async () => {
  token = 'mock-token-ghost';
  await expect(api().getMe()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
});
```

- [ ] **Step 2:** `npx vitest run src/api/mock/auth.test.ts` → FAIL.
- [ ] **Step 3:** Хэрэгжүүлэх. Id-г `crypto.randomUUID()`-ээр үүсгэнэ, имэйлийг `toLowerCase()` болгож хадгална.
- [ ] **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat(api): mock register/login/getMe`

---

### Task 4: Mock худалдан авалт ба явц

**Files:**
- Modify: `src/api/mock/mockApi.ts`
- Test: `src/api/mock/purchase.test.ts`

**Interfaces:**
- Consumes: Task 3-ийн `requireUser`.
- Produces: `checkout`, `getMyCourses`, `getProgress`, `markLessonComplete`. Захиалгууд `way.mock.orders`-д `Order & { userId }` хэлбэрээр, явц `way.mock.progress`-д `Record<"<userId>:<courseId>", string[]>` хэлбэрээр хадгалагдана. `isOwned` нь одоо жинхэнэ шалгалт хийнэ: токен хүчинтэй бөгөөд тухайн хэрэглэгчийн захиалгад хичээл байгаа эсэх.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
let token: string | null = null;
const api = () => createMockApi({ storage: localStorage, getToken: () => token, delay: 0 });
beforeEach(async () => {
  token = null;
  token = (await api().register({ name: 'A', email: 'a@test.mn', password: 'secret1' })).token;
});

test('checkout creates paid order with summed total', async () => {
  const o = await api().checkout(['c1', 'c2']);
  expect(o).toMatchObject({ courseIds: ['c1', 'c2'], total: 88000, status: 'paid' });
});
test('checkout skips owned and unknown ids; all skipped → VALIDATION', async () => {
  await api().checkout(['c1']);
  const o = await api().checkout(['c1', 'c2', 'ghost']);
  expect(o.courseIds).toEqual(['c2']);
  expect(o.total).toBe(39000);
  await expect(api().checkout(['c1'])).rejects.toMatchObject({ code: 'VALIDATION' });
});
test('checkout without token → UNAUTHORIZED', async () => {
  token = null;
  await expect(api().checkout(['c1'])).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
});
test('getMyCourses lists purchased courses', async () => {
  expect(await api().getMyCourses()).toEqual([]);
  await api().checkout(['c1']);
  expect((await api().getMyCourses()).map(c => c.id)).toEqual(['c1']);
});
test('owned course exposes all videoUrls', async () => {
  await api().checkout(['c1']);
  const lessons = (await api().getCourse('react-ekhlel')).sections.flatMap(s => s.lessons);
  expect(lessons.every(l => l.videoUrl)).toBe(true);
});
test('progress: FORBIDDEN when not owned, idempotent mark when owned', async () => {
  await expect(api().getProgress('c1')).rejects.toMatchObject({ code: 'FORBIDDEN' });
  await api().checkout(['c1']);
  expect(await api().getProgress('c1')).toEqual({ courseId: 'c1', completedLessonIds: [] });
  await api().markLessonComplete('c1', 'l2');
  const p = await api().markLessonComplete('c1', 'l2');
  expect(p.completedLessonIds).toEqual(['l2']);
});
test('markLessonComplete with lesson not in course → NOT_FOUND', async () => {
  await api().checkout(['c1']);
  await expect(api().markLessonComplete('c1', 'zzz')).rejects.toMatchObject({ code: 'NOT_FOUND' });
});
```

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Хэрэгжүүлэх.
- [ ] **Step 4:** `npx vitest run src/api` → бүгд PASS.
- [ ] **Step 5: Commit** — `feat(api): mock checkout, my courses, progress`

---

### Task 5: Provider-ууд, store-ууд, тестийн render helper

**Files:**
- Create: `src/api/ApiProvider.tsx`, `src/api/createApi.ts`, `src/app/queryClient.ts`, `src/app/Providers.tsx`, `src/features/auth/authStore.ts`, `src/features/cart/cartStore.ts`, `src/lib/persistStorage.ts`, `src/test/renderApp.tsx`
- Modify: `src/app/main.tsx`
- Test: `src/features/cart/cartStore.test.ts`, `src/features/auth/authStore.test.ts`, `src/app/queryClient.test.ts`

**Interfaces:**
- Produces:
  - `ApiProvider({ api, children })`, `useApi(): ApiClient` (provider байхгүй бол throw).
  - `createApi(env: { VITE_API_MODE?: string; VITE_MOCK_DELAY?: string }): ApiClient`. Энэ функц `createMockApi`-ийг `{ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: VITE_MOCK_DELAY !== undefined ? Number(VITE_MOCK_DELAY) : [200, 500] }` гэж дуудна. `VITE_API_MODE` нь `mock`-оос өөр утгатай бол Global Constraints-д заасан Error шиднэ.
  - `useAuthStore`: `{ user: User | null; token: string | null; setSession(user, token): void; clear(): void }`, `way.auth`-д persist хийнэ.
  - `useCartStore`: `{ courseIds: string[]; add(id): void; remove(id): void; clear(): void }`, `way.cart`-д persist хийнэ. `add` давхардал үүсгэхгүй.
  - `safeJSONStorage`: эвдэрсэн JSON-ийг `null` гэж уншдаг `createJSONStorage` wrapper. Хоёр store хоёулаа үүнийг ашиглана.
  - `createQueryClient(onUnauthorized: () => void): QueryClient`. QueryCache болон MutationCache-ийн `onError` дээр `isApiError(e) && e.code === 'UNAUTHORIZED'` бол `onUnauthorized()` дуудна. `retry`-г тестэд `false`, бусад үед `1` болгоно (`createQueryClient(onUnauth, { retry })` гэсэн 2 дахь сонголттой аргумент).
  - Query key-үүд (бүх task-д ижил): `['courses', filter]`, `['course', slug]`, `['categories']`, `['myCourses']`, `['progress', courseId]`.
  - `Providers({ api, queryClient, children })`.
  - `renderApp(path: string, opts?: { api?: ApiClient }): { user: UserEvent; api: ApiClient; router }`. Энэ helper `createMemoryRouter(routes, { initialEntries: [path] })`-ийг `Providers`-оор ороож render хийнэ. `api`-ийн анхдагч утга нь `createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 })`, `retry: false`. Мөн `loginAs(api, { name?, email?, password? }): Promise<User>` helper-ийг export хийнэ. Энэ нь бүртгүүлээд `setSession` дуудна.
- `main.tsx`: `createApi(import.meta.env)`, `createQueryClient(() => useAuthStore.getState().clear())`, `Providers` + `RouterProvider`.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
// cartStore.test.ts
test('add dedupes, remove, clear', () => {
  const s = useCartStore.getState();
  s.add('c1'); s.add('c1'); s.add('c2');
  expect(useCartStore.getState().courseIds).toEqual(['c1', 'c2']);
  s.remove('c1');
  expect(useCartStore.getState().courseIds).toEqual(['c2']);
  s.clear();
  expect(useCartStore.getState().courseIds).toEqual([]);
});
test('persists to way.cart', () => {
  useCartStore.getState().add('c3');
  expect(localStorage.getItem('way.cart')).toContain('c3');
});
test('corrupted way.cart rehydrates to empty without throwing', async () => {
  localStorage.setItem('way.cart', '{bad');
  await useCartStore.persist.rehydrate();
  expect(useCartStore.getState().courseIds).toEqual([]);
});

// authStore.test.ts
test('setSession and clear', () => {
  useAuthStore.getState().setSession({ id: 'u', name: 'A', email: 'a@x.mn' }, 't');
  expect(useAuthStore.getState().token).toBe('t');
  useAuthStore.getState().clear();
  expect(useAuthStore.getState()).toMatchObject({ user: null, token: null });
});

// queryClient.test.ts
test('UNAUTHORIZED query error triggers onUnauthorized', async () => {
  const onUnauth = vi.fn();
  const qc = createQueryClient(onUnauth, { retry: false });
  await qc.fetchQuery({ queryKey: ['x'], queryFn: () => Promise.reject(new ApiError('UNAUTHORIZED', 'x')) }).catch(() => {});
  expect(onUnauth).toHaveBeenCalledOnce();
});
test('createApi throws for http mode', () => {
  expect(() => createApi({ VITE_API_MODE: 'http' })).toThrow('HTTP API хараахан хэрэгжээгүй');
});
```

Store тест бүрийн өмнө `beforeEach`-д `useCartStore.setState({ courseIds: [] })` болон `useAuthStore.setState({ user: null, token: null })`-ээр төлөвийг цэвэрлэнэ.

- [ ] **Step 2:** FAIL.
- [ ] **Step 3:** Хэрэгжүүлэх.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5: Commit** — `feat: add api provider, query client, auth and cart stores`

---

### Task 6: Ерөнхий UI компонентууд ба Header

**Files:**
- Create: `src/lib/format.ts`, `src/components/Button.tsx`, `src/components/CourseCard.tsx`, `src/components/Header.tsx`, `src/components/states.tsx` (`Skeleton`, `ErrorState`, `EmptyState`), `src/pages/NotFoundPage.tsx`
- Modify: `src/app/Layout.tsx` (Header + Footer ашиглана), `src/app/routes.tsx` (`*` → NotFoundPage)
- Test: `src/lib/format.test.ts`, `src/components/components.test.tsx`

**Interfaces:**
- Produces:
  - `formatPrice(n: number): string` → `"49,000₮"`. `levelLabel: Record<Level, string> = { beginner: 'Анхан шат', intermediate: 'Дунд шат', advanced: 'Ахисан шат' }`. `formatDuration(sec: number): string` → `"5:07"` (минут:секунд, секунд 2 оронтой).
  - `CourseCard({ course, footer?: ReactNode })`. Гарчиг нь `/courses/:slug` руу линк, мөн thumbnail, багшийн нэр, `formatPrice`, `levelLabel`-ийг харуулна. `footer` өгвөл үнийн оронд түүнийг харуулна.
  - `ErrorState({ onRetry })`: "Алдаа гарлаа" текст, "Дахин оролдох" товч. `EmptyState({ message })`. `Skeleton({ count?: number })`.
  - `Header`: "Way Academy" (линк `/`), "Хичээлүүд" (`/courses`), сагсны линк (`aria-label="Сагс"`, `courseIds.length`-ийг харуулна). Нэвтэрсэн үед "Миний хичээлүүд" (`/my-courses`) болон "Гарах" товч (`clear()` + `/` руу шилжинэ) харагдана. Нэвтрээгүй үед "Нэвтрэх" (`/login`) харагдана.
  - `NotFoundPage`: "Хуудас олдсонгүй" + нүүр рүү буцах линк.

- [ ] **Step 1: Failing тестүүд бичих:**

```tsx
test('formatPrice', () => {
  expect(formatPrice(49000)).toBe('49,000₮');
  expect(formatPrice(1250000)).toBe('1,250,000₮');
  expect(formatPrice(0)).toBe('0₮');
});
test('formatDuration', () => { expect(formatDuration(307)).toBe('5:07'); });

test('header shows cart count and login link when anonymous', async () => {
  useCartStore.setState({ courseIds: ['c1', 'c2'] });
  renderApp('/');
  expect(screen.getByRole('link', { name: /Сагс/ })).toHaveTextContent('2');
  expect(screen.getByRole('link', { name: 'Нэвтрэх' })).toBeInTheDocument();
});
test('header shows my courses and logout when logged in', async () => {
  const { user, api } = renderApp('/');
  await act(() => loginAs(api, {}));
  expect(await screen.findByRole('link', { name: 'Миний хичээлүүд' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Гарах' }));
  expect(useAuthStore.getState().token).toBeNull();
});
test('unknown route renders 404', () => {
  renderApp('/no-such-page');
  expect(screen.getByText('Хуудас олдсонгүй')).toBeInTheDocument();
});
test('ErrorState calls onRetry', async () => {
  const onRetry = vi.fn();
  render(<ErrorState onRetry={onRetry} />);
  await userEvent.click(screen.getByRole('button', { name: 'Дахин оролдох' }));
  expect(onRetry).toHaveBeenCalled();
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх (Tailwind, энгийн цэвэр загвар, mobile-first). **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat(ui): shared components, header, 404`

---

### Task 7: Нүүр болон каталогийн хуудас

**Files:**
- Create: `src/features/catalog/queries.ts`, `src/features/catalog/CatalogFilters.tsx`, `src/pages/HomePage.tsx`, `src/pages/CatalogPage.tsx`
- Modify: `src/app/routes.tsx`
- Test: `src/pages/catalog.test.tsx`

**Interfaces:**
- Consumes: `useApi`, `CourseCard`, `states`, `levelLabel`.
- Produces: `useCourses(filter: CourseFilter)`, `useCategories()` (`queries.ts`).
- HomePage: hero (`<h1>` "Way Academy"-д тохирсон мэдлэгийн уриа, "Хичээлүүдийг үзэх" → `/courses`), "Онцлох хичээлүүд" (эхний 4 хичээл), ангиллуудын линк (`/courses?category=<нэр>`).
- CatalogPage: шүүлтүүрийг URL query-ээс уншиж бичнэ (`q`, `category`, `level`). Талбарууд: `<input aria-label="Хайх">`, `<select aria-label="Ангилал">` ("Бүгд" + ангиллууд), `<select aria-label="Түвшин">` ("Бүгд" + `levelLabel`). Хайлтын утга бичигдэх тусам шууд URL-д орно, debounce шаардлагагүй. Үр дүн хоосон бол "Хайлтад тохирох хичээл олдсонгүй".

- [ ] **Step 1: Failing тестүүд бичих:**

```tsx
test('home shows featured courses', async () => {
  renderApp('/');
  expect(await screen.findAllByRole('link', { name: /React эхлэл|Figma үндэс/ })).not.toHaveLength(0);
});
test('catalog reads category from URL', async () => {
  renderApp('/courses?category=Дизайн');
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument();
  expect(screen.getByLabelText('Ангилал')).toHaveValue('Дизайн');
});
test('typing in search updates URL and results', async () => {
  const { user, router } = renderApp('/courses');
  await screen.findByRole('link', { name: 'React эхлэл' });
  await user.type(screen.getByLabelText('Хайх'), 'figma');
  expect(await screen.findByRole('link', { name: 'Figma үндэс' })).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument());
  expect(router.state.location.search).toContain('q=figma');
});
test('no results shows empty state', async () => {
  renderApp('/courses?q=zzzzzz');
  expect(await screen.findByText('Хайлтад тохирох хичээл олдсонгүй')).toBeInTheDocument();
});
test('api failure shows error state with retry', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => null, delay: 0 });
  api.getCourses = vi.fn().mockRejectedValueOnce(new ApiError('UNKNOWN', 'x')).mockResolvedValue([]);
  const { user } = renderApp('/courses', { api });
  await user.click(await screen.findByRole('button', { name: 'Дахин оролдох' }));
  expect(await screen.findByText('Хайлтад тохирох хичээл олдсонгүй')).toBeInTheDocument();
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх. **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat: home and catalog pages with URL filters`

---

### Task 8: Хичээлийн дэлгэрэнгүй хуудас ба VideoPlayer

**Files:**
- Create: `src/features/course/queries.ts`, `src/features/learning/VideoPlayer.tsx`, `src/features/course/CurriculumList.tsx`, `src/pages/CourseDetailPage.tsx`
- Modify: `src/app/routes.tsx`
- Test: `src/pages/courseDetail.test.tsx`

**Interfaces:**
- Consumes: `useApi`, `useCartStore`, `useAuthStore`, `formatPrice`, `formatDuration`.
- Produces:
  - `useCourse(slug)`, `useMyCourses({ enabled: boolean })` (`queries.ts`, key `['myCourses']`). Task 10 болон 11 үүнийг дахин ашиглана.
  - `VideoPlayer({ src, title, onEnded? })`: `<video controls src aria-label={title}>`. Тоглуулагчийг бүхэлд нь энэ компонентод тусгаарлана.
  - `CurriculumList({ course, activeLessonId?, completedIds?, renderAction?: (lesson) => ReactNode })`: бүлэг болон хичээлүүдийг үргэлжлэх хугацаатай нь харуулна. Task 11 дахин ашиглана.
- CourseDetailPage-ийн дүрмүүд:
  - Хичээл худалдаж авсан бол (`useMyCourses`-д байгаа) "Үзэх" линк `/learn/:slug/<эхний хичээлийн id>` руу заана.
  - Сагсанд байгаа бол "Сагс руу очих" линк (`/cart`) харагдана.
  - Бусад үед "Сагсанд нэмэх" товч харагдана.
  - Preview хичээл бүрийн хажууд "Урьдчилан үзэх" товч байна, дарахад хуудсан дээр `VideoPlayer` нээгдэнэ.
  - `location.state?.notice`-д текст байвал баннер болгож харуулна. Task 11 үүнийг ашиглана.
  - `NOT_FOUND` ирвэл `NotFoundPage` харуулна.

- [ ] **Step 1: Failing тестүүд бичих:**

```tsx
test('shows course info and curriculum', async () => {
  renderApp('/courses/react-ekhlel');
  expect(await screen.findByRole('heading', { name: 'React эхлэл' })).toBeInTheDocument();
  expect(screen.getByText('49,000₮')).toBeInTheDocument();
});
test('add to cart switches button to go-to-cart link', async () => {
  const { user } = renderApp('/courses/react-ekhlel');
  await user.click(await screen.findByRole('button', { name: 'Сагсанд нэмэх' }));
  expect(useCartStore.getState().courseIds).toEqual(['c1']);
  expect(screen.getByRole('link', { name: 'Сагс руу очих' })).toHaveAttribute('href', '/cart');
});
test('preview opens a video player', async () => {
  const { user } = renderApp('/courses/react-ekhlel');
  await user.click(await screen.findByRole('button', { name: 'Урьдчилан үзэх' }));
  expect(document.querySelector('video')).toHaveAttribute('src', expect.stringContaining('flower.mp4'));
});
test('owned course shows watch link instead of add-to-cart', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  await api.checkout(['c1']);
  renderApp('/courses/react-ekhlel', { api });
  expect(await screen.findByRole('link', { name: 'Үзэх' })).toHaveAttribute('href', '/learn/react-ekhlel/l1');
  expect(screen.queryByRole('button', { name: 'Сагсанд нэмэх' })).not.toBeInTheDocument();
});
test('unknown slug renders 404', async () => {
  renderApp('/courses/nope');
  expect(await screen.findByText('Хуудас олдсонгүй')).toBeInTheDocument();
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх. **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat: course detail page with preview player and cart actions`

---

### Task 9: Нэвтрэх, бүртгүүлэх, хамгаалалттай маршрут

**Files:**
- Create: `src/features/auth/RequireAuth.tsx`, `src/features/auth/safeRedirect.ts`, `src/features/auth/validation.ts`, `src/pages/LoginPage.tsx`, `src/pages/RegisterPage.tsx`
- Modify: `src/app/routes.tsx`
- Test: `src/features/auth/safeRedirect.test.ts`, `src/pages/auth.test.tsx`

**Interfaces:**
- Produces:
  - `safeRedirect(raw: string | null): string`. `/`-ээр эхэлсэн бөгөөд `//`-ээр эхлээгүй бол тэр утгаа, бусад үед `'/'` буцаана.
  - `RequireAuth({ children })`: токен байхгүй бол `<Navigate to={'/login?redirect=' + encodeURIComponent(pathname + search)} replace />`.
  - `validateEmail(v): string | null` → `'Имэйл буруу байна'` (`/^\S+@\S+\.\S+$/`-д тохирохгүй үед). `validatePassword(v)` → `'Нууц үг хамгийн багадаа 6 тэмдэгт байна'`. `validateName(v)` → `'Нэрээ оруулна уу'` (trim хийсний дараа хоосон бол).
- LoginPage: "Имэйл" ба "Нууц үг" талбар, "Нэвтрэх" товч, "Бүртгүүлэх" линк (`?redirect`-ийг дамжуулна). RegisterPage-д "Нэр" талбар нэмэгдэж, товч нь "Бүртгүүлэх". Амжилттай бол `setSession` дуудаж, `safeRedirect(searchParams.get('redirect'))` руу `replace` горимоор шилжинэ. API-ийн `ApiError.message`-ийг формын дээр `role="alert"`-тайгаар харуулна. Талбарын алдаа тухайн талбарын доор гарна. Хүсэлт явж байх үед товч идэвхгүй.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
test.each([
  ['/my-courses', '/my-courses'],
  ['/learn/a/b?x=1', '/learn/a/b?x=1'],
  ['https://evil.com', '/'],
  ['//evil.com', '/'],
  [null, '/'],
  ['', '/'],
])('safeRedirect(%s) → %s', (raw, out) => expect(safeRedirect(raw)).toBe(out));
```

```tsx
test('protected route redirects to login with redirect param', async () => {
  const { router } = renderApp('/my-courses');
  await screen.findByRole('button', { name: 'Нэвтрэх' });
  expect(router.state.location.pathname).toBe('/login');
  expect(new URLSearchParams(router.state.location.search).get('redirect')).toBe('/my-courses');
});
test('register validates fields in Mongolian', async () => {
  const { user } = renderApp('/register');
  await user.type(screen.getByLabelText('Имэйл'), 'bad');
  await user.type(screen.getByLabelText('Нууц үг'), '123');
  await user.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }));
  expect(screen.getByText('Нэрээ оруулна уу')).toBeInTheDocument();
  expect(screen.getByText('Имэйл буруу байна')).toBeInTheDocument();
  expect(screen.getByText('Нууц үг хамгийн багадаа 6 тэмдэгт байна')).toBeInTheDocument();
});
test('register then lands on redirect target', async () => {
  const { user, router } = renderApp('/register?redirect=%2Fcart');
  await user.type(screen.getByLabelText('Нэр'), 'Бат');
  await user.type(screen.getByLabelText('Имэйл'), 'bat@test.mn');
  await user.type(screen.getByLabelText('Нууц үг'), 'secret1');
  await user.click(screen.getByRole('button', { name: 'Бүртгүүлэх' }));
  await waitFor(() => expect(router.state.location.pathname).toBe('/cart'));
  expect(useAuthStore.getState().user?.name).toBe('Бат');
});
test('wrong password shows API error', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => null, delay: 0 });
  await api.register({ name: 'A', email: 'a@test.mn', password: 'secret1' });
  const { user } = renderApp('/login', { api });
  await user.type(screen.getByLabelText('Имэйл'), 'a@test.mn');
  await user.type(screen.getByLabelText('Нууц үг'), 'wrong00');
  await user.click(screen.getByRole('button', { name: 'Нэвтрэх' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Имэйл эсвэл нууц үг буруу байна');
});
test('external redirect param is ignored after login', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => null, delay: 0 });
  await api.register({ name: 'A', email: 'a@test.mn', password: 'secret1' });
  const { user, router } = renderApp('/login?redirect=https%3A%2F%2Fevil.com', { api });
  await user.type(screen.getByLabelText('Имэйл'), 'a@test.mn');
  await user.type(screen.getByLabelText('Нууц үг'), 'secret1');
  await user.click(screen.getByRole('button', { name: 'Нэвтрэх' }));
  await waitFor(() => expect(router.state.location.pathname).toBe('/'));
});
```

Анхаар: `Header`-т мөн "Нэвтрэх" нэртэй линк байдаг тул формын товчийг `getByRole('button', ...)`-ээр ялгана.

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх. `/my-courses` маршрутыг энэ task-д түр `<RequireAuth><h1>Миний хичээлүүд</h1></RequireAuth>` гэж бүртгэнэ, Task 11 жинхэнэ хуудсаар солино. **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat(auth): login, register, protected routes, safe redirect`

---

### Task 10: Сагс ба төлбөрийн хуудас

**Files:**
- Create: `src/features/cart/useCartCourses.ts`, `src/pages/CartPage.tsx`, `src/pages/CheckoutPage.tsx`
- Modify: `src/app/routes.tsx` (`/checkout`-ийг `RequireAuth`-аар ороох)
- Test: `src/pages/cart.test.tsx`

**Interfaces:**
- Consumes: `useCartStore`, `useMyCourses` (Task 8), `useCourses({})` (Task 7), `RequireAuth`.
- Produces: `useCartCourses(): { courses: Course[]; total: number; isLoading: boolean }`. Сагсны id-уудаас байхгүй хичээл болон аль хэдийн худалдаж авсан хичээлийг хасна (нэвтэрсэн үед `useMyCourses`-ийг ашиглана).
- CartPage: хичээл бүрийг `CourseCard` + "Хасах" товчтой харуулна. Доор нь "Нийт: <formatPrice>" болон "Төлбөр төлөх" линк (`/checkout`). Хоосон бол "Таны сагс хоосон байна" + "Хичээлүүдийг үзэх" линк.
- CheckoutPage: "QPay-ээр төлөх" гарчиг, нийт дүн, QR-ийн оронд `aria-label="QPay QR код"`-той саарал дөрвөлжин, "Төлсөн" товч. Товчийг дарахад `useMutation` нь `api.checkout(courses.map(c => c.id))`-ийг дуудна, хүсэлт явж байх үед товч идэвхгүй, `"Шалгаж байна..."` гэж бичигдэнэ. Амжилттай бол `clear()` дуудаж, `['myCourses']` query-г invalidate хийгээд `/my-courses` руу `replace` горимоор шилжинэ. Сагс хоосон бол `/cart` руу `Navigate` хийнэ. Алдаа гарвал `role="alert"`-тай мессеж харуулна.

- [ ] **Step 1: Failing тестүүд бичих:**

```tsx
test('cart lists items with total and remove', async () => {
  useCartStore.setState({ courseIds: ['c1', 'c2'] });
  const { user } = renderApp('/cart');
  expect(await screen.findByText('Нийт: 88,000₮')).toBeInTheDocument();
  await user.click(screen.getAllByRole('button', { name: 'Хасах' })[0]);
  expect(await screen.findByText('Нийт: 39,000₮')).toBeInTheDocument();
});
test('empty cart message', async () => {
  renderApp('/cart');
  expect(await screen.findByText('Таны сагс хоосон байна')).toBeInTheDocument();
});
test('cart hides owned and unknown ids', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  await api.checkout(['c1']);
  useCartStore.setState({ courseIds: ['c1', 'c2', 'ghost'] });
  renderApp('/cart', { api });
  expect(await screen.findByText('Нийт: 39,000₮')).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'React эхлэл' })).not.toBeInTheDocument();
});
test('checkout pays once even on double click, clears cart, goes to my courses', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  const spy = vi.spyOn(api, 'checkout');
  useCartStore.setState({ courseIds: ['c1'] });
  const { user, router } = renderApp('/checkout', { api });
  const btn = await screen.findByRole('button', { name: 'Төлсөн' });
  await user.dblClick(btn);
  await waitFor(() => expect(router.state.location.pathname).toBe('/my-courses'));
  expect(spy).toHaveBeenCalledTimes(1);
  expect(useCartStore.getState().courseIds).toEqual([]);
});
test('checkout requires login', async () => {
  useCartStore.setState({ courseIds: ['c1'] });
  const { router } = renderApp('/checkout');
  await waitFor(() => expect(router.state.location.pathname).toBe('/login'));
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх. Давхар дарахаас хамгаалахдаа `disabled={mutation.isPending}` дээр нэмээд click handler-ийн эхэнд `if (mutation.isPending) return` шалгалт хийнэ. **Step 4:** PASS.
- [ ] **Step 5: Commit** — `feat: cart and mock QPay checkout`

---

### Task 11: "Миний хичээлүүд" ба видео үзэх хуудас

**Files:**
- Create: `src/features/learning/queries.ts`, `src/features/learning/progress.ts`, `src/pages/MyCoursesPage.tsx`, `src/pages/LearnPage.tsx`
- Modify: `src/app/routes.tsx` (`/my-courses`, `/learn/:slug/:lessonId`, хоёулаа `RequireAuth`-тай)
- Test: `src/features/learning/progress.test.ts`, `src/pages/learning.test.tsx`

**Interfaces:**
- Consumes: `useCourse`, `useMyCourses`, `CurriculumList`, `VideoPlayer`, `CourseCard({ footer })`.
- Produces:
  - `progressPercent(course: Course, completedIds: string[]): number` = `Math.round(completed / total * 100)`. Зөвхөн тухайн хичээлд байгаа id-уудыг тоолно, хичээл байхгүй бол `0`.
  - `firstLessonId(course): string`, `nextLessonId(course, lessonId): string | null`. Дараагийн хичээлийг бүлэг дамнан хайна.
  - `useProgress(courseId, { enabled })`, `useMarkComplete(courseId)`. Mutation амжилттай болбол `['progress', courseId]` query-ийн өгөгдлийг шинэ утгаар солино.
- MyCoursesPage: хичээл бүр `CourseCard`-аар харагдаж, `footer` хэсэгт "Явц: N%" болон "Үргэлжлүүлэх" линк (`/learn/:slug/<эхний дуусаагүй хичээл, бүгд дууссан бол эхний хичээл>`) байна. Хоосон бол "Та одоогоор хичээл худалдаж аваагүй байна". Хичээл бүрийн явцыг `useProgress`-оор татна.
- LearnPage:
  - Хичээл худалдаж аваагүй бол (`useMyCourses`-д байхгүй) `/courses/:slug` руу `replace` горимоор, `state: { notice: 'Энэ хичээлийг худалдаж авна уу' }`-тайгаар шилжинэ.
  - `lessonId` нь тухайн хичээлд байхгүй бол `NotFoundPage` харуулна.
  - Хуудсанд `VideoPlayer` (`onEnded` дээр дууссан гэж тэмдэглэнэ), хичээлийн гарчиг, "Дууссан гэж тэмдэглэх" товч (дууссан бол "Дууссан ✓" гэсэн идэвхгүй товч), "Дараагийн хичээл" линк (дараагийн хичээл байхгүй бол харагдахгүй), идэвхтэй болон дууссан хичээлүүдийг тэмдэглэсэн `CurriculumList` (хичээл бүр `/learn/:slug/:id` руу линктэй) байна.

- [ ] **Step 1: Failing тестүүд бичих:**

```ts
// progress.test.ts  (fixture-ийн c1-ийг ашиглана: l1, l2, l3, 2 бүлэг)
test('progressPercent rounds and ignores foreign ids', () => {
  expect(progressPercent(c1, [])).toBe(0);
  expect(progressPercent(c1, ['l1'])).toBe(33);
  expect(progressPercent(c1, ['l1', 'l2', 'l3', 'zzz'])).toBe(100);
});
test('nextLessonId crosses sections and ends with null', () => {
  expect(firstLessonId(c1)).toBe('l1');
  expect(nextLessonId(c1, 'l1')).toBe('l2');
  expect(nextLessonId(c1, 'l3')).toBeNull();
});
```

```tsx
async function ownedSetup() {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  await api.checkout(['c1']);
  return api;
}
test('my courses empty state', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  renderApp('/my-courses', { api });
  expect(await screen.findByText('Та одоогоор хичээл худалдаж аваагүй байна')).toBeInTheDocument();
});
test('my courses shows progress and continue link', async () => {
  const api = await ownedSetup();
  await api.markLessonComplete('c1', 'l1');
  renderApp('/my-courses', { api });
  expect(await screen.findByText('Явц: 33%')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Үргэлжлүүлэх' })).toHaveAttribute('href', '/learn/react-ekhlel/l2');
});
test('mark complete updates state and next link works', async () => {
  const api = await ownedSetup();
  const { user, router } = renderApp('/learn/react-ekhlel/l1', { api });
  await user.click(await screen.findByRole('button', { name: 'Дууссан гэж тэмдэглэх' }));
  expect(await screen.findByRole('button', { name: 'Дууссан ✓' })).toBeDisabled();
  await user.click(screen.getByRole('link', { name: 'Дараагийн хичээл' }));
  expect(router.state.location.pathname).toBe('/learn/react-ekhlel/l2');
});
test('last lesson has no next link', async () => {
  const api = await ownedSetup();
  renderApp('/learn/react-ekhlel/l3', { api });
  await screen.findByRole('button', { name: 'Дууссан гэж тэмдэглэх' });
  expect(screen.queryByRole('link', { name: 'Дараагийн хичээл' })).not.toBeInTheDocument();
});
test('not owned redirects to detail with notice', async () => {
  const api = createMockApi({ storage: localStorage, getToken: () => useAuthStore.getState().token, delay: 0 });
  await loginAs(api, {});
  const { router } = renderApp('/learn/react-ekhlel/l2', { api });
  expect(await screen.findByText('Энэ хичээлийг худалдаж авна уу')).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/courses/react-ekhlel');
});
test('unknown lesson id renders 404', async () => {
  const api = await ownedSetup();
  renderApp('/learn/react-ekhlel/zzz', { api });
  expect(await screen.findByText('Хуудас олдсонгүй')).toBeInTheDocument();
});
```

- [ ] **Step 2:** FAIL. **Step 3:** Хэрэгжүүлэх. **Step 4:** `npm test` → бүгд PASS.
- [ ] **Step 5: Commit** — `feat: my courses and learn page with progress`

---

### Task 12: Playwright E2E — гол урсгал

**Files:**
- Create: `playwright.config.ts`, `.env.e2e`, `e2e/purchase-flow.spec.ts`
- Modify: `.gitignore` (`test-results/`, `playwright-report/`)

**Interfaces:**
- Consumes: бүх хуудасны UI текстүүд (Task 6–11).
- `.env.e2e`: `VITE_MOCK_DELAY=0`. `playwright.config.ts`: `webServer: { command: 'npx vite --mode e2e --port 5174', url: 'http://localhost:5174', reuseExistingServer: !process.env.CI }`, `use.baseURL`, зөвхөн chromium.

- [ ] **Step 1:** `npx playwright install chromium`
- [ ] **Step 2: Тест бичих** (`e2e/purchase-flow.spec.ts`):

```ts
test('browse → buy → watch → progress', async ({ page }) => {
  await page.goto('/courses');
  await page.getByLabel('Хайх').fill('react');
  await page.getByRole('link', { name: 'React эхлэл' }).click();
  await page.getByRole('button', { name: 'Сагсанд нэмэх' }).click();
  await page.getByRole('link', { name: 'Сагс руу очих' }).click();
  await expect(page.getByText('Нийт: 49,000₮')).toBeVisible();
  await page.getByRole('link', { name: 'Төлбөр төлөх' }).click();
  await expect(page).toHaveURL(/\/login\?redirect=/);
  await page.getByRole('link', { name: 'Бүртгүүлэх' }).click();
  await page.getByLabel('Нэр').fill('Бат');
  await page.getByLabel('Имэйл').fill('bat@test.mn');
  await page.getByLabel('Нууц үг').fill('secret1');
  await page.getByRole('button', { name: 'Бүртгүүлэх' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await page.getByRole('button', { name: 'Төлсөн' }).click();
  await expect(page).toHaveURL(/\/my-courses$/);
  await expect(page.getByText('Явц: 0%')).toBeVisible();
  await page.getByRole('link', { name: 'Үргэлжлүүлэх' }).click();
  await expect(page.locator('video')).toBeVisible();
  await page.getByRole('button', { name: 'Дууссан гэж тэмдэглэх' }).click();
  await page.goto('/my-courses');
  await expect(page.getByText('Явц: 33%')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Явц: 33%')).toBeVisible();   // localStorage-д хадгалагдсан
});
```

- [ ] **Step 3:** `npm run e2e` → PASS. Тест унавал алдааг E2E тест рүү биш, тухайн хуудасны task руу буцааж засна. Харин зөвхөн тестийн selector буруу байвал тестээ засна.
- [ ] **Step 4:** `npm test && npm run build && npm run e2e` → бүгд ногоон.
- [ ] **Step 5: Commit** — `test(e2e): main purchase-and-watch flow`
