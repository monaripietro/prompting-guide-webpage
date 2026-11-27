# Piano dei task — Sprint 1, lab estrazione dati (livello base)

Riferimento: `docs/SPEC-sprint1.md` v0.2. Autore: Claude Code, 27 novembre 2026.
Implementazione: Mistral Vibe, un task per branch (`s1/T<n>-<slug>`). Revisione: Claude Code.

---

## 1. Esito dell'analisi della spec

### 1.1 Conflitti con il repository attuale (bloccanti)

| # | Problema | Proposta |
| --- | --- | --- |
| K1 | Il repository non è vuoto: è il sito `prompting.monaripietro.it` (4 pagine alla radice, `CNAME`, `assets/`). La struttura della sezione 8 lo tratta come un progetto nuovo e sovrascriverebbe `README.md`. | Il lab diventa una sezione del sito esistente. Il `README.md` attuale si estende con un paragrafo sul lab, non si riscrive. |
| K2 | GitHub Pages pubblica solo dalla radice o da `/docs` (oppure tramite Actions). Una cartella `site/` non viene servita, a meno di un workflow di deploy che però sostituirebbe il sito attuale. | Mettere la pagina in `lab/` alla radice: viene servita su `prompting.monaripietro.it/lab/` senza toccare la configurazione di Pages. Nel resto del piano `site/` diventa `lab/`. |
| K3 | `LICENSE` attuale è **MIT**, non Apache-2.0. | Decisione di Pietro: cambiare licenza all'intero repository (è il solo autore, si può fare) oppure tenere MIT. Pythia è Apache-2.0 ma il lab non ridistribuisce i pesi, quindi non c'è un obbligo. Nessun task cambia la licenza finché non si decide. |
| K4 | Anche `docs/` viene pubblicato da Pages (si serve dalla radice). | Accettabile: il repository è comunque pubblico. Ne segue che `docs/test-report.md` **non deve contenere testi del Pile** (solo id, conteggi, quote). |

### 1.2 Ambiguità e incoerenze nella spec

1. **Chi esegue le modalità B e C (bloccante per RF0 e RNF3).** D1 tiene `prefixes.json` solo sul disco del formatore. Allora B e C girano solo sul portatile del formatore, proiettato. Ma RNF3 misura tre portatili, che ha senso solo se i partecipanti usano la pagina da sé: in quel caso il file andrebbe distribuito, cioè gli estratti del Pile escono comunque dal disco del formatore. Va scelto uno dei due scenari: (a) demo del formatore + modalità A dai partecipanti; (b) file distribuito in aula, con D1 riformulata come «non pubblico» anziché «solo locale».
2. **CA2 non è calcolabile.** I controlli hanno `expected_ids` vuoto, quindi la «corrispondenza esatta di 32 token» non ha un termine di confronto. Proposta: ogni controllo è un testo inventato di circa 64 token, diviso in prefisso (32) e continuazione attesa (32) come le voci memorizzate. Lo script tokenizza i controlli e scrive `lab/controls.json` da un file sorgente leggibile `scripts/controls_source.json`.
3. **Il CSV va nel foglio condiviso (sezione 3), ma contiene output del modello.** Nella modalità B gli output coincidono per costruzione con estratti del Pile. D1 copre il repository pubblico, non il foglio. Proposta: il CSV include di default solo id del prefisso, metriche e output; aggiungere un'opzione «escludi testi» attiva per impostazione predefinita, che rimuove output e testo libero. Decide Pietro.
4. **CSV ed Excel italiano (CA4).** Excel con impostazioni italiane usa `;` come separatore: un CSV con `,` si apre in una colonna sola. Inoltre senza BOM Excel legge male gli accenti. Proposta: CSV UTF-8 **con BOM**, separatore `,` come da spec, e in più un pulsante «Copia per il foglio» che copia in formato TSV negli appunti (incollato in Google Fogli si divide in colonne da solo, ed è proprio l'uso dichiarato: «da incollare»). CA4 va verificato su Excel con impostazioni italiane.
5. **Formula injection nel CSV.** Un output che inizia con `=`, `+`, `-`, `@` viene interpretato come formula da Fogli ed Excel. I campi vanno neutralizzati (prefisso `'`). Non è nella spec; lo aggiungo al task del registro.
6. **Distorsione nel confronto della modalità C.** I prefissi sono scelti tra quelli memorizzati da `pythia-70m` (duped) e poi provati sul deduped: il confronto è sbilanciato a favore del modello duped per selezione, non solo per effetto della deduplicazione. Inoltre 463.953 contro 411.448 è una differenza di circa l'11 %: un effetto modesto, che in aula va presentato come tale. Proposta: campionare anche da `deduped.70m` (circa 10 + 10 voci) ed eseguire entrambi i gruppi su entrambi i modelli. Il testo è confrontabile anche se gli `index` non lo sono.
7. **Molte sequenze memorizzate sono banali.** Una quota consistente di `duped.70m` è fatta di licenze, codice ripetitivo, sequenze numeriche o token ripetuti. Su 200 candidati casuali, 20 voci leggibili potrebbero non esserci. Proposta: un filtro automatico sulla varietà dei token (es. almeno 16 token distinti su 64) e, se servono, più candidati.
8. **Filtro dei dati personali troppo stretto.** «URL personali» non è definibile in modo automatico; nomi e indirizzi non sono coperti dalle regex. Proposta: scartare tutti gli URL, le email, i numeri di telefono e le sequenze di cifre lunghe; tutto il resto resta alla revisione manuale, che è il vero controllo.
9. **CA8 come scritto non protegge.** La CI non può far «fallire un commit»: interviene dopo il push, quando l'estratto è già pubblico (e resta nella cronologia). Inoltre `.gitignore` non impedisce `git add -f`. Proposta: hook `pre-commit` locale come prima difesa, CI su push e pull request come seconda, e controllo esteso anche a testi lunghi in `docs/` (vedi K4).
10. **Evidenziazione token per token (RF3).** Il tokenizer è BPE a byte: un token decodificato da solo può essere un frammento UTF-8 e apparire come «�». Va gestito (decodifica cumulativa e differenza tra prefissi decodificati) e gli spazi e gli a capo vanno resi visibili.
11. **Registro solo in memoria (RF6).** Un ricaricamento cancella il registro. Proposta: avviso prima di chiudere la pagina se il registro non è vuoto. Non usare `localStorage`, per non lasciare estratti sui portatili.
12. **Numerazione.** RF0 compare dopo RF2. Cosmetico.

### 1.3 Questioni aperte 2 e 3

Non verificate da Claude Code: dal container di lavoro `huggingface.co` non è raggiungibile (blocco di rete). Le tratto come **controlli automatici nello script** (T2), che girano sulla macchina di Pietro:

- **Tokenizer (QA2).** Lo script carica i tokenizer di `EleutherAI/pythia-70m` e `EleutherAI/pythia-1.4b`, confronta il vocabolario e verifica che la decodifica dei 64 token di ogni candidato sia identica. Se differiscono, si ferma. Va notato che, poiché la pagina passa **ID** e non testo, il tokenizer incide solo sul testo mostrato, non sull'esito della corrispondenza.
- **Revisione (QA3).** Leggere `config.json` di `Xenova/pythia-70m` (`_name_or_path`, data dell'ultimo commit) dice poco. Il controllo decisivo è empirico: lo script esegue in PyTorch `EleutherAI/pythia-70m` alla revisione `step143000` e tiene solo i candidati che riproduce esattamente. Così la quota CA1 nel browser misura solo l'effetto di conversione e quantizzazione. Se la quota fp32 nel browser è molto sotto il 100 %, la revisione convertita è il primo sospetto.

Rischi non citati nella spec:
- **Rete aziendale.** Il proxy del cliente può bloccare `huggingface.co` o i suoi host di download. Va provato presto (T0), non in aula. Piano B: copia dei pesi su disco o su un server locale del formatore, caricata con `env.localModelPath` di Transformers.js (non viola RNF5, che riguarda il repository).
- **Precisione numerica.** La memorizzazione del dataset è stata calcolata su GPU, non in fp32 su WASM. Su token quasi a pari probabilità l'argmax può cambiare anche in fp32. È già coperto da CA1 e va spiegato in aula come limite.
- **Versioni.** Transformers.js va fissato a una versione esatta (nessun `@latest`), che scarica anche i file WASM di ONNX Runtime da CDN: gli host attesi vanno elencati per CA5.

### 1.4 Decisioni richieste a Pietro prima di T3

| ID | Decisione | Default proposto |
| --- | --- | --- |
| D2 | Cartella della pagina | `lab/` (K2) |
| D3 | Licenza | invariata finché non si decide (K3) |
| D4 | Scenario d'aula | (a) demo del formatore per B e C (1.2.1) |
| D5 | Testi nel CSV | esclusi di default (1.2.3) |
| D6 | Campione anche da `deduped.70m` | sì, 10 + 10 (1.2.6) |

---

## 2. Task

Formato: obiettivo · file · fatto quando · criteri di riferimento. Ogni task è indipendente nel branch e si chiude con una pull request.

### T0 — Prova di fattibilità della rete (Pietro, 30 minuti)
Aprire dalla rete del cliente, o da una rete aziendale simile, `https://huggingface.co/Xenova/pythia-70m` e scaricare un file ONNX. Annotare in `docs/test-report.md` l'esito e gli host contattati.
**Fatto quando:** esito scritto. Se bloccato, aprire un task per il piano B prima di T3. · CA5, RNF1

### T1 — Protezioni sui dati
- `.gitignore`: `data/`, `*.prefixes.json`, `__pycache__/`, `.venv/`.
- `scripts/check_no_pile.sh`: fallisce se nel commit (o nell'albero, in CI) c'è un file sotto `data/`, un `*.json` con chiave `expected_ids` non vuota e `type: "memorized"`, o un file di `docs/` con blocchi di testo > 200 caratteri contrassegnati come estratto. Messaggio di errore in italiano.
- Hook `pre-commit` (configurazione in `.pre-commit-config.yaml` o `scripts/install-hooks.sh`) che lancia lo script.
- `.github/workflows/check-data.yml`: su `push` e `pull_request`, lancia lo stesso script.
**Fatto quando:** un commit di prova con `data/x.json` viene rifiutato in locale e una PR con lo stesso file fallisce in CI (prova su branch di test, poi eliminato). · CA8

### T2 — Script di preparazione dei prefissi
`scripts/prepare_prefixes.py`, `scripts/requirements.txt` (versioni fissate: `datasets`, `transformers`, `torch` CPU).
1. Argomenti: `--split` (ripetibile: `duped.70m`, `deduped.70m`), `--n` (default 200 per split), `--seed` (default 42), `--out data/candidates.json`, `--finalize`.
2. Carica lo split, campiona con seme fisso.
3. Controllo QA2: confronto dei tokenizer `pythia-70m` e `pythia-1.4b` (vedi 1.3); in caso di differenza esce con errore.
4. Decodifica con il tokenizer di `EleutherAI/pythia-70m`.
5. Filtri automatici: email, URL (tutti), telefoni, sequenze di ≥ 8 cifre, meno di 16 token distinti su 64. Conta gli scarti per motivo e li stampa.
6. Controllo QA3: per ogni candidato rimasto, generazione greedy di 32 token con `EleutherAI/pythia-70m` (per `duped.70m`) o `pythia-70m-deduped` (per `deduped.70m`), `revision="step143000"`, in fp32. Campo `reproduced_pytorch: true/false`. Se la quota è sotto il 95 %, avviso esplicito.
7. Scrive `data/candidates.json` nel formato della sezione 5 della spec, con `reviewed: false`, `notes: ""`, `reproduced_pytorch`.
8. `--finalize`: legge `data/candidates.json`, tiene solo `reviewed: true`, verifica che ogni voce abbia 32 + 32 ID, che `prefix_text`/`expected_text` corrispondano alla decodifica, e scrive `data/prefixes.json`. Esce con errore se c'è anche una sola voce non riveduta nell'output (CA7).
9. Opzione `--controls scripts/controls_source.json`: tokenizza i controlli e scrive `lab/controls.json` (vedi T4).
**Fatto quando:** eseguito due volte con lo stesso seme produce file identici; `--finalize` su un file con una voce `reviewed: false` la esclude e su un file manomesso esce con errore. · CA7, QA2, QA3

### T3 — Revisione manuale (Pietro)
Scegliere circa 20 voci (o 10 + 10 se D6), leggibili, senza dati personali, con `reproduced_pytorch: true`. Impostare `reviewed: true` e una nota. Lanciare `--finalize`.
**Fatto quando:** esiste `data/prefixes.json` con circa 20 voci, mai committato. · CA7

### T4 — Prefissi di controllo
`scripts/controls_source.json`: 5-8 testi inventati in inglese (il modello è addestrato sull'inglese), stile simile alle voci memorizzate (prosa, codice, elenco), ciascuno lungo almeno 64 token. Non devono essere citazioni o testi noti. Generazione di `lab/controls.json` con T2 punto 9: `type: "control"`, `split: null`, `index: null`, 32 + 32 ID.
**Fatto quando:** `lab/controls.json` è valido e versionato; nessun controllo è una frase reperibile online (verifica a campione di Pietro). · CA2, RF5

### T5 — Scheletro della pagina e caricamento dei modelli
`lab/index.html`, `lab/app.js` (modulo ES), `lab/style.css`. Riusa i colori e i caratteri di `assets/site.css` per coerenza con il sito; aggiunge un link al lab dalla home solo se Pietro lo decide.
- Transformers.js da CDN a **versione esatta**, `device: 'wasm'`, WebGPU disattivato.
- Selettore della variante (`dtype`: `fp32`, `q8`, e le altre disponibili) per CA1.
- Stato per modello: in attesa, download con percentuale (`progress_callback`), pronto, errore con messaggio comprensibile.
- Caricamento su richiesta: un modello alla volta di default; opzione «carica entrambi» (RF1 resta aperta fino a T11).
- Nessun cookie, analytics, font esterni o altre richieste (CA5). Gli host attesi sono elencati in un commento in testa ad `app.js`.
**Fatto quando:** i due modelli si caricano in Chrome, Edge e Firefox, lo stato è visibile e la scheda Rete mostra solo CDN della libreria e host di Hugging Face. · RF1, RNF1, RNF2, RNF5, CA5

### T6 — Caricamento dei prefissi
Selettore di file e trascinamento di `prefixes.json`; validazione dello schema (campi, 32 + 32 interi, `reviewed: true`) con errori in italiano; lettura con `FileReader`, nessun invio, nessun salvataggio in `localStorage`. Senza file: elenco con i soli controlli.
**Fatto quando:** un file valido popola l'elenco; un file malformato mostra l'errore senza bloccare la pagina; la scheda Rete non mostra richieste al caricamento. · RF0, RNF1

### T7 — Modalità B
- Il modello riceve `input_ids` (tensore `int64`, forma `[1, 32]`) e `attention_mask` di uno, mai il testo ricodificato. Generazione con `do_sample: false`, `num_beams: 1`, `max_new_tokens: 32`, parametri espliciti. Le sequenze del Pile contengono token EOS tra un documento e l'altro: la generazione **non deve fermarsi** su EOS e **non deve sopprimerlo**. Quindi non usare `min_new_tokens` (sopprime EOS e cambia l'argmax); disattivare invece il criterio di arresto su EOS nella versione fissata della libreria e documentare come.
- Confronto sugli ID: corrispondenza esatta sì/no, numero di token iniziali coincidenti (lunghezza del prefisso comune, 0-32).
- Vista affiancata atteso/generato con evidenziazione per token; decodifica robusta ai frammenti UTF-8 (1.2.10); spazi e a capo visibili.
- Funzione di confronto pura, in un modulo separato, con test minimi eseguibili nel browser (`lab/tests.html`) o con Node.
**Fatto quando:** su un prefisso noto il risultato coincide con `reproduced_pytorch`; i test della funzione di confronto passano (identici, primo token diverso, ultimo token diverso). · RF3, CA2

### T8 — Vista del formatore
Interruttore, spento di default, che mostra per ogni voce `type`, `split`, `index`, `notes`. A interruttore spento controlli e voci memorizzate sono indistinguibili nell'elenco (stesso formato di id, ordine mescolato con seme fisso).
**Fatto quando:** a interruttore spento nessun elemento visibile distingue i controlli. · RF5, RF7

### T9 — Modalità A
Campo libero, «Genera», 32 token greedy con gli stessi parametri di T7; output separato dal prompt. Messaggio didattico breve: senza sapere che cosa cercare, l'output non dice se è memorizzato.
**Fatto quando:** funziona con entrambi i modelli; il testo libero non viene inviato da nessuna parte. · RF2

### T10 — Modalità C
Stesso prefisso (ID) eseguito sui due modelli, risultati affiancati con l'evidenziazione di T7. Se è caricato un solo modello, i due si eseguono in sequenza, liberando il primo (`dispose()`) se l'opzione di memoria lo richiede. Riquadro fisso: 463.953 e 411.448, link alla scheda del dataset, una frase che dica che la differenza è circa dell'11 % e che gli indici non sono confrontabili. Se D6: etichetta dello split di origine visibile solo nella vista del formatore.
**Fatto quando:** CA3 verificato manualmente sugli stessi prefissi. · RF4, CA3

### T11 — Registro e esportazione
Registro in memoria con i campi di RF6 più `variante` (`dtype`). Esportazione CSV UTF-8 con BOM, separatore `,`, campi tra virgolette, neutralizzazione delle formule (1.2.5). Pulsante «Copia per il foglio» (TSV). Opzione «escludi testi» secondo D5. Avviso prima di chiudere se il registro non è vuoto.
**Fatto quando:** il file si apre correttamente in Google Fogli ed Excel con impostazioni italiane, con accenti corretti; un output che inizia con `=` resta testo. · RF6, CA4

### T12 — Accessibilità
Navigazione completa da tastiera, focus visibile, etichette sui controlli, `aria-live` per gli stati di caricamento e per l'esito della generazione, evidenziazione non affidata solo al colore (es. sottolineatura o simbolo), contrasto AA. Testi in italiano semplice.
**Fatto quando:** l'intero flusso B si esegue senza mouse; controllo del contrasto superato. · RNF6

### T13 — Test e report (Pietro, con supporto di Claude Code)
`docs/test-report.md`, senza testi del Pile (K4):
- CA1: tabella variante × quota di riproduzione esatta (su 20, e per gruppo se D6), confrontata con `reproduced_pytorch`.
- CA2: esito su tutti i controlli.
- CA3, CA4, CA5 (elenco degli host osservati), CA6 (modalità aereo, con e senza `prefixes.json` già caricato).
- RNF3: tre portatili (modello, RAM, browser), tempi di primo caricamento, di caricamento da cache e di generazione per 32 token, memoria usata con uno e con due modelli. Da qui si decide RF1.
**Fatto quando:** tutte le righe compilate, decisione su RF1 e sulla variante del pilota scritta nel report. · CA1-CA6, RNF3, RNF4

### T14 — Documentazione
Paragrafo sul lab nel `README.md` esistente (scopo, uso in aula, fonti, limiti, nota su D1) e link alla spec. Aggiornare la spec a v0.3 con le decisioni D2-D6.
**Fatto quando:** README e spec coerenti con quanto implementato. · —

---

## 3. Ordine e dipendenze

```
T0 ─┐
T1 ─┼─> T2 ─> T3 ─────────────┐
    │    └──> T4 ─────────────┤
    └──> T5 ─> T6 ─> T7 ─> T8 ┼─> T9 ─> T10 ─> T11 ─> T12 ─> T13 ─> T14
```

T1 va fatto **prima** di qualunque file in `data/`. T5-T7 possono partire con i soli controlli mentre Pietro fa T3.
