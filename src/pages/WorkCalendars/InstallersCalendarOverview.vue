<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="row items-center justify-between">
          <div>
            <div class="text-h6">تقویم کاری نصاب‌ها</div>
            <div class="text-caption text-grey-7">نمایش کلی نوبت‌های نصب همه نصاب‌ها بر اساس روز</div>
          </div>
          <q-btn flat round icon="refresh" :loading="loadingAppointments" @click="refreshCalendar">
            <q-tooltip>بروزرسانی</q-tooltip>
          </q-btn>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section>
        <div v-if="loadingAppointments" class="flex justify-center q-pa-md">
          <q-spinner size="50px" color="primary" />
        </div>
        <persian-month-calendar
            v-else
            :j-year="jYear"
            :j-month="jMonth"
            :events="appointments"
            @change-month="onChangeMonth"
        >
          <template #default="{ day, events }">
            <div class="q-mt-xs">
              <q-chip
                  v-for="ev in events.slice(0, 3)"
                  :key="ev.id"
                  dense
                  square
                  clickable
                  :color="chipColor(ev.role)"
                  text-color="white"
                  class="q-mb-xs full-width ellipsis"
                  style="justify-content: flex-start"
                  @click.stop="openAppointmentDetails(ev)"
              >
                {{ chipLabel(ev) }}
                <q-tooltip>{{ ev.customer_name }}</q-tooltip>
              </q-chip>

              <q-btn
                  v-if="events.length > 3"
                  flat
                  dense
                  size="sm"
                  color="primary"
                  :label="`+${events.length - 3} بیشتر`"
                  @click.stop="openDayDetails(day, events)"
              />
            </div>
          </template>
        </persian-month-calendar>
      </q-card-section>

      <q-separator />

      <!-- راهنمای رنگ‌ها: هر نوع نوبت (نصب پنل، نصب سیم‌کشی، نصب و راه‌اندازی، خدمات پس از فروش) یک رنگ ثابت دارد -->
      <q-card-section>
        <div class="row q-col-gutter-sm items-center">
          <div
              v-for="item in legendItems"
              :key="item.role"
              class="row items-center q-mr-md q-mb-xs"
          >
            <q-chip dense square :color="item.color" text-color="white" class="q-mr-xs" style="width: 16px; min-width: 16px; height: 16px;" />
            <span class="text-caption">{{ item.label }}</span>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- لیست کامل نوبت‌های یک روز، وقتی تعداد نوبت‌ها بیش از ۳ باشد -->
    <q-dialog v-model="dayDetailsDlg">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">
            نوبت‌های روز {{ selectedDay ? selectedDay.jDate : '' }} {{ monthNamesFa[jMonth - 1] }}
          </div>
        </q-card-section>
        <q-separator />
        <q-list separator>
          <q-item
              v-for="ev in selectedDayEvents"
              :key="ev.id"
              clickable
              @click="openAppointmentDetails(ev)"
          >
            <q-item-section side>
              <q-badge :color="chipColor(ev.role)">{{ ev.all_day ? ev.role_label : ev.time }}</q-badge>
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ ev.installer_name }} — {{ ev.role_label }}</q-item-label>
              <q-item-label caption>{{ ev.customer_name }}</q-item-label>
              <q-item-label caption v-if="ev.address">{{ ev.address }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
        <q-card-actions align="center">
          <q-btn flat rounded color="accent" label="بستن" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- دیالوگ جزئیات نوبت: بر اساس نوع نوبت، اطلاعات سرویس نصب یا خدمت پس از فروش نمایش داده می‌شود -->
    <q-dialog v-model="detailDlg">
      <q-card style="min-width: 350px; max-width: 480px">
        <q-card-section class="row items-center justify-between">
          <div
              class="text-h6 text-primary cursor-pointer row items-center no-wrap"
              @click="goToEditPage"
          >
            {{ detailDialogTitle }}
            <q-icon name="open_in_new" size="18px" class="q-mr-xs" />
            <q-tooltip>مشاهده کامل / ویرایش</q-tooltip>
          </div>
          <q-badge v-if="selectedEvent" :color="chipColor(selectedEvent.role)">
            {{ selectedEvent.role_label }}
          </q-badge>
        </q-card-section>
        <q-separator />

        <q-card-section v-if="loadingDetail" class="flex justify-center q-pa-lg">
          <q-spinner size="40px" color="primary" />
        </q-card-section>

        <q-card-section v-else-if="detailData" style="max-height: 60vh" class="scroll">
          <!-- خدمات پس از فروش -->
          <template v-if="selectedEvent.role === 'after_sale'">
            <div class="text-subtitle2 q-mb-xs">مشتری: {{ detailData.customer && detailData.customer.name }}</div>
            <div>وضعیت: {{ detailData.status_label }}</div>
            <div v-if="detailData.serviceType">نوع خدمت: {{ detailData.serviceType.name }}</div>
            <div v-if="detailData.responsibleUser">مسئول پیگیری: {{ detailData.responsibleUser.name }}</div>
            <div class="q-mt-sm">مشکل: {{ detailData.problem }}</div>
            <div v-if="detailData.jalali_request_date">تاریخ درخواست: {{ detailData.jalali_request_date }}</div>
            <div v-if="detailData.jalali_follow_up_date">تاریخ پیگیری بعدی: {{ detailData.jalali_follow_up_date }}</div>
            <div v-if="detailData.resolution_description" class="q-mt-sm">
              <div class="text-caption text-grey-7">نتیجه پیگیری:</div>
              <div>{{ detailData.resolution_description }}</div>
            </div>
          </template>

          <!-- بازدید ثبت‌شده در اتوماسیون (visit_date) -->
          <template v-else-if="selectedEvent.role === 'visit'">
            <div class="text-subtitle2 q-mb-xs">مشتری: {{ detailData.customer && detailData.customer.name }}</div>
            <div v-if="detailData.address" class="text-caption text-grey-7">آدرس: {{ detailData.address }}</div>

            <q-separator class="q-my-sm" />

            <div v-if="detailData.survey_type">نوع بازدید: {{ surveyTypeLabel(detailData.survey_type) }}</div>
            <div v-if="detailData.jalali_visit_date">تاریخ بازدید: {{ detailData.jalali_visit_date }}</div>
            <div v-if="detailData.expert">کارشناس فنی: {{ detailData.expert.name }}</div>
            <div>وضعیت: {{ automationStatusLabel(detailData.status) }}</div>
          </template>

          <!-- سرویس نصب (نصب پنل / سیم‌کشی / راه‌اندازی) -->
          <template v-else>
            <div class="text-subtitle2 q-mb-xs">مشتری: {{ detailData.customer && detailData.customer.name }}</div>
            <div v-if="detailData.address" class="text-caption text-grey-7">آدرس: {{ detailData.address }}</div>
            <div v-if="detailData.contact_number" class="text-caption text-grey-7">تماس: {{ detailData.contact_number }}</div>

            <q-separator class="q-my-sm" />

            <div>وضعیت: {{ detailData.status === 2 ? 'نهایی' : 'موقت' }}</div>
            <div>منبع خرید: {{ detailData.purchase_source === 1 ? 'داخلی' : 'خارجی' }}</div>
            <div v-if="detailData.jalali_survey_date">تاریخ بازدید: {{ detailData.jalali_survey_date }}</div>
            <div v-if="detailData.technicalExpert">کارشناس فنی: {{ detailData.technicalExpert.name }}</div>

            <template v-if="detailData.installerAppointments && detailData.installerAppointments.length">
              <q-separator class="q-my-sm" />
              <div class="text-subtitle2 q-mb-xs">نوبت‌های نصاب</div>
              <q-list dense>
                <q-item v-for="a in detailData.installerAppointments" :key="a.id">
                  <q-item-section side>
                    <q-badge :color="chipColor(a.type_key)">
                      {{ a.start_time && a.start_time.substring(0, 5) }} - {{ a.end_time && a.end_time.substring(0, 5) }}
                    </q-badge>
                  </q-item-section>
                  <q-item-section>
                    {{ a.type_label }} — {{ a.installer && a.installer.name }}
                  </q-item-section>
                </q-item>
              </q-list>
            </template>

            <template v-if="detailData.installationServiceItems && detailData.installationServiceItems.length">
              <q-separator class="q-my-sm" />
              <div class="text-subtitle2 q-mb-xs">اقلام مصرفی</div>
              <q-list dense>
                <q-item v-for="item in detailData.installationServiceItems" :key="item.id">
                  <q-item-section>
                    {{ item.product && item.product.name }} — {{ item.quantity }}
                  </q-item-section>
                </q-item>
              </q-list>
            </template>
          </template>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat rounded color="accent" label="بستن" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import moment from 'moment-jalaali'
import { api } from 'boot/axios'
import PersianMonthCalendar from 'components/PersianMonthCalendar.vue'

moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

// رنگ ثابت هر نوع نوبت؛ هم برای چیپ‌های تقویم و هم راهنمای زیر آن استفاده می‌شود
const TYPE_COLORS = {
  panel: 'primary',
  wiring: 'orange',
  commissioning: 'teal',
  after_sale: 'purple',
  visit: 'grey',
}

const TYPE_LABELS = {
  panel: 'نصب پنل',
  wiring: 'نصب سیم‌کشی',
  commissioning: 'نصب و راه‌اندازی',
  after_sale: 'خدمات پس از فروش',
  visit: 'بازدید',
}

// وضعیت‌های اتوماسیون؛ فقط برای نمایش در دیالوگ جزئیات بازدید استفاده می‌شود
const AUTOMATION_STATUS_LABELS = {
  '-1': 'فروش ناموفق',
  0: 'درخواست ثبت شده',
  1: 'پیش فاکتور ثبت شده',
  2: 'مذاکره و قرارداد',
  3: 'فروش موفق',
}

const AUTOMATION_SURVEY_TYPE_LABELS = {
  1: 'خانگی',
  2: 'صنعتی',
}

export default {
  name: 'InstallersCalendarOverview',

  components: { PersianMonthCalendar },

  data() {
    const now = moment()
    return {
      jYear: now.jYear(),
      jMonth: now.jMonth() + 1,

      appointments: [],
      loadingAppointments: false,

      dayDetailsDlg: false,
      selectedDay: null,
      selectedDayEvents: [],

      legendItems: Object.keys(TYPE_LABELS).map(role => ({
        role,
        label: TYPE_LABELS[role],
        color: TYPE_COLORS[role],
      })),

      detailDlg: false,
      loadingDetail: false,
      selectedEvent: null,
      detailData: null,

      monthNamesFa: [
        'فروردین',
        'اردیبهشت',
        'خرداد',
        'تیر',
        'مرداد',
        'شهریور',
        'مهر',
        'آبان',
        'آذر',
        'دی',
        'بهمن',
        'اسفند',
      ],
    }
  },

  computed: {
    detailDialogTitle() {
      if (!this.selectedEvent) return ''
      if (this.selectedEvent.role === 'after_sale') return 'جزئیات خدمت پس از فروش'
      if (this.selectedEvent.role === 'visit') return 'جزئیات بازدید'
      return 'جزئیات سرویس نصب'
    },
  },

  methods: {
    fetchAppointments() {
      const start = moment().jYear(this.jYear).jMonth(this.jMonth - 1).jDate(1)
      const from = start.format('YYYY-MM-DD')
      const to = start.clone().add(1, 'jMonth').subtract(1, 'day').format('YYYY-MM-DD')

      this.loadingAppointments = true
      api.get('installer-appointments/forAll', { params: { from, to } })
          .then(response => {
            this.appointments = response.data.data || []
          })
          .catch(() => {
            this.$q.notify({
              type: 'negative',
              message: 'خطا در دریافت نوبت‌های نصاب‌ها',
            })
          })
          .finally(() => {
            this.loadingAppointments = false
          })
    },

    onChangeMonth({ jYear, jMonth }) {
      this.jYear = jYear
      this.jMonth = jMonth
      this.fetchAppointments()
    },

    refreshCalendar() {
      this.fetchAppointments()
    },

    chipColor(role) {
      return TYPE_COLORS[role] || 'grey'
    },

    // متن نمایش‌داده‌شده روی چیپ تقویم: نوبت‌های نصب ساعت شروع/پایان دارند،
    // اما بازدیدهای اتوماسیون تمام‌روز هستند و ساعت مشخصی ندارند
    chipLabel(ev) {
      return ev.all_day ? `${ev.role_label} - ${ev.installer_name}` : `${ev.time} - ${ev.installer_name}`
    },

    automationStatusLabel(status) {
      return AUTOMATION_STATUS_LABELS[status] ?? '-'
    },

    surveyTypeLabel(type) {
      return AUTOMATION_SURVEY_TYPE_LABELS[type] ?? '-'
    },

    /**
     * با کلیک روی تایتل دیالوگ جزئیات، کاربر به صفحه ادیت همان رکورد
     * (سرویس نصب / خدمت پس از فروش / اتوماسیون) هدایت می‌شود تا مشخصات
     * کامل‌تری را ببیند. نام روت‌ها و پارامتر id مطابق routes/routes.js
     * پروژه (InstallServiceEdit، AfterSalesServiceEdit، EditAutomation) است.
     */
    goToEditPage() {
      if (!this.selectedEvent) return

      let routeName
      let id

      if (this.selectedEvent.role === 'after_sale') {
        routeName = 'AfterSalesServiceEdit'
        id = this.selectedEvent.after_sale_service_id
      } else if (this.selectedEvent.role === 'visit') {
        routeName = 'EditAutomation'
        id = this.selectedEvent.automation_id
      } else {
        routeName = 'InstallServiceEdit'
        id = this.selectedEvent.installation_service_id
      }

      if (!id) {
        this.$q.notify({ type: 'negative', message: 'شناسه‌ای برای رفتن به صفحه ویرایش یافت نشد' })
        return
      }

      this.detailDlg = false
      this.$router.push({ name: routeName, params: { id } })
    },

    openDayDetails(day, events) {
      this.selectedDay = day
      this.selectedDayEvents = events
      this.dayDetailsDlg = true
    },

    /**
     * با کلیک روی یک نوبت (چه از چیپ اصلی تقویم، چه از لیست «بیشتر» یک روز)،
     * بسته به نوع آن (خدمات پس از فروش، یکی از سه نوع سرویس نصب، یا یک بازدید
     * ثبت‌شده در اتوماسیون) اطلاعات کامل همان رکورد از بک‌اند گرفته و در
     * دیالوگ نمایش داده می‌شود.
     */
    openAppointmentDetails(ev) {
      this.selectedEvent = ev
      this.detailData = null
      this.detailDlg = true

      if (ev.role === 'visit') {
        if (!ev.automation_id) {
          this.$q.notify({ type: 'negative', message: 'شناسه بازدید یافت نشد' })
          this.detailDlg = false
          return
        }

        this.loadingDetail = true
        // نکته: نام مسیر زیر بر اساس الگوی نام‌گذاری سایر ریسورس‌های پروژه
        // فرض شده است (متد show در AutomationController)؛ در صورت متفاوت
        // بودن routes/api.php واقعی، باید با نام درست جایگزین شود.
        api.get(`automation/${ev.automation_id}`)
            .then(response => {
              this.detailData = response.data.data
            })
            .catch(() => {
              this.$q.notify({ type: 'negative', message: 'خطا در دریافت جزئیات بازدید' })
              this.detailDlg = false
            })
            .finally(() => {
              this.loadingDetail = false
            })
        return
      }

      const isAfterSale = ev.role === 'after_sale'
      const targetId = isAfterSale ? ev.after_sale_service_id : ev.installation_service_id

      if (!targetId) {
        this.$q.notify({ type: 'negative', message: 'شناسه سرویس مرتبط با این نوبت یافت نشد' })
        this.detailDlg = false
        return
      }

      // نکته: نام مسیرهای زیر بر اساس الگوی نام‌گذاری سایر ریسورس‌های پروژه
      // فرض شده است؛ در صورت متفاوت بودن routes/api.php واقعی، این دو مسیر
      // باید با نام درست جایگزین شوند.
      const url = isAfterSale
          ? `after-sales-service/${targetId}`
          : `installation-service/${targetId}`

      this.loadingDetail = true
      api.get(url)
          .then(response => {
            this.detailData = response.data.data
          })
          .catch(() => {
            this.$q.notify({ type: 'negative', message: 'خطا در دریافت جزئیات نوبت' })
            this.detailDlg = false
          })
          .finally(() => {
            this.loadingDetail = false
          })
    },
  },

  created() {
    this.fetchAppointments()
  },
}
</script>

<style scoped>
.border-radius-card {
  border-radius: 12px;
}
</style>
