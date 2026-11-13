import {LocalStorage} from 'quasar'
import {reactive} from 'vue'

/**
 * دسترسی‌های سمت کاربر (هم‌خوان با app/Support/Access.php و app/Support/Permissions.php در بک‌اند).
 * بک‌اند منبع اصلی دسترسی است؛ این فایل فقط منو، مسیرها و دکمه‌ها را متناسب با دسترسی‌های نقش کاربر نمایش می‌دهد.
 *
 * دسترسی‌های هر نقش توسط ادمین در صفحه‌ی «سطوح دسترسی» (کاربران ← سطوح دسترسی) تعیین می‌شود و
 * هنگام ورود و هر بار درخواست checking (منوی کناری) به‌روز می‌شود.
 */
export const ROLE = {
  ADMIN: 0,
  TECHNICAL_EXPERT: 1, // کارشناس فنی
  INSTALLER: 2,        // نصاب
  SALES_EXPERT: 3,     // کارشناس فروش
  SALES_MANAGER: 4,    // مدیر فروش
}

function readRole() {
  const role = LocalStorage.getItem('role')
  return role === null || role === undefined || role === '' ? null : Number(role)
}

function readPermissions() {
  const permissions = LocalStorage.getItem('permissions')
  return Array.isArray(permissions) ? permissions : []
}

// واکنش‌گرا: با تغییر دسترسی‌ها (پاسخ checking) منو و دکمه‌ها بدون بارگذاری مجدد به‌روز می‌شوند
const state = reactive({
  role: readRole(),
  permissions: readPermissions(),
})

/** ذخیره‌ی نقش و دسترسی‌های دریافتی از سرور (ورود و checking) */
export function setAccess(role, permissions) {
  if (role !== undefined && role !== null) {
    LocalStorage.set('role', role)
    state.role = Number(role)
  }
  if (Array.isArray(permissions)) {
    LocalStorage.set('permissions', permissions)
    state.permissions = permissions
  }
}

export const currentRole = () => state.role
export const isAdmin = () => state.role === ROLE.ADMIN
export const isInstaller = () => state.role === ROLE.INSTALLER
export const isTechnicalExpert = () => state.role === ROLE.TECHNICAL_EXPERT

/** آیا کاربر این دسترسی را دارد؟ ادمین همیشه همه‌ی دسترسی‌ها را دارد */
export function can(permission) {
  return isAdmin() || state.permissions.includes(permission)
}

export const canAny = (...permissions) => permissions.some(can)

// بخش فروش: سرنخ، فرصت، مشتری، معرف، اتوماسیون فروش، محصولات، پیامک و نمودارها
export const canUseSales = () => can('sales.access')
// همه‌ی داده‌های فروش را می‌بیند (نه فقط مال خودش)
export const seesAllSales = () => can('sales.view_all')
// مراحل مدیریتی اتوماسیون (پیش فاکتور ← مذاکره، تایید قرارداد، فروش موفق، اصلاحیه و ابطال فروش موفق)
export const canManageSalesStages = () => can('sales.manage_stages')

const ALWAYS = () => true
const ADMIN_ONLY = isAdmin
const SALES = canUseSales
const perm = permission => () => can(permission)

// شرط دسترسی هر مسیر (مسیرهای بدون ورود در اینجا نیستند و برای همه مجازند)
const ROUTE_RULES = {
  Dashboard: ALWAYS, Profile: ALWAYS, UserReport: ALWAYS,
  Users: ADMIN_ONLY, UserProfile: ADMIN_ONLY, AccessLevels: ADMIN_ONLY,
  Settings: perm('settings.manage'),

  LeadCreate: SALES, LeadEdit: SALES, LeadsList: SALES,
  CustomerCreate: SALES, CustomerEdit: SALES, CustomersList: SALES,
  CustomersOpportunities: SALES, OpportunityEdit: SALES, introducerList: SALES,
  CallCreate: SALES, CallEdit: SALES,
  CreateQuickPreInvoice: SALES, CreateRequest: SALES, EditAutomation: SALES, AutomationContract: SALES,
  ListRequest: SALES, ListPreInvoice: SALES, ListContract: SALES, ListFinal: SALES, listcanseling: SALES,
  ProductCreate: SALES, ProductEdit: SALES, ProductsList: SALES,
  SmsCreate: SALES, SmsList: SALES,
  LeadsStatus: SALES, LeadsMethod: SALES, ProductChart: SALES, SellerChart: SALES, Call: SALES, SuccessfulSale: SALES,
  TargetingChart: SALES,
  TargetingCreate: perm('targeting.manage'), TargetingEdit: perm('targeting.manage'),
  TargetingList: () => canAny('sales.access', 'targeting.manage'),

  // اطلاعات پایه (تنظیمات)
  CategoryCreate: perm('settings.manage'), CategoryEdit: perm('settings.manage'), CategoriesList: perm('settings.manage'),
  FailureEdit: perm('settings.manage'), SourceEdit: perm('settings.manage'), SmsEdit: perm('settings.manage'),
  editInventory: perm('inventory.manage'), editCategoryProduct: perm('inventory.manage'),

  // مالی
  InvoiceCreate: perm('accounting.manage'), InvoiceEdit: perm('accounting.manage'), InvoicesList: perm('accounting.manage'),
  BankAccountCreate: perm('accounting.manage'), BankAccountEdit: perm('accounting.manage'), BankAccountsList: perm('accounting.manage'),
  CheckCreate: perm('accounting.manage'), CheckEdit: perm('accounting.manage'), ChecksList: perm('accounting.manage'),

  InstallServiceCreate: perm('installation.manage'), InstallServiceEdit: perm('installation.manage'),
  InstallServiceList: () => canAny('installation.view_all', 'installation.view_assigned'),
  AfterSalesServiceCreate: perm('after_sales.manage'), AfterSalesServiceEdit: perm('after_sales.manage'),
  AfterSalesServiceList: () => canAny('after_sales.view_all', 'after_sales.view_assigned'),

  ReminderCreate: ALWAYS, ReminderEdit: ALWAYS, RemindersList: ALWAYS,
  PlanningCreate: ALWAYS, PlanningEdit: ALWAYS, PlanningList: ALWAYS,
  TicketCreate: ALWAYS, TicketEdit: ALWAYS, TicketList: ALWAYS,
}

// مسیرهایی که در این لیست نیستند فقط برای مدیر مجازند (پیش‌فرض امن)
export function canAccessRoute(name) {
  if (!name) return true
  const rule = ROUTE_RULES[name]
  return rule ? rule() : isAdmin()
}

// برای استفاده در قالب‌ها: $access.can('sales.delete')، $access.isAdmin() و ...
export default {
  ROLE, currentRole, isAdmin, isInstaller, isTechnicalExpert, can, canAny,
  canUseSales, seesAllSales, canManageSalesStages, canAccessRoute, setAccess,
}
