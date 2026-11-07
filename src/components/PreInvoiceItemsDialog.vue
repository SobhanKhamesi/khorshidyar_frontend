<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :persistent="editing">
    <q-card class="dialog-card-big2" style="max-width: 900px; width: 900px;">
      <q-card-section class="row items-center">
        <div class="text-h6 col">{{ editing ? 'ویرایش ' + dlgTitle : dlgTitle }}</div>
        <q-btn v-if="!editing && !loading && (!isSuccess || $access.canManageSalesStages())" rounded dense outline color="yellow-9" icon="edit" label="ویرایش"
               class="q-px-sm" @click="startEdit"/>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 70vh" class="scroll">
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em"/>
        </div>

        <!-- حالت ویرایش: در هر مرحله از اتوماسیون، حتی فروش موفق -->
        <div v-else-if="editing" class="q-gutter-y-md">
          <q-banner v-if="contractStatus === 2" rounded dense class="bg-orange-1 text-orange-10">
            قرارداد این درخواست توسط مشتری امضا شده است؛ اصلاحیه روی فاکتور ثبت می‌شود اما متن قرارداد امضا شده تغییر نمی‌کند.
          </q-banner>
          <q-banner v-else-if="contractStatus === 1" rounded dense class="bg-blue-1 text-blue-10">
            قرارداد این درخواست برای مشتری ارسال شده است؛ پس از ثبت اصلاحیه، قرارداد نیاز به تایید مجدد ادمین دارد.
          </q-banner>

          <div>
            <div v-for="(item, index) in editItems" :key="item.uid" class="row q-col-gutter-sm items-center q-mb-xs">
              <div class="col-md-4 col-xs-12">
                <q-select dense outlined v-model="item.product" :options="productOptions" :option-label="productLabel"
                          use-input @filter="filterProducts" label="کالا/خدمت"
                          @update:model-value="p => onProductSelected(item, p)"/>
              </div>
              <div class="col-md-2 col-xs-4">
                <q-input dense outlined type="number" dir="ltr" v-model.number="item.count" label="تعداد"/>
              </div>
              <div v-if="isService(item.product)" class="col-md-5 col-xs-8">
                <q-input v-if="isCostService(item.product)" dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                         v-model.number="item.purchasePrice" label="مبلغ هزینه (برای ما)"/>
                <q-input v-else dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                         v-model.number="item.price" label="مبلغ دریافتی"/>
              </div>
              <div v-if="!isService(item.product)" class="col-md-3 col-xs-4">
                <q-input dense outlined type="number" dir="ltr" suffix="تومان" v-model.number="item.purchasePrice"
                         label="قیمت خرید"/>
              </div>
              <div v-if="!isService(item.product)" class="col-md-2 col-xs-4">
                <q-input dense outlined type="number" dir="ltr" suffix="تومان" v-model.number="item.price" label="فی فروش"/>
              </div>
              <div class="col-md-1 col-xs-2 text-left">
                <q-btn dense round flat color="negative" icon="delete" :disable="editItems.length === 1"
                       @click="editItems.splice(index, 1)"/>
              </div>
            </div>
            <q-btn label="افزودن قلم" icon="add" color="primary" outline rounded dense @click="editItems.push(emptyItem())"/>
          </div>

          <q-input outlined type="number" dir="ltr" suffix="تومان" v-model.number="editFinalPrice"
                   label="مبلغ نهایی (دستی) *" :hint="'جمع اقلام: ' + moneyFormat(itemsSum) + ' تومان'">
            <template v-slot:after>
              <q-btn flat dense rounded size="sm" color="primary" label="برابر جمع اقلام" @click="editFinalPrice = itemsSum"/>
            </template>
          </q-input>

          <div class="text-caption text-grey-8">
            جمع قیمت خرید: {{ moneyFormat(editPurchaseSum) }} تومان —
            سود ناخالص این فاکتور: <strong :class="profitClass(Number(editFinalPrice || 0) - editPurchaseSum)">
            {{ moneyFormat(Number(editFinalPrice || 0) - editPurchaseSum) }}</strong> تومان
            <span v-if="grossProfit !== null"> (سود ناخالص ثبت شده در فروش موفق ثابت می‌ماند)</span>
          </div>

          <q-input outlined autogrow type="textarea" v-model="reason" label="علت اصلاحیه (در سابقه کامنت‌ها ثبت می‌شود)"/>
        </div>

        <template v-else>
          <q-markup-table v-if="items.length" flat bordered dense>
            <thead>
            <tr>
              <th class="text-center">محصول</th>
              <th class="text-center">تعداد</th>
              <th class="text-center">قیمت خرید واحد</th>
              <th class="text-center">مبلغ واحد</th>
              <th class="text-center">مبلغ کل</th>
              <th class="text-center">سود ردیف</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, idx) in items" :key="idx">
              <td class="text-center">
                {{ item.product?.name || item.product_name }}
                <q-badge v-if="item.product?.kind === 2" :color="item.product.service_nature === 1 ? 'negative' : 'teal'" outline
                         :label="'خدمت ' + (item.product.service_nature_label || '')"/>
              </td>
              <td class="text-center">{{ item.count }}</td>
              <td class="text-center">{{ item.purchase_price === null || item.purchase_price === undefined ? '-' : moneyFormat(item.purchase_price) }}</td>
              <td class="text-center">{{ moneyFormat(item.price) }}</td>
              <td class="text-center">{{ moneyFormat((item.count || 0) * (item.price || 0)) }}</td>
              <td class="text-center" :class="profitClass(rowProfit(item))">{{ moneyFormat(rowProfit(item)) }}</td>
            </tr>
            </tbody>
          </q-markup-table>

          <div v-else class="text-center text-grey q-pa-md">
            آیتمی برای این پیش فاکتور ثبت نشده است
          </div>

          <div class="row justify-end q-mt-md">
            <div class="text-subtitle1">
              جمع کل: <strong>{{ moneyFormat(finalPrice) }}</strong> تومان
            </div>
          </div>
          <div class="row justify-end">
            <div class="text-body2 text-grey-8">
              جمع قیمت خرید: {{ moneyFormat(purchaseSum) }} تومان
            </div>
          </div>
          <div v-if="grossProfit !== null" class="row justify-end q-mt-xs">
            <div class="text-subtitle1">
              سود ناخالص اولیه (ثبت شده در فروش موفق):
              <strong :class="profitClass(grossProfit)">{{ moneyFormat(grossProfit) }}</strong> تومان
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions align="center">
        <template v-if="editing">
          <q-btn outline rounded color="accent" label="انصراف" @click="editing = false"/>
          <q-btn rounded color="positive" icon="save" label="ثبت تغییرات" :loading="saving" @click="submit"/>
        </template>
        <q-btn v-else outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

let uid = 0
let cachedProducts = null

export default {
  name: "PreInvoiceItemsDialog",
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''}
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return {
      loading: false,
      saving: false,
      editing: false,
      dlgTitle: "",
      items: [],
      finalPrice: null,
      grossProfit: null,
      isSuccess: false,
      contractStatus: null,
      editItems: [],
      editFinalPrice: null,
      reason: '',
      products: [],
      productOptions: []
    }
  },
  computed: {
    itemsSum() {
      return this.editItems.reduce((sum, i) => sum + (Number(i.count) || 0) * (Number(i.price) || 0), 0)
    },
    editPurchaseSum() {
      return this.editItems.reduce((sum, i) => sum + (Number(i.count) || 0) * (Number(i.purchasePrice) || 0), 0)
    },
    purchaseSum() {
      return this.items.reduce((sum, i) => sum + (Number(i.count) || 0) * (Number(i.purchase_price) || 0), 0)
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) {
        this.editing = false
        this.fetchItems()
      }
    }
  },
  methods: {
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
    },
    emptyItem() {
      return {uid: ++uid, product: null, count: 1, price: 0, purchasePrice: 0}
    },
    productLabel(p) {
      return p ? p.name + (p.kind === 2 ? ' (خدمت)' : '') : ''
    },
    // قیمت خرید و فروش پیش‌فرض از محصول؛ کاربر می‌تواند برای همین فاکتور تغییر دهد
    // خدمت فقط یک مبلغ دارد: خدمت هزینه ← مبلغ هزینه (قیمت خرید)، خدمت دریافتی ← مبلغ دریافتی (قیمت فروش)
    isService(p) {
      return !!p && p.kind === 2
    },
    isCostService(p) {
      return this.isService(p) && p.service_nature === 1
    },
    onProductSelected(item, p) {
      if (!p) return
      if (this.isService(p)) {
        const amount = Number(p.service_amount) || 0
        if (this.isCostService(p)) {
          item.price = 0
          if (!item.purchasePrice) item.purchasePrice = amount
        } else {
          item.purchasePrice = 0
          if (!item.price) item.price = amount
        }
        return
      }
      if (!item.price) item.price = Number(p.selling_price) || 0
      if (!item.purchasePrice) item.purchasePrice = Number(p.purchase_price) || 0
    },
    rowProfit(item) {
      return Math.round((Number(item.count) || 0) * ((Number(item.price) || 0) - (Number(item.purchase_price) || 0)))
    },
    profitClass(value) {
      return Number(value) < 0 ? 'text-negative' : 'text-positive'
    },
    filterProducts(val, update) {
      update(() => {
        const needle = (val || '').toLowerCase()
        this.productOptions = this.products.filter(p => (p.name || '').toLowerCase().includes(needle))
      })
    },
    loadProducts() {
      if (cachedProducts) return Promise.resolve(cachedProducts)
      return api.get('products/list').then(r => (cachedProducts = r.data.data))
    },
    fetchItems() {
      this.loading = true
      this.items = []
      this.finalPrice = null
      this.grossProfit = null

      api.get('automation/' + this.automationId)
          .then(response => {
            const data = response.data.data
            this.items = data.orders || []
            this.finalPrice = data.final_price
            this.grossProfit = data.gross_profit ?? null
            this.contractStatus = data.contract?.status ?? null
            this.isSuccess = Number(data.status) === 3
            this.dlgTitle = this.isSuccess ? "اقلام فاکتور فروش" : "اقلام پیش فاکتور"
          })
          .finally(() => {
            this.loading = false
          })
    },
    startEdit() {
      this.loading = true
      this.loadProducts()
          .then(products => {
            this.products = products
            this.productOptions = products
            this.editItems = this.items.map(o => ({
              uid: ++uid,
              product: products.find(p => p.id === o.product_id) || o.product,
              count: Number(o.count),
              price: Number(o.price),
              purchasePrice: o.purchase_price === null || o.purchase_price === undefined ? null : Number(o.purchase_price),
            }))
            if (!this.editItems.length) this.editItems.push(this.emptyItem())
            this.editFinalPrice = this.finalPrice !== null ? Number(this.finalPrice) : null
            this.reason = ''
            this.editing = true
          })
          .finally(() => {
            this.loading = false
          })
    },
    submit() {
      if (this.editFinalPrice === null || this.editFinalPrice === '') {
        this.$q.notify({type: 'negative', position: 'center', message: 'مبلغ نهایی را وارد نمایید'})
        return
      }
      if (this.editItems.some(i => !i.product)) {
        this.$q.notify({type: 'negative', position: 'center', message: 'کالا/خدمت همه اقلام را انتخاب کنید'})
        return
      }

      this.saving = true
      // فقط اقلام و مبلغ نهایی ارسال می‌شود؛ پرداختی‌ها و چک‌ها دست نمی‌خورند
      api.post('automation/amend', {
        id: this.automationId,
        orders: this.editItems.map(i => ({
          orderProductId: i.product.id, orderCount: i.count, orderPrice: i.price, orderPurchasePrice: i.purchasePrice,
        })),
        final_price: this.editFinalPrice,
        reason: this.reason,
      })
          .then(response => {
            this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
            this.editing = false
            this.fetchItems()
            this.$emit('saved', this.automationId)
          })
          .finally(() => {
            this.saving = false
          })
    }
  }
}
</script>

<style scoped>
</style>
