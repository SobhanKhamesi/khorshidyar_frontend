<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="submitForm('final')">

      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ثبت سرویس نصب جدید</div>
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
                  label="مشتری"
                  clearable
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
              <div class="q-mb-xs">این نصب مربوط به کدام خرید است؟</div>
              <q-radio v-model="purchaseSource" val="1" label="خرید شده از ما"
                       @update:model-value="onPurchaseSourceChange"/>
              <q-radio v-model="purchaseSource" val="2" label="خریداری شده از جای دیگر"
                       @update:model-value="onPurchaseSourceChange"/>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md border-radius-card q-mt-sm" v-if="customer_id">

        <div class="col-md-8 col-xs-12 q-gutter-y-md">

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات نصب</div>
              <div class="row q-col-gutter-md">

                <div class="col-md-6 col-xs-12">
                  <q-input outlined v-model="address" label="آدرس" autogrow/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dir="ltr" v-model="contactNumber" label="شماره تماس"/>
                </div>

                <div class="col-12">
                  <q-input
                      v-if="purchaseSource !== '1' || !selectedAutomationId"
                      outlined
                      autogrow
                      v-model="productDescription"
                      label="توضیحات محصول / سیستم نصب شده"
                  />
                </div>

              </div>
            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات نصاب ها</div>

              <div v-for="role in installerRoles" :key="role.key" class="q-mb-lg">
                <div class="text-caption text-grey-8 q-mb-xs">{{ role.label }}</div>
                <div class="row q-col-gutter-md items-start">

                  <div class="col-md-5 col-xs-12">
                    <q-select
                        option-label="name"
                        option-value="id"
                        outlined
                        dense
                        clearable
                        v-model="installers[role.key].installer"
                        label="انتخاب نصاب"
                        :options="installerOptions"
                        @update:model-value="onInstallerContextChanged(role)">
                      <template v-slot:after>
                        <q-btn @click.prevent="openNewInstallerDlg(role.key)" icon="person_add" dense flat rounded/>
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
                             v-model="installers[role.key].date" label="تاریخ نصب"
                             @update:model-value="onInstallerContextChanged(role)">
                      <template v-slot:prepend>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date today-btn
                                    calendar="persian"
                                    v-model="installers[role.key].date" mask="YYYY-MM-DD"
                                    @update:model-value="onInstallerContextChanged(role)">
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-md-2 col-xs-6">
                    <q-input outlined dense dir="ltr" v-model="installers[role.key].startTime" label="ساعت شروع">
                      <template v-slot:prepend>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time v-model="installers[role.key].startTime" format24h>
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-md-2 col-xs-6">
                    <q-input outlined dense dir="ltr" v-model="installers[role.key].endTime" label="ساعت پایان">
                      <template v-slot:prepend>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time v-model="installers[role.key].endTime" format24h>
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                </div>
                <q-separator v-if="role.key !== installerRoles[installerRoles.length - 1].key" class="q-mt-md"/>
              </div>

            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اقلام مصرفی</div>

              <div
                  v-for="(item, index) in consumableItems"
                  :key="index"
                  class="row q-col-gutter-md items-start q-mb-sm">

                <div class="col-md-7 col-xs-12">
                  <q-select
                      option-label="name"
                      option-value="id"
                      outlined
                      dense
                      use-input
                      clearable
                      v-model="item.product"
                      label="انتخاب محصول"
                      :options="productOptions"
                      @filter="filterProducts"
                      behavior="dialog">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-md-3 col-xs-8">
                  <q-input
                      outlined
                      dense
                      type="number"
                      min="0"
                      step="1"
                      v-model.number="item.quantity"
                      label="تعداد"/>
                </div>

                <div class="col-md-2 col-xs-4 flex flex-center">
                  <q-btn
                      round
                      flat
                      dense
                      color="negative"
                      icon="delete"
                      @click.prevent="removeConsumableRow(index)">
                    <q-tooltip>حذف ردیف</q-tooltip>
                  </q-btn>
                </div>

              </div>

              <q-btn
                  outline
                  rounded
                  dense
                  color="accent"
                  icon="add"
                  label="افزودن ردیف"
                  @click.prevent="addConsumableRow"/>
            </q-card-section>
          </q-card>

        </div>

        <div class="col-md-4 col-xs-12 q-gutter-y-md">

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات مشتری</div>
              <q-list dense>
                <q-item>
                  <q-item-section side>
                    <q-icon name="person"/>
                  </q-item-section>
                  <q-item-section>{{ customer_id.name || customer_id.fullName }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.contact_number">
                  <q-item-section side>
                    <q-icon name="call"/>
                  </q-item-section>
                  <q-item-section dir="ltr" class="text-right">{{ customer_id.contact_number }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.address">
                  <q-item-section side>
                    <q-icon name="place"/>
                  </q-item-section>
                  <q-item-section>{{ customer_id.address }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">فروش ها موفق مشتری</div>

              <div v-if="automationsLoading" class="text-grey text-caption">
                در حال دریافت اطلاعات...
              </div>

              <div v-else-if="!customerAutomations.length" class="text-grey text-caption">
                هیچ فروش موفقی برای این مشتری ثبت نشده است
              </div>

              <q-list bordered separator v-else>
                <q-item
                    v-for="automation in customerAutomations"
                    :key="automation.id"
                    clickable
                    :disable="purchaseSource !== '1'"
                    :active="selectedAutomationId === automation.id"
                    active-class="bg-accent text-white"
                    @click="selectAutomation(automation)">
                  <q-item-section>
                    <q-item-label>
                      {{ surveyTypeLabel(automation.survey_type) + ' ( ' + (automation.invoice_number || '') + ' ) ' }}
                    </q-item-label>
                    <q-item-label caption
                                  :class="selectedAutomationId === automation.id ? 'text-white' : 'text-grey-7'">
                      تاریخ: {{ automation.jalali_date }}
                    </q-item-label>
                    <q-item-label caption
                                  v-if="automation.description"
                                  :class="selectedAutomationId === automation.id ? 'text-white' : 'text-grey-7'">
                      {{ automation.description }}
                    </q-item-label>
                    <q-item-section class="q-mt-xs">
                      <div>محصولات فاکتور : </div>
                      <div v-for="order in automation.orders" class="q-gutter-x-xs">
                        <span class="text-grey-8">نام محصول : {{ order.product.name }}</span>
                        <span>,</span>
                        <span class="text-grey-8">تعداد :  {{ order.count }}</span>
                        <span>,</span>
                        <span class="text-grey-8">قیمت :  {{ Number(order.price).toLocaleString('en-US') + ' تومان' }}</span>
                      </div>
                    </q-item-section>
                  </q-item-section>
                  <q-item-section side v-if="selectedAutomationId === automation.id">
                    <q-icon name="check_circle"/>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="purchaseSource !== '1'" class="text-caption text-grey q-mt-sm">
                برای انتخاب اتوماسیون، ابتدا نوع خرید را «خرید شده از ما» انتخاب کنید
              </div>
            </q-card-section>
          </q-card>

        </div>
      </div>

      <!-- ============ دکمه های ثبت ============ -->
      <q-card-actions v-if="customer_id" class="q-gutter-sm">
        <q-btn
            outline
            rounded
            class="col"
            color="grey-8"
            label="تکمیل موقت"
            @click.prevent="submitForm('temporary')"/>
        <q-btn
            type="submit"
            rounded
            class="col"
            color="accent"
            label="تکمیل نصب نهایی"/>
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

  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

export default {
  name: "CreateInstallationService",

  data() {
    return {

      customer_id: null,

      newCustomerDlg: false,
      newCustomerName: '',
      newCustomerContactNumber: '',
      newCustomerAddress: '',
      newCustomerGender: 0,

      customersAndLeads: [],
      customersAndLeadsOptions: [],

      purchaseSource: '1',

      address: '',
      contactNumber: '',
      productDescription: '',

      customerAutomations: [],
      automationsLoading: false,
      selectedAutomationId: null,

      installerRoles: [
        {key: 'panel', label: 'نصاب پنل'},
        {key: 'wiring', label: 'نصاب سیم کشی'},
        {key: 'commissioning', label: 'نصاب راه اندازی'}
      ],
      installers: {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      },
      installerOptions: [],

      products: [],
      productOptions: [],
      consumableItems: [
        {product: null, quantity: 1},
        {product: null, quantity: 1},
        {product: null, quantity: 1}
      ],

      newInstallerDlg: false,
      newInstallerName: '',
      newInstallerUserName: '',

      installerCalendarDlg: false,
      installerCalendarTarget: null,
      installerCalendarLoading: false,
      installerWorkingDays: [],
      installerDayAvailability: null,
      installerDayAvailabilityLoading: false
    }
  },

  methods: {

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
            v => (v.name || v.fullName || '').toLowerCase().indexOf(needle) > -1
        )
      })
    },

    onCustomerSelected(customer) {
      this.resetInstallInfo()
      this.customerAutomations = []

      if (!customer) return

      this.address = customer.address || ''
      this.contactNumber = customer.contact_number || ''

      this.getCustomerAutomations(customer.id)
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
          .catch((error) => {
            this.$q.loading.hide();
          });
    },

    getCustomerAutomations(customerId) {
      this.automationsLoading = true
      api.get(`installation-service/customer/${customerId}/automations`)
          .then(response => {
            this.customerAutomations = response.data.data
          })
          .finally(() => {
            this.automationsLoading = false
          })
    },

    selectAutomation(automation) {
      if (this.purchaseSource !== '1') return

      this.selectedAutomationId = automation.id
      this.productDescription = automation.description || ''
    },

    onPurchaseSourceChange() {
      this.selectedAutomationId = null
      this.productDescription = ''
    },

    surveyTypeLabel(type) {
      if (type === 1) return 'کارشناسی خانگی'
      if (type === 2) return 'کارشناسی صنعتی'
      if (type === 3) return 'ثبت شده از مشتری'
      return 'نامشخص'
    },

    getInstallers() {
      api.get('installers')
          .then(response => {
            this.installerOptions = response.data.data
          })
    },

    getProducts() {
      api.get('products/list')
          .then(response => {
            this.products = response.data.data
            this.productOptions = response.data.data
          })
    },

    filterProducts(val, update) {
      if (val === '') {
        update(() => {
          this.productOptions = this.products
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.productOptions = this.products.filter(
            p => (p.name || '').toLowerCase().indexOf(needle) > -1
        )
      })
    },

    addConsumableRow() {
      this.consumableItems.push({product: null, quantity: 1})
    },

    removeConsumableRow(index) {
      this.consumableItems.splice(index, 1)
    },

    resetConsumableItems() {
      this.consumableItems = [
        {product: null, quantity: 1},
        {product: null, quantity: 1},
        {product: null, quantity: 1}
      ]
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
          });
    },

    weekdayLabel(weekday) {
      const labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
      return labels[weekday] ?? '-'
    },

    resetInstallInfo() {
      this.purchaseSource = '1'
      this.address = ''
      this.contactNumber = ''
      this.productDescription = ''
      this.selectedAutomationId = null
      this.installers = {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      }
      this.resetConsumableItems()
    },

    validateFinal() {
      for (const role of this.installerRoles) {
        const item = this.installers[role.key]
        if (!item.installer || !item.date || !item.startTime || !item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `اطلاعات «${role.label}» تکمیل نشده است`
          })
          return false
        }
        if (item.startTime >= item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `ساعت پایان «${role.label}» باید بعد از ساعت شروع باشد`
          })
          return false
        }
      }
      return true
    },

    validateTemporary() {
      for (const role of this.installerRoles) {
        const item = this.installers[role.key]
        const hasAny = item.installer || item.date || item.startTime || item.endTime
        const hasAll = item.installer && item.date && item.startTime && item.endTime

        if (hasAny && !hasAll) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `اطلاعات «${role.label}» را کامل وارد کنید یا کاملاً خالی بگذارید`
          })
          return false
        }
        if (hasAll && item.startTime >= item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `ساعت پایان «${role.label}» باید بعد از ساعت شروع باشد`
          })
          return false
        }
      }
      return true
    },

    submitForm(status) {
      if (status === 'final' && !this.validateFinal()) {
        return
      }
      if (status === 'temporary' && !this.validateTemporary()) {
        return
      }

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        status: status === 'final' ? 2 : 1,
        customer_id: this.customer_id.id,
        purchase_source: this.purchaseSource,
        automation_id: this.purchaseSource === '1' ? this.selectedAutomationId : null,
        address: this.address,
        contact_number: this.contactNumber,
        description: this.productDescription,
        installers: {
          panel: {
            installer_id: this.installers.panel.installer ? this.installers.panel.installer.id : null,
            date: this.installers.panel.date,
            start_time: this.installers.panel.startTime,
            end_time: this.installers.panel.endTime
          },
          wiring: {
            installer_id: this.installers.wiring.installer ? this.installers.wiring.installer.id : null,
            date: this.installers.wiring.date,
            start_time: this.installers.wiring.startTime,
            end_time: this.installers.wiring.endTime
          },
          commissioning: {
            installer_id: this.installers.commissioning.installer ? this.installers.commissioning.installer.id : null,
            date: this.installers.commissioning.date,
            start_time: this.installers.commissioning.startTime,
            end_time: this.installers.commissioning.endTime
          }
        },
        items: this.consumableItems
            .filter(item => item.product && Number(item.quantity) > 0)
            .map(item => ({
              product_id: item.product.id,
              quantity: item.quantity
            }))
      }

      api.post('installation-service/store', payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.customer_id = null
            this.customerAutomations = []
            this.resetInstallInfo()

            this.$q.loading.hide();
          })
          .catch((error) => {
            this.$q.loading.hide();
          });
    }
  },

  created() {
    this.getCustomersAndLeads();
    this.getInstallers();
    this.getProducts();
  }
}
</script>

<style scoped>

</style>
