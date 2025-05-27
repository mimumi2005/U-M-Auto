# Tīmekļa lietojumprogrammas sistēma autoservisa pārvaldībai un klientu apkalpošanai

## Projekta apraksts
Tīmekļa lietojumprogramma autoservisa pārvaldībai un klientu apkalpošanai ir izstrādāta, lai efektīvi pārvaldītu autoservisu un piesaistītu klientus ar elektronisku projektu pieteikšanu un  unikālu cenrādi, kā arī dažādām paziņojumu un atlaižu iespējām. Gala produkts ir pilnīga funckionāla sistēma, kurā iespējams veidot kontu, pieteikt remontu un darbiniekiem pālvaldīt pieteiktos remontus, kā arī administratoriem iespēju apskatīt, rediģēt datus, kā arī apskatīt statistiku.

## Izmantotās tehnoloģijas
Sistēmas izstrādes laikā tika izmantotas tādas valodas kā,
- JavaScript;
- HTML;
- CSS;
- MySQL.

Tika izmantotas arī papildus tehnoloģijas, piemēram;
- Node.Js, pašas sistēmas aizmugures izveidei;
- Bootstrap 5.3, lai padarītu saskarnes izveidi ērtāku;
- knex.js, lai veidotu migrācijas  un pagaidu datus datu bāzē;
- node-cron, lai sūtītu paziņojumus par tuvojošajiem projektiem;
- express.js, lai veidotu API’s ;
- i18n, priekš tulkošanas iespējām
- u.c.

## Izmantotie avoti
1. [MySQL pamācība](https://www.mysqltutorial.org/mysql-basics/mysql-generated-columns) - kā pamats MySQL izmantošanai

2. [MySQL dokumentācija](https://dev.mysql.com/doc/refman/8.0/en/windows-start-command-line.html) - kā pamats MySQL izpratnei 
  
3. [Stack Overflow. Express Cookie atgriež undefined un citas sadaļas](https://stackoverflow.com/questions/12197053/express-cookie-return-undefined) - tika izmantots dažādu problēmu atrisināšanai kodā.

4. [Traversy Media](https://www.youtube.com/watch?v=7S_tz1z_5bA) - kā pamats steku izmantošanai.

5. [Dolthub Blogs](https://www.dolthub.com/blog/2023-10-27-uuid-keys) - kā pamats darbībai ar dažādām UUID.

6. [FreeCodeCamp](https://www.freecodecamp.org/news/authenticate-users-node-app) - kā pamats node.js izmantošanai.

7. [Traversy Media Iemācieties Passport.js autentifikāciju](https://www.youtube.com/watch?v=AuHNCbnQHBc) - kā pamats autentifikācijas integrēšanai

## Uzstādīšanas instrukcijas

### 1. solis: Ielādēt vajadzīgās tehnoloģijas
1. Pārbaudiet un instalējiet šīs tehnoloģijas:
   - **MySQL 8.0** datu bāze.
   - **Visual Studio Code** (vai citu IDE).
   - **Node.js**.

   *Tip*: Iespējams būs vajadzīgs atvērt "PowerShell", kā administratoram un izpildīt šo komandu `Set-ExecutionPolicy RemoteSigned`.

---

### 2. Solis: Ielādēt projektu ICE
1. Instalē projektu kā ZIP.
2. Izpakojiet mapi.
3. Atver mapi ar Visual Studio Code (vai citu IDE).

---

### 3. Solis: Uzstādīt datu bāzi
1. Atveriet **MySQL Workbench**.
2. Palaidiet savu vietējo MySQL gadījumu un pārbaudiet savu lietotājvārdu un paroli.
3. Atrodiet "example .env" failu, nomainiet tā nosaukumu uz ".env" un aizpildiet vajadzīgo informāciju.
4. Izveidojiet datu bāzes shēmu ar nosaukumu "carrepairshop" vai atjauniniet failu ".env" ar esošu datu bāzes nosaukumu.
5. Atveriet termināli savā IDE un palaidiet:
``` npx knex migrate:latest --knexfile ./knexfile.cjs```
un tad ``` npx knex seed:run --knexfile ./knexfile.cjs```;
---

### 4. Solis: Programmas palaišana
7. Tad termināli palaidiet komandu `node app.js`;
8. Lai atvērtu vietni, pārlūkprogrammā atveriet vietni "localhost".

### Papildus
Uzreiz ir pieejami 3 dažādi konti:
- Parasts lietotājs:
  - Lietotājvārds - Mazanarina2
  - Parole – DrosaParole#123

- Darbinieks
  - Lietotājvārds - Jaukais49
  - Parole – DrosaParole#123

- Administrators
  - Lietotajvārds – JanisG
  - Parole – DrosaParole#123

Vai arī vietne pieejama ar uzlabojumiem: [U&M Auto](https://umautorepair.up.railway.app/)