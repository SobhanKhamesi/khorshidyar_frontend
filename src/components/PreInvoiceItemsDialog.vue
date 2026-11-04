<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :persistent="editing">
    <q-card class="dialog-card-big2" style="max-width: 900px; width: 900px;">
      <q-card-section class="row items-center">
        <div class="text-h6 col">{{ editing ? 'ویرایش ' + dlgTitle : dlgTitle }}</div>
        <q-btn v-if="!editing && !loading" rounded dense outline color="yellow-9" icon="edit" label="ویرایش"
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
              <div class="col-md-5 col-xs-12">
                <q-select dense outlined v-model="item.product" :options="productOptions" option-label="name"
                          use-input @filter="filterProducts" label="کالا/خدمت"
                          @update:model-value="p => { if (p && !item.price) item.price = Number(p.selling_price) || 0 }"/>
              </div>
              <div class="col-md-2 col-xs-4">
                <q-input dense outlined type="number" dir="ltr" v-model.number="item.count" label="تعداد"/>
              </div>
              <div class="col-md-4 col-xs-6">
                <q-input dense outlined type="number" dir="ltr" suffix="تومان" v-model.number="item.price" label="فی"/>
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

          <q-input outlined autogrow type="textarea" v-model="reason" label="علت اصلاحیه (در سابقه کامنت‌ها ثبت می‌شود)"/>
        </div>

        <template v-else>
          <q-markup-table v-if="items.length" flat bordered dense>
            <thead>
            <tr>
              <th class="text-center">محصول</th>
              <th class="text-center">تعداد</th>
              <th class="text-center">مبلغ واحد</th>
              <th class="text-center">مبلغ کل</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="(item, idx) in items" :key="idx">
              <td class="text-center">{{ item.product?.name || item.product_name }}</td>
              <td class="text-center">{{ item.count }}</td>
              <td class="text-center">{{ moneyFormat(item.price) }}</td>
              <td class="text-center">{{ moneyFormat((item.count || 0) * (item.price || 0)) }}</td>
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
      return {uid: ++uid, product: null, count: 1, price: 0}
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

      api.get('automation/' + this.automationId)
          .then(response => {
            const data = response.data.data
            this.items = data.orders || []
            this.finalPrice = data.final_price
            this.contractStatus = data.contract?.status ?? null
            this.dlgTitle = Number(data.status) === 3 ? "اقلام فاکتور فروش" : "اقلام پیش فاکتور"
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
        orders: this.editItems.map(i => ({orderProductId: i.product.id, orderCount: i.count, orderPrice: i.price})),
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
