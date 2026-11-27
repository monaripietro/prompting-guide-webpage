# Spec — Sprint 1: Lab estrazione dati, livello base

Versione 0.2 · 26 novembre 2026 · Autore: Pietro Monari
Destinatario: Claude Code (analisi, piano, revisione). Implementazione: Mistral Vibe.
Licenza del progetto: Apache-2.0. Repository pubblico su GitHub, pagina su GitHub Pages.

> Le osservazioni di Claude Code su questa versione sono in `docs/tasks.md`, sezione 1. Le decisioni prese dopo vanno riportate qui con un nuovo numero di versione.

---

## 1. Contesto

Il lab fa parte del modulo 4 («Estrarre dati dal modello») di un percorso formativo su dati, intelligence e sicurezza con gli LLM. Il pilota si terrà in un corso aziendale. I partecipanti hanno buone conoscenze di AI literacy e **non programmano**.

Il lab è organizzato in tre livelli. Questo sprint copre solo il **livello base**:

1. **Base (questo sprint):** estrarre dati di pre-addestramento da un modello piccolo e completamente aperto.
2. Intermedio (sprint successivi): estrarre segreti inseriti con un fine-tuning ad hoc.
3. Avanzato (attività ponte opzionale, dopo il pilota): esfiltrare dati recuperati da strumenti o RAG.

**Obiettivo didattico del livello base:** far vedere che un modello memorizza parti dei dati di addestramento, ma che l'estrazione riesce solo se si sa già che cosa cercare. Gli altri obiettivi sono mostrare l'effetto della deduplicazione e la differenza tra un tentativo alla cieca e uno guidato.

## 2. Fatti verificati su cui si basa la spec

Tutti controllati sulle fonti il 26 novembre 2026.

| Fatto | Fonte |
| --- | --- |
| Pythia: modelli da 14M a 12B, addestrati sul Pile e sul Pile deduplicato; stessi dati nello stesso ordine; 154 checkpoint per modello; licenza Apache-2.0 | [EleutherAI/pythia](https://github.com/EleutherAI/pythia) |
| Esistono conversioni ONNX per Transformers.js di `pythia-70m` e `pythia-70m-deduped` | [Xenova/pythia-70m](https://huggingface.co/Xenova/pythia-70m), [Xenova/pythia-70m-deduped](https://huggingface.co/Xenova/pythia-70m-deduped) |
| I file ONNX di `Xenova/pythia-70m` vanno da circa 71 MB a 291 MB secondo la variante | [file ONNX](https://huggingface.co/Xenova/pythia-70m/tree/main/onnx) |
| Il dataset `EleutherAI/pythia-memorized-evals` elenca ogni sequenza di addestramento memorizzata dal modello finale. Memorizzata significa che, dati i primi 32 token, la continuazione greedy riproduce esattamente i 32 token successivi. Ogni riga contiene `index` e `tokens` (64 token) | [scheda del dataset](https://huggingface.co/datasets/EleutherAI/pythia-memorized-evals) |
| Split per il 70M: `duped.70m` con 463.953 righe, `deduped.70m` con 411.448 righe. I token si decodificano con il tokenizer Pythia | [README del dataset](https://huggingface.co/datasets/EleutherAI/pythia-memorized-evals/blob/main/README.md) |
| Transformers.js esegue i modelli nel browser tramite ONNX Runtime, su CPU (WASM) o, in modo sperimentale, su WebGPU | [README di Transformers.js](https://github.com/huggingface/transformers.js) |
| In Transformers.js `do_sample` vale `false` per impostazione predefinita, cioè decodifica greedy; `num_beams: 1` disattiva la beam search; `max_new_tokens` fissa i token generati | [documentazione della generazione](https://huggingface.co/docs/transformers.js/api/generation/configuration_utils) |

**Nota:** gli indici `index` di `duped.70m` e `deduped.70m` puntano a due dataset di addestramento diversi, quindi **non sono confrontabili tra loro**. Il confronto sulla deduplicazione si fa eseguendo gli stessi prefissi su entrambi i modelli e citando il numero di righe dei due split.

## 3. Ambito

### Nello sprint
- Pagina statica in italiano su GitHub Pages, senza backend.
- Due modelli caricati da Hugging Face Hub al momento dell'uso: `Xenova/pythia-70m` e `Xenova/pythia-70m-deduped`.
- Script offline in Python che prepara un insieme ridotto e rivisto a mano di prefissi.
- **Decisione sui dati (D1):** gli estratti del Pile **non si pubblicano** in questo sprint. Il file dei prefissi resta solo in locale, escluso dal repository con `.gitignore`, e la pagina lo carica dal disco del formatore. La pubblicazione si rivaluta dopo il pilota, eventualmente con un parere legale.
- Esportazione dei tentativi in CSV, da incollare nel registro esperimenti, che è un foglio condiviso.

### Fuori dallo sprint
Fine-tuning, server, interfaccia in lingua diversa dall'italiano, modelli in italiano, RAG e strumenti, account, analytics.

## 4. Requisiti funzionali

**RF1. Caricamento dei modelli.** All'avvio la pagina mostra lo stato di caricamento di ciascun modello (in attesa, in download con percentuale se disponibile, pronto, errore). Si può usare un solo modello alla volta per risparmiare memoria, oppure entrambi se i tempi lo permettono: va deciso dopo il test RNF3.

**RF2. Modalità A, alla cieca.** Campo di testo libero e pulsante «Genera». Si generano 32 token in modalità greedy (`do_sample: false`, `num_beams: 1`, `max_new_tokens: 32`). L'output si mostra separato dal prompt.

**RF0. Caricamento dei prefissi.** La pagina non contiene prefissi. Il formatore carica `prefixes.json` dal proprio disco, con un selettore di file o trascinandolo nella pagina. Il file viene letto solo nel browser e non viene inviato da nessuna parte. Senza file sono disponibili soltanto la modalità A e i prefissi di controllo, che sono testi inventati e possono stare nel repository.

**RF3. Modalità B, prefissi noti.** Elenco dei prefissi rivisti, presi dal file caricato con RF0. Selezionato un prefisso, il modello riceve **gli ID dei token** del prefisso, non il testo ricodificato, e genera 32 token greedy. La pagina mostra:
- il testo atteso e quello generato, affiancati;
- l'evidenziazione token per token di coincidenze e differenze;
- un'indicazione «Corrispondenza esatta: sì / no» calcolata sugli ID dei token;
- il numero di token iniziali coincidenti (da 0 a 32).

**RF4. Modalità C, confronto.** Lo stesso prefisso viene eseguito su `pythia-70m` e `pythia-70m-deduped`, con i risultati affiancati e la stessa evidenziazione di RF3. Un riquadro fisso riporta il numero di sequenze memorizzate nei due split (463.953 e 411.448), con il link alla fonte.

**RF5. Prefissi di controllo.** L'elenco include prefissi inventati, che non sono dati di addestramento e sono marcati come tali solo nella vista del formatore. Servono a mostrare che il modello non li completa in modo esatto.

**RF6. Registro locale.** Ogni tentativo viene salvato in memoria con: ora, modalità, modello, id del prefisso o testo libero, output, corrispondenza esatta, numero di token coincidenti. Un pulsante esporta il registro in CSV (UTF-8, separatore virgola). Nessun invio di dati a server.

**RF7. Vista del formatore.** Un interruttore mostra, per ogni prefisso, la fonte (`split` e `index`), il tipo (memorizzato o controllo) e le note di revisione. È nascosta per impostazione predefinita.

## 5. Preparazione dei dati (script offline)

`scripts/prepare_prefixes.py`:
1. carica `duped.70m` con `datasets`;
2. estrae casualmente, con seme fisso, circa 200 sequenze candidate;
3. le decodifica con il tokenizer di `EleutherAI/pythia-70m`;
4. scarta automaticamente quelle che contengono pattern di email, numeri di telefono o URL personali;
5. scrive `data/candidates.json` per la revisione manuale.

La **revisione manuale** spetta a Pietro: sceglie circa 20 sequenze leggibili e prive di dati personali e imposta `reviewed: true` con una nota. Poi lo script, con l'opzione `--finalize`, scrive `data/prefixes.json` con le sole voci rivedute. `data/candidates.json` e `data/prefixes.json` sono in `.gitignore`. I prefissi di controllo stanno in un file separato e pubblico, `site/controls.json`.

Formato di ogni voce:
```json
{
  "id": "m01",
  "type": "memorized | control",
  "split": "duped.70m",
  "index": 12345,
  "prefix_ids": [ ...32 int... ],
  "expected_ids": [ ...32 int... ],
  "prefix_text": "...",
  "expected_text": "...",
  "reviewed": true,
  "notes": "..."
}
```
I prefissi di controllo hanno `split` e `index` a `null` ed `expected_ids` vuoto.

## 6. Requisiti non funzionali

- **RNF1. Privacy:** nessuna richiesta di rete oltre al download dei file del modello e delle librerie; nessun cookie né analytics. Si verifica dagli strumenti di sviluppo del browser.
- **RNF2. Browser:** Chrome, Edge e Firefox recenti. WASM per impostazione predefinita; WebGPU disattivato in questo sprint.
- **RNF3. Prestazioni:** tempi di primo caricamento e di generazione misurati su tre portatili diversi e riportati in `docs/test-report.md`. Non c'è una soglia fissata: decide Pietro dopo la misura.
- **RNF4. Offline:** dopo il primo caricamento la pagina dovrebbe funzionare senza rete grazie alla cache del browser. **È un'ipotesi da verificare**, non un fatto.
- **RNF5. Pesi:** i file del modello non vanno nel repository; si caricano da Hugging Face Hub.
- **RNF6. Accessibilità:** testi in italiano semplice, contrasto adeguato, utilizzabile da tastiera.

## 7. Criteri di accettazione

| ID | Criterio | Come si verifica |
| --- | --- | --- |
| CA1 | Per ogni variante ONNX provata (almeno fp32 e una quantizzata) si riporta la quota dei 20 prefissi memorizzati riprodotti esattamente nel browser | Tabella in `docs/test-report.md`; per il pilota si sceglie la variante con la quota più alta |
| CA2 | Nessun prefisso di controllo ha una corrispondenza esatta di 32 token | Esecuzione della modalità B su tutti i controlli |
| CA3 | La modalità C mostra risultati affiancati sugli stessi prefissi | Prova manuale |
| CA4 | Il CSV esportato si apre correttamente in Google Fogli ed Excel, con gli accenti italiani | Prova manuale |
| CA5 | Nessuna richiesta di rete oltre a modelli e librerie | Scheda Rete degli strumenti di sviluppo |
| CA6 | Il comportamento offline dopo il primo caricamento è documentato, che funzioni o no | Test in modalità aereo |
| CA7 | `data/prefixes.json` contiene solo voci con `reviewed: true` | Controllo automatico nello script |
| CA8 | Nessun estratto del Pile è presente nel repository pubblico | Controllo automatico in CI: falliscono i commit che contengono `data/*.json` |

**Rischio da controllare con CA1:** la quantizzazione può cambiare la continuazione greedy. In quel caso sequenze memorizzate dal modello originale non si riproducono più. Se succede, il risultato va riportato e diventa materiale didattico, non va nascosto.

## 8. Struttura del repository

```
/
├── LICENSE                 Apache-2.0
├── README.md               in italiano: scopo, uso in aula, fonti, limiti
├── docs/
│   ├── SPEC-sprint1.md     questo documento
│   ├── tasks.md            piano dei task (scritto da Claude Code)
│   └── test-report.md      risultati di CA1-CA6 e tempi RNF3
├── .gitignore              esclude data/*.json
├── site/                   pagina per GitHub Pages
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── controls.json       prefissi di controllo inventati (pubblici)
├── data/                   solo in locale, non pubblicata
│   ├── candidates.json
│   └── prefixes.json
└── scripts/
    └── prepare_prefixes.py
```

## 9. Flusso di lavoro

1. **Claude Code** legge questa spec, segnala ambiguità e conflitti, poi scrive `docs/tasks.md`: task piccoli, ciascuno con il criterio di accettazione di riferimento.
2. **Mistral Vibe** implementa un task alla volta, su un branch per task.
3. **Claude Code** rivede ogni modifica rispetto alla spec e ai criteri, poi propone le correzioni.
4. **Pietro** fa la revisione manuale dei prefissi ed esegue i test su portatili e in aula.

Ordine consigliato dei task: script di preparazione, poi revisione manuale, poi pagina con modalità B, poi le modalità A e C, poi il registro CSV, infine test e report.

## 10. Questioni aperte per Claude Code

1. ~~Licenza dei contenuti~~: chiusa con la decisione D1 (sezione 3).
2. **Tokenizer:** la scheda del dataset decodifica con il tokenizer di `pythia-1.4b`. Va verificato che coincida con quello di `pythia-70m`.
3. **Revisione:** gli indici del modello convertito devono corrispondere al checkpoint finale a cui si riferisce l'elenco delle sequenze memorizzate. Va verificato quale revisione è stata convertita in `Xenova/pythia-70m`.
4. **Memoria:** caricare due modelli insieme potrebbe essere troppo per i portatili meno recenti. Va misurato prima di decidere RF1.
