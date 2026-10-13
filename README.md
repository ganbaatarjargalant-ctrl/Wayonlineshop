# Wayonlineshop

Way Academy — видео хичээл зарах онлайн дэлгүүрийн frontend (Vite + React + TypeScript).
Backend хараахан байхгүй тул `localStorage` дээр ажилладаг mock API ашиглана.

## Ажиллуулах

```bash
npm install
npm run dev      # хөгжүүлэлтийн сервер
npm test         # unit тест (Vitest)
npm run e2e      # E2E тест (Playwright)
npm run build    # production build
```

## Бүтэц

- `src/api/` — `ApiClient` интерфейс ба mock хэрэгжилт (`VITE_API_MODE`-оор дараа нь солигдоно)
- `src/features/` — auth, cart, catalog, course, learning
- `src/pages/` — нүүр, каталог, хичээлийн дэлгэрэнгүй, сагс/төлбөр (mock QPay), нэвтрэх/бүртгүүлэх, миний хичээлүүд, видео үзэх
- `docs/superpowers/` — дизайны spec болон хэрэгжүүлэх төлөвлөгөө
