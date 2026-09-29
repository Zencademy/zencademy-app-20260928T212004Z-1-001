# Zencademy — evaluare și plan de lucru

Data: 29 septembrie 2026. Bază: versiunea locală după migrarea la Expo SDK 57.

## Stadiu

Aplicația este un prototip avansat / alpha, potrivit pentru testare internă. Pornirea în Expo Go este confirmată de utilizator; verificarea dependențelor și cele 21 de verificări Expo Doctor au trecut. Bundle-ul iOS a fost generat și servit cu succes. Aceste rezultate validează infrastructura de dezvoltare, nu toate funcțiile produsului.

Există autentificare Supabase, profil, XP, clasament, jurnal, focus, notificări, multe jocuri și șase ebook-uri integrate. Există și ecrane duplicate, funcții demonstrative și trasee incomplete. TypeScript raportează încă 357 de diagnostice. Nu există un script de testare automată în package.json.

Auditul de față citește codul și reproduce logică în memorie. Nu a modificat datele Supabase, nu a verificat politicile bazei live și nu reprezintă o testare completă pe dispozitiv. Nu am schimbat codul aplicației în această etapă.

## Bug-uri și riscuri prioritizate

### P1 — înainte de extinderea testării

1. **Posibilă resetare a profilului după o eroare de citire.** `utils/supabase.ts:68` întoarce null atât pentru absența profilului, cât și pentru orice eroare. `components/XPContext.tsx:135` tratează două rezultate null ca profil nou; `initializeUserData`, la `utils/supabase.ts:149`, face upsert cu points=0 și plan=free. Dacă citirile eșuează, dar scrierea ulterioară reușește, profilul existent poate fi suprascris. Reproducerea cu serviciul real și Supabase simulat a transformat 5000 XP/premium în 0 XP/free. Remediere: diferențiere not-found/error, inserare fără suprascriere, inițializare idempotentă în backend. Acceptare: o eroare de rețea nu schimbă profilul.

2. **Jurnalul local poate trece între conturi.** `JournalScreen.tsx:166,190,250` folosește cheia `@journal_<data>`, fără userId. După logout A și login B pe același telefon, în lipsa unei intrări B, codul poate încărca jurnalul A și îl poate salva în Supabase pe contul B. Remediere: chei separate pe utilizator; datele vechi fără proprietar nu se migrează automat în contul curent. Acceptare: test cu două conturi, inclusiv offline.

3. **Actualizările XP nu sunt atomice.** `utils/supabase.ts:204` citește punctele, adună local și scrie totalul. Două recompense simultane pot porni de la același total. Reproducere: 100 + 10 + 20 a produs 120 în loc de 130. Aceeași structură apare la alte contoare. Remediere: tranzacție/RPC și identificator unic pentru fiecare sesiune de joc. Acceptare: cereri concurente păstrează toate recompensele; retry nu le dublează.

4. **Economia magazinului este inconsistentă.** `ShopScreen.tsx:324–350` verifică `xp`, care în context înseamnă progresul în nivel, nu totalul. La 1000 de puncte utilizatorul ajunge la nivelul 2 cu xp=0 și nu poate cumpăra un obiect de 500. Cheltuirea scade punctele care determină nivelul. Deblocarea badge-ului și debitarea sunt separate, fără tranzacție, iar rezultatele false pot fi ascunse de context. Remediere propusă: XP cumulativ separat de monede; achiziție atomică, confirmată înainte de mesajul de succes.

5. **Nouă categorii fizice trimit la ecrane inexistente.** `PhysicalTrainingScreen.tsx:11` definește Mobility, Strength, Stretching, Breathing, Endurance, Balance, Coordination, Relaxation și Posture sub `/PhysicalTraining/*TrainingScreen`. Aceste ecrane nu există. Mai multe exerciții încearcă să revină la aceleași rute. Remediere: pagini reale de categorie sau legături la conținutul existent; verificare automată a rutelor.

6. **Controlul accesului trebuie verificat înainte de utilizatori externi.** AdminEditorScreen și DeveloperScreen sunt rute incluse în aplicație și nu verifică roluri. Protejarea în layout prin simpla declarare condiționată de Stack.Screen nu exprimă o regulă explicită Stack.Protected. Codul client poate actualiza XP și alte câmpuri din profiles. Documentația SUPABASE_SETUP.md propune SELECT public pe întregul profiles, care include email. Nu confirm că aceste politici sunt active în producție. Remediere: audit RLS cu conturi de test, proiecție publică limitată pentru clasament, operații privilegiate în backend, scoaterea rutelor de dezvoltare din distribuția normală.

### P2 — pentru o beta coerentă

7. **Abonamentele realtime nu se închid.** `subscribeToUserData` este async și întoarce Promise; XPContext transmite acel Promise funcției de unsubscribe, care caută `.unsubscribe`. Reproducere: zero apeluri reale de unsubscribe. Risc de listeners multipli și actualizări întârziate după schimbarea contului. Remediere: returnarea sincronă a canalului, cleanup și anularea aplicării rezultatelor pentru contul anterior.

8. **Streak-ul folosește inconsistent zile și timestampuri.** Comparația unui timestamp din ziua anterioară cu miezul nopții UTC și Math.floor poate produce zero zile. Exemplu reprodus: 28 septembrie ora 14:00 → 29 septembrie produce 0. Există și fluxuri separate pentru login/training, iar indicatorul streakCheckedToday nu se resetează explicit la schimbarea contului/zilei. Remediere: o singură definiție de zi, fus orar și eveniment care contează; test la miezul nopții și schimbare de oră.

9. **Statisticile nu reflectă istoricul real.** XPContext furnizează permanent `xpHistory: []`, `timeHistory: []`, `completedStats: {}`. StatisticsScreen construiește grafice zero și are progres de categorii fix 17/12/5. Remediere: jurnal de sesiuni cu durată, rezultat, categorie, dată și XP acordat; agregări reale.

10. **Notificările declarate zilnice sunt de fapt programări la o dată.** NotificationsScreen.tsx:240 folosește trigger date plus repeats=true. Tipurile și implementarea instalată Expo precizează că repeats este ignorat pentru date. Remediere: trigger daily/calendar valid și test pe două zile. CustomReminders folosește și el o singură dată; repetarea trebuie definită explicit în produs.

11. **Daily Tasks poate scrie înainte de încărcarea datelor.** La montare pornește citirea, dar efectul de salvare scrie și lista inițială goală. Cheia este globală pe zi, calculată la import, fără cont. Remediere: stare de hidratare, chei per user, actualizare la schimbarea zilei, tratarea erorilor de stocare.

12. **Autentificarea are trasee incomplete.** Forgot Password nu are onPress. Register navighează în aplicație imediat după signUp chiar dacă setările Supabase ar cere confirmarea emailului și nu există sesiune. Recuperarea sesiunii nu are catch/finally. Remediere: recovery, confirmare email, protecție explicită a rutelor și stare de eroare/reîncercare la pornire.

13. **Conținutul testului de inteligență necesită revizie.** Întrebarea despre trandafiri/flori roșii marchează greșit „Some Roses are Red”; premisele permit răspunsul „Cannot be determined”. Procentele răspunsurilor corecte sunt afișate drept percentile, iar IQ este calculat prin praguri hardcodate, fără o populație de referință în implementare. Propunere: redenumire în evaluare cognitivă orientativă și afișarea scorului de quiz până la o validare separată a metodei.

14. **Jocul ReactionTap are logică fragilă a temporizatoarelor.** Callback-ul verifică o valoare phase capturată înainte de trecerea în go; un alt efect curăță temporizatoarele la schimbarea phase. Timeout-ul too-slow poate să nu ruleze cum se intenționează. Necesită testarea secvenței complete cu fake timers și o singură mașină de stări pentru rundă.

## Funcții parțiale

- Clubs și Courses: Coming Soon.
- Magazin: fluxuri de plată demonstrative, fără integrare reală.
- Plans: butonul de upgrade arată un mesaj în loc să deschidă pagina; planul curent este hardcodat în randare.
- Șase ebook-uri au conținut integrat; alte titluri nu au conținut. EbooksScreen mai vechi folosește linkuri fictive.
- Privacy, Language și Help sunt placeholder în Settings.
- Texte amestecate română/engleză, versiuni declarate neuniform, ecrane foarte mari și logică duplicată.

## Propunere de produs

Recomand un nucleu simplu: **10 minute pe zi pentru focus, memorie și reflecție**. Este o direcție de produs propusă, nu o concluzie din cercetare cu utilizatori.

1. Pagina Azi: un singur buton „Începe sesiunea”, 2–3 exerciții și o reflecție scurtă. La final: ce ai făcut, progres salvat și pasul următor.
2. Progres: minute, acuratețe, sesiuni și consecvență, comparate cu propria săptămână anterioară. Fără valori demonstrative prezentate ca rezultate personale.
3. Bibliotecă: numai conținut disponibil, cu marcarea lecțiilor citite, timp estimat și reluare de unde ai rămas. În prima beta, ebook-urile pot deveni lecții scurte legate de sesiunea zilnică.
4. XP cumulativ pentru nivel; monede separate pentru recompense cosmetice. Nu cumpăra XP care influențează clasamentul.
5. La început maximum 5–8 jocuri testate bine. Catalogul mare existent poate fi păstrat pentru extindere după validarea utilizării.
6. Onboarding cu obiectiv, timp disponibil și moment preferat. Personalizarea ulterioară bazată pe rezultate reale, nu doar pe eticheta brain type.
7. Gruparea navigației în Azi, Antrenament, Progres, Bibliotecă și Profil; ecranele neterminate nu domină experiența beta.
8. Feedback rapid în aplicație și colectarea erorilor tehnice, fără răspunsuri private din jurnal în loguri.

## Ordinea recomandată

**Lot 1 — date și conturi:** bug-urile 1, 2, 3, 6 și 7; două conturi pe același dispozitiv, rețea întreruptă, retry și concurență. Nu se resetează progresul și nu circulă date între conturi.

**Lot 2 — traseu complet:** autentificare, rute, 5–8 jocuri, statistici reale, streak și notificări. Criteriu: creare cont → sesiune → salvare → logout/login → progres identic, inclusiv restart.

**Lot 3 — conținut și experiență:** revizie răspunsuri, scoruri corecte, o limbă consecventă, ecrane disponibile clar separate, contrast/accesibilitate și performanță pe telefon.

**Lot 4 — beta restrânsă:** test cu un grup mic, feedback și metrici pentru finalizarea primei sesiuni, revenire și salvarea cu succes a progresului. Monetizarea și Clubs vin după validarea acestui nucleu.

Reproducerile locale sunt în ../zencademy-upgrade-tools/audit-behavior.cjs. Folosesc codul serviciului cu un client în memorie; nu dovedesc configurația bazei live.
