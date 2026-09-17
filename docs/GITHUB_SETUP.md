# Opcionális GitHub-kapcsolat

A helyi írás GitHub nélkül is használható. Ez a dokumentum a megvalósított szerveroldali adapter konfigurációja; a kapcsolat ezen átadás során nem futott éles felhasználói repositoryval.

## Ajánlott üzemmód: GitHub App
Hozz létre a célrepositoryhoz telepített GitHub Appot a saját fiókodban/szervezetedben. A szükséges repository-hozzáférés: Metadata olvasás; Contents írás; Pull requests írás. Csak a szükséges repositorykat engedélyezd. A tényleges belépő felhasználónak is írási jogosultsággal kell rendelkeznie.

A megvalósítás felhasználói OAuth access tokent használ az App engedélyei mellett; nem telepítési tokenes gépi bot, nem kér App private key-t. Az engedélyezési és callback URI-t az alkalmazás tényleges HTTPS-originjére állítsd:

```text
https://SAJAT-DOMAIN/api/creator?action=callback
```

Vercel szerveroldali környezeti változók:

```text
PUBLIC_SITE_URL=https://SAJAT-DOMAIN
GITHUB_CLIENT_ID=<az App client ID-ja>
GITHUB_CLIENT_SECRET=<szervertitok>
GITHUB_REPOSITORY=<owner/repository>
GITHUB_AUTH_MODE=app
GITHUB_ALLOWED_LOGINS=<opcionális,vesszővel,elválasztva>
SESSION_SECRET=<legalább 32 véletlen karakter>
```

Kulcsgenerálás:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"
```

Titkokat ne írj `PUBLIC_` változóba, site.json-ba vagy commitba. A `PUBLIC_SITE_URL` szándékosan nyilvános domain, nem titok. A callbacknek és a böngészőnek ugyanazt az origint kell használnia. Previewhoz külön hitelesítési környezet szükséges; ne oszd meg ellenőrizetlen preview-val az éles szerkesztői titkokat.

A `GITHUB_AUTH_MODE=oauth` hagyományos OAuth Appra vált, `repo` scope-pal. Ez tudatosan szélesebb hozzáférés; csak szükség esetén használd.

## Próba a saját környezetben
Telepíts először elkülönített tesztinstance-t. A munkatér Beállítások panelén ellenőrizd a session-állapotot. Jelentkezz be; hozz létre egy új vázlatot és mentsd Git-vázlatként. Ellenőrizd a tényleges ágat, commitot, MDX-et, forrás-JSON-t és képfájlokat a repositoryban. Kérj publikálási PR-t; ellenőrizd, hogy a főág és az éles oldal ettől még változatlan.

Második kliensből/stale SHA-val próbálj menteni: az újabb távoli változat nem írható felül force-pushsal. Teszteld a jogosultság visszavonását, a kijelentkezést, hibás Origint, hiányzó CSRF-t és a lejárt sessiont. Merge csak jóváhagyott CI és tartalmi ellenőrzés után. Utána ellenőrizd a valódi deploymentet és a nyilvános URL-t.

## Korlátok és hibák
A session legfeljebb 8 órás; nincs tartós háttér-tokenfrissítési szolgáltatás. A szerver az origint és repositoryt a titkosított sessionhöz köti. A `SESSION_SECRET` forgatása a korábbi cookie-kat érvényteleníti; a már kiadott szolgáltatói tokeneket külön is vissza kell vonni szükség esetén.

4 MB-os alkalmazásszintű kéréskorlát, mentésenként 2,4 MB saját képfájl-összeg. Ennél nagyobb médiához használd a ZIP/Git utat. `409` esetén ne erőltesd a mentést: exportálj helyi másolatot és hasonlítsd össze a távoli verziót. Commit utáni PR-hiba esetén a commitot megőrzi és külön figyelmeztet, nem állít rollbacket vagy publikálást.

Az Astro `dev`/`preview` a statikus oldalt szolgálja ki, a Vercel-függvényt nem. A valódi OAuth-folyamatot a telepített HTTPS-tesztinstance-en kell ellenőrizni. Nincs automatikus publikus regisztráció, és a helyi munkatér önmagában nem tartalmaz privát távoli tartalmat.

## Ellenőrzéshez használt elsődleges dokumentáció
GitHub: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps
Git refs: https://docs.github.com/en/rest/git/refs
Vercel function limits: https://vercel.com/docs/functions/limitations
A kód alkalmazásszintű korlátai szándékosan konzervatívak; a tényleges szolgáltatói beállításokat a saját telepítéskor ellenőrizd.
