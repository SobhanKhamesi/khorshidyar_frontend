// پاورقی چاپ: فقط شماره صفحه و تاریخ/ساعت لحظه‌ی چاپ.
// وقتی صفحه محتوای حاشیه‌ی @page تعریف کند، مرورگر هدر و فوتر پیش‌فرض خودش
// (عنوان نرم‌افزار، لینک صفحه و ...) را چاپ نمی‌کند.

const STYLE_ID = 'print-page-footer'

// تاریخ و ساعت شمسی با ارقام فارسی، مثل «۱۴۰۵/۰۸/۱۹ - ساعت ۱۰:۲۰»
export function printTimestamp(date = new Date()) {
  const day = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {year: 'numeric', month: '2-digit', day: '2-digit'}).format(date)
  const time = new Intl.DateTimeFormat('fa-IR', {hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).format(date)
  return `${day} - ساعت ${time}`
}

export function buildPrintPageCss(date = new Date()) {
  const stamp = printTimestamp(date).replace(/["\\]/g, '')
  const box = 'font-family: IRANSans, Tahoma, sans-serif; font-size: 9pt; color: #555;'

  return `@page {
  margin: 12mm 10mm 14mm;
  @top-left { content: ""; }
  @top-center { content: ""; }
  @top-right { content: ""; }
  @bottom-right { content: "صفحه " counter(page, persian) " از " counter(pages, persian); ${box} }
  @bottom-center { content: ""; }
  @bottom-left { content: "${stamp}"; ${box} }
}`
}

/**
 * پاورقی چاپ را تا زمان فراخوانی تابع برگشتی فعال نگه می‌دارد؛
 * تاریخ و ساعت درست قبل از هر چاپ به‌روز می‌شود.
 */
export function installPrintPageFooter() {
  let style = document.getElementById(STYLE_ID)
  if (!style) {
    style = document.createElement('style')
    style.id = STYLE_ID
    document.head.appendChild(style)
  }

  const refresh = () => {
    style.textContent = buildPrintPageCss()
  }
  refresh()
  window.addEventListener('beforeprint', refresh)

  return () => {
    window.removeEventListener('beforeprint', refresh)
    style.remove()
  }
}
