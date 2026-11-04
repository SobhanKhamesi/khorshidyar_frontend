<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست سرویس های نصب</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div class="row items-center q-gutter-sm q-mb-sm">
          <div class="legend-box legend-box-urgent"></div>
          <span class="text-caption text-grey-8">دارای نصب امروز یا فردا</span>
          <q-space/>
          <q-toggle v-model="onlyMyTurn" label="فقط موارد منتظر اقدام من" color="accent"/>
          <q-select
              outlined dense
              style="min-width: 260px"
              v-model="stageFilter"
              :options="stageFilterOptions"
              map-options emit-value
              label="مرحله"/>
        </div>
        <q-table
            :loading="loading"
            flat bordered class="border-radius-table"
            :rows="filteredRows"
            :filter="filter"
            :columns="columns"
            :rows-per-page-options="[10]"
        >

          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
          </template>

          <template v-slot:top-right="props">
            <div class="q-gutter-sm">
              <q-btn
                  round
                  color="info"
                  :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                  @click="props.toggleFullscreen"
              />
              <q-btn
                  round
                  color="negative"
                  size="13px"
                  icon="ti-export"
                  @click="exportTable()"/>
            </div>
          </template>

          <template v-slot:top-left>
            <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props" :class="isUrgentInstallation(props.row) ? 'row-urgent-installation' : ''">
              <q-td key="customer_name" :props="props">
                {{ props.row.customer ? props.row.customer.fullName : '-' }}
              </q-td>

              <q-td key="purchase_source" :props="props">
                <q-badge :color="purchaseSourceColor(props.row.purchase_source)">
                  {{ purchaseSourceLabel(props.row.purchase_source) }}
                </q-badge>
              </q-td>

              <q-td key="stage" :props="props">
                <q-badge :color="stageColor(props.row.stage)" class="q-pa-xs">
                  {{ props.row.stage_label }}
                </q-badge>
                <div v-if="props.row.technical_expert && props.row.stage >= STAGE.UNDER_REVIEW"
                     class="text-caption text-grey-7">
                  کارشناس: {{ props.row.technical_expert.name }}
                </div>
              </q-td>

              <q-td key="installers" :props="props">
                <div class="q-gutter-xs">
                  <q-badge
                      v-for="role in rolesOf(props.row)"
                      :key="role.key"
                      :color="installerBadgeColor(props.row, role.key)"
                  >
                    {{ role.shortLabel }}: {{ installerBadgeText(props.row, role.key) }}
                    <q-icon v-if="isUrgentAppointment(installerAppointment(props.row, role.key))"
                            name="warning" color="white" size="14px" class="q-ml-xs">
                      <q-tooltip>نصب امروز یا فردا</q-tooltip>
                    </q-icon>
                  </q-badge>
                </div>
              </q-td>

              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <!-- اقدام بعدی گردش کار -->
                <q-btn
                    v-if="nextAction(props.row)"
                    rounded dense no-caps
                    class="q-px-sm"
                    :color="nextAction(props.row).color"
                    :icon="nextAction(props.row).icon"
                    :label="nextAction(props.row).label"
                    @click.prevent="openWorkflow(props.row, nextAction(props.row).mode)"/>

                <q-btn
                    @click.prevent="showDetails(props.row.id)"
                    title="مشخصات و تاریخچه" dense round color="brown" icon="info"/>
                <q-btn
                    @click.prevent="showConsumables(props.row)"
                    title="اقلام پیش‌نیاز و مصرفی" dense round color="teal" icon="inventory_2"/>

                <q-btn :href="'/v1/print_install_service/' + props.row.id" target="_blank" title="پرینت" dense round
                       color="positive" icon="print"/>

                <template v-if="!isInstaller">
                  <q-btn v-if="props.row.stage !== STAGE.COMPLETED" title="ویرایش" dense round color="yellow-9" icon="edit"
                         :to="{ name:'InstallServiceEdit', params:{id:props.row.id} }"/>
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteConfirmation(props.row.id)"/>
                </template>
              </q-td>
            </q-tr>
          </template>

        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="deleteConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این سرویس نصب اطمینان دارید؟</span>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" :loading="deleting" @click.prevent="deleteItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="detailsDlg">
      <q-card style="width: 700px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">مشخصات سرویس نصب</div>
        </q-card-section>

        <q-separator/>

        <q-card-section v-if="detailsLoading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </q-card-section>

        <q-card-section v-else-if="details">
          <div class="row q-col-gutter-md">

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">مشتری</div>
              <div class="text-body1">{{ details.customer ? details.customer.name : '-' }}</div>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">شماره تماس</div>
              <div class="text-body1" dir="ltr">{{ details.contact_number || '-' }}</div>
            </div>

            <div class="col-12">
              <div class="text-caption text-grey-7">آدرس</div>
              <div class="text-body1">{{ details.address || '-' }}</div>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">نوع خرید</div>
              <q-badge :color="purchaseSourceColor(details.purchase_source)">
                {{ purchaseSourceLabel(details.purchase_source) }}
              </q-badge>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">مرحله</div>
              <q-badge :color="stageColor(details.stage)">
                {{ details.stage_label }}
              </q-badge>
            </div>

            <div class="col-md-6 col-xs-12" v-if="details.automation">
              <div class="text-caption text-grey-7">فروش موفق مرتبط</div>
              <div class="text-body1">فاکتور {{ details.automation.invoice_number || '-' }}</div>
            </div>

            <div class="col-md-6 col-xs-12" v-if="details.technical_expert">
              <div class="text-caption text-grey-7">کارشناس فنی بررسی کننده</div>
              <div class="text-body1">{{ details.technical_expert.name }}</div>
            </div>

            <div class="col-12" v-if="details.description">
              <div class="text-caption text-grey-7">توضیحات</div>
              <div class="text-body1">{{ details.description }}</div>
            </div>

            <div class="col-12">
              <q-separator class="q-my-sm"/>
              <div class="text-subtitle2 q-mb-sm">نصاب ها</div>

              <q-list bordered separator dense>
                <q-item v-for="role in rolesOf(details)" :key="role.key">
                  <q-item-section>
                    <q-item-label>{{ role.label }}</q-item-label>
                    <q-item-label caption>
                      {{ installerFullText(details, role.key) }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :color="installerBadgeColor(details, role.key)">
                      {{ installerStatusLabel(details, role.key) }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-subtitle2 q-mb-sm">اقلام پیش‌نیاز</div>
              <installation-items-table :items="details.required_items" empty-text="ثبت نشده است"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-subtitle2 q-mb-sm">اقلام مصرف شده (نصاب)</div>
              <installation-items-table :items="details.used_items" empty-text="هنوز ثبت نشده است"/>
            </div>

            <div class="col-12" v-if="details.histories && details.histories.length">
              <q-separator class="q-my-sm"/>
              <div class="text-subtitle2 q-mb-sm">تاریخچه گردش کار</div>
              <q-timeline color="accent" layout="dense">
                <q-timeline-entry
                    v-for="history in details.histories"
                    :key="history.id"
                    :color="stageColor(history.stage)"
                    :title="history.stage_label"
                    :subtitle="history.jalali_date + (history.user ? ' - ' + history.user.name : '')">
                  <div v-if="history.description" style="white-space: pre-line">{{ history.description }}</div>
                </q-timeline-entry>
              </q-timeline>
            </div>

          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="consumablesDlg">
      <q-card style="width: 550px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">اقلام سرویس نصب</div>
        </q-card-section>

        <q-separator/>

        <q-card-section v-if="consumablesRow" class="q-gutter-y-md">
          <div>
            <div class="text-subtitle2 q-mb-xs">اقلام پیش‌نیاز (تعیین شده توسط مدیر)</div>
            <installation-items-table :items="consumablesRow.required_items" empty-text="ثبت نشده است"/>
          </div>
          <div>
            <div class="text-subtitle2 q-mb-xs">اقلام مصرف شده (ثبت شده توسط نصاب)</div>
            <installation-items-table :items="consumablesRow.used_items" empty-text="هنوز ثبت نشده است"/>
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <installation-workflow-dialog
        v-model="workflowDlg"
        :service="workflowService"
        :mode="workflowMode"
        @saved="getData()"/>

  </q-page>
</template>

<script>
import {exportFile, LocalStorage} from 'quasar'
import {api} from 'boot/axios'
import InstallationWorkflowDialog, {STAGE} from 'components/InstallationWorkflowDialog.vue'
import InstallationItemsTable from 'components/InstallationItemsTable.vue'

const ROLE_ADMIN = 0
const ROLE_INSTALLER = 2

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0
      ? formatFn(val)
      : val
  formatted = formatted === void 0 || formatted === null
      ? ''
      : String(formatted)
  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

// same appointment status codes as backend InstallerAppointment model
const APPOINTMENT_CANCELED = 3

export default {
  name: "ListInstallationService",
  components: {InstallationWorkflowDialog, InstallationItemsTable},

  data() {
    return {
      STAGE,
      userRole: Number(LocalStorage.getItem('role')),
      userId: LocalStorage.getItem('id'),

      loading: true,
      filter: '',
      rows: [],

      stageFilter: null,
      onlyMyTurn: false,
      stageFilterOptions: [
        {label: 'همه مراحل', value: null},
        {label: 'پیش‌نویس', value: STAGE.DRAFT},
        {label: 'ارجاع به نصاب - در حال نصب', value: STAGE.ASSIGNED},
        {label: 'تکمیل توسط نصاب - در انتظار ارجاع به کارشناس', value: STAGE.INSTALLER_SUBMITTED},
        {label: 'در حال بررسی کارشناس فنی', value: STAGE.UNDER_REVIEW},
        {label: 'برگشت به نصاب برای رفع عیوب', value: STAGE.NEEDS_FIX},
        {label: 'تایید کارشناس - آماده تکمیل نهایی', value: STAGE.APPROVED},
        {label: 'تکمیل نهایی', value: STAGE.COMPLETED}
      ],

      workflowDlg: false,
      workflowService: null,
      workflowMode: '',

      installerRoles: [
        {key: 'panel', label: 'نصاب پنل', shortLabel: 'پنل'},
        {key: 'wiring', label: 'نصاب سیم کشی', shortLabel: 'سیم کشی'},
        {key: 'commissioning', label: 'نصاب راه اندازی', shortLabel: 'راه اندازی'}
      ],

      columns: [
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'purchase_source', field: 'purchase_source', align: 'center', label: 'نوع خرید'},
        {name: 'stage', field: 'stage_label', align: 'center', label: 'مرحله'},
        {name: 'installers', field: 'installers', align: 'center', label: 'نصاب ها'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      deleting: false,

      detailsDlg: false,
      detailsLoading: false,
      details: null,

      consumablesDlg: false,
      consumablesRow: null
    }
  },

  computed: {
    isInstaller() {
      return this.userRole === ROLE_INSTALLER
    },
    filteredRows() {
      return this.rows.filter(row =>
          (this.stageFilter === null || row.stage === this.stageFilter)
          && (!this.onlyMyTurn || this.nextAction(row))
      )
    }
  },

  methods: {

    // اقدام بعدی گردش کار برای کاربر جاری (در صورت داشتن دسترسی)
    nextAction(row) {
      const isAdmin = this.userRole === ROLE_ADMIN

      switch (row.stage) {
        case STAGE.ASSIGNED:
          if (!this.isInstaller || this.isAssignedInstaller(row))
            return {mode: 'installer-submit', label: 'ثبت اقلام مصرفی', icon: 'inventory', color: 'blue'}
          return null
        case STAGE.NEEDS_FIX:
          if (!this.isInstaller || this.isAssignedInstaller(row))
            return {mode: 'installer-submit', label: 'ثبت رفع عیوب', icon: 'build', color: 'negative'}
          return null
        case STAGE.INSTALLER_SUBMITTED:
          return this.isInstaller ? null
              : {mode: 'send-to-review', label: 'ارسال برای کارشناس', icon: 'engineering', color: 'deep-purple'}
        case STAGE.UNDER_REVIEW:
          return isAdmin || row.technical_expert_id === this.userId
              ? {mode: 'review', label: 'بررسی کارشناس', icon: 'fact_check', color: 'orange-8'}
              : null
        case STAGE.APPROVED:
          return this.isInstaller ? null
              : {mode: 'complete', label: 'تکمیل نهایی', icon: 'task_alt', color: 'positive'}
        default:
          return null
      }
    },

    // installer_mode = 1: کل پروژه به یک نصاب ارجاع شده (در ردیف panel ذخیره می شود)
    rolesOf(row) {
      if (row && Number(row.installer_mode) === 1)
        return [{key: 'panel', label: 'نصاب کل پروژه', shortLabel: 'نصاب پروژه'}]
      return this.installerRoles
    },

    isAssignedInstaller(row) {
      return (row.installer_appointments || []).some(a => a.user_id === this.userId && a.status !== APPOINTMENT_CANCELED)
    },

    openWorkflow(row, mode) {
      this.workflowService = row
      this.workflowMode = mode
      this.workflowDlg = true
    },

    stageColor(stage) {
      return {
        [STAGE.DRAFT]: 'grey-6',
        [STAGE.ASSIGNED]: 'blue',
        [STAGE.INSTALLER_SUBMITTED]: 'deep-purple',
        [STAGE.UNDER_REVIEW]: 'orange-8',
        [STAGE.NEEDS_FIX]: 'negative',
        [STAGE.APPROVED]: 'teal',
        [STAGE.COMPLETED]: 'positive'
      }[stage] || 'grey'
    },

    getData() {
      this.loading = true
      api.get('installation-service/list')
          .then(response => {
            this.rows = response.data.data
          })
          .catch((error) => {
            this.notifyError(error)
          })
          .finally(() => {
            this.loading = false
          })
    },

    purchaseSourceLabel(val) {
      return val === 1 ? 'خرید شده از ما' : 'خریداری شده از جای دیگر'
    },
    purchaseSourceColor(val) {
      return val === 1 ? 'teal' : 'blue-grey'
    },

    installerAppointment(row, roleKey) {
      const typeMap = {panel: 1, wiring: 2, commissioning: 3}
      const appointments = row && row.installer_appointments ? row.installer_appointments : []
      return appointments.find(a => a.type === typeMap[roleKey] || a.type === roleKey) || null
    },

    installerBadgeText(row, roleKey) {
      const appointment = this.installerAppointment(row, roleKey)
      if (!appointment) return 'ثبت نشده'
      return appointment.installer ? appointment.installer.name : 'ثبت نشده'
    },

    installerFullText(row, roleKey) {
      const appointment = this.installerAppointment(row, roleKey)
      if (!appointment) return 'اطلاعاتی ثبت نشده است'
      const name = appointment.installer ? appointment.installer.name : '-'
      const date = appointment.jalali_date || '-'
      const time = appointment.start_time ? appointment.start_time.substring(0, 5) : '-'
      return `${name} | ${date} ساعت ${time}`
    },

    installerStatusLabel(row, roleKey) {
      const appointment = this.installerAppointment(row, roleKey)
      if (!appointment) return 'ثبت نشده'
      if (appointment.status === 2) return 'انجام شده'
      if (appointment.status === 3) return 'لغو شده'
      return 'رزرو شده'
    },

    installerBadgeColor(row, roleKey) {
      const appointment = this.installerAppointment(row, roleKey)
      if (!appointment) return 'grey-5'
      if (appointment.status === 2) return 'positive'
      if (appointment.status === 3) return 'negative'
      return 'blue'
    },

    // returns 'YYYY-MM-DD' for a Date object, using local time (avoids UTC day-shift issues)
    toDateKey(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    // mirrors backend logic:
    // whereHas('installerAppointments', date in [today, tomorrow] AND status != CANCELED)
    isUrgentAppointment(appointment) {
      if (!appointment || !appointment.date) return false
      if (appointment.status === APPOINTMENT_CANCELED) return false

      const appointmentKey = String(appointment.date).substring(0, 10)

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      return appointmentKey === this.toDateKey(today) || appointmentKey === this.toDateKey(tomorrow)
    },

    isUrgentInstallation(row) {
      return this.rolesOf(row).some(role =>
          this.isUrgentAppointment(this.installerAppointment(row, role.key))
      )
    },

    showDetails(id) {
      this.detailsDlg = true
      this.detailsLoading = true
      this.details = null

      api.get(`installation-service/${id}`)
          .then(response => {
            this.details = response.data.data
          })
          .catch((error) => {
            this.notifyError(error)
            this.detailsDlg = false
          })
          .finally(() => {
            this.detailsLoading = false
          })
    },

    showConsumables(row) {
      this.consumablesRow = row
      this.consumablesDlg = true
    },

    deleteConfirmation(id) {
      this.deleteConfirmDialog = true
      this.itemFocusingId = id
    },

    deleteItem() {
      this.deleting = true

      api.delete('installation-service/destroy/'+ this.itemFocusingId)
          .then(response => {
            this.$q.notify({
              type: 'positive',
              position: 'center',
              timeout: 1000,
              message: response.data.message
            })
            this.deleteConfirmDialog = false
            this.getData()
          })
          .catch((error) => {
            this.notifyError(error)
          })
          .finally(() => {
            this.deleting = false
          })
    },

    notifyError(error) {
      const message = error?.response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
      this.$q.notify({timeout: 4000, position: 'center', type: 'negative', message})
    },

    exportTable() {
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
          this.rows.map(row => this.columns.map(col => wrapCsvValue(
              typeof col.field === 'function'
                  ? col.field(row)
                  : row[col.field === void 0 ? col.name : col.field],
              col.format
          )).join(','))
      ).join('\r\n')

      const status = exportFile(
          'installation-services-export.csv',
          "\ufeff" + content,
          'text/csv')

      if (status !== true) {
        this.$q.notify({
          message: 'مرورگر دسترسی دانلود فایل را بسته است.',
          color: 'negative',
          icon: 'warning'
        })
      }
    }
  },

  created() {
    this.getData()
  }
}
</script>

<style scoped>
.row-urgent-installation :deep(td) {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

.legend-box-urgent {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.4);
}
</style>
