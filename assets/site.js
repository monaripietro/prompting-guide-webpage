/* Configurazione e comportamenti condivisi — Guida al Prompt Engineering */

// Se il CDN di Tailwind non risponde, il resto dello script deve comunque partire:
// senza questa guardia un solo ReferenceError disattiva tab, copia e navigazione.
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    theme: {
      extend: {
        fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
        colors: {
          brand: {
            50: '#eff6ff', 100: '#dbeafe', 400: '#60a5fa', 500: '#3b82f6',
            600: '#2563eb', 700: '#1d4ed8', 900: '#1e3a8a'
          },
          reasoning: { 50: '#f5f3ff', 100: '#ede9fe', 600: '#7c3aed', 700: '#6d28d9' },
          danger: {
            50: '#fef2f2', 100: '#fee2e2', 400: '#f87171', 500: '#ef4444',
            700: '#b91c1c', 900: '#7f1d1d'
          },
          safe: { 50: '#ecfdf5', 100: '#d1fae5', 600: '#059669', 700: '#047857' }
        }
      }
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
  markCurrentNavLink();
  wireCopyButtons();
});

function markCurrentNavLink() {
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('[data-nav-links] a[href]').forEach((link) => {
    const target = link.getAttribute('href').split('/').pop().toLowerCase();
    if (target === here) link.setAttribute('aria-current', 'page');
  });
}

/* Bottoni con data-copy-target="<id>": copiano il testo dell'elemento indicato. */
function wireCopyButtons() {
  document.querySelectorAll('[data-copy-target]').forEach((button) => {
    button.addEventListener('click', async () => {
      const source = document.getElementById(button.dataset.copyTarget);
      if (!source) return;
      const label = button.querySelector('[data-copy-label]') || button;
      const original = label.textContent;
      const ok = await copyText(source.innerText);
      label.textContent = ok ? 'Copiato negli appunti' : 'Copia non riuscita — selezionalo a mano';
      setTimeout(() => { label.textContent = original; }, 2500);
    });
  });
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // navigator.clipboard non è disponibile su alcuni browser quando la pagina
    // è aperta da file:// — si ripiega sul vecchio comando di copia.
    const scratch = document.createElement('textarea');
    scratch.value = text;
    scratch.setAttribute('readonly', '');
    scratch.style.position = 'fixed';
    scratch.style.opacity = '0';
    document.body.appendChild(scratch);
    scratch.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(scratch);
    return ok;
  }
}
