<script>
  import { onDestroy, onMount } from 'svelte'
  import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

  const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  const weekNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const languages = [['es', 'ES'], ['en', 'EN'], ['fr', 'FR'], ['ca', 'CA'], ['pt', 'PT'], ['eu', 'EU']]
  const countries = [['ES', 'España'], ['PT', 'Portugal'], ['FR', 'Francia'], ['US', 'Estados Unidos'], ['GB', 'Reino Unido'], ['DE', 'Alemania'], ['IT', 'Italia']]
  const regions = {
    ES: [['', 'Todo el país'], ['ES-AN', 'Andalucía'], ['ES-CT', 'Cataluña'], ['ES-EX', 'Extremadura'], ['ES-GA', 'Galicia'], ['ES-MD', 'Madrid'], ['ES-PV', 'País Vasco'], ['ES-VC', 'Comunidad Valenciana']],
    US: [['', 'Todo el país'], ['US-CA', 'California'], ['US-FL', 'Florida'], ['US-NY', 'New York'], ['US-TX', 'Texas']]
  }

  const steps = [
    { key: 'date', title: '¿Desde cuándo empieza?', help: 'Elige el primer mes y el año. El calendario se generará a partir de esa fecha.' },
    { key: 'range', title: '¿Cuántos meses quieres?', help: 'Puedes crear desde un calendario de un solo mes hasta un planificador anual completo.' },
    { key: 'page', title: '¿Cómo será la página?', help: 'El tamaño y la orientación afectan a cómo se reparte el calendario al imprimir o exportar a PDF.' },
    { key: 'content', title: '¿Qué debe aparecer?', help: 'Activa festivos, fines de semana, números de semana, días externos o zona de notas según el uso que quieras darle.' },
    { key: 'style', title: '¿Qué aspecto prefieres?', help: 'Configura tamaño de los días, color, bordes redondeados y pie de página con la fuente.' },
    { key: 'summary', title: 'Resumen y vista previa', help: 'Revisa las opciones, cambia lo que necesites y genera el PDF cuando esté todo listo.' }
  ]

  let language = 'es'
  let theme = 'light'
  let menuOpen = false
  let stepIndex = 0
  let startMonth = new Date().getMonth()
  let startYear = new Date().getFullYear()
  let totalMonths = 12
  let monthsPerPage = 2
  let pageSize = 'A4'
  let orientation = 'landscape'
  let showHolidays = true
  let country = 'ES'
  let region = 'ES-EX'
  let shadeWeekends = true
  let showWeekNumbers = false
  let showEmptyDays = false
  let showNotes = false
  let daySize = 'comfortable'
  let colorMode = 'color'
  let roundedCells = true
  let includeFooter = true
  let pdfUrl = ''
  let isGenerating = false
  let message = ''

  $: currentStep = steps[stepIndex]
  $: availableRegions = regions[country] || [['', 'Todo el país']]
  $: if (!availableRegions.some(([code]) => code === region)) region = ''
  $: calendarMonths = Array.from({ length: Number(totalMonths) }, (_, index) => addMonths(Number(startYear), Number(startMonth), index))
  $: selectedSummary = [
    ['Inicio', `${monthNames[startMonth]} de ${startYear}`],
    ['Duración', `${totalMonths} ${Number(totalMonths) === 1 ? 'mes' : 'meses'}`],
    ['Página', `${pageSize}, ${orientation === 'landscape' ? 'horizontal' : 'vertical'}, ${monthsPerPage} meses por página`],
    ['Contenido', contentSummary()],
    ['Estilo', `${daySizeLabel(daySize)}, ${colorMode === 'color' ? 'a color' : 'blanco y negro'}`]
  ]

  onMount(() => {
    const storedTheme = localStorage.getItem('printacalendar-theme') || localStorage.getItem('alon-tools-theme') || localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme = storedTheme || (prefersDark ? 'dark' : 'light')
    document.documentElement.dataset.theme = theme

    const storedLang = localStorage.getItem('printacalendar-language')
    if (storedLang && languages.some(([code]) => code === storedLang)) language = storedLang

    const onKeydown = (event) => {
      if (event.key === 'Escape') menuOpen = false
    }
    const mq = window.matchMedia('(min-width: 981px)')
    const onMediaChange = (event) => {
      if (event.matches) menuOpen = false
    }

    document.addEventListener('keydown', onKeydown)
    mq.addEventListener('change', onMediaChange)

    return () => {
      document.removeEventListener('keydown', onKeydown)
      mq.removeEventListener('change', onMediaChange)
    }
  })

  onDestroy(() => revokePdf())

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    localStorage.setItem('printacalendar-theme', theme)
    localStorage.setItem('alon-tools-theme', theme)
    localStorage.setItem('theme', theme)
  }

  function changeLanguage(code) {
    language = code
    localStorage.setItem('printacalendar-language', code)
    menuOpen = false
  }

  function nextStep() { stepIndex = Math.min(stepIndex + 1, steps.length - 1) }
  function previousStep() { stepIndex = Math.max(stepIndex - 1, 0) }
  function goToStep(index) { stepIndex = index; menuOpen = false }

  function addMonths(year, month, amount) {
    const date = new Date(year, month + amount, 1)
    return { year: date.getFullYear(), month: date.getMonth() }
  }

  function daysForMonth(year, month) {
    const first = new Date(year, month, 1)
    const offset = (first.getDay() + 6) % 7
    const days = new Date(year, month + 1, 0).getDate()
    const previousDays = new Date(year, month, 0).getDate()
    const cells = []

    for (let i = 0; i < offset; i += 1) cells.push({ day: previousDays - offset + i + 1, muted: true, weekend: i >= 5 })
    for (let day = 1; day <= days; day += 1) {
      const weekday = (new Date(year, month, day).getDay() + 6) % 7
      cells.push({ day, muted: false, weekend: weekday >= 5 })
    }
    while (cells.length % 7 !== 0 || cells.length < 35) {
      const day = cells.length - offset - days + 1
      const weekday = (new Date(year, month + 1, day).getDay() + 6) % 7
      cells.push({ day, muted: true, weekend: weekday >= 5 })
    }
    return showEmptyDays ? cells : cells.map((cell) => cell.muted ? { ...cell, day: '' } : cell)
  }

  function daySizeLabel(value) {
    return value === 'large' ? 'días grandes' : value === 'compact' ? 'días pequeños' : 'días medianos'
  }

  function contentSummary() {
    const items = []
    if (showHolidays) items.push(`festivos de ${country}${region ? ` / ${region}` : ''}`)
    if (shadeWeekends) items.push('fines de semana sombreados')
    if (showWeekNumbers) items.push('números de semana')
    if (showNotes) items.push('zona de notas')
    return items.length ? items.join(', ') : 'solo días del mes'
  }

  function pageDimensions() {
    const sizes = { A4: [595.28, 841.89], A3: [841.89, 1190.55], Letter: [612, 792] }
    let [width, height] = sizes[pageSize] || sizes.A4
    if (orientation === 'landscape') [width, height] = width > height ? [width, height] : [height, width]
    if (orientation === 'portrait') [width, height] = width < height ? [width, height] : [height, width]
    return [width, height]
  }

  async function generatePdf() {
    isGenerating = true
    message = ''
    revokePdf()
    try {
      const pdf = await PDFDocument.create()
      const font = await pdf.embedFont(StandardFonts.Helvetica)
      const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
      const [width, height] = pageDimensions()
      const perPage = Number(monthsPerPage)
      const primary = colorMode === 'color' ? rgb(0.94, 0.32, 0.24) : rgb(0.1, 0.1, 0.1)
      const soft = colorMode === 'color' ? rgb(1, 0.95, 0.93) : rgb(0.94, 0.94, 0.94)
      const weekend = colorMode === 'color' ? rgb(1, 0.92, 0.86) : rgb(0.9, 0.9, 0.9)

      for (let i = 0; i < calendarMonths.length; i += perPage) {
        const page = pdf.addPage([width, height])
        const slice = calendarMonths.slice(i, i + perPage)
        const cols = perPage === 1 ? 1 : orientation === 'landscape' ? Math.min(perPage, 3) : 1
        const rows = Math.ceil(slice.length / cols)
        const gap = 18
        const margin = 36
        const footerSpace = includeFooter ? 22 : 0
        const blockWidth = (width - margin * 2 - gap * (cols - 1)) / cols
        const blockHeight = (height - margin * 2 - footerSpace - gap * (rows - 1)) / rows

        slice.forEach((item, index) => {
          const col = index % cols
          const row = Math.floor(index / cols)
          const x = margin + col * (blockWidth + gap)
          const y = height - margin - (row + 1) * blockHeight - row * gap
          drawMonth(page, { ...item, x, y, w: blockWidth, h: blockHeight, font, bold, primary, soft, weekend })
        })

        if (includeFooter) page.drawText('Creado en printacalendar.alon.one', { x: margin, y: 18, size: 9, font, color: rgb(0.4, 0.45, 0.52) })
      }

      const bytes = await pdf.save()
      pdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
      message = 'PDF generado. Puedes verlo, descargarlo o cambiar opciones abajo.'
      stepIndex = steps.length - 1
    } catch (error) {
      message = 'No se pudo generar el PDF. Revisa la configuración e inténtalo de nuevo.'
      console.error(error)
    } finally {
      isGenerating = false
    }
  }

  function drawMonth(page, data) {
    const { year, month, x, y, w, h, font, bold, primary, soft, weekend } = data
    const title = `${monthNames[month]} ${year}`
    const titleSize = daySize === 'large' ? 18 : 15
    page.drawRectangle({ x, y, width: w, height: h, color: rgb(1, 1, 1), borderColor: rgb(0.86, 0.88, 0.92), borderWidth: 1 })
    page.drawRectangle({ x, y: y + h - 34, width: w, height: 34, color: soft })
    page.drawText(title.charAt(0).toUpperCase() + title.slice(1), { x: x + 12, y: y + h - 23, size: titleSize, font: bold, color: primary })

    const top = y + h - 56
    const cellW = w / 7
    const notesSpace = showNotes ? 34 : 0
    const cellH = Math.max(18, (h - 72 - notesSpace) / 7)

    weekNames.forEach((name, index) => {
      page.drawText(name, { x: x + index * cellW + 8, y: top, size: 9, font: bold, color: rgb(0.35, 0.39, 0.46) })
    })

    daysForMonth(year, month).slice(0, 42).forEach((cell, index) => {
      const col = index % 7
      const row = Math.floor(index / 7)
      const cx = x + col * cellW
      const cy = top - 12 - (row + 1) * cellH
      if (shadeWeekends && cell.weekend && !cell.muted) page.drawRectangle({ x: cx + 2, y: cy + 2, width: cellW - 4, height: cellH - 4, color: weekend })
      page.drawRectangle({ x: cx, y: cy, width: cellW, height: cellH, borderColor: rgb(0.88, 0.9, 0.93), borderWidth: 0.5 })
      if (cell.day) page.drawText(String(cell.day), { x: cx + 6, y: cy + cellH - 14, size: daySize === 'large' ? 12 : daySize === 'compact' ? 8 : 10, font, color: cell.muted ? rgb(0.65, 0.68, 0.72) : rgb(0.08, 0.1, 0.14) })
    })

    if (showNotes) {
      page.drawText('Notas', { x: x + 10, y: y + 20, size: 9, font: bold, color: rgb(0.4, 0.45, 0.52) })
      page.drawLine({ start: { x: x + 48, y: y + 22 }, end: { x: x + w - 10, y: y + 22 }, thickness: 0.5, color: rgb(0.82, 0.85, 0.9) })
    }
  }

  function revokePdf() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    pdfUrl = ''
  }
</script>

<svelte:head>
  <title>Generador de calendarios imprimibles paso a paso | Print a Calendar</title>
  <meta name="description" content="Crea calendarios imprimibles en PDF con un asistente paso a paso, vista previa y resumen editable de opciones." />
</svelte:head>

<a href="#main" class="skip-link">Saltar al contenido</a>
<header class:is-menu-open={menuOpen} class="site-header" data-site-header>
  <div class="page-shell header-inner">
    <a href="/" class="brand" aria-label="Print a Calendar">
      <span class="brand-mark" aria-hidden="true">PC</span>
      <strong>Print a Calendar</strong>
    </a>

    <button class="menu-toggle" type="button" aria-label="Abrir menú de navegación" aria-controls="site-menu" aria-expanded={menuOpen} on:click={() => menuOpen = !menuOpen}>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
      <span aria-hidden="true"></span>
    </button>

    <div class="header-right" id="site-menu">
      <nav aria-label="Navegación principal">
        <a href="#main" on:click={() => menuOpen = false}>Inicio</a>
        <a href="#wizard" on:click={() => { goToStep(0); menuOpen = false }}>Asistente</a>
        <a href="#preview" on:click={() => { goToStep(5); menuOpen = false }}>Vista previa</a>
        <button class="nav-button" type="button" on:click={() => { generatePdf(); menuOpen = false }}>Generar PDF</button>
      </nav>

      <div class="header-actions">
        <button class="theme-toggle" type="button" aria-label="Cambiar modo claro u oscuro" aria-pressed={theme === 'dark'} title="Cambiar modo claro u oscuro" on:click={toggleTheme}>
          <span class="theme-toggle-icon" aria-hidden="true">{theme === 'dark' ? '🌙' : '☀️'}</span>
          <span class="theme-toggle-text">Tema</span>
        </button>

        <div class="language-switcher" aria-label="Selector de idioma">
          {#each languages as item}
            <button type="button" class:active={language === item[0]} aria-current={language === item[0] ? 'page' : undefined} on:click={() => changeLanguage(item[0])}>{item[1]}</button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</header>

<main id="main" class="wizard-shell">
  <section class="hero">
    <span class="badge">Asistente de calendario imprimible</span>
    <h1>Crea tu calendario paso a paso</h1>
    <p>Te iré preguntando la configuración, explicando cada decisión y al final tendrás un resumen editable, vista previa y PDF descargable.</p>
  </section>

  <section id="wizard" class="wizard-layout" aria-label="Asistente de creación de calendario">
    <aside class="steps-panel">
      {#each steps as step, index}
        <button class:active={index === stepIndex} class:done={index < stepIndex} on:click={() => goToStep(index)}>
          <span>{index + 1}</span>
          <strong>{step.title}</strong>
        </button>
      {/each}
    </aside>

    <section class="wizard-card">
      <p class="step-kicker">Paso {stepIndex + 1} de {steps.length}</p>
      <h2>{currentStep.title}</h2>
      <p class="help">{currentStep.help}</p>

      {#if currentStep.key === 'date'}
        <div class="field-grid two">
          <label>Mes inicial
            <select bind:value={startMonth}>{#each monthNames as name, index}<option value={index}>{name}</option>{/each}</select>
            <small>Será el primer mes del calendario.</small>
          </label>
          <label>Año inicial
            <input type="number" min="1900" max="2100" bind:value={startYear} />
            <small>Útil para calendarios futuros, escolares o laborales.</small>
          </label>
        </div>
      {:else if currentStep.key === 'range'}
        <div class="choice-grid">
          {#each [1, 3, 6, 12, 18, 24] as amount}
            <button class:selected={Number(totalMonths) === amount} on:click={() => totalMonths = amount}>{amount} {amount === 1 ? 'mes' : 'meses'}</button>
          {/each}
        </div>
        <label class="range-field">Personalizado
          <input type="range" min="1" max="24" bind:value={totalMonths} />
          <strong>{totalMonths} meses</strong>
        </label>
      {:else if currentStep.key === 'page'}
        <div class="field-grid three">
          <label>Tamaño de papel
            <select bind:value={pageSize}><option>A4</option><option>A3</option><option>Letter</option></select>
            <small>A4 suele ser la mejor opción para imprimir en casa.</small>
          </label>
          <label>Orientación
            <select bind:value={orientation}><option value="landscape">Horizontal</option><option value="portrait">Vertical</option></select>
            <small>Horizontal da más espacio para varios meses.</small>
          </label>
          <label>Meses por página
            <select bind:value={monthsPerPage}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="6">6</option></select>
            <small>Cuantos más meses, más compacto queda.</small>
          </label>
        </div>
      {:else if currentStep.key === 'content'}
        <div class="toggle-grid">
          <label><input type="checkbox" bind:checked={showHolidays} /> Incluir festivos <small>Consulta date.nager.at según país y región.</small></label>
          {#if showHolidays}
            <label>País <select bind:value={country}>{#each countries as item}<option value={item[0]}>{item[1]}</option>{/each}</select></label>
            <label>Región <select bind:value={region}>{#each availableRegions as item}<option value={item[0]}>{item[1]}</option>{/each}</select></label>
          {/if}
          <label><input type="checkbox" bind:checked={shadeWeekends} /> Sombrear fines de semana <small>Facilita leer calendarios laborales.</small></label>
          <label><input type="checkbox" bind:checked={showWeekNumbers} /> Mostrar números de semana <small>Útil para planificación profesional.</small></label>
          <label><input type="checkbox" bind:checked={showEmptyDays} /> Mostrar días de otros meses <small>Rellena la cuadrícula completa.</small></label>
          <label><input type="checkbox" bind:checked={showNotes} /> Añadir zona de notas <small>Deja espacio para apuntes.</small></label>
        </div>
      {:else if currentStep.key === 'style'}
        <div class="field-grid two">
          <label>Tamaño de los días
            <select bind:value={daySize}><option value="compact">Pequeños</option><option value="comfortable">Medios</option><option value="large">Grandes</option></select>
            <small>Grande es mejor para pared; pequeño para planificadores.</small>
          </label>
          <label>Color
            <select bind:value={colorMode}><option value="color">A color</option><option value="grayscale">Blanco y negro</option></select>
            <small>Blanco y negro ahorra tinta.</small>
          </label>
          <label class="check"><input type="checkbox" bind:checked={roundedCells} /> Celdas redondeadas</label>
          <label class="check"><input type="checkbox" bind:checked={includeFooter} /> Añadir fuente en el pie</label>
        </div>
      {:else}
        <div id="preview" class="summary-grid">
          <div>
            <h3>Opciones seleccionadas</h3>
            <dl>{#each selectedSummary as row}<div><dt>{row[0]}</dt><dd>{row[1]}</dd></div>{/each}</dl>
            <div class="edit-actions">
              {#each steps.slice(0, 5) as step, index}<button on:click={() => goToStep(index)}>Cambiar {index + 1}</button>{/each}
            </div>
          </div>
          <div class="preview">
            <h3>Vista previa</h3>
            <div class="calendar-preview">
              <h4>{monthNames[calendarMonths[0].month]} {calendarMonths[0].year}</h4>
              <div class="week-row">{#each weekNames as day}<strong>{day}</strong>{/each}</div>
              <div class="days-row">{#each daysForMonth(calendarMonths[0].year, calendarMonths[0].month).slice(0, 42) as cell}<span class:muted={cell.muted} class:weekend={shadeWeekends && cell.weekend && !cell.muted}>{cell.day}</span>{/each}</div>
            </div>
          </div>
        </div>
      {/if}

      {#if message}<p class="message">{message}</p>{/if}

      <div class="wizard-actions">
        <button class="secondary" on:click={previousStep} disabled={stepIndex === 0}>Atrás</button>
        {#if stepIndex < steps.length - 1}
          <button class="primary" on:click={nextStep}>Siguiente</button>
        {:else}
          <button class="primary" on:click={generatePdf} disabled={isGenerating}>{isGenerating ? 'Generando...' : 'Generar PDF'}</button>
        {/if}
      </div>
    </section>
  </section>

  {#if pdfUrl}
    <section class="result-panel">
      <div>
        <h2>Tu calendario está listo</h2>
        <p>Puedes revisarlo aquí, descargarlo o volver a cambiar cualquier paso del asistente.</p>
      </div>
      <div class="result-actions"><a class="primary link" href={pdfUrl} download="calendario-printacalendar.pdf">Descargar PDF</a><button class="secondary" on:click={() => window.open(pdfUrl, '_blank')}>Abrir vista previa</button></div>
      <iframe title="Vista previa del calendario generado" src={pdfUrl}></iframe>
    </section>
  {/if}
</main>

<style>
  :global(:root) {
    color-scheme: light;
    --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    --color-bg: #f6f6fa;
    --color-surface: #ffffff;
    --color-surface-soft: #fbfcff;
    --color-surface-raised: rgba(255, 255, 255, 0.96);
    --color-text: #2b2d38;
    --color-text-muted: #636779;
    --color-text-soft: #787d8d;
    --color-border: #dddfea;
    --color-border-strong: #cfd3df;
    --color-primary: #f0523d;
    --color-primary-hover: #dd3427;
    --color-primary-soft: #ffe4dd;
    --color-secondary: #b9231b;
    --color-surface-blur: rgba(255, 255, 255, .94);
    --radius-md: 1rem;
    --radius-xl: 1.45rem;
    --radius-full: 999px;
    --shadow-xs: 0 1px 2px rgba(27, 31, 45, 0.06);
    --shadow-md: 0 18px 46px rgba(27, 31, 45, 0.1);
    --shadow-brand: 0 18px 40px rgba(240, 82, 61, 0.26);
    --shadow-focus: 0 0 0 4px rgba(240, 82, 61, 0.18);
    --transition-base: 190ms cubic-bezier(0.2, 0, 0, 1);
    --page-gutter: clamp(1rem, 3vw, 2rem);
    --container-xl: 92.5rem;
    font-family: var(--font-sans);
  }
  :global(html[data-theme='dark']) {
    color-scheme: dark;
    --color-bg: #020617;
    --color-surface: #0f172a;
    --color-surface-soft: #111827;
    --color-surface-raised: #1e293b;
    --color-text: #f8fafc;
    --color-text-muted: #cbd5e1;
    --color-text-soft: #94a3b8;
    --color-border: #1e293b;
    --color-border-strong: #334155;
    --color-primary: #fb923c;
    --color-primary-hover: #fdba74;
    --color-primary-soft: rgb(249 115 22 / 0.18);
    --color-secondary: #f87171;
    --color-surface-blur: rgba(15, 23, 42, .96);
    --shadow-xs: 0 1px 2px rgb(0 0 0 / 0.3);
    --shadow-md: 0 16px 40px rgb(0 0 0 / 0.45);
    --shadow-brand: 0 18px 40px rgb(249 115 22 / 0.18);
    --shadow-focus: 0 0 0 4px rgb(249 115 22 / 0.22);
  }
  :global(*) { box-sizing: border-box; }
  :global(html) { min-width: 320px; background: var(--color-bg); scroll-behavior: smooth; }
  :global(body) {
    margin: 0;
    min-height: 100vh;
    overflow-x: hidden;
    background:
      radial-gradient(circle at -8% 38%, color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 24rem),
      radial-gradient(circle at 105% 22%, color-mix(in srgb, var(--color-primary) 9%, transparent), transparent 25rem),
      linear-gradient(180deg, color-mix(in srgb, var(--color-surface) 68%, var(--color-bg)) 0%, var(--color-bg) 44%, color-mix(in srgb, var(--color-bg) 92%, #e5e7eb) 100%);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
  :global(button), :global(input), :global(select) { font: inherit; }
  :global(:focus-visible) { outline: 0; box-shadow: var(--shadow-focus); }

  .skip-link { position: fixed; left: 1rem; top: 1rem; z-index: 100; transform: translateY(calc(-100% - 2rem)); display: inline-flex; min-height: 2.75rem; align-items: center; padding: .75rem 1rem; border-radius: var(--radius-xl); background: var(--color-primary); color: #fff; font-weight: 900; text-decoration: none; box-shadow: var(--shadow-md); transition: transform var(--transition-base); }
  .skip-link:focus-visible { transform: translateY(0); }
  .page-shell { width: min(var(--container-xl), calc(100% - (var(--page-gutter) * 2))); margin-inline: auto; }
  .site-header { position: sticky; top: 0; z-index: 50; width: 100%; max-width: 100vw; }
  .site-header::before { content: ''; position: absolute; inset: 0 calc((100vw - 100%) / -2); z-index: -1; background: color-mix(in srgb, var(--color-surface) 94%, transparent); border-bottom: 1px solid color-mix(in srgb, var(--color-border) 78%, transparent); box-shadow: 0 1px 0 rgba(27, 31, 45, .03); backdrop-filter: blur(18px); }
  .header-inner { min-height: 4.6rem; display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: clamp(1rem, 2.2vw, 2rem); }
  .brand { display: inline-flex; align-items: center; gap: .7rem; color: var(--color-text); font-weight: 950; letter-spacing: -.055em; text-decoration: none; white-space: nowrap; }
  .brand-mark { display: inline-grid; place-items: center; width: 2.55rem; height: 2.55rem; border-radius: .85rem; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: #fff; font-size: .72rem; letter-spacing: -.03em; font-weight: 950; box-shadow: var(--shadow-brand); }
  .brand strong { font-size: clamp(1.15rem, 1.6vw, 1.45rem); }
  .menu-toggle { display: none; width: 2.85rem; height: 2.85rem; align-items: center; justify-content: center; flex-direction: column; gap: .28rem; border-radius: var(--radius-md); border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); cursor: pointer; box-shadow: var(--shadow-xs); }
  .menu-toggle span { width: 1.25rem; height: 2px; border-radius: var(--radius-full); background: currentColor; transition: transform var(--transition-base), opacity var(--transition-base); }
  .is-menu-open .menu-toggle span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
  .is-menu-open .menu-toggle span:nth-child(2) { opacity: 0; }
  .is-menu-open .menu-toggle span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
  .header-right, nav, .header-actions, .language-switcher { display: flex; align-items: center; }
  .header-right { justify-content: flex-end; gap: clamp(.75rem, 2vw, 1.5rem); }
  nav { justify-content: center; gap: clamp(.35rem, .8vw, 1rem); }
  nav a, .nav-button, .language-switcher button { display: inline-flex; align-items: center; min-height: 2.8rem; padding: 0 .75rem; border-radius: var(--radius-full); color: var(--color-text); background: transparent; font-size: .96rem; font-weight: 850; text-decoration: none; white-space: nowrap; cursor: pointer; transition: background var(--transition-base), color var(--transition-base), transform var(--transition-base); }
  nav a:hover, .nav-button:hover, .language-switcher button:hover { background: var(--color-surface-soft); color: var(--color-text); transform: translateY(-1px); }
  .header-actions { justify-content: flex-end; gap: .45rem; }
  .language-switcher { gap: .25rem; }
  .language-switcher button { min-height: 2.25rem; padding-inline: .55rem; color: var(--color-text-muted); font-size: .75rem; }
  .language-switcher button.active { background: var(--color-text); color: var(--color-surface); }
  .theme-toggle { min-width: 2.55rem; height: 2.55rem; display: inline-grid; place-items: center; border-radius: .7rem; background: transparent; color: var(--color-text); cursor: pointer; transition: transform var(--transition-base), background var(--transition-base); }
  .theme-toggle:hover { transform: translateY(-1px); background: var(--color-surface-soft); }
  .theme-toggle-icon { line-height: 1; font-size: 1rem; }
  .theme-toggle-text { display: none; }

  .wizard-shell { width: min(1180px, calc(100% - 24px)); margin: 0 auto; padding: 32px 0 56px; }
  .hero { padding: clamp(3rem, 6vw, 5.2rem) 0 clamp(1.5rem, 3vw, 2.4rem); text-align: center; display: grid; justify-items: center; gap: 1rem; }
  .badge { display: inline-flex; padding: .55rem .8rem; border: 1px solid var(--color-border); border-radius: var(--radius-full); background: var(--color-surface); color: var(--color-primary-hover); font-weight: 900; box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-border) 70%, transparent); }
  h1 { max-width: 980px; margin: 0; color: var(--color-text); font-size: clamp(2.45rem, 5.5vw, 4.35rem); line-height: 1.02; letter-spacing: -.052em; text-wrap: balance; }
  h2 { margin: 0 0 8px; color: var(--color-text); font-size: clamp(1.7rem, 3vw, 2.4rem); letter-spacing: -.03em; }
  h3, h4 { margin: 0 0 12px; color: var(--color-text); }
  p { color: var(--color-text-muted); line-height: 1.55; }
  .hero p { max-width: 760px; margin: 0; font-size: clamp(1.05rem, 1.5vw, 1.25rem); }
  .wizard-layout { display: grid; grid-template-columns: 300px 1fr; gap: 18px; align-items: start; }
  .steps-panel { position: sticky; top: 5.5rem; display: grid; gap: 10px; }
  .steps-panel button { display: grid; grid-template-columns: 34px 1fr; align-items: center; gap: 10px; padding: 13px; border: 1px solid var(--color-border); border-radius: 16px; background: var(--color-surface-raised); color: var(--color-text); text-align: left; cursor: pointer; box-shadow: var(--shadow-xs); }
  .steps-panel span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; background: var(--color-surface-soft); font-weight: 950; }
  .steps-panel .active { border-color: color-mix(in srgb, var(--color-primary) 55%, var(--color-border)); box-shadow: var(--shadow-md); }
  .steps-panel .active span, .steps-panel .done span { background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; }
  .wizard-card, .result-panel { border: 1px solid var(--color-border); border-radius: 28px; background: var(--color-surface-raised); box-shadow: var(--shadow-md); padding: clamp(18px, 4vw, 32px); }
  .step-kicker { margin: 0 0 8px; color: var(--color-primary-hover); font-weight: 950; text-transform: uppercase; font-size: .78rem; letter-spacing: .08em; }
  .help { margin: 0 0 24px; }
  .field-grid { display: grid; gap: 16px; }
  .field-grid.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .field-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  label { display: grid; gap: 8px; color: var(--color-text); font-weight: 900; }
  small { color: var(--color-text-soft); font-weight: 600; line-height: 1.45; }
  input:not([type='checkbox']), select { width: 100%; min-height: 48px; border: 1px solid var(--color-border-strong); border-radius: 14px; padding: 10px 12px; background: var(--color-surface); color: var(--color-text); font: inherit; box-shadow: var(--shadow-xs); }
  .choice-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .choice-grid button, .edit-actions button { border: 1px solid var(--color-border-strong); border-radius: 16px; padding: 14px; background: var(--color-surface); color: var(--color-text); font-weight: 950; cursor: pointer; }
  .choice-grid .selected { border-color: var(--color-primary); background: var(--color-primary-soft); color: var(--color-primary-hover); }
  .range-field { margin-top: 18px; }
  .toggle-grid { display: grid; gap: 12px; }
  .toggle-grid label, .check { grid-template-columns: auto 1fr; align-items: start; padding: 14px; border: 1px solid var(--color-border); border-radius: 18px; background: var(--color-surface-soft); }
  .toggle-grid select { grid-column: 1 / -1; }
  input[type='checkbox'] { width: 18px; min-height: 18px; accent-color: var(--color-primary); }
  .summary-grid { display: grid; grid-template-columns: .9fr 1.1fr; gap: 24px; }
  dl { display: grid; gap: 10px; margin: 0; }
  dl div { display: grid; gap: 2px; padding: 12px; border-radius: 16px; background: var(--color-surface-soft); }
  dt { color: var(--color-text-soft); font-size: .82rem; font-weight: 900; text-transform: uppercase; }
  dd { margin: 0; color: var(--color-text); font-weight: 850; }
  .edit-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .calendar-preview { border: 1px solid var(--color-border); border-radius: 22px; padding: 16px; background: var(--color-surface); }
  .calendar-preview h4 { text-transform: capitalize; color: var(--color-primary-hover); }
  .week-row, .days-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
  .week-row strong { text-align: center; color: var(--color-text-soft); font-size: .78rem; }
  .days-row span { display: grid; place-items: center; min-height: 38px; border-radius: 12px; background: var(--color-surface-soft); color: var(--color-text); font-weight: 900; }
  .days-row .muted { color: var(--color-border-strong); background: transparent; }
  .days-row .weekend { color: var(--color-primary-hover); background: var(--color-primary-soft); }
  .message { margin: 18px 0 0; padding: 12px 14px; border-radius: 16px; background: var(--color-primary-soft); color: var(--color-primary-hover); font-weight: 850; }
  .wizard-actions, .result-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; flex-wrap: wrap; }
  .wizard-actions button, .result-actions button, .link { min-height: 46px; border-radius: var(--radius-full); padding: 0 18px; font-weight: 950; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
  .primary { border: 0; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; box-shadow: var(--shadow-brand); }
  .secondary { border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); }
  button:disabled { opacity: .55; cursor: not-allowed; }
  .result-panel { margin-top: 20px; }
  iframe { width: 100%; height: min(76vh, 780px); margin-top: 18px; border: 1px solid var(--color-border-strong); border-radius: 18px; background: #475569; }

  @media (max-width: 1100px) {
    .header-inner { grid-template-columns: auto 1fr auto; }
    .header-right { gap: .65rem; }
    nav { gap: .2rem; }
    nav a, .nav-button { padding-inline: .55rem; font-size: .9rem; }
  }
  @media (max-width: 980px) {
    .site-header::before { inset: 0; }
    .header-inner { min-height: 4.25rem; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: .75rem; padding-block: .55rem; position: relative; }
    .brand { min-width: 0; }
    .brand strong { overflow: hidden; text-overflow: ellipsis; }
    .brand-mark { width: 2.35rem; height: 2.35rem; }
    .menu-toggle { display: inline-flex; }
    .header-right { position: absolute; top: calc(100% + .45rem); left: 0; right: 0; z-index: 60; display: grid; grid-template-columns: 1fr; gap: .75rem; padding: .75rem; border: 1px solid var(--color-border); border-radius: var(--radius-xl); background: var(--color-surface-blur); box-shadow: var(--shadow-md); opacity: 0; pointer-events: none; transform: translateY(-.4rem) scale(.98); transform-origin: top center; transition: opacity var(--transition-base), transform var(--transition-base); }
    .is-menu-open .header-right { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
    nav { display: grid; grid-template-columns: 1fr; gap: .35rem; width: 100%; }
    nav a, .nav-button { min-height: 2.9rem; justify-content: flex-start; padding-inline: 1rem; border-radius: var(--radius-md); font-size: .96rem; background: var(--color-surface-soft); }
    .header-actions { display: grid; grid-template-columns: 1fr auto; gap: .75rem; width: 100%; align-items: stretch; }
    .theme-toggle { width: 100%; min-height: 2.9rem; display: inline-flex; align-items: center; justify-content: center; gap: .5rem; border: 1px solid var(--color-border); background: var(--color-surface-soft); border-radius: var(--radius-md); font-weight: 850; }
    .theme-toggle-text { display: inline; }
    .language-switcher { align-self: stretch; padding: .25rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface-soft); }
    .language-switcher button { min-height: 2.35rem; padding-inline: .65rem; border-radius: calc(var(--radius-md) - .25rem); }
    .wizard-layout, .summary-grid, .field-grid.two, .field-grid.three { grid-template-columns: 1fr; }
    .steps-panel { position: static; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .hero { text-align: left; justify-items: start; }
  }
  @media (max-width: 640px) {
    .page-shell { width: calc(100% - 1.5rem); max-width: calc(100vw - 1.5rem); }
    .wizard-shell { width: min(100% - 14px, 1180px); padding-top: 14px; }
    .steps-panel, .choice-grid { grid-template-columns: 1fr; }
    .wizard-actions button, .result-actions > * { width: 100%; }
  }
  @media (max-width: 380px) {
    .brand strong { font-size: 1.05rem; }
    .header-actions { grid-template-columns: 1fr; }
    .language-switcher { justify-content: center; flex-wrap: wrap; }
  }
</style>
