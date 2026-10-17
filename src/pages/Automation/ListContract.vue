<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست مذاکره و قرارداد</div>
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
              <q-td key="invoice_number" :props="props">
                {{ props.row.invoice_number }}
              </q-td>
              <q-td key="customer_name" :props="props">
                <q-btn
                  @click.prevent="openCustomerInfo(props.row.customer)"
                  :label="props.row.customer.name" dense flat/>
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
                <q-badge v-else label="در انتظار تایید نهایی" color="orange"/>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">

                <q-btn
                    @click.prevent="showContractInfo(props.row.id)"
                    title="نمایش قرارداد و پرداختی ها" dense round color="deep-purple" icon="receipt_long"/>

                <q-btn
                    @click.prevent="showPreInvoiceItems(props.row.id)"
                    title="نمایش پیش فاکتور" dense round color="deep-purple" icon="list_alt"/>
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

    <!-- ============ دیالوگ تایید نهایی (بدون دریافت اطلاعات، فقط اطمینان) ============ -->
    <q-dialog v-model="acceptRowDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیا از تایید نهایی این قرارداد و اعلام موفقیت این درخواست اطمینان دارید؟</div>
        </q-card-section>
        <q-card-section>
          <div>پیامک تشکر از خرید ارسال شود؟</div>
          <div class="row items-center q-gutter-md">
            <q-radio v-model="sendSms" :val="true" label="بله" />
            <q-radio v-model="sendSms" :val="false" label="خیر" />
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :loading="acceptingInvoice" label="تایید" @click="acceptInvoice()"/>
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
          <div class="text-h6">آیا از بازگشت این درخواست به مرحله اول اطمینان دارید؟</div>
          <div class="text-deep-orange-10">
            ابتدا دلیل رد کردن این مورد را در قسمت کامنت ها ذکر کنید.
          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :loading="cancelingInvoice" label="تایید" @click="cancelInvoice()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ نمایش قرارداد / پرداختی ها / چک ها (فقط نمایش) ============ -->
    <q-dialog v-model="contractItemsDlg">
      <q-card style="width: 800px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">اطلاعات قرارداد</div>
          <div class="text-caption text-grey" v-if="contractInvoice">
            مشتری: {{ contractInvoice.customer?.name }} - شماره: {{ contractInvoice.number }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="max-height: 65vh" class="scroll">
          <div v-if="contractItemsLoading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em"/>
          </div>

          <div v-else class="q-gutter-y-md">

            <div>
              <div class="text-subtitle2 q-mb-xs">اقلام قرارداد</div>
              <q-markup-table v-if="contractItems.length" flat bordered dense>
                <thead>
                <tr>
                  <th class="text-center">شرح</th>
                  <th class="text-center">مبلغ</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(item, i) in contractItems" :key="i">
                  <td class="text-center">{{ item.title }}</td>
                  <td class="text-center">{{ moneyFormat(item.amount) }}</td>
                </tr>
                </tbody>
              </q-markup-table>
              <div v-else class="text-grey">آیتمی ثبت نشده</div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-xs">پرداختی ها</div>
              <q-markup-table v-if="payments.length" flat bordered dense>
                <thead>
                <tr>
                  <th class="text-center">نوع پرداخت</th>
                  <th class="text-center">مبلغ</th>
                  <th class="text-center">تاریخ</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(p, i) in payments" :key="i">
                  <td class="text-center">{{ p.method }}</td>
                  <td class="text-center">{{ moneyFormat(p.amount) }}</td>
                  <td class="text-center">{{ p.jalali_date || p.date }}</td>
                </tr>
                </tbody>
              </q-markup-table>
              <div v-else class="text-grey">پرداختی ثبت نشده</div>
            </div>

            <div>
              <div class="text-subtitle2 q-mb-xs">چک ها</div>
              <q-markup-table v-if="cheques.length" flat bordered dense>
                <thead>
                <tr>
                  <th class="text-center">شماره چک</th>
                  <th class="text-center">بانک</th>
                  <th class="text-center">مبلغ</th>
                  <th class="text-center">تاریخ سررسید</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(c, i) in cheques" :key="i">
                  <td class="text-center">{{ c.number }}</td>
                  <td class="text-center">{{ c.bank_name }}</td>
                  <td class="text-center">{{ moneyFormat(c.amount) }}</td>
                  <td class="text-center">{{ c.jalali_due_date || c.due_date }}</td>
                </tr>
                </tbody>
              </q-markup-table>
              <div v-else class="text-grey">چکی ثبت نشده</div>
            </div>

          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ نمایش فرم بازدید ============ -->
    <survey-view-dialog v-model="surveyViewDlg" :automation-id="focusedAutomationId"/>
    <pre-invoice-items-dialog v-model="preInvoiceItemsDlg" :automation-id="focusedAutomationId"/>
    <contract-info-dialog v-model="contractInfoDlg" :automation-id="focusedAutomationId"/>

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

  </q-page>
  <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>
</template>

<script>
import {exportFile, LocalStorage, QSpinnerPuff} from 'quasar'
import {api} from 'boot/axios'
import SurveyViewDialog from 'components/SurveyViewDialog.vue'
import PreInvoiceItemsDialog from "components/PreInvoiceItemsDialog.vue";
import ContractInfoDialog from "components/ContractInfoDialog.vue";
import CustomerInfoDialog from "components/CustomerInfoDialog.vue";


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
  name: "ListNegotiation",
  components: {CustomerInfoDialog, ContractInfoDialog, PreInvoiceItemsDialog, SurveyViewDialog},
  data() {
    return {
      customerInfoDlg: false,
      customerInfoTarget: null,

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

      selectedInvoice: null,
      sendSms: true,

      // ---------- نمایش فرم بازدید ----------
      surveyViewDlg: false,
      preInvoiceItemsDlg: false,
      contractInfoDlg: false,
      focusedAutomationId: '',

      // ---------- نمایش قرارداد/پرداختی/چک (فقط نمایش) ----------
      contractItemsDlg: false,
      contractItemsLoading: false,
      contractInvoice: null,
      contractItems: [],
      payments: [],
      cheques: [],

      userRole: Number(LocalStorage.getItem('role')),
      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'invoice_number', field: 'invoice_number', align: 'center', label: 'شماره فاکتور'},
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'survey_type', field: 'survey_type', align: 'center', label: 'نوع کارشناسی'},
        {name: 'final_price', field: 'final_price', align: 'center', label: 'مبلغ (تومان)'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'vazieat', field: 'vazieat', align: 'center', label: 'وضعیت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: []
    }
  },
  methods: {
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
    },
    surveyTypeLabel(type) {
      if (type === 1) return 'خانگی'
      if (type === 2) return 'صنعتی'
      return '-'
    },
    surveyTypeColor(type) {
      if (type === 1) return 'teal'
      if (type === 2) return 'deep-orange'
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
      api.get('automation/list/2')
          .then(response => {
            this.rows = response.data.data
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          });
    },

    // ---------- نمایش فرم بازدید ----------
    showSurveyForm(id) {
      this.focusedAutomationId = id
      this.surveyViewDlg = true
    },
    showPreInvoiceItems(id) {
      this.focusedAutomationId = id
      this.preInvoiceItemsDlg = true
    },
    showContractInfo(id) {
      this.focusedAutomationId = id
      this.contractInfoDlg = true
    },

    // ---------- نمایش قرارداد/پرداختی/چک ----------
    showContractItems(row) {
      this.contractItemsDlg = true
      this.contractItemsLoading = true
      this.contractInvoice = row
      this.contractItems = []
      this.payments = []
      this.cheques = []

      api.get('automation/' + row.id)
          .then(response => {
            const data = response.data.data
            this.contractItems = data.contractItems || []
            this.payments = data.payments || []
            this.cheques = data.cheques || []
          })
          .finally(() => {
            this.contractItemsLoading = false
          })
    },

    acceptRow(invoice) {
      this.selectedInvoice = invoice
      this.acceptRowDlg = true;
    },
    cancelRow(invoice) {
      this.selectedInvoice = invoice
      this.cancelRowDlg = true;
    },
    acceptInvoice() {
      this.acceptingInvoice = true;
      api.post('automation/success', {id: this.selectedInvoice.id,send_sms:this.sendSms})
          .then(() => {
            this.acceptingInvoice = false;
            this.acceptRowDlg = false;
            this.$q.notify({
              message: 'درخواست با موفقیت به عنوان موفق ثبت شد',
              type: 'positive'
            })

            this.getData();

          })
          .catch(() => {
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
