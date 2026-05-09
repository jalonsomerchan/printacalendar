<script>
  import { onDestroy } from 'svelte'
  import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

  const appUrl = 'https://printacalendar.alon.one'

  const translations = {
    es: {
      languageName: 'Español',
      seoTitle: 'Generador de calendarios imprimibles gratis',
      badge: 'Calendarios imprimibles y PDF',
      title: 'Genera calendarios personalizados para imprimir',
      subtitle:
        'Crea calendarios mensuales en PDF con festivos, fines de semana sombreados, orientación, tamaño de página y diseño a medida. Todo se genera en tu navegador.',
      cta: 'Generar PDF',
      print: 'Imprimir',
      download: 'Descargar PDF',
      close: 'Cerrar',
      preview: 'Vista previa del calendario',
      settings: 'Configuración del calendario',
      content: 'Contenido',
      layout: 'Página y diseño',
      style: 'Estilo visual',
      localization: 'Idioma y festivos',
      startMonth: 'Mes inicial',
      startYear: 'Año inicial',
      totalMonths: 'Meses a generar',
      monthsPerPage: 'Meses por página',
      daySize: 'Tamaño de los días',
      compact: 'Pequeños',
      comfortable: 'Medios',
      large: 'Grandes',
      weekStarts: 'Inicio de semana',
      monday: 'Lunes',
      sunday: 'Domingo',
      pageSize: 'Tamaño de página',
      orientation: 'Orientación',
      portrait: 'Vertical',
      landscape: 'Horizontal',
      includeFooter: 'Añadir fuente en el pie',
      shadeWeekends: 'Sombrear fines de semana',
      colorMode: 'Modo de color',
      color: 'A color',
      grayscale: 'Blanco y negro',
      showHolidays: 'Incluir festivos',
      country: 'País',
      region: 'Comunidad / región',
      noRegion: 'Todo el país',
      showWeekNumbers: 'Mostrar número de semana',
      showEmptyDays: 'Mostrar días de otros meses',
      showNotes: 'Añadir zona de notas',
      roundedCells: 'Celdas redondeadas',
      emphasizeToday: 'Marcar el día actual',
      headerStyle: 'Cabecera',
      clean: 'Limpia',
      solid: 'Bloque sólido',
      soft: 'Suave',
      gridStyle: 'Cuadrícula',
      lines: 'Líneas',
      cards: 'Tarjetas',
      minimal: 'Mínima',
      modalTitle: 'Tu calendario está listo',
      loading: 'Generando calendario...',
      holidayHelp: 'Los festivos se consultan en date.nager.at y se filtran por país y región cuando la API ofrece ese dato.',
      footerSource: 'Creado en printacalendar.alon.one',
      livePreview: 'Resumen rápido',
      faqTitle: 'Preguntas frecuentes',
      faq1: '¿Se suben mis datos a un servidor?',
      faq1a: 'No. El PDF se construye en tu navegador con pdf-lib. Solo se consulta la API pública de festivos si activas esa opción.',
      faq2: '¿Puedo imprimir sin descargar?',
      faq2a: 'Sí. Al generar el PDF se abre una vista previa con botón de imprimir y de descargar.',
      faq3: '¿Sirve para calendarios escolares o laborales?',
      faq3a: 'Sí. Puedes elegir varios meses, orientación horizontal, festivos, fines de semana sombreados y zona de notas.',
      benefitsTitle: 'Ventajas del generador',
      benefitPrivacy: 'Generación local en el navegador',
      benefitFlexible: 'Meses, página, color y festivos configurables',
      benefitPrint: 'PDF preparado para imprimir o descargar',
      howTitle: 'Cómo crear tu calendario',
      step1: 'Elige el mes y año de inicio.',
      step2: 'Configura cuántos meses quieres, el tamaño de página y el diseño.',
      step3: 'Activa festivos, fines de semana, notas o pie de página si los necesitas.',
      step4: 'Genera el PDF y descárgalo o imprímelo.',
      error: 'No se pudo generar el PDF. Revisa la configuración e inténtalo de nuevo.',
      holidaysWarning: 'No se pudieron cargar los festivos, pero el calendario se generó igualmente.'
    },
    en: {
      languageName: 'English', seoTitle: 'Free printable calendar generator', badge: 'Printable calendars and PDF', title: 'Create custom calendars to print', subtitle: 'Generate monthly PDF calendars with holidays, shaded weekends, page orientation, paper size and custom layout. Everything is generated in your browser.', cta: 'Generate PDF', print: 'Print', download: 'Download PDF', close: 'Close', preview: 'Calendar preview', settings: 'Calendar settings', content: 'Content', layout: 'Page and layout', style: 'Visual style', localization: 'Language and holidays', startMonth: 'Start month', startYear: 'Start year', totalMonths: 'Months to generate', monthsPerPage: 'Months per page', daySize: 'Day size', compact: 'Small', comfortable: 'Medium', large: 'Large', weekStarts: 'Week starts on', monday: 'Monday', sunday: 'Sunday', pageSize: 'Paper size', orientation: 'Orientation', portrait: 'Portrait', landscape: 'Landscape', includeFooter: 'Add source in footer', shadeWeekends: 'Shade weekends', colorMode: 'Color mode', color: 'Color', grayscale: 'Black and white', showHolidays: 'Include holidays', country: 'Country', region: 'State / region', noRegion: 'Whole country', showWeekNumbers: 'Show week numbers', showEmptyDays: 'Show days from other months', showNotes: 'Add notes area', roundedCells: 'Rounded cells', emphasizeToday: 'Highlight today', headerStyle: 'Header', clean: 'Clean', solid: 'Solid block', soft: 'Soft', gridStyle: 'Grid', lines: 'Lines', cards: 'Cards', minimal: 'Minimal', modalTitle: 'Your calendar is ready', loading: 'Generating calendar...', holidayHelp: 'Holidays are loaded from date.nager.at and filtered by country and region when available.', footerSource: 'Created at printacalendar.alon.one', livePreview: 'Quick summary', faqTitle: 'Frequently asked questions', faq1: 'Are my files uploaded?', faq1a: 'No. The PDF is built in your browser with pdf-lib. Only the public holiday API is queried if you enable that option.', faq2: 'Can I print without downloading?', faq2a: 'Yes. After generating the PDF you get a preview with print and download buttons.', faq3: 'Is it useful for school or work calendars?', faq3a: 'Yes. You can select multiple months, landscape mode, holidays, shaded weekends and notes.', benefitsTitle: 'Generator benefits', benefitPrivacy: 'Local generation in your browser', benefitFlexible: 'Configurable months, paper, color and holidays', benefitPrint: 'PDF ready to print or download', howTitle: 'How to create your calendar', step1: 'Choose the start month and year.', step2: 'Configure the number of months, paper size and layout.', step3: 'Enable holidays, weekends, notes or footer if needed.', step4: 'Generate the PDF and download or print it.', error: 'The PDF could not be generated. Check the settings and try again.', holidaysWarning: 'Holidays could not be loaded, but the calendar was generated anyway.'
    },
    fr: {
      languageName: 'Français', seoTitle: 'Générateur gratuit de calendriers à imprimer', badge: 'Calendriers imprimables et PDF', title: 'Créez des calendriers personnalisés à imprimer', subtitle: 'Générez des calendriers mensuels en PDF avec jours fériés, week-ends ombrés, orientation, format de page et mise en page personnalisée.', cta: 'Générer le PDF', print: 'Imprimer', download: 'Télécharger le PDF', close: 'Fermer', preview: 'Aperçu du calendrier', settings: 'Configuration du calendrier', content: 'Contenu', layout: 'Page et mise en page', style: 'Style visuel', localization: 'Langue et jours fériés', startMonth: 'Mois de début', startYear: 'Année de début', totalMonths: 'Mois à générer', monthsPerPage: 'Mois par page', daySize: 'Taille des jours', compact: 'Petits', comfortable: 'Moyens', large: 'Grands', weekStarts: 'Début de semaine', monday: 'Lundi', sunday: 'Dimanche', pageSize: 'Format de page', orientation: 'Orientation', portrait: 'Portrait', landscape: 'Paysage', includeFooter: 'Ajouter la source en pied', shadeWeekends: 'Ombrer les week-ends', colorMode: 'Mode couleur', color: 'Couleur', grayscale: 'Noir et blanc', showHolidays: 'Inclure les jours fériés', country: 'Pays', region: 'Région', noRegion: 'Tout le pays', showWeekNumbers: 'Afficher les numéros de semaine', showEmptyDays: 'Afficher les jours des autres mois', showNotes: 'Ajouter une zone de notes', roundedCells: 'Cellules arrondies', emphasizeToday: 'Mettre aujourd’hui en évidence', headerStyle: 'En-tête', clean: 'Épuré', solid: 'Bloc plein', soft: 'Doux', gridStyle: 'Grille', lines: 'Lignes', cards: 'Cartes', minimal: 'Minimal', modalTitle: 'Votre calendrier est prêt', loading: 'Génération du calendrier...', holidayHelp: 'Les jours fériés sont chargés depuis date.nager.at et filtrés par pays et région si disponible.', footerSource: 'Créé sur printacalendar.alon.one', livePreview: 'Résumé rapide', faqTitle: 'Questions fréquentes', faq1: 'Mes données sont-elles envoyées ?', faq1a: 'Non. Le PDF est créé dans votre navigateur avec pdf-lib. Seule l’API publique des jours fériés est consultée si vous l’activez.', faq2: 'Puis-je imprimer sans télécharger ?', faq2a: 'Oui. Après la génération, un aperçu propose les boutons imprimer et télécharger.', faq3: 'Est-ce utile pour l’école ou le travail ?', faq3a: 'Oui. Plusieurs mois, paysage, jours fériés, week-ends ombrés et notes sont disponibles.', benefitsTitle: 'Avantages', benefitPrivacy: 'Génération locale dans le navigateur', benefitFlexible: 'Mois, papier, couleur et jours fériés configurables', benefitPrint: 'PDF prêt à imprimer ou télécharger', howTitle: 'Comment créer votre calendrier', step1: 'Choisissez le mois et l’année de début.', step2: 'Configurez les mois, le format et la mise en page.', step3: 'Activez les options utiles.', step4: 'Générez le PDF puis téléchargez-le ou imprimez-le.', error: 'Impossible de générer le PDF. Vérifiez la configuration.', holidaysWarning: 'Les jours fériés n’ont pas pu être chargés, mais le calendrier a été généré.'
    },
    ca: {
      languageName: 'Català', seoTitle: 'Generador de calendaris imprimibles gratis', badge: 'Calendaris imprimibles i PDF', title: 'Crea calendaris personalitzats per imprimir', subtitle: 'Genera calendaris mensuals en PDF amb festius, caps de setmana ombrejats, orientació, mida de pàgina i disseny a mida.', cta: 'Generar PDF', print: 'Imprimir', download: 'Descarregar PDF', close: 'Tancar', preview: 'Vista prèvia del calendari', settings: 'Configuració del calendari', content: 'Contingut', layout: 'Pàgina i disseny', style: 'Estil visual', localization: 'Idioma i festius', startMonth: 'Mes inicial', startYear: 'Any inicial', totalMonths: 'Mesos a generar', monthsPerPage: 'Mesos per pàgina', daySize: 'Mida dels dies', compact: 'Petits', comfortable: 'Mitjans', large: 'Grans', weekStarts: 'Inici de setmana', monday: 'Dilluns', sunday: 'Diumenge', pageSize: 'Mida de pàgina', orientation: 'Orientació', portrait: 'Vertical', landscape: 'Horitzontal', includeFooter: 'Afegir font al peu', shadeWeekends: 'Ombrejar caps de setmana', colorMode: 'Mode de color', color: 'Color', grayscale: 'Blanc i negre', showHolidays: 'Incloure festius', country: 'País', region: 'Comunitat / regió', noRegion: 'Tot el país', showWeekNumbers: 'Mostrar número de setmana', showEmptyDays: 'Mostrar dies d’altres mesos', showNotes: 'Afegir zona de notes', roundedCells: 'Cel·les arrodonides', emphasizeToday: 'Marcar avui', headerStyle: 'Capçalera', clean: 'Neta', solid: 'Bloc sòlid', soft: 'Suau', gridStyle: 'Quadrícula', lines: 'Línies', cards: 'Targetes', minimal: 'Mínima', modalTitle: 'El calendari està llest', loading: 'Generant calendari...', holidayHelp: 'Els festius es consulten a date.nager.at i es filtren per país i regió quan està disponible.', footerSource: 'Creat a printacalendar.alon.one', livePreview: 'Resum ràpid', faqTitle: 'Preguntes freqüents', faq1: 'S’envien les dades a un servidor?', faq1a: 'No. El PDF es crea al navegador amb pdf-lib.', faq2: 'Puc imprimir sense descarregar?', faq2a: 'Sí. La vista prèvia inclou botó d’imprimir i descarregar.', faq3: 'Serveix per a calendaris escolars o laborals?', faq3a: 'Sí. Pots configurar diversos mesos, horitzontal, festius, caps de setmana i notes.', benefitsTitle: 'Avantatges', benefitPrivacy: 'Generació local al navegador', benefitFlexible: 'Mesos, pàgina, color i festius configurables', benefitPrint: 'PDF llest per imprimir o descarregar', howTitle: 'Com crear el calendari', step1: 'Tria el mes i any inicial.', step2: 'Configura mesos, mida i disseny.', step3: 'Activa les opcions que necessitis.', step4: 'Genera el PDF i descarrega’l o imprimeix-lo.', error: 'No s’ha pogut generar el PDF.', holidaysWarning: 'No s’han pogut carregar els festius, però el calendari s’ha generat igualment.'
    },
    pt: {
      languageName: 'Português', seoTitle: 'Gerador grátis de calendários para imprimir', badge: 'Calendários imprimíveis e PDF', title: 'Crie calendários personalizados para imprimir', subtitle: 'Gere calendários mensais em PDF com feriados, fins de semana sombreados, orientação, tamanho da página e layout personalizado.', cta: 'Gerar PDF', print: 'Imprimir', download: 'Baixar PDF', close: 'Fechar', preview: 'Pré-visualização do calendário', settings: 'Configuração do calendário', content: 'Conteúdo', layout: 'Página e layout', style: 'Estilo visual', localization: 'Idioma e feriados', startMonth: 'Mês inicial', startYear: 'Ano inicial', totalMonths: 'Meses a gerar', monthsPerPage: 'Meses por página', daySize: 'Tamanho dos dias', compact: 'Pequenos', comfortable: 'Médios', large: 'Grandes', weekStarts: 'Semana começa em', monday: 'Segunda', sunday: 'Domingo', pageSize: 'Tamanho da página', orientation: 'Orientação', portrait: 'Vertical', landscape: 'Horizontal', includeFooter: 'Adicionar fonte no rodapé', shadeWeekends: 'Sombrear fins de semana', colorMode: 'Modo de cor', color: 'Colorido', grayscale: 'Preto e branco', showHolidays: 'Incluir feriados', country: 'País', region: 'Região', noRegion: 'Todo o país', showWeekNumbers: 'Mostrar número da semana', showEmptyDays: 'Mostrar dias de outros meses', showNotes: 'Adicionar área de notas', roundedCells: 'Células arredondadas', emphasizeToday: 'Destacar hoje', headerStyle: 'Cabeçalho', clean: 'Limpo', solid: 'Bloco sólido', soft: 'Suave', gridStyle: 'Grade', lines: 'Linhas', cards: 'Cartões', minimal: 'Mínima', modalTitle: 'O calendário está pronto', loading: 'Gerando calendário...', holidayHelp: 'Os feriados são carregados de date.nager.at e filtrados por país e região quando disponível.', footerSource: 'Criado em printacalendar.alon.one', livePreview: 'Resumo rápido', faqTitle: 'Perguntas frequentes', faq1: 'Meus dados são enviados?', faq1a: 'Não. O PDF é criado no navegador com pdf-lib.', faq2: 'Posso imprimir sem baixar?', faq2a: 'Sim. A prévia inclui botões para imprimir e baixar.', faq3: 'Serve para calendário escolar ou de trabalho?', faq3a: 'Sim. Configure meses, paisagem, feriados, fins de semana e notas.', benefitsTitle: 'Vantagens', benefitPrivacy: 'Geração local no navegador', benefitFlexible: 'Meses, página, cor e feriados configuráveis', benefitPrint: 'PDF pronto para imprimir ou baixar', howTitle: 'Como criar seu calendário', step1: 'Escolha mês e ano inicial.', step2: 'Configure meses, tamanho e layout.', step3: 'Ative as opções necessárias.', step4: 'Gere o PDF e baixe ou imprima.', error: 'Não foi possível gerar o PDF.', holidaysWarning: 'Não foi possível carregar os feriados, mas o calendário foi gerado.'
    },
    eu: {
      languageName: 'Euskara', seoTitle: 'Egutegi inprimagarrien sortzaile doakoa', badge: 'Egutegi inprimagarriak eta PDF', title: 'Sortu egutegi pertsonalizatuak inprimatzeko', subtitle: 'Sortu hileko egutegiak PDFan: jaiegunak, asteburuak itzalita, orientazioa, orri tamaina eta diseinu pertsonalizatua.', cta: 'Sortu PDFa', print: 'Inprimatu', download: 'Deskargatu PDFa', close: 'Itxi', preview: 'Egutegiaren aurrebista', settings: 'Egutegiaren ezarpenak', content: 'Edukia', layout: 'Orria eta diseinua', style: 'Ikusizko estiloa', localization: 'Hizkuntza eta jaiegunak', startMonth: 'Hasierako hilabetea', startYear: 'Hasierako urtea', totalMonths: 'Sortu beharreko hilabeteak', monthsPerPage: 'Hilabeteak orriko', daySize: 'Egunen tamaina', compact: 'Txikiak', comfortable: 'Ertainak', large: 'Handiak', weekStarts: 'Astearen hasiera', monday: 'Astelehena', sunday: 'Igandea', pageSize: 'Orri tamaina', orientation: 'Orientazioa', portrait: 'Bertikala', landscape: 'Horizontala', includeFooter: 'Iturria oinean gehitu', shadeWeekends: 'Asteburuak itzali', colorMode: 'Kolore modua', color: 'Koloretan', grayscale: 'Zuri-beltzean', showHolidays: 'Jaiegunak sartu', country: 'Herrialdea', region: 'Erkidegoa / eskualdea', noRegion: 'Herrialde osoa', showWeekNumbers: 'Astearen zenbakia erakutsi', showEmptyDays: 'Beste hilabeteetako egunak erakutsi', showNotes: 'Oharren gunea gehitu', roundedCells: 'Gelaxka biribilduak', emphasizeToday: 'Gaur nabarmendu', headerStyle: 'Goiburua', clean: 'Garbia', solid: 'Bloke trinkoa', soft: 'Leuna', gridStyle: 'Sarea', lines: 'Lerroak', cards: 'Txartelak', minimal: 'Minimoa', modalTitle: 'Egutegia prest dago', loading: 'Egutegia sortzen...', holidayHelp: 'Jaiegunak date.nager.at zerbitzutik hartzen dira eta herrialde/eskualdearen arabera iragazten dira ahal denean.', footerSource: 'printacalendar.alon.one webgunean sortua', livePreview: 'Laburpena', faqTitle: 'Ohiko galderak', faq1: 'Datuak zerbitzarira igotzen dira?', faq1a: 'Ez. PDFa nabigatzailean sortzen da pdf-lib erabiliz.', faq2: 'Deskargatu gabe inprima dezaket?', faq2a: 'Bai. Aurrebistak inprimatzeko eta deskargatzeko botoiak ditu.', faq3: 'Eskola edo lan egutegietarako balio du?', faq3a: 'Bai. Hilabeteak, orientazioa, jaiegunak, asteburuak eta oharrak konfigura ditzakezu.', benefitsTitle: 'Abantailak', benefitPrivacy: 'Tokiko sorrera nabigatzailean', benefitFlexible: 'Hilabeteak, orria, kolorea eta jaiegunak konfiguragarri', benefitPrint: 'PDFa inprimatzeko edo deskargatzeko prest', howTitle: 'Nola sortu egutegia', step1: 'Aukeratu hasierako hilabetea eta urtea.', step2: 'Konfiguratu hilabete kopurua, tamaina eta diseinua.', step3: 'Aktibatu behar dituzun aukerak.', step4: 'Sortu PDFa eta deskargatu edo inprimatu.', error: 'Ezin izan da PDFa sortu.', holidaysWarning: 'Ezin izan dira jaiegunak kargatu, baina egutegia sortu da.'
    }
  }

  const languageLocales = { es: 'es-ES', en: 'en-US', fr: 'fr-FR', ca: 'ca-ES', pt: 'pt-PT', eu: 'eu-ES' }
  const monthOptions = Array.from({ length: 12 }, (_, index) => index)
  const years = Array.from({ length: 21 }, (_, index) => new Date().getFullYear() - 5 + index)
  const countries = [
    ['ES', 'España'], ['PT', 'Portugal'], ['FR', 'Francia'], ['GB', 'Reino Unido'], ['US', 'Estados Unidos'], ['DE', 'Alemania'], ['IT', 'Italia'], ['BR', 'Brasil']
  ]
  const regions = {
    ES: [
      ['', 'Todo el país'], ['ES-AN', 'Andalucía'], ['ES-AR', 'Aragón'], ['ES-AS', 'Asturias'], ['ES-CB', 'Cantabria'], ['ES-CL', 'Castilla y León'], ['ES-CM', 'Castilla-La Mancha'], ['ES-CT', 'Cataluña'], ['ES-EX', 'Extremadura'], ['ES-GA', 'Galicia'], ['ES-IB', 'Islas Baleares'], ['ES-CN', 'Canarias'], ['ES-RI', 'La Rioja'], ['ES-MD', 'Madrid'], ['ES-MC', 'Murcia'], ['ES-NC', 'Navarra'], ['ES-PV', 'País Vasco'], ['ES-VC', 'Comunidad Valenciana']
    ],
    US: [['', 'Whole country'], ['US-CA', 'California'], ['US-FL', 'Florida'], ['US-NY', 'New York'], ['US-TX', 'Texas']],
    DE: [['', 'Ganzes Land'], ['DE-BE', 'Berlin'], ['DE-BY', 'Bayern'], ['DE-HH', 'Hamburg'], ['DE-NW', 'Nordrhein-Westfalen']],
    FR: [['', 'Tout le pays']],
    PT: [['', 'Todo o país']],
    GB: [['', 'Whole country']],
    IT: [['', 'Tutto il paese']],
    BR: [['', 'Todo o país']]
  }

  let language = 'es'
  let startMonth = new Date().getMonth()
  let startYear = new Date().getFullYear()
  let totalMonths = 12
  let monthsPerPage = 2
  let daySize = 'comfortable'
  let weekStarts = 1
  let pageSize = 'A4'
  let orientation = 'landscape'
  let includeFooter = true
  let shadeWeekends = true
  let colorMode = 'color'
  let showHolidays = true
  let country = 'ES'
  let region = 'ES-EX'
  let showWeekNumbers = false
  let showEmptyDays = false
  let showNotes = false
  let roundedCells = true
  let emphasizeToday = true
  let headerStyle = 'soft'
  let gridStyle = 'cards'
  let isGenerating = false
  let modalOpen = false
  let pdfUrl = ''
  let errorMessage = ''
  let warningMessage = ''

  $: text = translations[language] || translations.es
  $: locale = languageLocales[language] || 'es-ES'
  $: monthNames = Array.from({ length: 12 }, (_, index) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2026, index, 1)))
  $: weekDays = getWeekDays(locale, Number(weekStarts))
  $: availableRegions = regions[country] || [['', text.noRegion]]
  $: if (!availableRegions.some(([code]) => code === region)) region = ''
  $: calendarMonths = Array.from({ length: Number(totalMonths) }, (_, index) => addMonths(Number(startYear), Number(startMonth), index))
  $: pageCount = Math.ceil(Number(totalMonths) / Number(monthsPerPage))

  onDestroy(() => revokePdfUrl())

  function addMonths(year, month, add) {
    const date = new Date(year, month + add, 1)
    return { year: date.getFullYear(), month: date.getMonth() }
  }

  function getWeekDays(currentLocale, start) {
    return Array.from({ length: 7 }, (_, index) => {
      const day = (start + index) % 7
      const base = new Date(2026, 1, 1 + day)
      return new Intl.DateTimeFormat(currentLocale, { weekday: 'short' }).format(base).replace('.', '')
    })
  }

  function getIsoDate(year, month, day) {
    return new Date(Date.UTC(year, month, day)).toISOString().slice(0, 10)
  }

  function getWeekNumber(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1))
    return Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7)
  }

  function buildMonthDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay()
    const offset = (firstDay - Number(weekStarts) + 7) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const previousDays = new Date(year, month, 0).getDate()
    const cells = []

    for (let i = 0; i < offset; i += 1) {
      const day = previousDays - offset + i + 1
      const date = new Date(year, month - 1, day)
      cells.push({ day, date, current: false, iso: getIsoDate(date.getFullYear(), date.getMonth(), date.getDate()) })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = new Date(year, month, day)
      cells.push({ day, date, current: true, iso: getIsoDate(year, month, day) })
    }

    while (cells.length % 7 !== 0 || cells.length < 35) {
      const day = cells.length - offset - daysInMonth + 1
      const date = new Date(year, month + 1, day)
      cells.push({ day, date, current: false, iso: getIsoDate(date.getFullYear(), date.getMonth(), date.getDate()) })
    }

    return cells
  }

  async function fetchHolidays() {
    if (!showHolidays) return new Map()
    const yearsToFetch = [...new Set(calendarMonths.map((item) => item.year))]
    const entries = []

    for (const year of yearsToFetch) {
      const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`)
      if (!response.ok) throw new Error('Holiday API error')
      const holidays = await response.json()
      entries.push(...holidays)
    }

    const map = new Map()
    for (const holiday of entries) {
      const counties = holiday.counties || []
      const matchesRegion = !region || counties.length === 0 || counties.includes(region)
      if (matchesRegion) map.set(holiday.date, holiday.localName || holiday.name)
    }
    return map
  }

  function pageDimensions() {
    const sizes = { A4: [595.28, 841.89], A3: [841.89, 1190.55], Letter: [612, 792] }
    let [width, height] = sizes[pageSize] || sizes.A4
    if (orientation === 'landscape' && height > width) [width, height] = [height, width]
    if (orientation === 'portrait' && width > height) [width, height] = [height, width]
    return [width, height]
  }

  function palette() {
    const mono = colorMode === 'grayscale'
    return {
      text: rgb(0.07, 0.09, 0.14),
      muted: rgb(0.38, 0.43, 0.5),
      border: rgb(0.83, 0.86, 0.9),
      faint: mono ? rgb(0.95, 0.95, 0.95) : rgb(0.94, 0.97, 1),
      weekend: mono ? rgb(0.9, 0.9, 0.9) : rgb(1, 0.93, 0.86),
      holiday: mono ? rgb(0.78, 0.78, 0.78) : rgb(1, 0.88, 0.88),
      primary: mono ? rgb(0.12, 0.12, 0.12) : rgb(0.15, 0.39, 0.92),
      primarySoft: mono ? rgb(0.88, 0.88, 0.88) : rgb(0.86, 0.92, 1),
      white: rgb(1, 1, 1)
    }
  }

  function layoutForMonths(count, width, height) {
    const layouts = { 1: [1, 1], 2: orientation === 'landscape' ? [2, 1] : [1, 2], 3: [3, 1], 4: [2, 2], 6: [3, 2], 12: [4, 3] }
    let [cols, rows] = layouts[count] || [2, 2]
    if (height > width && count >= 3 && count !== 4) [cols, rows] = [rows, cols]
    return { cols, rows }
  }

  function drawText(page, textValue, options) {
    page.drawText(String(textValue), options)
  }

  function drawMonth(page, item, box, fonts, colors, holidays) {
    const { x, y, width, height } = box
    const title = `${monthNames[item.month]} ${item.year}`
    const padding = Math.min(18, width * 0.04)
    const titleHeight = daySize === 'large' ? 34 : 28
    const headerHeight = 20
    const notesHeight = showNotes ? Math.min(54, height * 0.16) : 0
    const gridTop = y + height - padding - titleHeight - headerHeight
    const gridHeight = height - padding * 2 - titleHeight - headerHeight - notesHeight - 8
    const weekNumberWidth = showWeekNumbers ? 24 : 0
    const cellWidth = (width - padding * 2 - weekNumberWidth) / 7
    const cells = buildMonthDays(item.year, item.month)
    const rows = cells.length / 7
    const cellHeight = gridHeight / rows
    const titleSize = Math.max(15, Math.min(26, width / 18))
    const dayFontSize = daySize === 'large' ? Math.min(20, cellHeight * 0.42) : daySize === 'compact' ? Math.min(9, cellHeight * 0.28) : Math.min(13, cellHeight * 0.34)
    const holidayFontSize = Math.max(5.5, Math.min(8, cellHeight * 0.18))

    if (headerStyle === 'solid') {
      page.drawRectangle({ x, y: y + height - titleHeight - 12, width, height: titleHeight + 12, color: colors.primary })
      drawText(page, title, { x: x + padding, y: y + height - padding - titleSize, size: titleSize, font: fonts.bold, color: colors.white })
    } else {
      if (headerStyle === 'soft') page.drawRectangle({ x, y: y + height - titleHeight - 12, width, height: titleHeight + 12, color: colors.primarySoft })
      drawText(page, title, { x: x + padding, y: y + height - padding - titleSize, size: titleSize, font: fonts.bold, color: colors.text })
    }

    weekDays.forEach((day, index) => {
      drawText(page, day.toUpperCase(), { x: x + padding + weekNumberWidth + index * cellWidth + 3, y: gridTop + 5, size: 7.8, font: fonts.bold, color: colors.muted })
    })

    cells.forEach((cell, index) => {
      const col = index % 7
      const row = Math.floor(index / 7)
      const cellX = x + padding + weekNumberWidth + col * cellWidth
      const cellY = gridTop - (row + 1) * cellHeight
      const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6
      const holidayName = holidays.get(cell.iso)
      const isToday = emphasizeToday && cell.iso === getIsoDate(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
      const background = holidayName ? colors.holiday : shadeWeekends && isWeekend ? colors.weekend : gridStyle === 'cards' ? colors.faint : undefined

      if (background) page.drawRectangle({ x: cellX + 1, y: cellY + 1, width: cellWidth - 2, height: cellHeight - 2, color: background, borderRadius: roundedCells ? 6 : 0 })
      if (gridStyle !== 'minimal') page.drawRectangle({ x: cellX, y: cellY, width: cellWidth, height: cellHeight, borderColor: colors.border, borderWidth: gridStyle === 'lines' ? 0.7 : 0.35 })
      if (isToday) page.drawRectangle({ x: cellX + 2, y: cellY + 2, width: cellWidth - 4, height: cellHeight - 4, borderColor: colors.primary, borderWidth: 1.4 })

      if (cell.current || showEmptyDays) {
        drawText(page, cell.day, { x: cellX + 5, y: cellY + cellHeight - dayFontSize - 5, size: dayFontSize, font: holidayName ? fonts.bold : fonts.regular, color: cell.current ? colors.text : colors.muted })
      }
      if (holidayName && cell.current && cellHeight > 18) {
        const label = holidayName.length > 18 ? `${holidayName.slice(0, 17)}…` : holidayName
        drawText(page, label, { x: cellX + 5, y: cellY + 5, size: holidayFontSize, font: fonts.regular, color: colors.muted })
      }
      if (showWeekNumbers && col === 0) {
        drawText(page, getWeekNumber(cell.date), { x: x + padding + 2, y: cellY + cellHeight - 12, size: 7, font: fonts.regular, color: colors.muted })
      }
    })

    if (showNotes) {
      const notesY = y + padding
      page.drawRectangle({ x: x + padding, y: notesY, width: width - padding * 2, height: notesHeight - 6, borderColor: colors.border, borderWidth: 0.6, color: colors.faint })
      drawText(page, 'Notas', { x: x + padding + 8, y: notesY + notesHeight - 20, size: 9, font: fonts.bold, color: colors.muted })
    }
  }

  async function generatePdf() {
    isGenerating = true
    errorMessage = ''
    warningMessage = ''
    try {
      let holidays = new Map()
      try {
        holidays = await fetchHolidays()
      } catch (error) {
        warningMessage = text.holidaysWarning
      }

      const pdfDoc = await PDFDocument.create()
      pdfDoc.setTitle(text.seoTitle)
      pdfDoc.setSubject('Printable calendar generator')
      pdfDoc.setCreator('printacalendar.alon.one')
      pdfDoc.setProducer('pdf-lib')
      const regular = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const fonts = { regular, bold }
      const colors = palette()
      const [width, height] = pageDimensions()
      const margin = 28
      const footerHeight = includeFooter ? 22 : 0

      for (let index = 0; index < calendarMonths.length; index += Number(monthsPerPage)) {
        const page = pdfDoc.addPage([width, height])
        const months = calendarMonths.slice(index, index + Number(monthsPerPage))
        const { cols, rows } = layoutForMonths(Number(monthsPerPage), width, height)
        const gap = 18
        const contentWidth = width - margin * 2
        const contentHeight = height - margin * 2 - footerHeight
        const monthWidth = (contentWidth - gap * (cols - 1)) / cols
        const monthHeight = (contentHeight - gap * (rows - 1)) / rows

        months.forEach((month, monthIndex) => {
          const col = monthIndex % cols
          const row = Math.floor(monthIndex / cols)
          drawMonth(page, month, {
            x: margin + col * (monthWidth + gap),
            y: height - margin - (row + 1) * monthHeight - row * gap - footerHeight,
            width: monthWidth,
            height: monthHeight
          }, fonts, colors, holidays)
        })

        if (includeFooter) {
          drawText(page, text.footerSource, { x: margin, y: 14, size: 8, font: regular, color: colors.muted })
          drawText(page, `${index / Number(monthsPerPage) + 1} / ${pageCount}`, { x: width - margin - 30, y: 14, size: 8, font: regular, color: colors.muted })
        }
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      revokePdfUrl()
      pdfUrl = URL.createObjectURL(blob)
      modalOpen = true
    } catch (error) {
      errorMessage = text.error
    } finally {
      isGenerating = false
    }
  }

  function revokePdfUrl() {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    pdfUrl = ''
  }

  function downloadPdf() {
    if (!pdfUrl) return
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `calendar-${startYear}-${String(Number(startMonth) + 1).padStart(2, '0')}.pdf`
    link.click()
  }

  function printPdf() {
    const frame = document.querySelector('#pdf-preview-frame')
    if (frame?.contentWindow) frame.contentWindow.print()
  }

  function closeModal() {
    modalOpen = false
  }
</script>

<svelte:head>
  <title>{text.seoTitle} | Print a Calendar</title>
  <meta name="description" content={text.subtitle} />
</svelte:head>

<a class="skip-link" href="#main">Saltar al contenido</a>

<header class="site-header">
  <nav class="container header-nav" aria-label="Navegación principal">
    <a class="brand" href={appUrl} aria-label="Print a Calendar">
      <span class="brand-mark">▦</span>
      <span>Print a Calendar</span>
    </a>
    <div class="header-actions">
      <select class="select compact-select" bind:value={language} aria-label="Idioma">
        {#each Object.entries(translations) as [code, item]}
          <option value={code}>{item.languageName}</option>
        {/each}
      </select>
      <a class="header-link" href="#faq">FAQ</a>
    </div>
  </nav>
</header>

<main id="main">
  <section class="hero-section">
    <div class="container hero-grid">
      <div class="hero-copy">
        <span class="badge">{text.badge}</span>
        <h1>{text.title}</h1>
        <p class="hero-subtitle">{text.subtitle}</p>
        <div class="hero-actions">
          <button class="btn btn-primary" type="button" on:click={generatePdf} disabled={isGenerating}>{isGenerating ? text.loading : text.cta}</button>
          <a class="btn btn-secondary" href="#configurator">{text.settings}</a>
        </div>
      </div>
      <aside class="preview-card" aria-label={text.livePreview}>
        <div class="preview-card-header">
          <strong>{monthNames[startMonth]} {startYear}</strong>
          <span>{totalMonths} · {pageCount} PDF</span>
        </div>
        <div class="mini-calendar" aria-hidden="true">
          {#each weekDays as day}<span>{day}</span>{/each}
          {#each buildMonthDays(Number(startYear), Number(startMonth)).slice(0, 35) as cell}
            <span class:muted={!cell.current} class:weekend={shadeWeekends && (cell.date.getDay() === 0 || cell.date.getDay() === 6)}>{cell.current || showEmptyDays ? cell.day : ''}</span>
          {/each}
        </div>
      </aside>
    </div>
  </section>

  <section id="configurator" class="container tool-layout" aria-labelledby="settings-title">
    <div class="panel intro-panel">
      <h2 id="settings-title">{text.settings}</h2>
      <p>{text.holidayHelp}</p>
      {#if warningMessage}<p class="alert alert-warning">{warningMessage}</p>{/if}
      {#if errorMessage}<p class="alert alert-danger">{errorMessage}</p>{/if}
    </div>

    <form class="settings-grid" on:submit|preventDefault={generatePdf}>
      <fieldset class="card">
        <legend>{text.content}</legend>
        <label><span>{text.startMonth}</span><select class="select" bind:value={startMonth}>{#each monthOptions as month}<option value={month}>{monthNames[month]}</option>{/each}</select></label>
        <label><span>{text.startYear}</span><select class="select" bind:value={startYear}>{#each years as year}<option value={year}>{year}</option>{/each}</select></label>
        <label><span>{text.totalMonths}</span><input class="input" type="number" min="1" max="36" bind:value={totalMonths} /></label>
        <label><span>{text.monthsPerPage}</span><select class="select" bind:value={monthsPerPage}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="6">6</option><option value="12">12</option></select></label>
        <label><span>{text.weekStarts}</span><select class="select" bind:value={weekStarts}><option value="1">{text.monday}</option><option value="0">{text.sunday}</option></select></label>
      </fieldset>

      <fieldset class="card">
        <legend>{text.layout}</legend>
        <label><span>{text.pageSize}</span><select class="select" bind:value={pageSize}><option>A4</option><option>A3</option><option>Letter</option></select></label>
        <label><span>{text.orientation}</span><select class="select" bind:value={orientation}><option value="portrait">{text.portrait}</option><option value="landscape">{text.landscape}</option></select></label>
        <label><span>{text.daySize}</span><select class="select" bind:value={daySize}><option value="compact">{text.compact}</option><option value="comfortable">{text.comfortable}</option><option value="large">{text.large}</option></select></label>
        <label><span>{text.headerStyle}</span><select class="select" bind:value={headerStyle}><option value="clean">{text.clean}</option><option value="soft">{text.soft}</option><option value="solid">{text.solid}</option></select></label>
        <label><span>{text.gridStyle}</span><select class="select" bind:value={gridStyle}><option value="cards">{text.cards}</option><option value="lines">{text.lines}</option><option value="minimal">{text.minimal}</option></select></label>
      </fieldset>

      <fieldset class="card">
        <legend>{text.localization}</legend>
        <label><span>{text.country}</span><select class="select" bind:value={country}>{#each countries as [code, name]}<option value={code}>{name}</option>{/each}</select></label>
        <label><span>{text.region}</span><select class="select" bind:value={region}>{#each availableRegions as [code, name]}<option value={code}>{code ? `${name} (${code})` : text.noRegion}</option>{/each}</select></label>
        <label class="switch"><input type="checkbox" bind:checked={showHolidays} /><span>{text.showHolidays}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={showWeekNumbers} /><span>{text.showWeekNumbers}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={showEmptyDays} /><span>{text.showEmptyDays}</span></label>
      </fieldset>

      <fieldset class="card">
        <legend>{text.style}</legend>
        <label><span>{text.colorMode}</span><select class="select" bind:value={colorMode}><option value="color">{text.color}</option><option value="grayscale">{text.grayscale}</option></select></label>
        <label class="switch"><input type="checkbox" bind:checked={shadeWeekends} /><span>{text.shadeWeekends}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={includeFooter} /><span>{text.includeFooter}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={showNotes} /><span>{text.showNotes}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={roundedCells} /><span>{text.roundedCells}</span></label>
        <label class="switch"><input type="checkbox" bind:checked={emphasizeToday} /><span>{text.emphasizeToday}</span></label>
      </fieldset>

      <div class="form-actions">
        <button class="btn btn-primary btn-large" type="submit" disabled={isGenerating}>{isGenerating ? text.loading : text.cta}</button>
      </div>
    </form>
  </section>

  <section class="container content-grid" aria-labelledby="benefits-title">
    <article class="panel">
      <h2 id="benefits-title">{text.benefitsTitle}</h2>
      <ul class="check-list"><li>{text.benefitPrivacy}</li><li>{text.benefitFlexible}</li><li>{text.benefitPrint}</li></ul>
    </article>
    <article class="panel">
      <h2>{text.howTitle}</h2>
      <ol class="steps"><li>{text.step1}</li><li>{text.step2}</li><li>{text.step3}</li><li>{text.step4}</li></ol>
    </article>
  </section>

  <section id="faq" class="container faq" aria-labelledby="faq-title">
    <h2 id="faq-title">{text.faqTitle}</h2>
    <details><summary>{text.faq1}</summary><p>{text.faq1a}</p></details>
    <details><summary>{text.faq2}</summary><p>{text.faq2a}</p></details>
    <details><summary>{text.faq3}</summary><p>{text.faq3a}</p></details>
  </section>
</main>

<footer class="site-footer">
  <div class="container footer-grid">
    <p><strong>Print a Calendar</strong><br />{text.subtitle}</p>
    <p>{text.footerSource}</p>
  </div>
</footer>

{#if modalOpen}
  <div class="modal-backdrop" role="presentation" on:click={closeModal}>
    <section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" on:click|stopPropagation>
      <div class="modal-header">
        <h2 id="modal-title">{text.modalTitle}</h2>
        <button class="icon-button" type="button" on:click={closeModal} aria-label={text.close}>×</button>
      </div>
      <iframe id="pdf-preview-frame" title={text.preview} src={pdfUrl}></iframe>
      <div class="modal-actions">
        <button class="btn btn-secondary" type="button" on:click={printPdf}>{text.print}</button>
        <button class="btn btn-primary" type="button" on:click={downloadPdf}>{text.download}</button>
      </div>
    </section>
  </div>
{/if}
