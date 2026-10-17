<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست فروش های ناموفق</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
            flat bordered class="border-radius-table"
            :loading="loading"
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
                {{ props.row.number }}
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
              <q-td key="Text_canceling" :props="props" class="q-gutter-x-sm">
                <span v-if="props.row.failure !== null">
                  {{ props.row.failure.title }}
                </span>
              </q-td>

              <q-td key="action" :props="props" class="q-gutter-x-sm">

                <q-btn
                    v-if="hasSurvey(props.row)"
                    @click.prevent="showSurveyForm(props.row.id)"
                    title="نمایش فرم بازدید" dense round color="brown" icon="assignment"/>

                <q-btn
                    v-if="hasPreInvoiceItems(props.row)"
                    @click.prevent="showPreInvoiceItems(props.row.id)"
                    title="نمایش پیش فاکتور" dense round color="deep-purple" icon="list_alt"/>

                <q-btn
                    v-if="hasContractInfo(props.row)"
                    @click.prevent="showContractInfo(props.row.id)"
                    title="نمایش قرارداد و پرداختی ها" dense round color="indigo" icon="receipt_long"/>

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

              </q-td>

            </q-tr>
          </template>


        </q-table>
      </q-card-section>
    </q-card>

    <!-- دیالوگ های نمایشی مشترک -->
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
          <q-btn color="teal" @click.prevent="createComment" label="افزودن"/>
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
  </q-page>
  <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>
</template>

<script>
import {exportFile, LocalStorage} from 'quasar'
import {api} from 'boot/axios'
import SurveyViewDialog from 'components/SurveyViewDialog.vue'
import PreInvoiceItemsDialog from 'components/PreInvoiceItemsDialog.vue'
import ContractInfoDialog from 'components/ContractInfoDialog.vue'
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
  name: "listcanseling",
  components: {CustomerInfoDialog, SurveyViewDialog, PreInvoiceItemsDialog, ContractInfoDialog},
  data() {

    return {
      customerInfoDlg: false,
      customerInfoTarget: null,

      commentsRows: [],
      commentsColumns: [
        {name: 'user', field: 'user', align: 'center', label: 'کاربر'},
        {name: 'content', field: 'content', align: 'center', label: 'متن'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'},

      ],
      newCommentDlg: false,
      newCommentContent: '',
      commentForUUID: '',

      deleteCommentConfirmDialog: false,
      itemCommentFocusingId: '',
      showCommentsDlg: false,
      commentsLoading: false,

      // ---------- دیالوگ های نمایشی ----------
      focusedAutomationId: '',
      surveyViewDlg: false,
      preInvoiceItemsDlg: false,
      contractInfoDlg: false,

      userRole: Number(LocalStorage.getItem('role')),
      acceptRowDlg: false,
      acceptingInvoice: false,
      filter: '',

      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: false,
      columns: [
        {name: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'number', field: 'number', align: 'center', label: 'شماره فاکتور'},
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'survey_type', field: 'survey_type', align: 'center', label: 'نوع کارشناسی'},
        {name: 'final_price', field: 'final_price', align: 'center', label: 'مبلغ (تومان)'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'Text_canceling', field: 'Text_canceling', align: 'center', label: 'علت کنسلی'},
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

    // ---------- شرط نمایش دکمه ها ----------
    // توجه: برای دقیق تر شدن این شروط، بک اند باید در پاسخ لیست، فیلدهای
    // orders_count / contract_items_count / payments_count / cheques_count
    // را با withCount اضافه کند. تا آن زمان از final_price به عنوان جایگزین استفاده می شود.
    hasSurvey(row) {
      return !!row.survey_type
    },
    hasPreInvoiceItems(row) {
      if (row.orders_count !== undefined) return row.orders_count > 0
      return row.final_price !== null && row.final_price !== undefined
    },
    hasContractInfo(row) {
      if (row.contract_items_count !== undefined || row.payments_count !== undefined || row.cheques_count !== undefined) {
        return (row.contract_items_count || 0) > 0 || (row.payments_count || 0) > 0 || (row.cheques_count || 0) > 0
      }
      // fallback: در نبود شمارنده از بک اند، اگر پیش فاکتور داشته احتمال قرارداد هم هست
      return row.final_price !== null && row.final_price !== undefined
    },

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

    getData() {
      this.loading = true
      api.get('automation/list/-1')
          .then(response => {
            this.rows = response.data.data
            this.loading = false
          })
          .catch(() => {
            this.loading = false
          })
          .finally(() => {
            this.loading = false
          });
    },

    acceptRow(invoice) {
      this.selectedInvoice = invoice
      this.acceptRowDlg = true;
    },
    acceptInvoice() {
      this.acceptingInvoice = true;
      api.get('automation/accept/' + this.selectedInvoice.id)
          .then(response => {
            this.acceptingInvoice = false;
            this.acceptRowDlg = false;
            this.$q.notify({
              message: 'با موفقیت تایید شد',
              type: 'positive'
            })

            this.getData();

          })
          .catch(() => {
            this.acceptingInvoice = false
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
      payload.id = this.itemFocusingId

      api.post('automation/destroy', payload)
          .then(response => {
            this.$q.notify({
              type: 'positive',
              position: 'center',
              message: response.data.message
            })

            this.deleteConfirmDialog = false;
            this.loading = false;
            this.getData();
          })
          .catch(() => {
            this.loading = false
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
    this.getData()
  }

}

</script>

<style scoped>

</style>
