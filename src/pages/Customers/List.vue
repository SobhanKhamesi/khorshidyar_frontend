<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست مشتریان</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
            flat bordered class="border-radius-table"
            :rows="rows"
            :loading="loading"
            :filter="filter"
            :columns="columns">

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
            <div class="row q-gutter-sm">
              <div class="col-auto">
                <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
              </div>
              <div class="col-auto">
                <q-select
                    center
                    rounded outlined
                    clearable
                    dense
                    option-label="title"
                    option-value="id"
                    use-input
                    v-model="customerCategory"
                    label="دسته بندی"
                    :options="customerCategoryOptions"
                    @filter="filterFn">

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        یافت نشد
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
              <div class="col-auto">
                <q-select
                    v-if="userRole ===  0|| userRole === 2"
                    rounded outlined
                    clearable
                    dense
                    option-label="name"
                    option-value="id"
                    use-input
                    v-model="user"
                    label="کاربران"
                    :options="userOptions"
                    @filter="filterFn">

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        یافت نشد
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="sabtkonande" :props="props">
                {{ props.row.SabtKonande }}
              </q-td>
              <q-td key="type" :props="props">
                <q-badge color="pink-10" v-if="parseInt(props.row.type) === 2" label="حقوقی"/>
                <q-badge color="purple-10" v-else label="حقیقی"/>
              </q-td>
              <q-td key="date_sabt" :props="props">
                {{ props.row.custom_date }}
              </q-td>
              <q-td key="fullName" :props="props">
                <q-badge color="teal">
                  {{ props.row.fullName }}
                </q-badge>
              </q-td>
              <q-td key="contact_number" :props="props">
                {{ props.row.contact_number }}
              </q-td>
              <q-td key="city" :props="props">
                {{ props.row.province }}
              </q-td>
              <q-td key="category_title" :props="props">
                {{ props.row.category !== null ? props.row.category.title : void 0 }}
              </q-td>
              <q-td key="referrer_percent" :props="props">
                <referrer-percent-edit
                  v-if="props.row.referrer_id"
                  v-model="props.row.referrer_percent"
                  :endpoint="'referrers/introduces/percent/' + props.row.id"
                  :title="'معرف: ' + (props.row.referrer ? props.row.referrer.name : '')"
                  hint="فقط برای پروژه‌های جدید اعمال می‌شود؛ پروژه‌های قبلی درصد خود را حفظ می‌کنند"
                />
                <span v-else>-</span>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn title="پیگیری مکالمات" dense round color="indigo" icon="call"
                       @click="callTracking(props.row.id,props.row.name)"/>
                <q-btn title="سرویس های نصب" dense round color="deep-orange" icon="build"
                       @click="openInstallServicesDlg(props.row)"/>
                <q-btn title="خدمات پس از فروش" dense round color="deep-purple" icon="support_agent"
                       @click="openAfterSalesDlg(props.row)"/>
                <q-btn title="فروش ها" dense round color="teal-9" icon="sell"
                       @click="openSalesDlg(props.row)"/>
                <q-btn title="مشخصات" dense round color="brown" icon="eva-eye-outline"
                       @click="openDetailsDlg(props.row)"/>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'CustomerEdit',params:{id:props.row.id} }"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id,'customer')"/>
              </q-td>


            </q-tr>


          </template>


        </q-table>
      </q-card-section>
    </q-card>

    <!-- ============ دیالوگ پیگیری مکالمات (قبلی) ============ -->
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        v-model="listCallTrackingDlg">
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ listCallTrackingDlgTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-table
              flat bordered class="border-radius-table"
              :loading="loadingCall"
              :rows="rowsCalls"
              :columns="columnsCalls"
              :rows-per-page-options="[10]"
          >


            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width>
                  <q-btn :to="{ name:'CallCreate',params:{id:callTrackingFocus}}"
                         title="ثبت مکالمه جدید" dense rounded
                         color="indigo" icon="add_ic_call"/>
                </q-th>
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td/>
                <q-td key="subject" :props="props">
                  {{ props.row.subject }}
                </q-td>
                <q-td key="dateAndTime" :props="props">
                  {{ props.row.jalali_full_date }}
                </q-td>
                <q-td key="reFollowDate" :props="props">
                  {{ props.row.jalali_re_follow_date }}
                </q-td>
                <q-td key="reFollowSubject" :props="props">
                  {{ props.row.re_follow_subject }}
                </q-td>
                <q-td key="action" :props="props" class="q-gutter-x-sm">
                  <q-btn title="ویرایش" dense color="yellow-9" icon="edit" round
                         :to="{ name:'CallEdit',params:{id:props.row.id} }"/>
                  <q-btn title="حذف" dense color="negative" icon="delete" round
                         @click.prevent="deleteConfirmation(props.row.id,'call')"/>
                </q-td>
              </q-tr>
            </template>

          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ سرویس های نصب مشتری ============ -->
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        v-model="installServicesDlg">
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ installServicesDlgTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-table
              flat bordered class="border-radius-table"
              :loading="installServicesLoading"
              :rows="installServicesRows"
              :columns="installServicesColumns"
              :rows-per-page-options="[10]">

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="purchase_source" :props="props">
                  <q-badge :color="purchaseSourceColor(props.row.purchase_source)">
                    {{ purchaseSourceLabel(props.row.purchase_source) }}
                  </q-badge>
                </q-td>
                <q-td key="status" :props="props">
                  <q-badge :color="installStatusColor(props.row.status)">
                    {{ installStatusLabel(props.row.status) }}
                  </q-badge>
                </q-td>
                <q-td key="survey_date" :props="props">
                  {{ props.row.jalali_survey_date || props.row.survey_date || '-' }}
                </q-td>
                <q-td key="technical_expert" :props="props">
                  {{ props.row.technical_expert ? props.row.technical_expert.name : '-' }}
                </q-td>
                <q-td key="action" :props="props" class="q-gutter-x-sm">
                  <q-btn :href="'/v1/print_install_service/' + props.row.id" target="_blank" title="پرینت"
                         dense round color="positive" icon="print"/>
                  <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                         :to="{ name:'InstallServiceEdit', params:{id:props.row.id} }"/>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-pa-md">
                سرویس نصبی برای این مشتری ثبت نشده است
              </div>
            </template>

          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ خدمات پس از فروش مشتری ============ -->
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        v-model="afterSalesDlg">
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ afterSalesDlgTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-table
              flat bordered class="border-radius-table"
              :loading="afterSalesLoading"
              :rows="afterSalesRows"
              :columns="afterSalesColumns"
              :rows-per-page-options="[10]">

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="service_type" :props="props">
                  {{ props.row.service_type ? props.row.service_type.title : '-' }}
                </q-td>
                <q-td key="status" :props="props">
                  <q-badge :color="afterSalesStatusColor(props.row.status)">
                    {{ props.row.status_label }}
                  </q-badge>
                </q-td>
                <q-td key="source" :props="props">
                  <q-badge :color="afterSalesSourceColor(props.row.source)" outline>
                    {{ props.row.source_label }}
                  </q-badge>
                </q-td>
                <q-td key="request_date" :props="props">
                  {{ props.row.jalali_request_date || '-' }}
                </q-td>
                <q-td key="follow_up_date" :props="props">
                  {{ props.row.jalali_follow_up_date || '-' }}
                </q-td>
                <q-td key="action" :props="props" class="q-gutter-x-sm">
                  <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                         :to="{ name:'AfterSalesServiceEdit', params:{id:props.row.id} }"/>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-pa-md">
                خدمت پس از فروشی برای این مشتری ثبت نشده است
              </div>
            </template>

          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ فروش های مشتری (موفق / ناموفق / باز) ============ -->
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        v-model="salesDlg">
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ salesDlgTitle }}</div>
        </q-card-section>

        <q-tabs
            v-model="salesActiveTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            @update:model-value="fetchSales()">
          <q-tab name="open" label="باز"/>
          <q-tab name="success" label="موفق"/>
          <q-tab name="failure" label="ناموفق"/>
        </q-tabs>

        <q-separator/>

        <q-card-section class="q-pt-none">
          <q-table
              flat bordered class="border-radius-table"
              :loading="salesLoading"
              :rows="salesRows"
              :columns="salesColumns"
              :rows-per-page-options="[10]">

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="invoice_number" :props="props">
                  {{ props.row.invoice_number || '-' }}
                </q-td>
                <q-td key="survey_type" :props="props">
                  <q-badge v-if="props.row.survey_type" :color="surveyTypeColor(props.row.survey_type)">
                    {{ surveyTypeLabel(props.row.survey_type) }}
                  </q-badge>
                  <span v-else>-</span>
                </q-td>
                <q-td key="stage" :props="props">
                  <q-badge :color="automationStatusColor(props.row.status)">
                    {{ automationStatusLabel(props.row.status) }}
                  </q-badge>
                </q-td>
                <q-td key="final_price" :props="props">
                  {{ moneyFormat(props.row.final_price) }}
                </q-td>
                <q-td key="date" :props="props">
                  {{ props.row.jalali_date }}
                </q-td>
                <q-td v-if="salesActiveTab === 'failure'" key="failure_reason" :props="props">
                  {{ props.row.failure ? props.row.failure.title : '-' }}
                </q-td>
                <q-td key="action" :props="props" class="q-gutter-x-sm">
                  <q-btn :href="'/v1/print/' + props.row.id" target="_blank" title="پرینت" dense round
                         color="positive" icon="print"/>
                  <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                         :to="{ name:'EditAutomation', params:{id:props.row.id} }"/>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-pa-md">
                موردی در این وضعیت برای این مشتری ثبت نشده است
              </div>
            </template>

          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ مشخصات مشتری ============ -->
    <CustomerInfoDialog v-model="detailsDlg" :customer="detailsRow"/>

    <q-dialog v-model="deleteConfirmDialog"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیا از حذف این آیتم اطمینان دارید؟</div>
          <div v-if="itemFocusingType !== 'call'" class="text-deep-orange-10">با حذف این
            این مشتری تمام معاملات و مکالمات و تمامی اطلاعات آن نیز حذف میشود.
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn v-if="itemFocusingType === 'call'" color="accent" rounded label="تایید" @click="deleteCallItem()"/>
          <q-btn v-else color="accent" rounded label="تایید" @click="deleteCustomerItem()"/>

        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import {api} from 'boot/axios'
import {exportFile} from 'quasar'

import {QSpinnerPuff} from 'quasar'
import CustomerInfoDialog from "components/CustomerInfoDialog.vue";
import ReferrerPercentEdit from "components/ReferrerPercentEdit.vue";


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

export default {
  name: "CustomersList",
  components: {CustomerInfoDialog, ReferrerPercentEdit},
  watch: {
    customerCategory: function (e) {
      if (e !== null) {
        this.rows = (this.noFilterRows).filter(o => (o.category != null ? o.category.title === e.title : void 0));
      } else {
        this.rows = this.noFilterRows
      }
    },
    user: function (e) {
      if (e !== null) {
        this.rows = (this.noFilterRows).filter(o => (o.user != null ? o.user.name === e.name : void 0));
      } else {
        this.rows = this.noFilterRows
      }
    }
  },

  data() {
    return {
      customerCategory: null,
      customerCategories: [],
      customerCategoryOptions: [],

      userRole: parseInt(this.$q.localStorage.getItem('role')),

      user: null,
      userall: [],
      userOptions: [],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      itemFocusingType: '',
      listCallTrackingDlg: false,
      callTrackingFocus: '',
      loadingCall: true,
      loading: true,
      listCallTrackingDlgTitle: '',
      filter: '',
      columns: [
        {name: 'sabtkonande', field: 'sabtkonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'type', field: 'type', align: 'center', label: 'نوع'},
        {name: 'date_sabt', field: 'date_sabt', align: 'center', label: 'تاریخ ثبت'},
        {name: 'fullName', field: 'name', align: 'center', label: 'نام و نام خانوادگی'},
        {name: 'contact_number', field: 'contact_number', align: 'center', label: 'تلفن تماس'},
        {name: 'city', field: 'city', align: 'center', label: 'استان'},
        {name: 'category_title', field: 'categoryItem', align: 'center', label: 'دسته بندی'},
        {name: 'referrer_percent', field: 'referrer_percent', align: 'center', label: 'درصد معرف'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      columnsCalls: [
        {name: 'subject', align: 'center', label: 'موضوع', field: 'subject'},
        {name: 'dateAndTime', align: 'center', label: 'تاریخ', field: 'dateAndTime'},
        {name: 'reFollowDate', align: 'center', label: 'تاریخ پیگیری مجدد', field: 'reFollowDate'},
        {name: 'reFollowSubject', align: 'center', label: 'موضوع پیگیری مجدد', field: 'reFollowSubject'},
        {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
      ],
      rows: [],
      rowsCalls: [],
      noFilterRows: [],

      // ---------- دیالوگ سرویس های نصب ----------
      installServicesDlg: false,
      installServicesDlgTitle: '',
      installServicesLoading: false,
      installServicesRows: [],
      installServicesColumns: [
        {name: 'purchase_source', field: 'purchase_source', align: 'center', label: 'نوع خرید'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'survey_date', field: 'survey_date', align: 'center', label: 'تاریخ بازدید'},
        {name: 'technical_expert', field: 'technical_expert', align: 'center', label: 'کارشناس فنی'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],

      // ---------- دیالوگ خدمات پس از فروش ----------
      afterSalesDlg: false,
      afterSalesDlgTitle: '',
      afterSalesLoading: false,
      afterSalesRows: [],
      afterSalesColumns: [
        {name: 'service_type', field: 'service_type', align: 'center', label: 'نوع خدمت'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'source', field: 'source', align: 'center', label: 'منبع'},
        {name: 'request_date', field: 'request_date', align: 'center', label: 'تاریخ ثبت درخواست'},
        {name: 'follow_up_date', field: 'follow_up_date', align: 'center', label: 'تاریخ پیگیری مجدد'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],

      // ---------- دیالوگ فروش ها (موفق/ناموفق/باز) ----------
      salesDlg: false,
      salesDlgTitle: '',
      salesLoading: false,
      salesRows: [],
      salesFocusCustomerId: '',
      salesActiveTab: 'open',

      // ---------- دیالوگ مشخصات ----------
      detailsDlg: false,
      detailsRow: null,

    }
  },
  computed: {
    salesColumns() {
      const cols = [
        {name: 'invoice_number', field: 'invoice_number', align: 'center', label: 'شماره فاکتور'},
        {name: 'survey_type', field: 'survey_type', align: 'center', label: 'نوع کارشناسی'},
        {name: 'stage', field: 'status', align: 'center', label: 'مرحله'},
        {name: 'final_price', field: 'final_price', align: 'center', label: 'مبلغ نهایی (تومان)'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'}
      ]
      if (this.salesActiveTab === 'failure') {
        cols.push({name: 'failure_reason', field: 'failure_reason', align: 'center', label: 'دلیل شکست'})
      }
      cols.push({name: 'action', field: 'action', align: 'center', label: 'عملیات'})
      return cols
    }
  },
  methods: {
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    getCategories() {
      api.get('customers/categories/list')
          .then(response => {
            this.customerCategories = response.data.data
            this.customerCategoryOptions = response.data.data
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          });
    },
    deleteConfirmation(id, type) {
      this.deleteConfirmDialog = true;
      this.itemFocusingType = type;
      this.itemFocusingId = id;
    },
    deleteCustomerItem() {
      this.loading = true;


      let payload = {};
      payload.id = this.itemFocusingId

      api.post('customers/destroy', payload)
          .then(response => {
            this.$q.notify({
              type: 'positive',
              position: 'center',
              message: response.data.message
            })

            this.getCustomerData();
            this.deleteConfirmDialog = false;
          });
    },
    getUser() {
      api.get('users')
          .then(response => {
            this.userall = response.data.data
            this.userOptions = response.data.data
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
          })
    },
    deleteCallItem() {
      this.loadingCall = true;

      let payload = {};
      payload.id = this.itemFocusingId

      api.post('calls/destroy', payload)
          .then(response => {
            this.$q.notify({
              type: 'positive',
              position: 'center',
              message: response.data.message
            })
            this.deleteConfirmDialog = false;
            this.loadingCall = false;
            this.getCallData(this.callTrackingFocus);
          });
    },
    getCustomerData() {
      api.get('customers/list')
          .then(response => {
            this.noFilterRows = response.data.data
            this.rows = response.data.data
            this.loading = false
          })
          .catch(()=>{
            this.loading = false
          });
    },
    getCallData(customerId) {
      this.loadingCall = true;

      api.get('calls/list/' + customerId)
          .then(response => {
            this.rowsCalls = response.data.data.data
            this.loadingCall = false;
          });
    },
    callTracking(customerId, customerName) {
      this.listCallTrackingDlg = true;
      this.callTrackingFocus = customerId;
      this.listCallTrackingDlgTitle = 'لیست پیگیری مکالمات : ' + customerName;

      this.getCallData(customerId);

    },
    notifyError(error) {
      const message = error?.response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
      this.$q.notify({timeout: 4000, position: 'center', type: 'negative', message})
    },

    // ============ سرویس های نصب ============
    openInstallServicesDlg(row) {
      this.installServicesDlg = true
      this.installServicesDlgTitle = 'سرویس های نصب مشتری: ' + row.fullName
      this.installServicesLoading = true
      this.installServicesRows = []

      api.get('customers/installation_services/' + row.id)
          .then(response => {
            this.installServicesRows = response.data.data
          })
          .catch((error) => {
            this.notifyError(error)
          })
          .finally(() => {
            this.installServicesLoading = false
          })
    },
    purchaseSourceLabel(val) {
      return val === 1 ? 'خرید شده از ما' : 'خریداری شده از جای دیگر'
    },
    purchaseSourceColor(val) {
      return val === 1 ? 'teal' : 'blue-grey'
    },
    installStatusLabel(val) {
      return val === 2 ? 'نهایی' : 'موقت'
    },
    installStatusColor(val) {
      return val === 2 ? 'positive' : 'orange'
    },

    // ============ خدمات پس از فروش ============
    openAfterSalesDlg(row) {
      this.afterSalesDlg = true
      this.afterSalesDlgTitle = 'خدمات پس از فروش مشتری: ' + row.fullName
      this.afterSalesLoading = true
      this.afterSalesRows = []

      api.get('customers/after_sale_services/' + row.id)
          .then(response => {
            this.afterSalesRows = response.data.data
          })
          .catch((error) => {
            this.notifyError(error)
          })
          .finally(() => {
            this.afterSalesLoading = false
          })
    },
    afterSalesStatusColor(status) {
      const map = {1: 'orange', 2: 'blue', 3: 'positive', 4: 'grey'}
      return map[status] || 'grey'
    },
    afterSalesSourceColor(source) {
      return source === 1 ? 'teal' : 'purple'
    },

    // ============ فروش ها (موفق / ناموفق / باز) ============
    // توجه: وضعیت های اتوماسیون طبق مدل Automation.php به این شکل است:
    // REQUEST=0, PRE_INVOICE=1, NEGOTIATION=2 => در مجموع همان وضعیت "باز"
    // SUCCESS=3 => موفق   |   FAILURE=-1 => ناموفق
    // چون روت جدید customers/automations/{customer}/{status} فقط یک وضعیت را می پذیرد،
    // برای تب "باز" هر سه وضعیت به صورت جداگانه گرفته و با هم ترکیب می شوند.
    openSalesDlg(row) {
      this.salesDlg = true
      this.salesDlgTitle = 'فروش های مشتری: ' + row.fullName
      this.salesFocusCustomerId = row.id
      this.salesActiveTab = 'open'
      this.fetchSales()
    },
    fetchSales() {
      if (!this.salesFocusCustomerId) return

      this.salesLoading = true
      this.salesRows = []

      if (this.salesActiveTab === 'open') {
        Promise.all(
            [0, 1, 2].map(status => api.get(`customers/automations/${this.salesFocusCustomerId}/${status}`))
        )
            .then(responses => {
              this.salesRows = responses.flatMap(response => response.data.data)
            })
            .catch((error) => {
              this.notifyError(error)
            })
            .finally(() => {
              this.salesLoading = false
            })
      } else {
        const status = this.salesActiveTab === 'success' ? 3 : -1
        api.get(`customers/automations/${this.salesFocusCustomerId}/${status}`)
            .then(response => {
              this.salesRows = response.data.data
            })
            .catch((error) => {
              this.notifyError(error)
            })
            .finally(() => {
              this.salesLoading = false
            })
      }
    },
    surveyTypeLabel(type) {
      if (type === 1) return 'خانگی'
      if (type === 2) return 'صنعتی'
      if (type === 3) return 'ثبت شده از مشتری'
      return '-'
    },
    surveyTypeColor(type) {
      if (type === 1) return 'teal'
      if (type === 2) return 'deep-orange'
      if (type === 3) return 'purple'
      return 'grey'
    },
    automationStatusLabel(status) {
      const map = {0: 'درخواست ثبت شده', 1: 'پیش فاکتور ثبت شده', 2: 'مذاکره و قرارداد', 3: 'فروش موفق', '-1': 'شکست خورده'}
      return map[status] !== undefined ? map[status] : '-'
    },
    automationStatusColor(status) {
      const map = {0: 'grey', 1: 'blue', 2: 'orange', 3: 'positive', '-1': 'negative'}
      return map[status] || 'grey'
    },

    // ============ مشخصات مشتری ============
    openDetailsDlg(row) {
      this.detailsRow = row
      this.detailsDlg = true
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
          'table-export.csv',
          "\ufeff" + content,
          'text/csv')

      if (status !== true) {
        this.$q.notify({
          message: 'مرورگر دسترسی دانلود فایل را بسته است.',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.customerCategoryOptions = this.customerCategories
          this.userOptions = this.userall

        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.customerCategoryOptions = this.customerCategories.filter(v => v.title.toLowerCase().indexOf(needle) > -1)
        this.userOptions = this.userall.filter(v => v.name.toLowerCase().indexOf(needle) > -1)

      })
    },
  },
  created() {

    this.getCustomerData()

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getCategories();
    this.getUser();


  }


}

</script>

<style scoped>

</style>
