<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="text-h6">لیست معرف‌ها</div>
          <q-btn color="primary" label="ثبت معرف جدید" icon="add" @click="openCreateReferrerDialog" />
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
            flat bordered
            class="border-radius-table"
            :loading="loading"
            :rows="rows"
            :filter="filter"
            :columns="columns"
        >
          <template v-slot:loading>
            <q-inner-loading showing color="primary" />
          </template>

          <template v-slot:top-left>
            <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="name" :props="props">
                {{ props.row.name }}
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.description || '-' }}
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn
                    title="مشاهده معرف‌شدگان"
                    dense round color="indigo"
                    icon="people"
                    @click="openIntroducesDialog(props.row.id, props.row.name)"
                />
                <q-btn
                    title="ویرایش"
                    dense round color="yellow-9"
                    icon="edit"
                    @click="openEditReferrerDialog(props.row)"
                />
                <q-btn v-if="$access.can('sales.delete')"
                    title="حذف"
                    dense round color="negative"
                    icon="delete"
                    @click="deleteReferrer(props.row.id)"
                />
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- ============ دیالوگ ثبت / ویرایش معرف ============ -->
    <q-dialog v-model="referrerDialog" persistent>
      <q-card style="width: 500px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">{{ referrerDialogTitle }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <q-input
              v-model="referrerForm.name"
              label="نام معرف *"
              outlined
              dense
              :error="!!formErrors.name"
              :error-message="formErrors.name"
          />
          <q-input
              v-model="referrerForm.description"
              label="توضیحات"
              outlined
              dense
              type="textarea"
              rows="3"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup />
          <q-btn
              color="primary"
              rounded
              :label="referrerDialogMode === 'create' ? 'ثبت' : 'ویرایش'"
              :loading="submitLoading"
              @click="submitReferrer"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ لیست معرف‌شدگان ============ -->
    <q-dialog
        transition-show="slide-up"
        transition-hide="slide-down"
        v-model="introducesDialog"
    >
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ introducesDialogTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-table
              flat bordered
              class="border-radius-table"
              :loading="loadingIntroduces"
              :rows="introducesRows"
              :columns="introducesColumns"
              :rows-per-page-options="[10]"
          >
            <template v-slot:top-right>
              <div class="q-gutter-x-lg">
                <span>
                  مجموع خرید زیر مجموعه ها :
                  {{ moneyFormat(sumInvoicesPrice) + " تومان " }}
                </span>
                <span class="text-positive text-weight-bold">
                  مجموع دریافتی معرف :
                  {{ moneyFormat(sumReferrerIncome) + " تومان " }}
                </span>
              </div>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="customer_status" :props="props">
                  <q-badge color="primary" v-if="props.row.status === 0" label="سرنخ" />
                  <q-badge color="orange-9" v-else-if="props.row.status === 1" label="فرصت" />
                  <q-badge color="secondary" v-else label="مشتری" />
                </q-td>
                <q-td key="customer_type" :props="props">
                  <q-badge color="pink-10" v-if="props.row.type === 2" label="حقوقی" />
                  <q-badge color="purple-10" v-else label="حقیقی" />
                </q-td>
                <q-td key="full_name" :props="props">
                  {{ props.row.fullName }}
                </q-td>
                <q-td key="contact_number" :props="props">
                  {{ props.row.contact_number || '-' }}
                </q-td>
                <q-td key="referrer_percent" :props="props">
                  <referrer-percent-edit
                    v-model="props.row.referrer_percent"
                    :endpoint="'referrers/introduces/percent/' + props.row.id"
                    hint="فقط برای پروژه‌های جدید این مشتری اعمال می‌شود"
                  />
                </q-td>
                <q-td key="total_purchase" :props="props">
                  {{ moneyFormat(props.row.sum_invoices_price) }}
                </q-td>
                <q-td key="referrer_income" :props="props" class="text-positive text-weight-bold">
                  {{ moneyFormat(props.row.referrer_income) }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn :title="'مشخصات خرید ' + props.row.fullName" dense round color="brown" icon="eva-eye-outline"
                         @click="openDetailsDlg(props.row)"/>
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-pa-md">
                هیچ معرف‌شدگانی برای این معرف یافت نشد.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ لیست خرید های مشتری معرف ============ -->
    <q-dialog
      transition-show="slide-up"
      transition-hide="slide-down"
      v-model="customerBuyDetailsDlg"
    >
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6">{{ customerBuyDetailsDialogTitle }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-table
            flat bordered
            class="border-radius-table"
            :rows="customerBuyDetailsRows"
            :columns="customerBuyDetailsColumns"
            :rows-per-page-options="[10]"
          >
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="invoice_number" :props="props">
                  {{ props.row.invoice_number }}
                </q-td>
                <q-td key="purchase_amount" :props="props">
                  {{ moneyFormat(props.row.purchase_amount) }}
                </q-td>
                <q-td key="purchase_introducer_percent" :props="props">
                  <referrer-percent-edit
                    v-model="props.row.purchase_introducer_percent"
                    endpoint="automation/referrer-percent"
                    :payload="{ id: props.row.id }"
                    hint="فقط برای همین پروژه اعمال می‌شود"
                    @saved="data => onProjectPercentSaved(props.row, data)"
                  />
                </q-td>
                <q-td key="purchase_introducer_income" :props="props" class="text-positive text-weight-bold">
                  {{ moneyFormat(props.row.purchase_introducer_income) }}
                </q-td>
                <q-td key="purchase_date" :props="props">
                  {{ props.row.purchase_jalali_date }}
                </q-td>
              </q-tr>
            </template>
            <template v-slot:no-data>
              <div class="full-width row flex-center text-grey q-pa-md">
                هیچ خریدی برای این مشتری یافت نشد.
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ تایید حذف ============ -->
    <q-dialog v-model="deleteConfirmDialog" persistent>
      <q-card style="width: 450px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">آیا از حذف این معرف اطمینان دارید؟</div>
          <div class="text-deep-orange-10">با حذف این معرف، ارتباط معرف‌شدگان آن نیز حذف می‌شود (اما خود سرنخ‌ها و مشتریان حذف نمی‌شوند).</div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup />
          <q-btn color="negative" rounded label="حذف" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { QSpinnerPuff } from 'quasar'
import ReferrerPercentEdit from 'components/ReferrerPercentEdit.vue'

export default {
  name: 'ReferrersList',
  components: { ReferrerPercentEdit },
  data() {
    return {
      loading: true,
      filter: '',
      rows: [],
      columns: [
        { name: 'name', field: 'name', align: 'center', label: 'نام معرف' },
        { name: 'description', field: 'description', align: 'center', label: 'توضیحات' },
        { name: 'action', field: 'action', align: 'center', label: 'عملیات' }
      ],

      // دیالوگ ثبت/ویرایش
      referrerDialog: false,
      referrerDialogMode: 'create', // 'create' | 'edit'
      referrerDialogTitle: '',
      referrerForm: { id: null, name: '', description: '' },
      formErrors: { name: '' },
      submitLoading: false,

      customerBuyDetailsDialogTitle : "",
      customerBuyDetailsDlg : false,
      customerBuyDetailsRows : [],
      customerBuyDetailsColumns : [
        { name: 'invoice_number', field: 'invoice_number', align: 'center', label: 'شماره فاکتور' },
        { name: 'purchase_amount', field: 'purchase_amount', align: 'center', label: 'مبلغ خرید (تومان)' },
        { name: 'purchase_introducer_percent', field: 'purchase_introducer_percent', align: 'center', label: 'درصد پروژه' },
        { name: 'purchase_introducer_income', field: 'purchase_introducer_income', align: 'center', label: 'دریافتی پروژه (تومان)' },
        { name: 'purchase_date', field: 'purchase_date', align: 'center', label: 'تاریخ خرید' },
      ],

      // دیالوگ معرف‌شدگان
      selectedReferrerId: null,
      introducesDialog: false,
      introducesDialogTitle: '',
      loadingIntroduces: false,
      sumInvoicesPrice: 0,
      sumReferrerIncome: 0,
      detailsCustomer: null,
      introducesRows: [],
      introducesColumns: [
        { name: 'customer_status', field: 'customer_status', align: 'center', label: 'دسته بندی' },
        { name: 'customer_type', field: 'customer_type', align: 'center', label: 'نوع' },
        { name: 'full_name', field: 'full_name', align: 'center', label: 'نام' },
        { name: 'contact_number', field: 'contact_number', align: 'center', label: 'شماره تماس' },
        { name: 'referrer_percent', field: 'referrer_percent', align: 'center', label: 'درصد معرف' },
        { name: 'total_purchase', field: 'total_purchase', align: 'center', label: 'مجموع خرید (تومان)' },
        { name: 'referrer_income', field: 'referrer_income', align: 'center', label: 'دریافتی معرف (تومان)' },
        { name: 'operation', field: 'operation', align: 'center', label: 'عملیات' },
      ],

      // دیالوگ حذف
      deleteConfirmDialog: false,
      deleteTargetId: null,
    }
  },
  methods: {
    moneyFormat(digits) {
      if (!digits) return '۰'
      return digits.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    // ============ مشخصات خرید مشتری ============
    openDetailsDlg(customer) {
      this.customerBuyDetailsDialogTitle = 'لیست خرید های : ' + customer.fullName
      this.customerBuyDetailsDlg = true
      this.customerBuyDetailsRows = []
      this.detailsCustomer = customer

      api.get('referrers/introduces/details/' + customer.id)
        .then(response => {
          this.customerBuyDetailsRows = response.data.data
        })
        .catch(() => {
          this.$q.notify({ type: 'negative', position: 'center', message: 'خطا در دریافت خرید های مشتری' })
          this.customerBuyDetailsDlg = false
        })
    },


    // پس از تغییر درصد یک پروژه، دریافتی همان پروژه و مجموع‌ها به‌روز می‌شوند
    onProjectPercentSaved(row, data) {
      const oldIncome = Number(row.purchase_introducer_income) || 0
      row.purchase_introducer_income = data.referrer_income
      const diff = (Number(data.referrer_income) || 0) - oldIncome
      if (this.detailsCustomer) {
        this.detailsCustomer.referrer_income = (Number(this.detailsCustomer.referrer_income) || 0) + diff
      }
      this.sumReferrerIncome += diff
    },

    // ============ دریافت لیست معرف‌ها ============
    fetchReferrers() {
      this.loading = true
      api.get('referrers/list') // مسیر را مطابق با بک‌اند خود تنظیم کنید
          .then(response => {
            this.rows = response.data.data
          })
          .catch(() => {
            this.$q.notify({ type: 'negative', position: 'center', message: 'خطا در دریافت لیست معرف‌ها' })
          })
          .finally(() => {
            this.loading = false
          })
    },

    // ============ باز کردن دیالوگ ثبت معرف جدید ============
    openCreateReferrerDialog() {
      this.referrerDialogMode = 'create'
      this.referrerDialogTitle = 'ثبت معرف جدید'
      this.referrerForm = { id: null, name: '', description: '' }
      this.formErrors = { name: '' }
      this.referrerDialog = true
    },

    // ============ باز کردن دیالوگ ویرایش معرف ============
    openEditReferrerDialog(row) {
      this.referrerDialogMode = 'edit'
      this.referrerDialogTitle = 'ویرایش معرف'
      this.referrerForm = { id: row.id, name: row.name, description: row.description || '' }
      this.formErrors = { name: '' }
      this.referrerDialog = true
    },

    // ============ ثبت / ویرایش معرف ============
    submitReferrer() {
      // اعتبارسنجی ساده
      if (!this.referrerForm.name.trim()) {
        this.formErrors.name = 'نام معرف الزامی است'
        return
      }
      this.formErrors.name = ''

      this.submitLoading = true
      const payload = {
        name: this.referrerForm.name.trim(),
        description: this.referrerForm.description.trim()
      }

      let request
      if (this.referrerDialogMode === 'create') {
        request = api.post('referrers/store', payload)
      } else {
        request = api.post('referrers/update/' + this.referrerForm.id, payload)
      }

      request
          .then(response => {
            this.$q.notify({ type: 'positive', position: 'center', message: response.data.message })
            this.referrerDialog = false
            this.fetchReferrers()
          })
          .catch(error => {
            const msg = error.response?.data?.message || 'خطا در ثبت معرف'
            this.$q.notify({ type: 'negative', position: 'center', message: msg })
          })
          .finally(() => {
            this.submitLoading = false
          })
    },

    // ============ حذف معرف ============
    deleteReferrer(id) {
      this.deleteTargetId = id
      this.deleteConfirmDialog = true
    },
    confirmDelete() {
      if (!this.deleteTargetId) return
      api.post('referrers/destroy/' + this.deleteTargetId)
          .then(response => {
            this.$q.notify({ type: 'positive', position: 'center', message: response.data.message })
            this.deleteConfirmDialog = false
            this.deleteTargetId = null
            this.fetchReferrers()
          })
          .catch(error => {
            const msg = error.response?.data?.message || 'خطا در حذف معرف'
            this.$q.notify({ type: 'negative', position: 'center', message: msg })
            this.deleteConfirmDialog = false
          })
    },

    // ============ نمایش لیست معرف‌شدگان ============
    openIntroducesDialog(referrerId, referrerName) {
      this.introducesDialogTitle = 'لیست معرف‌شدگان: ' + referrerName
      this.introducesDialog = true
      this.loadingIntroduces = true
      this.selectedReferrerId = referrerId
      this.introducesRows = []

      api.get('referrers/introduces/' + referrerId) // مسیر را مطابق با بک‌اند تنظیم کنید
          .then(response => {
            this.sumInvoicesPrice = 0;
            this.sumReferrerIncome = 0;

            this.introducesRows = response.data.data

            this.introducesRows.forEach((item) => {
              this.sumInvoicesPrice += Number(item.sum_invoices_price) || 0;
              this.sumReferrerIncome += Number(item.referrer_income) || 0;
            });

          })
          .catch(() => {
            this.$q.notify({ type: 'negative', position: 'center', message: 'خطا در دریافت معرف‌شدگان' })
          })
          .finally(() => {
            this.loadingIntroduces = false
          })
    }
  },
  created() {
    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال بارگذاری اطلاعات',
      sanitize: true
    })
    this.fetchReferrers()
    this.$q.loading.hide()
  }
}
</script>

<style scoped>
/* همان استایل‌های قبلی را می‌توانید استفاده کنید */
.dialog-card-big-x {
  width: 90vw;
  max-width: 1200px;
}
</style>
