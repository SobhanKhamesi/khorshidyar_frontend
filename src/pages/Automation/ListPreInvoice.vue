<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست پیش فاکتورها</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
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
            <q-tr :props="props">
              <q-td key="sabtKonande" :props="props">
                {{ props.row.sabtKonande }}
              </q-td>
              <q-td key="number" :props="props">
                <span>{{ props.row.invoice_number }}</span>
              </q-td>
              <q-td key="customer_name" :props="props">
                <q-btn
                  @click.prevent="openCustomerInfo(props.row.customer)"
                  :label="props.row.customer.name" dense flat/>
              </q-td>
              <q-td key="referrer_percent" :props="props">
                <template v-if="props.row.customer && props.row.customer.referrer_id">
                  <referrer-percent-edit
                    v-model="props.row.referrer_percent"
                    endpoint="automation/referrer-percent"
                    :payload="{ id: props.row.id }"
                    hint="فقط برای همین پروژه اعمال می‌شود"
                    @saved="data => props.row.referrer_income = data.referrer_income"
                  />
                  <div v-if="props.row.referrer_income" class="text-caption text-positive">
                    {{ Number(props.row.referrer_income).toLocaleString('en-US') }} تومان
                  </div>
                </template>
                <span v-else>-</span>
              </q-td>
              <q-td key="survey_type" :props="props">
                <q-badge v-if="props.row.survey_type" :color="surveyTypeColor(props.row.survey_type)">
                  {{ surveyTypeLabel(props.row.survey_type) }}
                </q-badge>
                <span v-else>-</span>
              </q-td>
              <q-td key="final_price" :props="props">
                {{ moneyFormat(props.row.final_price) }}
              </q-td>
              <q-td key="date" :props="props">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="vazieat" :props="props">
                <q-btn v-if="userRole===2 || userRole===0" @click="acceptRow(props.row)" color="positive"
                       icon="task_alt" rounded dense/>
                <q-btn v-if="userRole===2 || userRole===0" @click="cancelRow(props.row)" color="negative"
                       class="q-mx-sm"
                       icon="eva-close-circle-outline" rounded dense/>
                <q-badge v-else label="در انتظار بررسی مدیرفروش" color="orange"/>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">

                <q-btn
                  @click.prevent="showInvoiceItems(props.row.id)"
                  title="مشاهده اقلام پیش فاکتور" dense round color="deep-purple" icon="list_alt"/>
                <q-btn
                    @click.prevent="showSurveyForm(props.row.id)"
                    title="نمایش فرم بازدید" dense round color="brown" icon="assignment"/>

                <q-btn
                    @click.prevent="showComments(props.row.id)"
                    title="کامنت ها" dense round color="blue" icon="forum">
                  <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                    {{ props.row.commentsCount }}
                  </q-badge>
                </q-btn>

                <q-btn :href="'/v1/print/' + props.row.id" target="_blank" title="پرینت" dense round
                       color="positive" icon="print"/>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                       :to="{ name:'EditAutomation',params:{id:props.row.id} }"/>
                <q-btn title="اصلاحیه فاکتور و روش پرداخت" dense round color="deep-purple" icon="receipt_long"
                       @click.prevent="openAmendment(props.row.id)"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id)"/>
              </q-td>
            </q-tr>
          </template>


        </q-table>
      </q-card-section>
    </q-card>
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
        </q-card-section>

        <q-card-section class="row items-center">
          <q-select
              option-label="title"
              option-value="id"
              outlined
              clearable
              v-model="failure"
              label=" علت شکست"
              :options="failureAutomationOptions"
              use-input
              @filter="filterFn">

            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  یافت نشد
                </q-item-section>
              </q-item>
            </template>

            <template v-slot:after>
              <q-btn @click.prevent="newFailureDlg = true"
                     icon="eva-plus-circle-outline" dense flat
                     rounded/>
            </template>
          </q-select>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded @click.prevent="deleteItem()" label="تایید"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ تایید و ثبت قرارداد/پرداختی/چک ============ -->
    <q-dialog v-model="acceptRowDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              persistent
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big2" style="max-width: 950px; width: 950px;">
        <q-card-section>
          <div class="text-h6">تایید پیش فاکتور و ثبت اطلاعات قرارداد</div>
          <div class="text-caption text-grey" v-if="selectedInvoice">
            مشتری: {{ selectedInvoice.customer?.name }} - مبلغ پیش فاکتور:
            {{ moneyFormat(selectedInvoice.final_price) }} تومان
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="max-height: 65vh" class="scroll">
          <!-- مبلغ کل قرارداد به‌صورت دستی وارد می‌شود -->
          <q-input outlined dir="ltr" type="number" suffix="تومان" class="q-mb-md"
                   v-model.number="contractTotal" label="مبلغ کل قرارداد (دستی) *"
                   :hint="'مبلغ پیش فاکتور: ' + moneyFormat(selectedInvoice?.final_price) + ' تومان'">
            <template v-slot:after>
              <q-btn flat dense rounded size="sm" color="primary" label="برابر پیش فاکتور"
                     @click="contractTotal = Number(selectedInvoice?.final_price) || 0"/>
            </template>
          </q-input>

<!--          <div class="text-subtitle2 q-mb-sm">اقلام قرارداد</div>-->
<!--          <div class="q-gutter-y-sm q-mb-md">-->
<!--            <div v-for="(item, index) in contractItems" :key="item.uid"-->
<!--                 class="row q-col-gutter-sm items-center">-->
<!--              <div class="col-md-6 col-xs-12">-->
<!--                <q-input dense outlined v-model="item.title" label="شرح مورد قرارداد"/>-->
<!--              </div>-->
<!--              <div class="col-md-4 col-xs-8">-->
<!--                <q-input dense outlined type="number" dir="ltr" suffix="تومان"-->
<!--                         v-model.number="item.amount" label="مبلغ"/>-->
<!--              </div>-->
<!--              <div class="col-md-2 col-xs-4 text-left">-->
<!--                <q-btn dense round flat color="negative" icon="delete"-->
<!--                       @click="removeContractItem(index)"/>-->
<!--              </div>-->
<!--            </div>-->
<!--            <q-btn label="افزودن مورد قرارداد" icon="add" color="primary" outline rounded dense-->
<!--                   @click="addContractItem()"/>-->
<!--          </div>-->

          <q-separator class="q-my-md"/>

          <!-- پرداختی ها -->
          <div class="text-subtitle2 q-mb-sm">پرداختی ها</div>
          <div class="q-gutter-y-sm q-mb-md">
            <div v-for="(payment, index) in payments" :key="payment.uid"
                 class="row q-col-gutter-sm items-center">
              <div class="col-md-3 col-xs-12">
                <q-select dense outlined v-model="payment.method" label="نوع پرداخت"
                          :options="['نقدی', 'کارتخوان', 'واریز به حساب']"/>
              </div>
              <div class="col-md-3 col-xs-6">
                <q-input dense outlined type="number" dir="ltr" suffix="تومان"
                         v-model.number="payment.amount" label="مبلغ"/>
              </div>
              <div class="col-md-4 col-xs-6">
                <q-input dense outlined dir="ltr" mask="####/##/##" v-model="payment.date" label="تاریخ پرداخت">
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date today-btn calendar="persian" v-model="payment.date" mask="YYYY-MM-DD">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-md-2 col-xs-12 text-left">
                <q-btn dense round flat color="negative" icon="delete"
                       @click="removePayment(index)"/>
              </div>
            </div>
            <q-btn label="افزودن پرداختی" icon="add" color="primary" outline rounded dense
                   @click="addPayment()"/>
          </div>

          <q-separator class="q-my-md"/>

          <!-- چک ها -->
          <div class="text-subtitle2 q-mb-sm">چک ها</div>
          <div class="q-gutter-y-sm q-mb-md">
            <div v-for="(cheque, index) in cheques" :key="cheque.uid"
                 class="row q-col-gutter-sm items-center">
              <div class="col-md-3 col-xs-12">
                <q-input dense outlined v-model="cheque.number" label="شماره چک"/>
              </div>
              <div class="col-md-3 col-xs-6">
                <q-input dense outlined v-model="cheque.bankName" label="نام بانک"/>
              </div>
              <div class="col-md-2 col-xs-6">
                <q-input dense outlined type="number" dir="ltr" suffix="تومان"
                         v-model.number="cheque.amount" label="مبلغ"/>
              </div>
              <div class="col-md-3 col-xs-10">
                <q-input dense outlined dir="ltr" mask="####/##/##" v-model="cheque.dueDate" label="تاریخ سررسید">
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-date today-btn calendar="persian" v-model="cheque.dueDate" mask="YYYY-MM-DD">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col-md-1 col-xs-2 text-left">
                <q-btn dense round flat color="negative" icon="delete"
                       @click="removeCheque(index)"/>
              </div>
            </div>
            <q-btn label="افزودن چک" icon="add" color="primary" outline rounded dense
                   @click="addCheque()"/>
          </div>

          <div v-if="amountMismatchWarning" class="text-orange-9 text-caption q-mt-md">
            <q-icon name="warning"/>
            توجه: مجموع پرداختی ها و چک ها ({{ moneyFormat(totalPaymentsAndCheques) }} تومان) با مبلغ پیش فاکتور
            ({{ moneyFormat(contractTotal ?? selectedInvoice?.final_price) }} تومان) برابر نیست.
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup @click="resetAcceptDialog()"/>
          <q-btn color="accent" rounded :loading="acceptingInvoice" label="تایید نهایی"
                 @click="acceptInvoice()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="cancelRowDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیا از بازگشت این پیش فاکتور به مرحله اول اطمینان دارید؟</div>
          <div class="text-deep-orange-10">
            ابتدا دلیل رد کردن این پیش‌فاکتور را در قسمت کامنت ها ذکر کنید.
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :loading="cancelingInvoice" label="تایید" @click="cancelInvoice()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showCommentsDlg">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section>

          <q-table
              :loading="commentsLoading"
              binary-state-sort
              :rows="commentsRows"
              title="کامنت ها"

              :columns="commentsColumns"
              :rows-per-page-options="[0]"
          >

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:top-right>
              <q-btn @click="newCommentDlg = true;" title="کامنت جدید" dense color="indigo"
                     icon="eva-plus-outline" round/>
            </template>


            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="user" :props="props">
                  {{ props.row.user.name }}
                </q-td>
                <q-td key="content" :props="props">
                  {{ props.row.content }}
                </q-td>
                <q-td key="date" :props="props">
                  {{ props.row.jalali_date }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteCommentConfirmation(props.row.id)"/>
                </q-td>
              </q-tr>
            </template>


          </q-table>

        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="newCommentDlg">
      <q-card style="width: 500px; max-width: 90vw;">

        <q-card-section>
          <div class="text-h6 q-mb-lg">کامنت جدید</div>

          <div class="q-gutter-md">


            <q-input
                outlined
                v-model="newCommentContent"
                autogrow/>


          </div>

        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" label="لغو" v-close-popup/>
          <q-btn color="teal"  @click.prevent="createComment" label="افزودن"/>
        </q-card-actions>

      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteCommentConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteCommentItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newFailureDlg">
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ایجاد دلایل شکست</div>
        </q-card-section>
        <q-separator inset/>
        <q-form @submit.prevent="submitFormFailure()">
          <q-card-section>
            <div class="row justify-around q-gutter-md">
              <div class="col-md-11 col-xs-12">
                <q-input outlined v-model="titleFailure" label="عنوان"/>
              </div>
              <div class="col-md-11 col-xs-12">

                <q-input
                    label="توضیحات"
                    v-model="descriptionFailure"
                    outlined
                    autogrow
                />
              </div>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <survey-view-dialog v-model="surveyViewDlg" :automation-id="surveyViewAutomationId"/>
    <amendment-dialog v-model="amendDlg" :automation-id="amendAutomationId" @saved="getData()"/>
    <pre-invoice-items-dialog v-model="viewItemsDlg" :automation-id="focusedAutomationId" @saved="getData()"/>
    <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>

  </q-page>
</template>

<script>
import {exportFile, LocalStorage, QSpinnerPuff} from 'quasar'
import {api} from 'boot/axios'
import SurveyViewDialog from "components/SurveyViewDialog.vue";
import AmendmentDialog from 'components/AmendmentDialog.vue'
import PreInvoiceItemsDialog from "components/PreInvoiceItemsDialog.vue";
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

function uid() {
  return Math.random().toString(36).slice(2)
}

function emptyContractItem() {
  return {uid: uid(), title: '', amount: null}
}

function emptyPayment() {
  return {uid: uid(), method: 'نقدی', amount: null, date: ''}
}

function emptyCheque() {
  return {uid: uid(), number: '', bankName: '', amount: null, dueDate: ''}
}

export default {
  name: "ListPreInvoice",
  components: {AmendmentDialog, ReferrerPercentEdit, CustomerInfoDialog, PreInvoiceItemsDialog, SurveyViewDialog},
  data() {
    return {
      amendDlg: false,
      amendAutomationId: '',
      customerInfoDlg: false,
      customerInfoTarget: null,

      // ---------- نمایش فرم بازدید ----------
      surveyViewDlg: false,
      surveyViewAutomationId: '',

      newFailureDlg : false,
      titleFailure: '',
      descriptionFailure: '',
      failureAutomation: [],
      failureAutomationOptions: [],
      failure: null,

      commentsRows: [],
      commentsColumns: [
        {name: 'user', field: 'user', align: 'center', label: 'کاربر'},
        {name: 'content', field: 'content', align: 'center', label: 'متن'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'},
        {name: 'operation', field: 'operation', align: 'center', label: 'عملیات'},
      ],
      newCommentDlg: false,
      newCommentContent: '',
      commentForUUID: '',

      deleteCommentConfirmDialog: false,
      itemCommentFocusingId: '',
      showCommentsDlg: false,
      commentsLoading: false,

      acceptRowDlg: false,
      cancelRowDlg: false,
      acceptingInvoice: false,
      cancelingInvoice: false,
      filter: '',

      Text_canceling:'',

      selectedInvoice: null,
      contractTotal: null,

      // ---------- مشاهده اقلام پیش فاکتور ----------
      viewItemsDlg: false,
      focusedAutomationId: false,

      // ---------- تایید: قرارداد / پرداختی / چک ----------
      contractItems: [emptyContractItem()],
      payments: [emptyPayment()],
      cheques: [emptyCheque()],

      userRole: Number(LocalStorage.getItem('role')),
      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'number', field: 'number', align: 'center', label: 'شماره فاکتور' , filterable:true},
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'referrer_percent', field: 'referrer_percent', align: 'center', label: 'درصد معرف'},
        {name: 'survey_type', field: 'survey_type', align: 'center', label: 'نوع کارشناسی'},
        {name: 'final_price', field: 'final_price', align: 'center', label: 'مبلغ (تومان)'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'vazieat', field: 'vazieat', align: 'center', label: 'وضعیت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      automationList: [],
      noFilterRows: []
    }
  },
  computed: {
    totalPaymentsAndCheques() {
      const paymentsSum = this.payments.reduce((sum, p) => sum + (p.amount || 0), 0)
      const chequesSum = this.cheques.reduce((sum, c) => sum + (c.amount || 0), 0)
      return paymentsSum + chequesSum
    },
    amountMismatchWarning() {
      if (!this.selectedInvoice) return false
      return this.totalPaymentsAndCheques !== Number(this.contractTotal ?? this.selectedInvoice.final_price ?? 0)
    }
  },
  methods: {
    // اصلاحیه فاکتور و روش پرداخت (در هر مرحله)
    openAmendment(id) {
      this.amendAutomationId = id
      this.amendDlg = true
    },
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
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
    //____________ایجاد دلایل شکست____________
    submitFormFailure() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleFailure
      postData.description = this.descriptionFailure


      api.post('failure/store', postData)
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })
          })
          .then(() => {
            this.titleFailure = '';
            this.descriptionFailure = '';
            this.getFailure();
          })
          .finally(() => {
            this.newFailureDlg = false
            this.$q.loading.hide();
          });
    },
    getFailure() {
      api.get('failure/list')
          .then(response => {
            this.failureAutomation = response.data.data
            this.failureAutomationOptions = response.data.data
          })
          .finally(() => {
            this.$q.loading.hide();
          })
    },

    getData() {
      this.loading = true
      api.get('automation/list/1')
          .then(response => {
            this.rows = response.data.data
            this.automationList = response.data.data
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          });
    },

    // ---------- مشاهده اقلام پیش فاکتور ----------
    showInvoiceItems(id) {
      this.viewItemsDlg = true
      this.focusedAutomationId = id
    },

    // ---------- اقلام قرارداد ----------
    addContractItem() {
      this.contractItems.push(emptyContractItem())
    },
    removeContractItem(index) {
      this.contractItems.splice(index, 1)
    },

    // ---------- پرداختی ها ----------
    addPayment() {
      this.payments.push(emptyPayment())
    },
    removePayment(index) {
      this.payments.splice(index, 1)
    },

    // ---------- چک ها ----------
    addCheque() {
      this.cheques.push(emptyCheque())
    },
    removeCheque(index) {
      this.cheques.splice(index, 1)
    },

    resetAcceptDialog() {
      this.contractItems = [emptyContractItem()]
      this.payments = [emptyPayment()]
      this.cheques = [emptyCheque()]
      this.selectedInvoice = null
    },

    validateAcceptForm() {
      // for (const item of this.contractItems) {
      //   if (!item.title) {
      //     this.$q.notify({type: 'negative', position: 'bottom', message: 'شرح اقلام قرارداد را کامل کنید'})
      //     return false
      //   }
      // }
      for (const payment of this.payments) {
        if (payment.amount && !payment.date) {
          this.$q.notify({type: 'negative', position: 'bottom', message: 'تاریخ پرداختی را وارد کنید'})
          return false
        }
      }
      for (const cheque of this.cheques) {
        if (cheque.amount && (!cheque.number || !cheque.dueDate)) {
          this.$q.notify({type: 'negative', position: 'bottom', message: 'اطلاعات چک را کامل کنید'})
          return false
        }
      }
      return true
    },

    acceptRow(invoice) {
      this.selectedInvoice = invoice
      this.contractItems = [emptyContractItem()]
      this.payments = [emptyPayment()]
      this.cheques = [emptyCheque()]
      this.contractTotal = null
      this.acceptRowDlg = true;
    },
    cancelRow(invoice) {
      this.selectedInvoice = invoice
      this.cancelRowDlg = true;
    },
    acceptInvoice() {
      if (!this.validateAcceptForm()) return
      if (this.contractTotal === null || this.contractTotal === '') {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'مبلغ کل قرارداد را وارد نمایید'})
        return
      }

      this.acceptingInvoice = true;

      // فقط ردیف هایی که واقعا پر شده اند ارسال می شوند
      const contract_items = this.contractItems
          .filter(i => i.title)
          .map(i => ({title: i.title, amount: i.amount || 0}))

      const payments = this.payments
          .filter(p => p.amount)
          .map(p => ({amount: p.amount, date: p.date, method: p.method}))

      const cheques = this.cheques
          .filter(c => c.amount)
          .map(c => ({
            number: c.number,
            bank_name: c.bankName,
            amount: c.amount,
            due_date: c.dueDate
          }))

      const payload = {
        id: this.selectedInvoice.id,
        final_price: this.contractTotal,
        contract_items,
        payments,
        cheques
      }

      api.post('automation/confirm-contract', payload)
          .then(() => {
            this.$q.notify({
              message: 'با موفقیت تایید شد',
              type: 'positive'
            })

            this.getData();
            this.acceptRowDlg = false;
            this.resetAcceptDialog();
          })
          .finally(() => {
            this.acceptingInvoice = false;
          });
    },
    cancelInvoice() {
      this.cancelingInvoice = true;
      api.get('automation/cancel/' + this.selectedInvoice.id)
          .then(response => {
            this.cancelingInvoice = false;
            this.cancelRowDlg = false;
            this.$q.notify({
              message: 'با موفقیت به مرحله اول برگشت داده شد',
              type: 'positive'
            })

            this.getData();

          })
          .catch(() => {
            this.cancelingInvoice = false
          });
    },
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let payload = {};
      if (this.failure !== null && this.failure.id !== undefined)
        payload.failure = this.failure.id
      payload.id = this.itemFocusingId


      api.post('automation/destroy', payload)
          .then(response => {
            this.$q.notify({
              type: 'positive',
              position: 'center',
              timeout: 1000,
              message: response.data.message
            })
            this.deleteConfirmDialog = false;
            this.loading = false;
            this.getData();
          })
          .catch(() => {
            this.loading = false;
          });
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

    createComment() {

      let formData = new FormData();
      formData.append('id', this.commentForUUID);
      formData.append('content', this.newCommentContent);

      api.post('automation/new-comment', formData)
          .then(response => {
            this.showComments(this.commentForUUID)
            this.newCommentDlg = false;
            this.newCommentContent = ''
            this.$q.loading.hide();
            this.$q.notify({
              message: 'باموفقیت ایجاد شد',
              type: 'positive'
            })


          })
    },
    // ---------- نمایش فرم بازدید ----------
    showSurveyForm(id) {
      this.surveyViewAutomationId = id
      this.surveyViewDlg = true
    },

    showComments(id) {
      this.showCommentsDlg = true;
      this.commentsLoading = true;
      this.commentForUUID = id;



      let formData = new FormData();
      formData.append('id', id);
      api.post('automation/comments', formData)
          .then(response => {
            this.commentsRows = response.data.data
            this.commentsLoading = false
          })
    },

    deleteCommentConfirmation(id) {
      this.deleteCommentConfirmDialog = true;
      this.itemCommentFocusingId = id;
    },
    deleteCommentItem() {
      this.commentsLoading = true;

      let data = new FormData();
      data.append('id', this.itemCommentFocusingId)

      api.post('automation/comment/destroy', data)
          .then(response => {
            this.showComments(this.commentForUUID);
            this.deleteCommentConfirmDialog = false;
            this.$q.notify({
              type: 'positive',
              position: 'center',
              message: response.data.message
            })
          })
    },


  },
  created() {
    this.getData();
    this.getFailure();

  }

}

</script>

<style scoped>

</style>
