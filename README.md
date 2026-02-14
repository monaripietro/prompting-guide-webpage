# **Guida Interattiva al Prompt Engineering & AI Coach**

**Benvenuto nel repository ufficiale del progetto educativo di Pietro Monari.**

Questo progetto offre due strumenti potenti per imparare a comunicare efficacemente con l'Intelligenza Artificiale:

1. 🌐 **Sito Web Interattivo:** Una guida visiva e pratica con simulatore.  
2. 🤖 **Prompt Coach:** Un set di istruzioni per trasformare ChatGPT (o qualsiasi LLM) nel tuo allenatore personale.

## **1\. Il Sito Web (prompt\_engineering\_guide.html)**

È una pagina web "tutto-in-uno" che guida l'utente da zero a esperto; puoi vederla online all'indirizzo <https://wwww.monaripietro.it/prompting>

### **Cosa contiene:**

* **Livello Base:** I fondamentali (Ruolo, Task, Contesto, Output) basati sugli "Appunti di sopravvivenza".  
* **Livello Intermedio:** Tecniche di struttura (Few-Shot, Prompt Interattivo) e ragionamento (Chain of Thought).  
* **Livello Avanzato:** Architetture complesse (Delimitatori, Reverse Meta-Prompting) e la differenza tra modelli Standard e Reasoning.  
* **Simulatore di Prompt:** Un'area interattiva dove confrontare in tempo reale un prompt "debole" con uno "ottimizzato" in vari scenari (Email, Coding, Creatività).  
* **🛡️ Laboratorio Security (Prompt Injection):** Una sezione nascosta (accessibile dal footer) che dimostra come l'IA può essere ingannata leggendo codice nascosto, metadati e attributi delle immagini.

## **🏗️ Dietro le Quinte: Come è stato costruito il sito?**

*(Spiegazione per non-programmatori)*

Questo sito è una **Single Page Application (SPA)** contenuta in un unico file. Non serve installare nulla, basta aprirlo con un browser. Ecco la logica di costruzione spiegata semplice:

### **1\. Lo Scheletro (HTML5)**

L'HTML è la struttura della pagina. Abbiamo diviso il contenuto in "blocchi" logici (sezioni Base, Intermedio, Avanzato).

* **Curiosità:** Abbiamo inserito volontariamente delle "trappole" nel codice (testo nascosto, metadati ingannevoli) per la sezione Security. Un utente umano non li vede, ma un'IA che legge il codice sì\!

### **2\. Il "Vestito" (Tailwind CSS)**

Invece di scrivere lunghi file di stile separati, abbiamo usato **Tailwind CSS**. È una tecnologia che permette di dare stile agli elementi usando delle "etichette" direttamente nell'HTML.

* *Esempio:* Scrivendo class="text-red-500 font-bold", il testo diventa automaticamente rosso e grassetto. Questo rende il sito moderno e adattabile ai cellulari (responsive) senza scrivere codice complesso.

### **3\. Il Cervello (JavaScript)**

È la parte che rende il sito interattivo. Ecco cosa fa:

* **Gestione Schede:** Quando clicchi su "Intermedio", lo script nasconde la sezione "Base" e mostra quella "Intermedio" istantaneamente, senza ricaricare la pagina.  
* **Il Simulatore:** Non stiamo interrogando veramente un'IA in tempo reale (sarebbe lento e costoso). Abbiamo creato un "dizionario" interno con scenari pre-scritti. Quando selezioni "Email", il sito recupera istantaneamente il testo "Bad" e "Good" associato a quello scenario e aggiorna lo schermo.  
* **Il Security Lab:** Simula il comportamento di un crawler AI. Quando clicchi "Analizza Testo Nascosto", lo script va a leggere un elemento HTML che ha stile display:none (invisibile) e te lo mostra a schermo, simulando come un LLM estrae i dati.

## **2\. Il Prompt Coach (prompt\_coach\_instruction.md)**

Questo file contiene il **System Prompt** (le "istruzioni madri") per creare il tuo assistente personale.

### **La Filosofia**

Il Coach è progettato seguendo il principio dell'**"Alchimia Empirica"**: non dà mai la risposta pronta. Ti costringe a ragionare attraverso 3 sfide di difficoltà crescente, adattandosi al tuo livello.

### **Come usarlo**

1. Apri il file prompt\_coach\_instruction.md.  
2. Copia tutto il testo.  
3. Incollalo in una nuova chat di ChatGPT, Claude o Gemini (oppure nelle "Custom Instructions").  
4. Inizia a chattare: il Coach ti guiderà passo dopo passo.

## **🚀 Come iniziare**

1. Scarica il file .html e aprilo con Chrome, Edge o Safari.  
2. Usa il file .md per addestrare la tua IA preferita.

**Credits:**

Progettato e Curato da **Pietro Monari**.

Codice generato e ottimizzato con il supporto di **Gemini 3 Pro**.
