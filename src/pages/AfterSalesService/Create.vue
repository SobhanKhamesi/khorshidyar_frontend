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
                  <q-input mask="####/##/##" outlined dir="ltr" v-model="followUpDate" label="تاریخ مراجعه نصاب">
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
              <div class="text-subtitle1 q-mb-md">سرویس نصب مرتبط</div>

              <q-select
                  option-label="title"
                  option-value="id"
                  outlined
                  clearable
                  v-model="installationService"
                  label="سرویس نصب تکمیل شده‌ی مشتری (اختیاری)"
                  :loading="loadingInstallations"
                  :options="installationOptions"
                  @update:model-value="onInstallationSelected">
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.title }}</q-item-label>
                      <q-item-label caption v-if="scope.opt.project_installer">
                        نصاب پروژه: {{ scope.opt.project_installer.name }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">سرویس نصب تکمیل شده‌ای برای این مشتری یافت نشد</q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div class="text-caption text-grey-7 q-mt-sm">
                با انتخاب سرویس نصب، نصاب همان پروژه به عنوان مسئول این خدمت انتخاب می‌شود.
                پس از ثبت، نام و شماره نصاب و تاریخ مراجعه برای مشتری و اطلاع کار جدید برای نصاب پیامک می‌شود.
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
                      <div v-if="service.installation_service_id">مرتبط با {{ service.installation_service_title || 'سرویس نصب' }}</div>
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

      installationService: null,
      installationOptions: [],
      loadingInstallations: false,

      completeDlg: false,
      completingServiceId: null,
      completeResolutionDescription: '',
      sendSms: true,

    }
  },

  methods: {
    // فقط جهت نمایش اطلاعاتی (ساعت کاری نصاب + بازه‌های از قبل رزرو شده)؛
    // هیچ بازه‌ی آماده‌ای برای کلیک/انتخاب نمی‌سازد. کاربر همچنان خودش ساعت
    // شروع و پایان دلخواه را در فرم تایپ می‌کند.

    // سرویس‌های نصب تکمیل شده‌ی مشتری به همراه نصاب پروژه
    getCustomerInstallations(customerId, selectedId = null) {
      this.installationOptions = []
      if (!customerId) return
      this.loadingInstallations = true
      api.get(`after-sales-service/customer-installations/${customerId}`)
          .then(response => {
            this.installationOptions = response.data.data
            if (selectedId)
              this.installationService = this.installationOptions.find(s => s.id === selectedId) || this.installationService
          })
          .finally(() => {
            this.loadingInstallations = false
          })
    },

    // مسئول خدمت پس از فروش، نصاب خود پروژه است
    onInstallationSelected(service) {
      const installer = service && service.project_installer
      if (!installer) return
      this.responsibleUserId = this.responsibleUserOptions.find(u => u.id === installer.id) || installer
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
      this.installationService = null
      this.installationOptions = []
      if (!customer) return
      this.getCustomerServiceHistory(customer.id)
      this.getCustomerInstallations(customer.id)
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
      this.installationService = null
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
      if (!this.followUpDate) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'تاریخ مراجعه نصاب را وارد کنید'})
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
        installation_service_id: this.installationService ? this.installationService.id : null,
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
  }
}
</script>

<style scoped>

</style>
