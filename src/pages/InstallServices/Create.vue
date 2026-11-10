<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="submitForm('refer')">

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
              <div class="row items-center q-mb-md">
                <div class="text-subtitle1 col">اطلاعات نصاب ها</div>
                <q-btn-toggle
                    v-model="installerMode"
                    rounded unelevated no-caps dense
                    toggle-color="accent"
                    class="q-px-xs"
                    :options="[{label: 'یک نصاب برای کل پروژه', value: 1}, {label: 'انتخاب جداگانه نصاب ها', value: 2}]"/>
              </div>

              <div v-for="role in visibleRoles" :key="role.key" class="q-mb-lg">
                <div class="text-caption text-grey-8 q-mb-xs">{{ role.label }}</div>
                <div class="row q-col-gutter-md items-start">

                  <div class="col-md-5 col-xs-12">
                    <q-select
                        :option-label="installerLabel"
                        option-value="id"
                        outlined
                        dense
                        clearable
                        v-model="installers[role.key].installer"
                        label="انتخاب نصاب"
                        :options="installerOptions">
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
                             v-model="installers[role.key].date" label="تاریخ نصب">
                      <template v-slot:prepend>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date today-btn
                                    calendar="persian"
                                    v-model="installers[role.key].date" mask="YYYY-MM-DD">
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
                <q-separator v-if="role.key !== visibleRoles[visibleRoles.length - 1].key" class="q-mt-md"/>
              </div>

            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1">اقلام پیش‌نیاز سرویس نصب</div>
              <div class="text-caption text-grey-7 q-mb-md">
                اقلامی که نصاب برای انجام این سرویس نیاز دارد (نام محصول و تعداد با واحد)
              </div>
              <installation-items-editor v-model="requiredItems"/>
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
            label="ذخیره پیش‌نویس (بدون ارجاع)"
            @click.prevent="submitForm('draft')"/>
        <q-btn
            type="submit"
            rounded
            class="col"
            color="accent"
            icon="send"
            label="ارجاع به نصاب و ارسال پیامک"/>
      </q-card-actions>

    </q-form>

    <q-dialog v-model="newCustomerDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down">
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
            <div class="q-gutter-md q-mt-sm">
              <q-input outlined dir="ltr" v-model="newInstallerMobile" label="شماره همراه (برای پیامک ارجاع)"/>
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
import InstallationItemsEditor from 'components/InstallationItemsEditor.vue'

export default {
  name: "CreateInstallationService",
  components: {InstallationItemsEditor},

  computed: {
    // در حالت یک نصاب، کل پروژه در ردیف panel به یک نصاب ارجاع می شود
    visibleRoles() {
      return this.installerMode === 1
          ? [{key: 'panel', label: 'نصاب کل پروژه (پنل، سیم کشی و راه اندازی)'}]
          : this.installerRoles
    }
  },

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

      // اقلام پیش نیاز که مدیر هنگام ارجاع به نصاب مشخص می کند
      requiredItems: [{product: null, quantity: 1}],

      // 1: یک نصاب برای کل پروژه (پیش فرض)، 2: انتخاب جداگانه نصاب پنل / سیم کشی / راه اندازی
      installerMode: 1,

      newInstallerDlg: false,
      newInstallerName: '',
      newInstallerUserName: '',
      newInstallerMobile: '',

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
      return api.get(`installation-service/customer/${customerId}/automations`)
          .then(response => {
            this.customerAutomations = response.data.data
          })
          .finally(() => {
            this.automationsLoading = false
          })
    },

    // ارجاع مستقیم از لیست فروش های موفق: مشتری و فروش از پیش انتخاب می شوند
    preselectFromAutomation() {
      const {customer, automation} = this.$route.query
      if (!customer) return

      const target = this.customersAndLeads.find(c => c.id === customer)
      if (!target) return

      this.customer_id = target
      this.resetInstallInfo()
      this.address = target.address || ''
      this.contactNumber = target.contact_number || ''
      this.getCustomerAutomations(target.id).then(() => {
        const sale = this.customerAutomations.find(a => a.id === automation)
        if (sale) this.selectAutomation(sale)
      })
    },

    selectAutomation(automation) {
      if (this.purchaseSource !== '1') return

      this.selectedAutomationId = automation.id
      this.productDescription = automation.description || ''
      // کالاهای فاکتور فروش (نه خدمات) به‌عنوان اقلام پیش‌نیاز پیشنهاد می‌شوند؛ قابل ویرایش است.
      // خدمات هزینه‌دار فاکتور (مثل حمل و نقل) در سمت سرور به هزینه‌های جانبی پروژه منتقل می‌شوند.
      if (!this.requiredItems.some(i => i.product)) {
        const goods = (automation.orders || []).filter(o => o.product && o.product.kind !== 2)
        if (goods.length) this.requiredItems = goods.map(o => ({product: o.product, quantity: Number(o.count)}))
      }
      // نشانی پروژه‌ی قید شده در قرارداد این فروش به‌صورت خودکار در آدرس نصب قرار می‌گیرد (قابل ویرایش)
      const projectAddress = automation.project_address || automation.address
      if (projectAddress) this.address = projectAddress
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

    installerLabel(user) {
      if (!user) return ''
      return user.mobile ? `${user.name} (${user.mobile})` : user.name
    },

    getInstallers() {
      api.get('installers')
          .then(response => {
            this.installerOptions = response.data.data
          })
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
      payload.mobile = this.newInstallerMobile

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
            this.newInstallerUserName = ''
            this.newInstallerMobile = ''
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
      this.installerMode = 1
      this.address = ''
      this.contactNumber = ''
      this.productDescription = ''
      this.selectedAutomationId = null
      this.installers = {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      }
      this.requiredItems = [{product: null, quantity: 1}]
    },

    notifyError(message) {
      this.$q.notify({type: 'negative', position: 'bottom', message})
      return false
    },

    // هر نصاب یا کامل پر شود یا کاملاً خالی بماند
    validateInstallers() {
      for (const role of this.visibleRoles) {
        const item = this.installers[role.key]
        const hasAny = item.installer || item.date || item.startTime || item.endTime
        const hasAll = item.installer && item.date && item.startTime && item.endTime

        if (hasAny && !hasAll)
          return this.notifyError(`اطلاعات «${role.label}» را کامل وارد کنید یا کاملاً خالی بگذارید`)
        if (hasAll && item.startTime >= item.endTime)
          return this.notifyError(`ساعت پایان «${role.label}» باید بعد از ساعت شروع باشد`)
      }
      return true
    },

    // ارجاع: حداقل یک نصاب + اقلام پیش نیاز الزامی است
    validateRefer() {
      if (!this.validateInstallers()) return false

      const anyInstaller = this.visibleRoles.some(role => {
        const item = this.installers[role.key]
        return item.installer && item.date && item.startTime && item.endTime
      })
      if (!anyInstaller)
        return this.notifyError('برای ارجاع، حداقل یک نصاب همراه با تاریخ و ساعت نصب انتخاب کنید')

      if (!this.requiredItemsPayload().length)
        return this.notifyError('اقلام پیش‌نیاز این سرویس نصب را مشخص کنید')

      return true
    },

    requiredItemsPayload() {
      return this.requiredItems
          .filter(item => item.product && Number(item.quantity) > 0)
          .map(item => ({
            product_id: item.product.id,
            quantity: item.quantity
          }))
    },

    installerPayload(roleKey) {
      const item = this.installers[roleKey]
      return {
        installer_id: item.installer ? item.installer.id : null,
        date: item.date,
        start_time: item.startTime,
        end_time: item.endTime
      }
    },

    submitForm(action) {
      if (action === 'refer' && !this.validateRefer()) return
      if (action === 'draft' && !this.validateInstallers()) return

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        action,
        installer_mode: this.installerMode,
        customer_id: this.customer_id.id,
        purchase_source: this.purchaseSource,
        automation_id: this.purchaseSource === '1' ? this.selectedAutomationId : null,
        address: this.address,
        contact_number: this.contactNumber,
        description: this.productDescription,
        installers: {
          panel: this.installerPayload('panel'),
          // در حالت یک نصاب، فقط ردیف panel ارسال می شود و بک اند بقیه را لغو می کند
          wiring: this.installerMode === 1 ? {} : this.installerPayload('wiring'),
          commissioning: this.installerMode === 1 ? {} : this.installerPayload('commissioning')
        },
        items: this.requiredItemsPayload()
      }

      api.post('installation-service/store', payload)
          .then(response => {

            this.$q.notify({
              timeout: 4000,
              position: 'center',
              type: 'positive',
              multiLine: true,
              message: response.data.message
            })

            this.$q.loading.hide();
            this.$router.push({name: 'InstallServiceList'})
          })
          .catch((error) => {
            this.$q.loading.hide();
          });
    }
  },

  created() {
    api.get('customers/all')
        .then(response => {
          this.customersAndLeadsOptions = response.data.data
          this.customersAndLeads = response.data.data
          this.preselectFromAutomation()
        })
    this.getInstallers();
  }
}
</script>

<style scoped>

</style>
