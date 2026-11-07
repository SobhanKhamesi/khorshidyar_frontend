// انواع یادآوری (هم‌خوان با ثابت‌های App\Models\Reminder در بک‌اند)
// انواع ۲ به بعد «یادآوری سیستمی» هستند: اعلان‌هایی که خود سامانه برای کاربر می‌سازد
export const REMINDER_TYPES = {
  GENERAL: 0,
  BIRTHDAY: 1,
  INTAKE_FORM: 2,
  CONTRACT_SIGNED: 3,
  POOR_RATING: 4,
}

const META = {
  [REMINDER_TYPES.GENERAL]: {label: 'عمومی', icon: 'bi-bell', color: 'grey-7'},
  [REMINDER_TYPES.BIRTHDAY]: {label: 'تولد', icon: 'cake', color: 'pink'},
  [REMINDER_TYPES.INTAKE_FORM]: {
    label: 'فرم اولیه', icon: 'assignment_turned_in', color: 'primary',
    route: {name: 'ListRequest'}
  },
  [REMINDER_TYPES.CONTRACT_SIGNED]: {
    label: 'امضای قرارداد', icon: 'history_edu', color: 'positive',
    route: {name: 'ListContract'}
  },
  [REMINDER_TYPES.POOR_RATING]: {
    label: 'نظرسنجی ضعیف', icon: 'sentiment_very_dissatisfied', color: 'negative',
    route: {name: 'AfterSalesServiceList', query: {poor: '1'}}
  },
}

export function reminderMeta(type) {
  return META[parseInt(type)] || META[REMINDER_TYPES.GENERAL]
}

// مسیر صفحه‌ای که اعلان سیستمی به آن مربوط است (برای یادآوری‌های عادی: null)
export function reminderRoute(type) {
  return reminderMeta(type).route || null
}
