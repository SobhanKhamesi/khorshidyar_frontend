<template>
  <q-page class="q-pa-md">

    <div v-if="serviceLoading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em"/>
      <div class="text-grey q-mt-sm">در حال دریافت اطلاعات سرویس نصب...</div>
    </div>

    <q-form v-else @submit.prevent="submitForm('refer')">

      <q-card flat class="border-radius-card">
        <q-card-section class="row items-center q-gutter-sm">
          <div class="text-h6">ویرایش سرویس نصب</div>
          <q-badge v-if="stageLabel" color="indigo" class="q-pa-sm">{{ stageLabel }}</q-badge>
        </q-card-section>
        <q-banner v-if="isCompleted" class="bg-green-1 text-positive q-mx-md q-mb-md" rounded>
          این سرویس نصب تکمیل نهایی شده و قابل ویرایش نیست.
        </q-banner>
        <q-banner v-else-if="isReferred" class="bg-blue-1 text-indigo q-mx-md q-mb-md" rounded>
          این سرویس به نصاب ارجاع شده است. در صورت تغییر نصاب یا زمان نصب، برای نصاب جدید و مشتری پیامک ارسال می‌شود.
        </q-banner>
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
              <div class="text-subtitle1 q-mb-md">اتوماسیون های موفق مشتری</div>

              <div v-if="automationsLoading" class="text-grey text-caption">
                در حال دریافت اطلاعات...
              </div>

              <div v-else-if="!customerAutomations.length" class="text-grey text-caption">
                هیچ اتوماسیون موفقی برای این مشتری ثبت نشده است
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
                      {{ surveyTypeLabel(automation.surveyType) + ' ( ' + (automation.invoice_number || '') + ' ) ' }}
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
                      <div v-for="order in automation.orders" :key="order.id" class="q-gutter-x-xs"
                           :class="selectedAutomationId === automation.id ? 'text-white' : 'text-grey-8'">
                        <span>نام محصول : {{ order.product.name }}</span>
                        <span>,</span>
                        <span>تعداد :  {{ order.count }}</span>
                        <span>,</span>
                        <span>قیمت :  {{ Number(order.price).toLocaleString('en-US') + ' تومان' }}</span>
                      </div>
                    </q-item-section>
                  </q-item-section>
                  <q-item-section side v-if="selectedAutomationId === automation.id">
                    <q-icon name="check_circle" color="white"/>
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
            color="negative"
            label="انصراف"
            :to="{ name: 'InstallServiceList' }"/>
        <template v-if="!isCompleted">
          <q-btn
              v-if="!isReferred"
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
              :icon="isReferred ? 'save' : 'send'"
              :label="isReferred ? 'ذخیره تغییرات' : 'ارجاع به نصاب و ارسال پیامک'"/>
        </template>
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
import {STAGE} from 'components/InstallationWorkflowDialog.vue'

export default {
  name: "EditInstallationService",
  components: {InstallationItemsEditor},

  computed: {
    // در حالت یک نصاب، کل پروژه در ردیف panel به یک نصاب ارجاع می شود
    visibleRoles() {
      return this.installerMode === 1
          ? [{key: 'panel', label: 'نصاب کل پروژه (پنل، سیم کشی و راه اندازی)'}]
          : this.installerRoles
    },
    isReferred() {
      return this.stage !== null && this.stage !== STAGE.DRAFT
    },
    isCompleted() {
      return this.stage === STAGE.COMPLETED
    }
  },

  data() {
    return {

      serviceId: this.$route.params.id,
      serviceLoading: true,
      // تا زمانی که اطلاعات سرویس از بک‌اند در فرم پر می‌شود، این پرچم true
      // است تا onCustomerSelected/onPurchaseSourceChange فرم را ریست نکنند.
      isHydrating: false,

      customer_id: null,
      stage: null,
      stageLabel: '',

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
      // در حالت هیدریت (پر کردن فرم از اطلاعات سرویس موجود) نباید فرم ریست شود
      if (this.isHydrating) {
        if (customer) {
          this.getCustomerAutomations(customer.id)
        }
        return
      }

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
      // فروش های موفقی که به سرویس نصب دیگری ارجاع شده اند نمایش داده نمی شوند
      api.get(`installation-service/customer/${customerId}/automations`, {params: {except: this.serviceId}})
          .then(response => {
            this.customerAutomations = response.data.data
          })
          .finally(() => {
            this.automationsLoading = false
          })
    },

    selectAutomation(automation) {
      if (this.purchaseSource !== '1') return

      // با انتخاب فروش دیگر (یا وقتی آدرس خالی است) نشانی پروژه‌ی قید شده در قرارداد در آدرس نصب قرار می‌گیرد؛
      // انتخاب دوباره‌ی همان فروش، آدرسی را که دستی ویرایش شده بازنویسی نمی‌کند
      const projectAddress = automation.project_address || automation.address
      if (projectAddress && (this.selectedAutomationId !== automation.id || !this.address))
        this.address = projectAddress

      this.selectedAutomationId = automation.id
      this.productDescription = automation.description || ''
      // کالاهای فاکتور فروش (نه خدمات) به‌عنوان اقلام پیش‌نیاز پیشنهاد می‌شوند؛ قابل ویرایش است.
      // خدمات هزینه‌دار فاکتور (مثل حمل و نقل) در سمت سرور به هزینه‌های جانبی پروژه منتقل می‌شوند.
      if (!this.requiredItems.some(i => i.product)) {
        const goods = (automation.orders || []).filter(o => o.product && o.product.kind !== 2)
        if (goods.length) this.requiredItems = goods.map(o => ({product: o.product, quantity: Number(o.count)}))
      }
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

    fetchService() {
      this.serviceLoading = true
      api.get(`installation-service/${this.serviceId}`)
          .then(response => {
            this.populateForm(response.data.data)
          })
          .finally(() => {
            this.serviceLoading = false
          })
    },

    populateForm(service) {
      this.isHydrating = true

      this.stage = Number(service.stage)
      this.stageLabel = service.stage_label
      this.installerMode = Number(service.installer_mode) || 2

      // نوع خرید در فرم به صورت رشته ('1'/'2') نگه داشته می‌شود (به خاطر q-radio)
      this.purchaseSource = String(service.purchase_source)

      this.address = service.address || ''
      this.contactNumber = service.contact_number || ''
      this.productDescription = service.description || ''
      this.selectedAutomationId = service.automation_id || null

      // مشتری: باید همان شکل آبجکتی مورد استفاده در q-select (customer_id) باشد
      this.customer_id = service.customer || null
      if (this.customer_id) {
        this.getCustomerAutomations(this.customer_id.id)
      }

      // نصاب‌ها: از روی installer_appointments بر اساس نوع (type) هر نقش پر می‌شود.
      // اگر نوبتی برای یک نقش لغو شده باشد (status === 3)، آن نقش خالی نمایش داده می‌شود.
      const typeMap = {panel: 1, wiring: 2, commissioning: 3}
      const appointments = service.installer_appointments || []

      this.installers = {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      }

      for (const roleKey of Object.keys(typeMap)) {
        const appointment = appointments.find(a => Number(a.type) === typeMap[roleKey])
        if (!appointment || Number(appointment.status) === 3) {
          continue
        }

        this.installers[roleKey] = {
          installer: appointment.installer || null,
          date: appointment.jalali_date ? appointment.jalali_date.replaceAll('/', '-') : '',
          startTime: appointment.start_time ? appointment.start_time.substring(0, 5) : '',
          endTime: appointment.end_time ? appointment.end_time.substring(0, 5) : ''
        }
      }

      // اقلام پیش نیاز
      const items = service.required_items || []
      this.requiredItems = items.length
          ? items.map(item => ({product: item.product || null, quantity: item.quantity}))
          : [{product: null, quantity: 1}]

      this.$nextTick(() => {
        this.isHydrating = false
      })
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

    // ارجاع (و هر ذخیره پس از ارجاع): حداقل یک نصاب + اقلام پیش نیاز الزامی است
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
      if (this.isCompleted) return
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

      api.put(`installation-service/${this.serviceId}`, payload)
          .then(response => {

            this.$q.notify({
              timeout: 4000,
              position: 'center',
              type: 'positive',
              multiLine: true,
              message: response.data.message
            })

            this.$router.push({name: 'InstallServiceList'})
          })
          .catch(() => {
            // خطا توسط interceptor در boot/axios نمایش داده می شود
          })
          .finally(()=>{
            this.$q.loading.hide();

          })
    }
  },

  created() {
    this.getCustomersAndLeads();
    this.getInstallers();
    this.fetchService();
  }
}
</script>

<style scoped>

</style>
