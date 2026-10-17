<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="submitForm()">

      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ثبت خدمات پس از فروش</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-select
                  option-label="fullName"
                  option-value="id"
                  outlined
                  v-model="customer_id"
                  use-input
                  clearable
                  label="مشتری"
                  :options="customersAndLeadsOptions"
                  @filter="filterCustomers"
                  @update:model-value="onCustomerSelected"
                  behavior="dialog">

                <template v-slot:after>
                  <q-btn @click.prevent="newCustomerDlg = true" icon="person_add" dense flat rounded/>
                </template>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-input mask="####/##/##" outlined dir="ltr" v-model="requestDate" label="تاریخ ثبت درخواست">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="requestDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md q-mt-sm" v-if="customer_id">

        <div class="col-md-8 col-xs-12 q-gutter-y-md">

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">جزئیات درخواست</div>
              <div class="row q-col-gutter-md">

                <div class="col-12">
                  <q-input outlined autogrow v-model="problemDescription" label="مشکل چیست؟"/>
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-select
                      option-label="title"
                      option-value="id"
                      clearable
                      outlined
                      v-model="serviceTypeId"
                      label="نوع خدمت"
                      :options="serviceTypeOptions">

                    <template v-slot:after>
                      <q-btn @click.prevent="newServiceTypeDlg = true" icon="add" dense flat rounded/>
                    </template>

                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-select
                      option-label="name"
                      option-value="id"
                      clearable
                      outlined
                      v-model="responsibleUserId"
                      label="مسئول این خدمت"
                      :options="responsibleUserOptions">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-input mask="####/##/##" outlined dir="ltr" v-model="followUpDate" label="تاریخ پیگیری مجدد">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date today-btn
                                  calendar="persian"
                                  v-model="followUpDate" mask="YYYY-MM-DD">
                            <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

              </div>
            </q-card-section>
          </q-card>
          <q-card flat class="border-radius-card q-mt-md">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات نصاب</div>

              <div class="row q-col-gutter-md items-start">
                <div class="col-md-4 col-xs-12">
                  <q-select
                      option-label="name"
                      option-value="id"
                      outlined
                      dense
                      v-model="selectedInstaller"
                      label="انتخاب نصاب"
                      :options="installerOptions"
                      clearable
                      @update:model-value="onInstallerContextChanged">
                    <template v-slot:after>
                      <q-btn @click.prevent="openNewInstallerDlg" icon="person_add" dense flat rounded/>
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-md-3 col-xs-6">
                  <q-input mask="####/##/##" outlined dense dir="ltr"
                           v-model="installerDate" label="تاریخ نصب"
                           @update:model-value="onInstallerContextChanged">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date today-btn
                                  calendar="persian"
                                  v-model="installerDate" mask="YYYY-MM-DD"
                                  @update:model-value="onInstallerContextChanged">
                            <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-md-2 col-xs-6">
                  <q-input outlined dense dir="ltr" v-model="installerStartTime" label="ساعت شروع">
                    <template v-slot:prepend>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-time v-model="installerStartTime" format24h>
                            <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-md-2 col-xs-6">
                  <q-input outlined dense dir="ltr" v-model="installerEndTime" label="ساعت پایان">
                    <template v-slot:prepend>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-time v-model="installerEndTime" format24h>
                            <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-md-1 col-xs-12 flex flex-center">
                  <q-btn
                      round
                      flat
                      color="primary"
                      icon="event_available"
                      :disable="!selectedInstaller"
                      @click.prevent="openInstallerCalendar">
                    <q-tooltip>تقویم کاری نصاب</q-tooltip>
                  </q-btn>
                </div>
              </div>

            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-4 col-xs-12 q-gutter-y-md">
          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات مشتری</div>
              <q-list dense>
                <q-item>
                  <q-item-section side><q-icon name="person"/></q-item-section>
                  <q-item-section>{{ customer_id.name || customer_id.fullName }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.contact_number">
                  <q-item-section side><q-icon name="call"/></q-item-section>
                  <q-item-section dir="ltr" class="text-right">{{ customer_id.contact_number }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.address">
                  <q-item-section side><q-icon name="place"/></q-item-section>
                  <q-item-section>{{ customer_id.address }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-subtitle1">سابقه خدمات پس از فروش</div>
                <q-spinner v-if="loadingHistory" color="accent" size="20px"/>
              </div>

              <div v-if="!loadingHistory && !customerServiceHistory.length" class="text-grey text-caption">
                سابقه‌ای برای این مشتری ثبت نشده است
              </div>

              <q-list bordered separator v-else>
                <q-item
                    v-for="service in customerServiceHistory"
                    :key="service.id">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ service.problem }}</q-item-label>

                    <q-item-label caption class="q-mt-xs">
                      <q-badge :color="statusColor(service.status)" :label="service.status_label"/>
                      <q-badge outline color="grey-7" class="q-mx-xs" :label="service.source_label"/>
                    </q-item-label>

                    <q-item-label caption class="text-grey-7 q-mt-xs q-gutter-y-sm">
                      <div v-if="service.service_type">نوع خدمت: {{ service.service_type.title }}</div>
                      <div v-if="service.responsible_user">مسئول: {{ service.responsible_user.name }}</div>
                      <div>تاریخ ثبت درخواست: {{ service.jalali_request_date || '—' }}</div>
                      <div v-if="service.jalali_follow_up_date">تاریخ پیگیری مجدد: {{ service.jalali_follow_up_date }}</div>
                      <div v-if="service.installation_service_id">مرتبط با سرویس نصب #{{ service.installation_service_id }}</div>
                      <div v-if="service.resolution_description">نتیجه پیگیری: {{ service.resolution_description }}</div>
                    </q-item-label>

                    <div class="q-mt-sm" v-if="isOpen(service)">
                      <q-btn dense flat rounded size="sm" color="positive" label="تکمیل کردن"
                             @click="openCompleteDialog(service)"/>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

        </div>
      </div>

      <q-card-actions v-if="customer_id">
        <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت خدمت پس از فروش"/>
      </q-card-actions>
    </q-form>

    <q-dialog v-model="newInstallerDlg">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewInstaller()">
          <q-card-section>
            <div class="text-h6">نصاب جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">
              <q-input outlined v-model="newInstallerName" label="نام"/>
            </div>
            <div class="q-gutter-md q-mt-sm">
              <q-input outlined v-model="newInstallerUserName" label="نام کاربری"/>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="installerCalendarDlg">
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">
            تقویم کاری نصاب
            <span v-if="selectedInstaller" class="text-grey text-subtitle2">
          ({{ selectedInstaller.name }})
        </span>
          </div>
        </q-card-section>
        <q-separator/>

        <q-card-section>
          <div v-if="installerCalendarLoading" class="text-center text-grey q-pa-md">
            در حال دریافت اطلاعات...
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">روزهای کاری</div>

            <q-list bordered separator dense v-if="installerWorkingDays.length">
              <q-item v-for="day in installerWorkingDays" :key="day.weekday">
                <q-item-section>{{ weekdayLabel(day.weekday) }}</q-item-section>
                <q-item-section side>
                  <q-badge :color="day.is_active ? 'positive' : 'grey-5'">
                    {{ day.is_active ? 'فعال' : 'غیرفعال' }}
                  </q-badge>
                </q-item-section>
                <q-item-section side v-if="day.is_active" class="text-grey-8" dir="ltr">
                  {{ (day.start_time || '').substring(0, 5) }} - {{ (day.end_time || '').substring(0, 5) }}
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-caption">
              برای این نصاب روز کاری ثبت نشده است
            </div>

            <q-separator class="q-my-md"/>

            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">
                وضعیت روز انتخابی
                <span v-if="installerDate" class="text-grey-7">({{ installerDate }})</span>
              </div>
              <q-btn
                  v-if="installerDate"
                  flat dense round icon="refresh"
                  @click="fetchInstallerDayAvailability(selectedInstaller.id, installerDate)">
                <q-tooltip>بروزرسانی</q-tooltip>
              </q-btn>
            </div>

            <div v-if="!installerDate" class="text-grey text-caption">
              برای مشاهده‌ی ساعت کاری و نوبت‌های رزرو شده، ابتدا تاریخ نصب را در فرم انتخاب کنید
            </div>
            <div v-else-if="installerDayAvailabilityLoading" class="text-center text-grey q-pa-md">
              در حال دریافت اطلاعات روز...
            </div>
            <div v-else-if="installerDayAvailability && !installerDayAvailability.is_working_day"
                 class="text-negative text-caption">
              این تاریخ جزو روزهای کاری نصاب نیست
            </div>
            <div v-else-if="installerDayAvailability">
              <div class="text-caption text-grey-8 q-mb-sm" dir="ltr">
                ساعت کاری: {{ installerDayAvailability.work_start }} - {{ installerDayAvailability.work_end }}
              </div>
              <div class="text-caption text-grey-8 q-mb-sm">رزرو های روز انتخابی : </div>
              <div v-if="!installerDayAvailability.busy.length" class="text-grey text-caption">
                در حال حاضر نوبت رزرو شده‌ای برای این روز ثبت نشده است
              </div>
              <div v-else class="row q-gutter-sm">
                <q-chip
                    v-for="(range, index) in installerDayAvailability.busy"
                    :key="index"
                    color="grey-5"
                    text-color="white">
                  {{ range.start }} - {{ range.end }}
                </q-chip>
              </div>

              <div class="text-caption text-grey-7 q-mt-sm">
                ساعت شروع/پایانی که در فرم وارد می‌کنید باید در بازه‌ی ساعت کاری بالا و خارج
                از بازه‌های رزرو شده باشد.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newCustomerDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewCustomer()">
          <q-card-section>
            <div class="text-h6">مشتری جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">
              <div>
                <q-radio v-model="newCustomerGender" :val="0" label="آقا"/>
                <q-radio v-model="newCustomerGender" :val="1" label="خانم"/>
              </div>
              <q-input outlined v-model="newCustomerName" label="نام و نام خانوادگی"/>
              <q-input outlined dir="ltr" v-model="newCustomerContactNumber" label="شماره تلفن همراه"/>
              <q-input outlined v-model="newCustomerAddress" label="آدرس"/>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newServiceTypeDlg">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewServiceType()">
          <q-card-section>
            <div class="text-h6">نوع خدمت جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input outlined v-model="newServiceTypeName" label="عنوان نوع خدمت"/>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="افزودن" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="completeDlg">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitComplete()">
          <q-card-section>
            <div class="text-h6">تکمیل خدمت پس از فروش</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input outlined autogrow v-model="completeResolutionDescription" label="توضیحات نتیجه پیگیری"/>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="text-bold">آیا پیامک لینک نظرسنجی ارسال شود؟</div>
            <div class="row items-center q-gutter-md">
              <q-radio v-model="sendSms" :val="true" label="بله" />
              <q-radio v-model="sendSms" :val="false" label="خیر" />
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="positive" rounded label="تکمیل" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

const STATUS_PENDING = 1
const STATUS_IN_PROGRESS = 2
const STATUS_COMPLETED = 3
const STATUS_CANCELED = 4

export default {
  name: "CreateAfterSalesService",

  data() {
    return {
      customer_id: null,
      requestDate: '',

      newCustomerDlg: false,
      newCustomerName: '',
      newCustomerContactNumber: '',
      newCustomerAddress: '',
      newCustomerGender: 0,

      customersAndLeads: [],
      customersAndLeadsOptions: [],

      customerServiceHistory: [],
      loadingHistory: false,

      problemDescription: '',

      serviceTypeId: null,
      serviceTypeOptions: [],
      newServiceTypeDlg: false,
      newServiceTypeName: '',

      responsibleUserId: null,
      responsibleUserOptions: [],

      followUpDate: '',

      completeDlg: false,
      completingServiceId: null,
      completeResolutionDescription: '',
      sendSms: true,

      selectedInstaller: null,
      installerDate: '',
      installerStartTime: '',
      installerEndTime: '',
      installerOptions: [],
      newInstallerDlg: false,
      newInstallerUserName: '',
      newInstallerName: '',
      installerCalendarDlg: false,
      installerCalendarLoading: false,
      installerWorkingDays: [],
      installerDayAvailability: null,
      installerDayAvailabilityLoading: false
    }
  },

  methods: {
    openInstallerCalendar() {
      if (!this.selectedInstaller) return
      this.installerCalendarDlg = true
      this.installerWorkingDays = []
      this.installerDayAvailability = null
      this.installerCalendarLoading = true
      api.get(`installer-working-days/${this.selectedInstaller.id}`)
          .then(response => {
            this.installerWorkingDays = response.data.data
          })
          .catch(this.notifyError)
          .finally(() => { this.installerCalendarLoading = false })
      if (this.installerDate) {
        this.fetchInstallerDayAvailability(this.selectedInstaller.id, this.installerDate)
      }
    },

    // فقط جهت نمایش اطلاعاتی (ساعت کاری نصاب + بازه‌های از قبل رزرو شده)؛
    // هیچ بازه‌ی آماده‌ای برای کلیک/انتخاب نمی‌سازد. کاربر همچنان خودش ساعت
    // شروع و پایان دلخواه را در فرم تایپ می‌کند.
    fetchInstallerDayAvailability(installerId, date) {
      if (!installerId || !date) return
      this.installerDayAvailabilityLoading = true
      api.get(`installer-appointments/available-slots/${installerId}`, {
        params: {date}
      })
          .then(response => {
            this.installerDayAvailability = response.data.data
          })
          .catch(this.notifyError)
          .finally(() => { this.installerDayAvailabilityLoading = false })
    },

    onInstallerContextChanged() {
      this.installerDayAvailability = null
      if (this.installerCalendarDlg && this.selectedInstaller && this.installerDate) {
        this.fetchInstallerDayAvailability(this.selectedInstaller.id, this.installerDate)
      }
    },

    getInstallers() {
      api.get('installers')
          .then(response => {
            this.installerOptions = response.data.data
          })
          .catch((error) => this.notifyError(error))
    },

    openNewInstallerDlg(roleKey) {
      this.newInstallerTargetRole = roleKey
      this.newInstallerDlg = true
    },

    submitNewInstaller() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.name = this.newInstallerName
      payload.username = this.newInstallerUserName

      api.post('users/quick-add', payload)
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getInstallers()

            if (this.newInstallerTargetRole) {
              this.installers[this.newInstallerTargetRole].installer = response.data.data
            }

            this.newInstallerName = ''
            this.newInstallerTargetRole = null
            this.newInstallerDlg = false
            this.$q.loading.hide();
          })
          .catch((error) => {
            this.$q.loading.hide();
            this.notifyError(error)
          });
    },

    weekdayLabel(weekday) {
      const labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
      return labels[weekday] ?? '-'
    },

    notifyError(error) {
      const message = error?.response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
      this.$q.notify({ timeout: 4000, position: 'center', type: 'negative', message })
    },

    getCustomersAndLeads() {
      api.get('customers/all')
          .then(response => {
            this.customersAndLeadsOptions = response.data.data
            this.customersAndLeads = response.data.data
          })
    },

    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          this.customersAndLeadsOptions = this.customersAndLeads
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.customersAndLeadsOptions = this.customersAndLeads.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
    },

    onCustomerSelected(customer) {
      this.customerServiceHistory = []
      if (!customer) return
      this.getCustomerServiceHistory(customer.id)
    },
    submitNewCustomer() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.contact_number = this.newCustomerContactNumber
      payload.name = this.newCustomerName
      payload.gender = this.newCustomerGender
      payload.address = this.newCustomerAddress

      api.post('customers/quick-add', payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getCustomersAndLeads();
            this.customer_id = response.data.data
            this.onCustomerSelected(response.data.data)

            this.newCustomerContactNumber = ''
            this.newCustomerName = ''
            this.newCustomerAddress = ''
            this.newCustomerGender = 0
            this.newCustomerDlg = false
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          });
    },

    getCustomerServiceHistory(customerId) {
      this.loadingHistory = true

      api.get(`after-sales-service/customer-history/${customerId}`)
          .then(response => {
            this.customerServiceHistory = response.data.data
          })
          .finally(() => {
            this.loadingHistory = false
          })
    },

    statusColor(status) {
      const colors = {
        [STATUS_PENDING]: 'orange',
        [STATUS_IN_PROGRESS]: 'blue',
        [STATUS_COMPLETED]: 'positive',
        [STATUS_CANCELED]: 'grey'
      }
      return colors[status] || 'grey'
    },

    isOpen(service) {
      return service.status !== STATUS_COMPLETED && service.status !== STATUS_CANCELED
    },

    openCompleteDialog(service) {
      this.completingServiceId = service.id
      this.completeResolutionDescription = ''
      this.completeDlg = true
    },

    submitComplete() {
      if (!this.completeResolutionDescription) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'توضیحات نتیجه پیگیری را وارد کنید'})
        return
      }

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      api.put(`after-sales-service/complete/${this.completingServiceId}`, {
        resolution_description: this.completeResolutionDescription,
        send_sms : this.sendSms
      })
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.completeDlg = false

            if (this.customer_id) {
              this.getCustomerServiceHistory(this.customer_id.id)
            }

            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          });
    },

    getServiceTypes() {
      api.get('service_types/list')
          .then(response => {
            this.serviceTypeOptions = response.data.data
          })
    },

    submitNewServiceType() {
      if (!this.newServiceTypeName) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'عنوان نوع خدمت را وارد کنید'})
        return
      }

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      api.post('service_types/quick-add', {title: this.newServiceTypeName})
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getServiceTypes()
            this.serviceTypeId = response.data.data

            this.newServiceTypeName = ''
            this.newServiceTypeDlg = false
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          });
    },

    getResponsibleUsers() {
      api.get('users')
          .then(response => {
            this.responsibleUserOptions = response.data.data
          })
    },

    resetServiceFields() {
      this.problemDescription = ''
      this.serviceTypeId = null
      this.responsibleUserId = null
      this.followUpDate = ''
    },

    submitForm() {
      if (!this.problemDescription) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'مشکل را وارد کنید'})
        return
      }
      if (!this.serviceTypeId) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'نوع خدمت را انتخاب کنید'})
        return
      }
      if (!this.responsibleUserId) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'مسئول این خدمت را انتخاب کنید'})
        return
      }
      if (this.selectedInstaller && (!this.installerDate || !this.installerStartTime || !this.installerEndTime)) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'تاریخ و ساعت شروع/پایان نصب را کامل وارد کنید'})
        return
      }
      if (this.installerStartTime && this.installerEndTime && this.installerStartTime >= this.installerEndTime) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'ساعت پایان باید بعد از ساعت شروع باشد'})
        return
      }

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        customer_id: this.customer_id.id,
        request_date: this.requestDate,
        problem: this.problemDescription,
        service_type_id: this.serviceTypeId ? this.serviceTypeId.id : null,
        responsible_user_id: this.responsibleUserId ? this.responsibleUserId.id : null,
        follow_up_date: this.followUpDate,
        installer_id: this.selectedInstaller ? this.selectedInstaller.id : null,
        installer_date: this.installerDate,
        installer_start_time: this.installerStartTime,
        installer_end_time: this.installerEndTime,
      }

      api.post('after-sales-service/store', payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getCustomerServiceHistory(this.customer_id.id)
            this.resetServiceFields()

            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          });
    }
  },

  created() {
    this.getCustomersAndLeads();
    this.getServiceTypes();
    this.getResponsibleUsers();
    this.getInstallers();
  }
}
</script>

<style scoped>

</style>
