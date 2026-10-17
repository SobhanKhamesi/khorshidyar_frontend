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
                <q-btn
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
              <div v-if="sumInvoicesPrice > 0">
                مجموع خرید زیر مجموعه ها :
                {{ moneyFormat(sumInvoicesPrice) + " تومان " }}
              </div>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="customer_status" :props="props">
                  <q-badge color="primary" v-if="props.row.status === 0" label="سرنخ" />
                  <q-badge color="secondary" v-else-if="props.row.status === 3" label="مشتری" />
                </q-td>
                <q-td key="customer_type" :props="props">
                  <q-badge color="pink-10" v-if="props.row.status === 'legal'" label="حقوقی" />
                  <q-badge color="purple-10" v-else label="حقیقی" />
                </q-td>
                <q-td key="full_name" :props="props">
                  {{ props.row.fullName }}
                </q-td>
                <q-td key="contact_number" :props="props">
                  {{ props.row.contact_number || '-' }}
                </q-td>
                <q-td key="total_purchase" :props="props">
                  {{ moneyFormat(props.row.sum_invoices_price) }}
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

export default {
  name: 'ReferrersList',
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

      // دیالوگ معرف‌شدگان
      introducesDialog: false,
      introducesDialogTitle: '',
      loadingIntroduces: false,
      sumInvoicesPrice: 0,
      introducesRows: [],
      introducesColumns: [
        { name: 'customer_status', field: 'customer_status', align: 'center', label: 'دسته بندی' },
        { name: 'customer_type', field: 'customer_type', align: 'center', label: 'نوع' },
        { name: 'full_name', field: 'full_name', align: 'center', label: 'نام' },
        { name: 'contact_number', field: 'contact_number', align: 'center', label: 'شماره تماس' },
        { name: 'total_purchase', field: 'total_purchase', align: 'center', label: 'مجموع خرید (تومان)' }
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
      this.introducesRows = []

      api.get('referrers/introduces/' + referrerId) // مسیر را مطابق با بک‌اند تنظیم کنید
          .then(response => {
            this.sumInvoicesPrice = 0;

            this.introducesRows = response.data.data

            this.introducesRows.forEach((item) => {
              this.sumInvoicesPrice += item.sum_invoices_price;
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
