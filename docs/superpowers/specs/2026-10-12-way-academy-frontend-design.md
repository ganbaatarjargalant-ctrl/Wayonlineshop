# Way Academy онлайн дэлгүүр — Frontend дизайн

Огноо: 2026-10-12
Төлөв: Хэрэглэгчийн хяналтыг хүлээж байна

## 1. Зорилго ба хүрээ

Way Academy-ийн видео хичээл зарах онлайн дэлгүүрийн **зөвхөн frontend** хэсэг. Backend-ийг дараа нь эсвэл өөр хүн хийнэ. Тиймээс UI нь бүх өгөгдлийг нэг API давхаргаар авдаг байх ёстой. Одоохондоо тэр давхарга mock өгөгдөл буцаана, backend бэлэн болоход зөвхөн тэр давхаргыг солино.

**Хэл:** зөвхөн монгол (i18n байхгүй). **Мөнгөн тэмдэгт:** төгрөг (₮).

### Хамрах зүйлс (эхний хувилбар)
1. Нүүр хуудас
2. Хичээлийн каталог (ангилал, түвшин, үнээр шүүх, хайх)
3. Хичээлийн дэлгэрэнгүй (үнэгүй урьдчилан үзэх видеотой)
4. Сагс ба төлбөрийн хуудас (mock QPay)
5. Нэвтрэх / бүртгүүлэх (mock)
6. "Миний хичээлүүд" (явцын хувьтай)
7. Видео тоглуулагчийн хуудас (явц хадгална)

### Хамрахгүй зүйлс
Админ самбар (дараагийн дэд төсөл), жинхэнэ төлбөр, жинхэнэ нэвтрэлт, видео хамгаалалт (DRM/HLS/signed URL), англи хэл, SEO/SSR.

### Амжилтын шалгуур
Playwright E2E-ийн гол урсгал (9-р хэсэг) mock горимд тогтвортой давна. Энэ урсгал нь каталог → дэлгэрэнгүй → сагс → нэвтрэх → төлөх → Миний хичээлүүд → видео үзэх → "Дууссан" → явц шинэчлэгдэх.

## 2. Технологи

- Vite + React + TypeScript (strict)
- React Router — маршрутчлал
- TanStack Query — серверийн өгөгдөл, cache
- Zustand — сагс ба нэвтэрсэн хэрэглэгчийн төлөв
- Tailwind CSS — загвар
- Vitest + React Testing Library — unit/компонент тест
- Playwright — E2E тест

## 3. Бүтэц

```
src/
  api/
    types.ts        Course, Section, Lesson, User, Order, Progress, ApiError
    client.ts       ApiClient interface + VITE_API_MODE-оор хэрэгжүүлэлт сонгох
    mock/           ApiClient-ийн mock хэрэгжүүлэлт + JSON fixture
  features/
    catalog/        каталог, хайлт, шүүлтүүр
    course/         хичээлийн дэлгэрэнгүй
    cart/           сагс, checkout, сагсны store
    auth/           нэвтрэх, бүртгүүлэх, auth store, хамгаалалттай маршрут
    learning/       Миний хичээлүүд, VideoPlayer, явц
  components/       ерөнхий UI: Button, CourseCard, Header, Footer, Skeleton, ErrorState, EmptyState
  pages/            маршрут бүрийн хуудас (features-ээс угсарна)
  router.tsx
  main.tsx
```

**Гол зарчим:** компонентууд `api/client.ts`-ийн `ApiClient` interface-ээр л өгөгдөл авна, mock байгааг мэдэхгүй. Backend бэлэн болоход `api/http/` хэрэгжүүлэлт нэмж, `VITE_API_MODE=http` болгоход хангалттай. Анхдагч утга нь `mock`.

### ApiClient interface

```ts
interface ApiClient {
  getCourses(filter?: { q?: string; category?: string; level?: string }): Promise<Course[]>;
  getCourse(slug: string): Promise<Course>;
  getCategories(): Promise<string[]>;
  register(input: { name: string; email: string; password: string }): Promise<{ user: User; token: string }>;
  login(input: { email: string; password: string }): Promise<{ user: User; token: string }>;
  getMe(): Promise<User>;
  checkout(courseIds: string[]): Promise<Order>;
  getMyCourses(): Promise<Course[]>;
  getProgress(courseId: string): Promise<Progress>;
  markLessonComplete(courseId: string, lessonId: string): Promise<Progress>;
}
```

## 4. Өгөгдлийн загвар (`api/types.ts`)

```ts
type Level = 'beginner' | 'intermediate' | 'advanced';

interface Course {
  id: string; slug: string; title: string; description: string;
  price: number;            // төгрөгөөр, бүхэл тоо
  thumbnail: string; category: string; level: Level;
  instructor: { name: string; avatar: string; bio: string };
  sections: Section[];
}
interface Section { id: string; title: string; lessons: Lesson[] }
interface Lesson {
  id: string; title: string; durationSec: number; isPreview: boolean;
  videoUrl?: string;        // зөвхөн preview эсвэл худалдаж авсан хичээлд ирнэ
}
interface User { id: string; name: string; email: string }
interface Order { id: string; courseIds: string[]; total: number; status: 'paid' }
interface Progress { courseId: string; completedLessonIds: string[] }
interface ApiError { code: 'UNAUTHORIZED' | 'NOT_FOUND' | 'FORBIDDEN' | 'VALIDATION' | 'UNKNOWN'; message: string }
```

## 5. Mock давхарга

- Fixture: 3–4 ангилалд хуваасан 8 орчим хичээл, монгол текстээр. Видео нь нийтийн жишээ MP4 URL.
- Хэрэглэгч, захиалга, явц `localStorage`-д хадгалагдана (`way.mock.*` түлхүүрүүд).
- Хүсэлт бүрд 200–500ms санамсаргүй хоцрол нэмнэ (тестэд 0 болгож болно).
- `getCourse` нь тухайн хэрэглэгч худалдаж аваагүй, preview биш хичээлийн `videoUrl`-ийг хасаж буцаана.
- Хамгаалалттай аргыг токенгүй дуудвал `UNAUTHORIZED` шиднэ. Худалдаж аваагүй хичээлд `getProgress`/`markLessonComplete` дуудвал `FORBIDDEN` шиднэ.
- `checkout` нь аль хэдийн худалдаж авсан хичээлийг давхар оруулахгүй.

## 6. Төлөв

| Өгөгдөл | Хаана |
|---|---|
| Хичээл, захиалга, явц | TanStack Query |
| Сагс (courseId-ууд) | Zustand + `localStorage` |
| Нэвтэрсэн хэрэглэгч, токен | Zustand + `localStorage` |
| Каталогийн шүүлтүүр, хайлт | URL query параметр |

Төлбөр амжилттай болсны дараа сагсыг хоосолж, `myCourses`-ийн query-г invalidate хийнэ.

## 7. Хуудсууд ба маршрут

| Зам | Хуудас | Хамгаалалт |
|---|---|---|
| `/` | Hero, онцлох хичээлүүд, ангиллууд | — |
| `/courses` | Каталог, шүүлтүүр, хайлт | — |
| `/courses/:slug` | Дэлгэрэнгүй, бүлгүүд, үнэ, сагсанд нэмэх, preview | — |
| `/cart` | Сагс, нийт дүн | — |
| `/checkout` | Mock QPay QR, "Төлсөн" товч | Нэвтэрсэн |
| `/login`, `/register` | Форм, баталгаажуулалт | — |
| `/my-courses` | Худалдаж авсан хичээлүүд + явцын хувь | Нэвтэрсэн |
| `/learn/:slug/:lessonId` | VideoPlayer, бүлгийн жагсаалт, "Дууссан", дараагийн хичээл | Нэвтэрсэн + худалдаж авсан |
| `*` | 404 | — |

- Нэвтрээгүй хэрэглэгч хамгаалалттай хуудас руу орвол `/login?redirect=<зам>` руу шилжиж, нэвтэрсний дараа буцна.
- Худалдаж авсан хичээлийн дэлгэрэнгүй хуудсанд "Сагсанд нэмэх"-ийн оронд "Үзэх" товч гарна.
- `VideoPlayer` нь `src` prop авдаг тусдаа компонент (HTML5 `<video>`). Дараа нь HLS эсвэл embed рүү шилжихэд зөвхөн энэ компонент өөрчлөгдөнө.
- Явцын хувь = дууссан хичээлийн тоо / нийт хичээлийн тоо.

## 8. Алдаа боловсруулалт

- Өгөгдөл татдаг хуудас бүр loading (skeleton), алдаа ("Дахин оролдох" товчтой), хоосон гэсэн гурван төлөвтэй.
- `api` давхарга бүх алдааг `ApiError` болгоно. `UNAUTHORIZED` ирвэл auth store-ийг цэвэрлэж, `/login` руу шилжүүлнэ.
- Байхгүй slug → 404. Худалдаж аваагүй хичээлийн `/learn/...` → дэлгэрэнгүй хуудас руу буцаж, "Энэ хичээлийг худалдаж авна уу" гэсэн мэдэгдэл харуулна.
- Формын алдаа (имэйл буруу, нууц үг 6-аас богино, имэйл аль хэдийн бүртгэлтэй) талбарын доор монголоор гарна.

## 9. Тест

- **Unit (Vitest):** mock ApiClient (худалдан авалт, давхардал, `videoUrl` нуух дүрэм, `UNAUTHORIZED`/`FORBIDDEN`, явц), сагсны store, явцын хувь тооцоолол.
- **Компонент (RTL):** CourseCard, каталогийн шүүлтүүр, хамгаалалттай маршрутын redirect, дэлгэрэнгүй хуудасны "Сагсанд нэмэх" / "Үзэх" товчны солигдол.
- **E2E (Playwright):** 1-р хэсэгт дурдсан гол урсгал, хоцролгүй mock горимд.
