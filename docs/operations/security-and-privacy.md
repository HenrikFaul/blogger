# Security, Privacy, and Operations Runbook

Ez a dokumentum a ForgeBlog statikus, Git-alapú architektúrájára vonatkozó biztonsági és adatvédelmi modellt, valamint a fenntartáshoz szükséges operatív lépéseket (Runbook) definiálja.

## 1. Threat Model (Fenyegetési Modell)

A ForgeBlog egy backend nélküli statikus generátor (Astro), amely GitHubon tárolja a tartalmat, és Vercelen keresztül publikál. A fenyegetési modellünk ennek megfelelően a következő:

### Account és Repository Hozzáférés
- **Kockázat:** Illetéktelen hozzáférés a GitHub fiókhoz, ellopott OAuth tokenek.
- **Védelem:** A GitHubon 2FA (Two-Factor Authentication) kötelező a kollaborátoroknak. A Creator Workspace OAuth tokenjei biztonságos `httpOnly` sütikben (vagy rövid lejáratú kliens tokenként) vannak kezelve, és minimális scope-ot (`public_repo` vagy `repo`) kérnek.

### Tartalom Integritás
- **Kockázat:** Tartalom módosítása vagy törlése, XSS injektálás (SEO spam).
- **Védelem:** A tartalmak publikálása előtt Zod sémák validálják a metaadatokat (Frontmatter). A React/Astro komponensek automatikusan escape-elik a dinamikus tartalmakat. A main ágra Branch Protection szabályok érvényesek (PR required).

### Látogatói Biztonság (Visszaélések a frontend-en)
- **Kockázat:** Cross-site scripting (XSS), beágyazott követők (Tracking).
- **Védelem:** Szigorú Content Security Policy (CSP) beállítása (lásd lejjebb). Az XSS elkerülése érdekében az Inline szkriptek korlátozva vannak.

## 2. Biztonsági Fejlécek és CSP

A `vercel.json`-ben beállítottuk az összes modern biztonsági fejlécet:
```json
{
  "key": "Content-Security-Policy",
  "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self' https://api.github.com https://vitals.vercel-insights.com; frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com;"
}
```
*Megjegyzés:* Az `'unsafe-inline'` az Astro View Transitions és hibrid szigetek működéséhez szükséges. Az iframe-ek csak a `youtube-nocookie` és `vimeo` domainekről tölthetnek be videókat.

## 3. Privacy-First Analitika

- **Elv:** A platform alapértelmezetten tiszteletben tartja a felhasználók magánéletét (Privacy by Default).
- **Eszköz:** Opcionálisan használható a Vercel Analytics (`@vercel/analytics`), amely cookie-mentes, anonimizált, GDPR-kompatibilis forgalomkövetést biztosít. Harmadik feles marketing trackerek (Facebook Pixel, Google Analytics) nincsenek bekötve alapértelmezetten.

## 4. Jogi és Compliance

- Az alapértelmezett template tartalmaz egy felkészített [Privacy Policy](/privacy) és [Terms of Service](/terms) dokumentumot.
- Nincsenek olyan backend szerverek, amelyek személyes adatokat tárolnának naplófájlokban.
- Bármilyen kapcsolatfelvételi űrlap csak külső, GDPR-kompatibilis szolgáltatón (pl. Formspree, Vercel Functions) keresztül futhat, megfelelő tájékoztatás mellett.

## 5. Backup és Recovery (Disaster Recovery Plan)

A statikus architektúra legnagyobb előnye, hogy a Git történet egyben a biztonsági mentés is.
- **Git Backup:** A GitHub adattár bármikor klónozható egy lokális gépre vagy másik szolgáltatóhoz (pl. GitLab, Bitbucket).
- **Vercel Rollback:** Hibás publikálás esetén a Vercel felületén azonnal visszavonható (Instant Rollback) az utolsó működő verzió. Utána Gitben egy `revert` committal kell szinkronizálni az állapotot.
- **Törölt tartalom helyreállítása:** A Creator Workspace-ben véletlenül törölt cikkek a Git History segítségével (commit visszaállítás) 100%-osan megmenthetők.

## 6. Incident Response (Műveleti Kézikönyv Incidensekhez)

### Biztonsági Incidens (Kompromittált GitHub fiók/token)
1. **Scope:** Azonnal vond vissza (revoke) az érintett GitHub Personal Access Token-eket és OAuth engedélyeket a GitHub beállításaiban.
2. **Audit:** Ellenőrizd a Git history-t az utolsó 24 órában, hogy történtek-e illetéktelen commitok.
3. **Rollback:** `git revert` segítségével állítsd vissza az utolsó ismert biztonságos állapotot, majd telepítsd újra a Vercelen.

### Üzemeltetési Incidens (Leállt a Vercel, vagy hibás build)
1. Nézd meg a [Vercel Status](https://www.vercel-status.com/) oldalt.
2. Ha a probléma a kódban van (pl. hibás MDX frontmatter blokkolja a buildet), használd az E2E/Unit teszt eszköztárat (`npm run verify`) a hiba lokális reprodukálásához.
3. Javítsd a hibát egy hotfix branch-en, ellenőrizd a Preview deploymentet, majd merge-öld a mainbe.
