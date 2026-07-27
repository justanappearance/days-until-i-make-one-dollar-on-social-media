const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const DAY_HEADERS = ['Su','Mo','Tu','We','Th','Fr','Sa']
const START_DATE = new Date(2026, 6, 27) // July 27, 2026 — the day this goal was set


function formatDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function renderMonth(year, month, todayStr, entryMap, today) {
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startDow = firstDay.getDay()

  const monthEl = document.createElement('div')
  monthEl.className = 'month'

  const nameEl = document.createElement('div')
  nameEl.className = 'month-name'
  nameEl.textContent = `${MONTH_NAMES[month]} ${year}`
  monthEl.appendChild(nameEl)

  const headersEl = document.createElement('div')
  headersEl.className = 'day-headers'
  for (const label of DAY_HEADERS) {
    const h = document.createElement('div')
    h.className = 'day-header'
    h.textContent = label
    headersEl.appendChild(h)
  }
  monthEl.appendChild(headersEl)

  const gridEl = document.createElement('div')
  gridEl.className = 'day-grid'

  for (let i = 0; i < startDow; i++) {
    const blank = document.createElement('div')
    blank.className = 'day-cell empty'
    gridEl.appendChild(blank)
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const dateStr = formatDate(date)
    const isFuture = date > today
    const isBeforeStart = date < START_DATE
    const isToday = dateStr === todayStr

    const cell = document.createElement('div')
    cell.className = 'day-cell'

    if (isBeforeStart || isFuture) {
      cell.classList.add('empty')
    } else if (entryMap[dateStr]) {
      cell.classList.add('milestone')
    } else {
      cell.classList.add('counted')
    }

    if (isToday) cell.classList.add('today')
    if (dateStr === formatDate(START_DATE)) cell.classList.add('start')

    const num = document.createElement('span')
    num.className = 'day-number'
    num.textContent = day
    cell.appendChild(num)

    gridEl.appendChild(cell)
  }

  monthEl.appendChild(gridEl)
  return monthEl
}

async function init() {
  const calendar = document.getElementById('calendar')
  calendar.innerHTML = '<p class="loading">Loading...</p>'

  let entries = []
  try {
    const resp = await fetch('/api/entries')
    if (resp.ok) entries = await resp.json()
  } catch (e) {
    console.error('Failed to load entries', e)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = formatDate(today)

  const entryMap = {}
  for (const e of entries) entryMap[e.date] = e

  const dayCount = Math.floor((today - START_DATE) / 864e5) + 1 // inclusive of start date; keeps counting forever
  document.getElementById('day-count').textContent = dayCount

  calendar.innerHTML = ''

  let cursor = new Date(START_DATE.getFullYear(), START_DATE.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth(), 1)
  while (cursor <= end) {
    calendar.appendChild(renderMonth(cursor.getFullYear(), cursor.getMonth(), todayStr, entryMap, today))
    cursor.setMonth(cursor.getMonth() + 1)
  }
}

init()
