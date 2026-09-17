# Implementation Plan: Stabilitásnövelés (Stability & Resiliency)

## Goal
A rendszer stabilitásának, hibatűrésének és típusbiztonságának maximalizálása. A cél az, hogy a felhasználó ne találkozzon "fehér képernyővel" (White Screen of Death), a szerkesztőfelület ne omoljon össze egy-egy rossz adat vagy kivétel miatt, és az Astro build robusztus legyen.

## User Review Required
> [!IMPORTANT]
> A React Error Boundary-k bevezetését javaslom a `CreatorApp` és `WorkspaceApp` köré, hogy ha a rich-text editor vagy valamelyik alkomponens elszáll, csak az az egy blokk álljon le, ne az egész oldal. Egyetértesz ezzel az iránnyal?

## Proposed Changes

### 1. React Error Boundary bevezetése
#### [NEW] [src/components/ui/ErrorBoundary.tsx](file:///C:/Work/project4%20blogspot/src/components/ui/ErrorBoundary.tsx)
- Létrehozunk egy univerzális React `ErrorBoundary` komponenst, amely elkapja a child komponensekben keletkező JavaScript hibákat, és egy formázott "Valami hiba történt" UI-t jelenít meg a teljes fagyás helyett.

#### [MODIFY] [src/components/creator/CreatorApp.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/CreatorApp.tsx)
- Beágyazzuk a munkafolyamatot az `ErrorBoundary`-ba.
- Lecseréljük a `any` típusokat explicit TypeScript generikusokra vagy `unknown` típusra a `handleMetadataUpdate` metódusban, javítva a típusbiztonságot.

#### [MODIFY] [src/components/creator/editor/MetadataInspector.tsx](file:///C:/Work/project4%20blogspot/src/components/creator/editor/MetadataInspector.tsx)
- Az `onUpdate: (field: string, value: any) => void` cseréje szigorúbb típusra.

---

### 2. Zod Schema Hardening (Adatvalidáció)
#### [MODIFY] [src/content.config.ts](file:///C:/Work/project4%20blogspot/src/content.config.ts)
- A Zod sémák szigorítása: a `authorSchema` és `categorySchema` ID referenciáit ellenőrizni (pl. hogy ne tartalmazzanak speciális karaktereket).
- Fallbackek (`.catch()`) hozzáadása bizonyos nem kritikus mezőkhöz, hogy ha egy adat hiányzik vagy rossz formátumú, ne szakadjon meg a build, hanem térjen vissza egy alapértelmezett értékkel.

---

### 3. Astro Komponens Null-Checking és Fallbackek
#### [MODIFY] [src/pages/posts/[slug].astro](file:///C:/Work/project4%20blogspot/src/pages/posts/[slug].astro)
- Hozzáadjuk a hiányzó adatkezelést (Graceful Degradation): mi történik, ha a poszt valami oknál fogva mégsem található, vagy a renderelés elbukik? Hibakezelés beépítése a `render(post)` köré.

---

### 4. Unit Tesztek az Adatszerkezetekhez
#### [NEW] [test/content-schemas.test.ts](file:///C:/Work/project4%20blogspot/test/content-schemas.test.ts)
- A `vitest` használatával létrehozunk egy tesztfájlt, ami kifejezetten a Zod sémák validációs logikáját teszteli (pl. elbukik-e a teszt, ha túl hosszú a cím, vagy hiányzik a kötelező kategória).

## Verification Plan

### Automated Tests
- Futtatom az `npm run test:unit` parancsot a Zod sémák validálására.
- Futtatom az `npm run build` parancsot, hogy biztosítsam, az Error Boundary és típusmódosítások nem törnek el semmit.

### Manual Verification
- Szándékosan generálok egy hibát a `CreatorApp` egyik belső komponensében, és ellenőrzöm a böngészőben, hogy az `ErrorBoundary` szépen megjelenik-e, elkerülve a teljes fagyást.
