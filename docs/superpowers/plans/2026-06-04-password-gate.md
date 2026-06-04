# Password Gate Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use $execute-plan to implement this plan task by task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Web uygulamasina sifre-only, hash tabanli, 1 saatlik signed-cookie gate eklemek.
**Architecture:** Ortak auth logic `apps/web/src/lib/password-gate.ts` icinde tutulacak. Next route handler login cookie'sini set edecek, middleware cookie'yi dogrulayip public route'lari koruyacak.
**Tech Stack:** Next.js 15 App Router, Vitest, Web Crypto, Middleware.

---

## Task 1 - Auth Core

Files:

- Create `apps/web/src/lib/password-gate.ts`
- Create `apps/web/src/__tests__/password-gate.test.ts`

Steps:

- [ ] RED: hash dogrulama, signed session, expiry ve next path sanitization testlerini yaz.
- [ ] Run `pnpm --filter @nacianilcom/web test -- password-gate`.
- [ ] GREEN: `password-gate.ts` icinde SHA-256, HMAC SHA-256, cookie parse/serialize ve safe-next helper'larini implement et.
- [ ] Run `pnpm --filter @nacianilcom/web test -- password-gate`.

## Task 2 - Next Integration

Files:

- Create `apps/web/app/login/page.tsx`
- Create `apps/web/app/login/actions.ts`
- Create `apps/web/middleware.ts`
- Modify `apps/web/.env.example`

Steps:

- [ ] Login page formunu sadece password input ve submit ile ekle.
- [ ] Server action'da env kontrolu, hash check, signed cookie set ve internal redirect yap.
- [ ] Middleware'de korunan route'lari cookie ile gecir, aksi halde `/login?next=...` adresine yonlendir.
- [ ] Env example'a hash uretme notu ve cookie secret ekle.

## Task 3 - Verification

Files:

- Modify `.wolf/anatomy.md`
- Modify `.wolf/cerebrum.md`
- Append `.wolf/memory.md`

Steps:

- [ ] Run `pnpm --filter @nacianilcom/web test`.
- [ ] Run `pnpm --filter @nacianilcom/web typecheck`.
- [ ] Run `pnpm --filter @nacianilcom/web lint`.
- [ ] Run `pnpm --filter @nacianilcom/web build`.
- [ ] Update OpenWolf anatomy, cerebrum, memory.
