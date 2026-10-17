<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست سرویس های نصب</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div class="row items-center q-gutter-x-sm q-mb-sm">
          <div class="legend-box legend-box-urgent"></div>
          <span class="text-caption text-grey-8">دارای نصب امروز یا فردا</span>
        </div>
        <q-table
            :loading="loading"
            flat bordered class="border-radius-table"
            :rows="rows"
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

              <q-td key="status" :props="props">
                <q-badge :color="statusColor(props.row.status)">
                  {{ statusLabel(props.row.status) }}
                </q-badge>
              </q-td>

              <q-td key="survey_date" :props="props">
                {{ props.row.jalali_survey_date || props.row.survey_date || '-' }}
              </q-td>

              <q-td key="technical_expert" :props="props">
                {{ props.row.technical_expert ? props.row.technical_expert.name : '-' }}
              </q-td>

              <q-td key="installers" :props="props">
                <div class="q-gutter-xs">
                  <q-badge
                      v-for="role in installerRoles"
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
                <q-btn
                    @click.prevent="showDetails(props.row.id)"
                    title="مشخصات بیشتر" dense round color="brown" icon="info"/>
                <q-btn
                    @click.prevent="showConsumables(props.row.id)"
                    title="اقلام مصرفی" dense round color="teal" icon="inventory_2"/>

                <q-btn :href="'/v1/print_install_service/' + props.row.id" target="_blank" title="پرینت" dense round
                       color="positive" icon="print"/>

                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                       :to="{ name:'InstallServiceEdit', params:{id:props.row.id} }"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id)"/>
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
              <div class="text-caption text-grey-7">وضعیت</div>
              <q-badge :color="statusColor(details.status)">
                {{ statusLabel(details.status) }}
              </q-badge>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">تاریخ بازدید</div>
              <div class="text-body1">{{ details.jalali_survey_date || details.survey_date || '-' }}</div>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">کارشناس فنی</div>
              <div class="text-body1">{{ details.technical_expert ? details.technical_expert.name : '-' }}</div>
            </div>

            <div class="col-12" v-if="details.description">
              <div class="text-caption text-grey-7">توضیحات</div>
              <div class="text-body1">{{ details.description }}</div>
            </div>

            <div class="col-12">
              <q-separator class="q-my-sm"/>
              <div class="text-subtitle2 q-mb-sm">نصاب ها</div>

              <q-list bordered separator dense>
                <q-item v-for="role in installerRoles" :key="role.key">
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

          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="consumablesDlg">
      <q-card style="width: 500px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">اقلام مصرفی سرویس نصب</div>
        </q-card-section>

        <q-separator/>

        <q-card-section v-if="consumablesLoading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </q-card-section>

        <q-card-section v-else-if="!consumables.length" class="text-center text-grey q-pa-md">
          اقلام مصرفی برای این سرویس نصب ثبت نشده است
        </q-card-section>

        <q-card-section v-else>
          <q-list bordered separator dense>
            <q-item v-for="item in consumables" :key="item.id">
              <q-item-section>
                <q-item-label>{{ item.product ? item.product.name : '-' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge color="teal">{{ item.quantity }} عدد</q-badge>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import {exportFile} from 'quasar'
import {api} from 'boot/axios'

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

  data() {
    return {
      loading: true,
      filter: '',
      rows: [],

      installerRoles: [
        {key: 'panel', label: 'نصاب پنل', shortLabel: 'پنل'},
        {key: 'wiring', label: 'نصاب سیم کشی', shortLabel: 'سیم کشی'},
        {key: 'commissioning', label: 'نصاب راه اندازی', shortLabel: 'راه اندازی'}
      ],

      columns: [
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'purchase_source', field: 'purchase_source', align: 'center', label: 'نوع خرید'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'survey_date', field: 'survey_date', align: 'center', label: 'تاریخ بازدید', sortable: true},
        {name: 'technical_expert', field: 'technical_expert', align: 'center', label: 'کارشناس فنی'},
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
      consumablesLoading: false,
      consumables: []
    }
  },

  methods: {

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

    statusLabel(val) {
      return val === 2 ? 'نهایی' : 'موقت'
    },
    statusColor(val) {
      return val === 2 ? 'positive' : 'orange'
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
      return this.installerRoles.some(role =>
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

    showConsumables(id) {
      this.consumablesDlg = true
      this.consumablesLoading = true
      this.consumables = []

      api.get(`installation-service/${id}`)
          .then(response => {
            this.consumables = response.data.data.installation_service_items || []
          })
          .catch((error) => {
            this.notifyError(error)
            this.consumablesDlg = false
          })
          .finally(() => {
            this.consumablesLoading = false
          })
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
