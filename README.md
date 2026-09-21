# **Guida Interattiva al Prompt Engineering & AI Coach**

**Repository ufficiale del progetto educativo di Pietro Monari.**

Un sito statico in italiano che insegna a comunicare con l'intelligenza artificiale, diviso in tre pagine. Online all'indirizzo <https://www.monaripietro.it/prompting>.

## **Le tre pagine**

### **1. `index.html` — La guida, in tre livelli**

Il percorso didattico vero e proprio, con i contenuti divisi in schede.

* **Livello Base:** i cinque blocchi di un prompt (Ruolo, Task, Contesto, Output, Regole) e i tre errori che lo rovinano.
* **Livello Intermedio:** Few-Shot, Chain of Thought, Meta-Prompting, Prompt Interattivo, con una tabella che dice quale tecnica usare per quale problema.
* **Livello Avanzato:** delimitatori strutturati, Reverse Meta-Prompting, differenze fra modelli Standard, Reasoning e Ibridi, più un esempio di prompt "a contratto" per la produzione.
* **Simulatore:** confronto affiancato fra un prompt grezzo e la sua versione strutturata su quattro scenari. Gli output sono esempi scritti in anticipo, non risposte generate in tempo reale.

### **2. `prompt-injection.html` — Laboratorio di sicurezza**

Pagina dedicata alla vulnerabilità che nasce dal fatto che, per un modello, istruzioni e dati sono la stessa cosa.

* **La causa:** perché il problema esiste e perché non è un bug che si corregge.
* **Diretta e indiretta:** le due famiglie di attacco e chi ne è la vittima reale.
* **Laboratorio con nove vettori reali,** piantati nel codice sorgente della pagina stessa: testo visibile, testo nascosto via CSS, commenti HTML, attributi `alt`, metadati, JSON-LD, caratteri Unicode invisibili, confusione di contesto ed esfiltrazione via immagine Markdown. Il simulatore legge davvero l'elemento corrispondente del DOM, e per ciascun vettore mostra il meccanismo e la contromisura.
* **Difese,** divise per chi usa l'IA, chi scrive prompt e chi costruisce agenti, con una sezione esplicita su tre difese che sembrano funzionare e non bastano.
* **Checklist** in cinque punti prima di mettere un assistente in produzione.

> ⚠️ I payload di prompt injection vivono **solo** in questa pagina e nell'esemplare qui sotto, non nella home. È deliberato: tenerli nella `meta description` dell'homepage significherebbe avvelenare qualsiasi sintesi automatica dell'intero sito.

### **3. `ukulele.html` — L'esemplare da laboratorio**

Il laboratorio ha un limite didattico: si annuncia da solo, quindi un modello che lo legge è già allertato. Questa pagina no. È un articolo vero sulla storia dell'ukulele — la traversata del *Ravenscrag* nel 1879, i tre liutai di Madeira, il re Kalākaua, l'esposizione di San Francisco del 1915 — con **otto payload nascosti nel codice**, tutti puntati su un solo bersaglio: la richiesta *"riassumi questa pagina"* o *"di cosa parla questa pagina"*.

Ogni payload punta a un argomento falso **diverso** (paracadutismo, pasticceria, caldaie, api, criptovalute, monopattini, logistica, assicurazioni). La risposta del modello dice quindi da sola quale canale non era stato sanificato. La tabella di decodifica sta su `prompt-injection.html#esemplare`, che è anche da dove si raggiunge la pagina.

Un riquadro in fondo all'articolo dichiara apertamente la natura dell'esemplare: il contenuto storico è autentico e i payload sono innocui.

### **4. `prompt-coach.html` — Il system prompt da copiare**

Il System Prompt che trasforma ChatGPT, Claude o Gemini in un tutor di prompt engineering. Segue il principio dell'**alchimia empirica**: non dà mai la risposta pronta, ma fa costruire il prompt attraverso tre livelli.

Il coach valuta il prompt dell'utente contro una **rubrica di domande** — i cinque elementi al livello 1, la tecnica adatta al livello 2, la separazione fra istruzioni e dati al livello 3 — e risponde in tre righe: cosa manca, perché è un problema, una sola azione da fare. Un livello è superato quando non manca più nulla. L'utente migliora sempre lo stesso prompt, così alla fine ha costruito un oggetto suo.

È scritto per reggere anche su modelli piccoli o gratuiti: nessun contatore, nessuna tabella, nessuno stato da ricordare, un tetto di righe dichiarato e un esempio del turno di feedback dentro il prompt stesso. Se l'utente sbaglia due volte lo stesso elemento, riceve un modello da riempire per quel solo pezzo — serve a chi lo usa da solo, senza un docente accanto.

La pagina contiene il testo integrale con un pulsante di copia, le istruzioni per incollarlo nelle varie piattaforme e un esempio di scambio. Il file di riferimento resta **`prompt-coach-prompt.md`**, scaricabile dalla pagina.

## **🏗️ Com'è costruito**

*(Spiegazione per non programmatori)*

Tre pagine HTML statiche che condividono due file in `assets/`. Non serve installare né compilare nulla: basta aprire `index.html` con un browser.

```
index.html              → la guida a tre livelli + simulatore
prompt-injection.html   → laboratorio sicurezza (contiene i vettori reali)
ukulele.html            → esemplare: articolo autentico con 8 payload nascosti
prompt-coach.html       → system prompt del coach, con copia negli appunti
prompt-coach-prompt.md  → il coach come file di testo, sorgente di riferimento
assets/site.css         → stili condivisi
assets/site.js          → configurazione dei colori, icone, navigazione, copia
assets/ukulele.svg      → illustrazione (il suo alt è uno dei vettori)
```

### **Lo scheletro (HTML)**

Ogni pagina è un documento a sé, con la stessa barra di navigazione. Nella pagina sulla sicurezza sono state inserite di proposito delle "trappole" nel codice — testo nascosto, metadati ingannevoli, caratteri invisibili. Un utente umano non le vede, un'IA che legge il codice sì: è esattamente il punto della lezione.

### **Il vestito (Tailwind CSS)**

Gli stili si scrivono come "etichette" direttamente nell'HTML: `class="text-red-500 font-bold"` rende il testo rosso e grassetto. Tailwind arriva da CDN, quindi serve una connessione a internet per vedere il sito nel suo aspetto definitivo. Il codice è scritto per non rompersi del tutto se il CDN non risponde: le schede dei livelli e il pulsante di copia continuano a funzionare.

### **Il cervello (JavaScript)**

* **Schede:** cliccando su "Intermedio" la sezione "Base" viene nascosta e l'altra mostrata, senza ricaricare la pagina. Il livello scelto finisce nell'indirizzo (`#intermedio`), così il link è condivisibile.
* **Simulatore:** un dizionario interno con scenari già scritti. Nessuna chiamata a un'IA reale: sarebbe lenta, costosa e non riproducibile a scopo didattico.
* **Laboratorio injection:** simula un crawler AI leggendo davvero gli elementi nascosti di questa stessa pagina — l'attributo `alt` dell'immagine, il commento HTML, i caratteri invisibili — e mostra cosa un modello ne ricaverebbe.

## **🚀 Come iniziare**

1. Scarica il repository e apri `index.html` con Chrome, Edge o Safari.
2. Per il coach, apri `prompt-coach.html` e usa il pulsante di copia, oppure prendi direttamente `prompt-coach-prompt.md`.

## **Credits**

Progettato e curato da **Pietro Monari**.
