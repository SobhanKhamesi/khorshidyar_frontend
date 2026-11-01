<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent
            :maximized="!$q.screen.gt.sm">
    <q-card class="amend-card">
      <q-card-section class="row items-center">
        <div class="text-h6 col">اصلاحیه فاکتور و روش پرداخت</div>
        <q-btn flat round icon="close" v-close-popup/>
      </q-card-section>
      <q-separator/>

      <div v-if="loading" class="text-center q-pa-xl"><q-spinner color="primary" size="2em"/></div>

      <q-card-section v-else style="max-height: 72vh" class="scroll q-gutter-y-md">
        <q-banner v-if="contractSigned" rounded class="bg-orange-1 text-orange-10">
          قرارداد این درخواست توسط مشتری امضا شده است؛ اصلاحیه روی فاکتور ثبت می‌شود اما متن قرارداد امضا شده تغییر نمی‌کند.
        </q-banner>
        <q-banner v-else-if="contractApproved" rounded class="bg-blue-1 text-blue-10">
          قرارداد این درخواست برای مشتری ارسال شده است؛ پس از ثبت اصلاحیه، قرارداد نیاز به تایید مجدد ادمین دارد.
        </q-banner>

        <!-- اقلام -->
        <div>
          <div class="text-subtitle2 q-mb-sm">اقلام فاکتور</div>
          <div v-for="(item, index) in items" :key="item.uid" class="row q-col-gutter-sm items-center q-mb-xs">
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
              <q-btn dense round flat color="negative" icon="delete" @click="items.splice(index, 1)"/>
            </div>
          </div>
          <q-btn label="افزودن قلم" icon="add" color="primary" outline rounded dense @click="items.push(emptyItem())"/>
        </div>

        <div>
          <q-input outlined type="number" dir="ltr" suffix="تومان" v-model.number="finalPrice"
                   label="مبلغ نهایی (دستی) *" :hint="'جمع اقلام: ' + money(itemsSum) + ' تومان'">
            <template v-slot:after>
              <q-btn flat dense rounded size="sm" color="primary" label="برابر جمع اقلام" @click="finalPrice = itemsSum"/>
            </template>
          </q-input>
        </div>

        <!-- پرداختی‌ها -->
        <div>
          <div class="text-subtitle2 q-mb-sm">پرداختی‌ها</div>
          <div v-for="(p, index) in payments" :key="p.uid" class="row q-col-gutter-sm items-center q-mb-xs">
            <div class="col-md-3 col-xs-12">
              <q-select dense outlined v-model="p.method" label="نوع پرداخت" :options="['نقدی', 'کارتخوان', 'واریز به حساب']"/>
            </div>
            <div class="col-md-4 col-xs-6">
              <q-input dense outlined type="number" dir="ltr" suffix="تومان" v-model.number="p.amount" label="مبلغ"/>
            </div>
            <div class="col-md-4 col-xs-6">
              <q-input dense outlined dir="ltr" mask="####/##/##" v-model="p.date" label="تاریخ پرداخت">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy><q-date today-btn calendar="persian" v-model="p.date" mask="YYYY/MM/DD"/></q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-1 col-xs-12 text-left">
              <q-btn dense round flat color="negative" icon="delete" @click="payments.splice(index, 1)"/>
            </div>
          </div>
          <q-btn label="افزودن پرداختی" icon="add" color="primary" outline rounded dense @click="payments.push(emptyPayment())"/>
        </div>

        <!-- چک‌ها -->
        <div>
          <div class="text-subtitle2 q-mb-sm">چک‌ها</div>
          <div v-for="(c, index) in cheques" :key="c.uid" class="row q-col-gutter-sm items-center q-mb-xs">
            <div class="col-md-3 col-xs-6"><q-input dense outlined v-model="c.number" label="شماره چک"/></div>
            <div class="col-md-3 col-xs-6"><q-input dense outlined v-model="c.bank_name" label="نام بانک"/></div>
            <div class="col-md-2 col-xs-6">
              <q-input dense outlined type="number" dir="ltr" suffix="تومان" v-model.number="c.amount" label="مبلغ"/>
            </div>
            <div class="col-md-3 col-xs-5">
              <q-input dense outlined dir="ltr" mask="####/##/##" v-model="c.due_date" label="سررسید">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy><q-date today-btn calendar="persian" v-model="c.due_date" mask="YYYY/MM/DD"/></q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-1 col-xs-1 text-left">
              <q-btn dense round flat color="negative" icon="delete" @click="cheques.splice(index, 1)"/>
            </div>
          </div>
          <q-btn label="افزودن چک" icon="add" color="primary" outline rounded dense @click="cheques.push(emptyCheque())"/>
        </div>

        <div v-if="paidSum && paidSum !== Number(finalPrice || 0)" class="text-orange-9 text-caption">
          <q-icon name="warning"/>
          مجموع پرداختی‌ها و چک‌ها ({{ money(paidSum) }} تومان) با مبلغ نهایی ({{ money(finalPrice) }} تومان) برابر نیست.
        </div>

        <q-input outlined autogrow type="textarea" v-model="reason" label="علت اصلاحیه (در سابقه کامنت‌ها ثبت می‌شود)"/>
      </q-card-section>

      <q-separator/>
      <q-card-actions align="center" class="q-pa-md">
        <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
        <q-btn rounded color="positive" icon="save" label="ثبت اصلاحیه" :loading="saving" :disable="loading" @click="submit"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

let uid = 0
let cachedProducts = null

/**
 * اصلاحیه فاکتور (اقلام و مبلغ نهایی دستی) و روش پرداخت (پرداختی‌ها و چک‌ها)
 * در هر مرحله از اتوماسیون، حتی فروش موفق. پس از ثبت رویداد saved ارسال می‌شود.
 */
export default {
  name: 'AmendmentDialog',
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''},
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return {
      loading: false,
      saving: false,
      items: [],
      finalPrice: null,
      payments: [],
      cheques: [],
      reason: '',
      products: [],
      productOptions: [],
      contractApproved: false,
      contractSigned: false,
    }
  },
  computed: {
    itemsSum() {
      return this.items.reduce((sum, i) => sum + (Number(i.count) || 0) * (Number(i.price) || 0), 0)
    },
    paidSum() {
      return [...this.payments, ...this.cheques].reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    },
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) this.load()
    }
  },
  methods: {
    emptyItem() {
      return {uid: ++uid, product: null, count: 1, price: 0}
    },
    emptyPayment() {
      return {uid: ++uid, method: null, amount: null, date: ''}
    },
    emptyCheque() {
      return {uid: ++uid, number: '', bank_name: '', amount: null, due_date: ''}
    },
    money(v) {
      return Math.round(Number(v) || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
    load() {
      this.loading = true
      this.reason = ''
      Promise.all([api.get('automation/' + this.automationId), this.loadProducts()])
        .then(([response, products]) => {
          const a = response.data.data
          this.products = products
          this.productOptions = products
          this.items = (a.orders || []).map(o => ({
            uid: ++uid,
            product: products.find(p => p.id === o.product_id) || o.product,
            count: Number(o.count),
            price: Number(o.price),
          }))
          this.finalPrice = a.final_price !== null ? Number(a.final_price) : null
          this.payments = (a.payments || []).map(p => ({uid: ++uid, method: p.method, amount: Number(p.amount), date: p.jalali_date || ''}))
          this.cheques = (a.cheques || []).map(c => ({
            uid: ++uid, number: c.number || '', bank_name: c.bank_name || '', amount: Number(c.amount), due_date: c.jalali_due_date || ''
          }))
          this.contractApproved = a.contract?.status === 1
          this.contractSigned = a.contract?.status === 2
        })
        .finally(() => {
          this.loading = false
        })
    },
    submit() {
      if (this.finalPrice === null || this.finalPrice === '') {
        this.$q.notify({type: 'negative', position: 'center', message: 'مبلغ نهایی را وارد نمایید'})
        return
      }
      if (this.items.some(i => !i.product)) {
        this.$q.notify({type: 'negative', position: 'center', message: 'کالا/خدمت همه اقلام را انتخاب کنید'})
        return
      }

      this.saving = true
      api.post('automation/amend', {
        id: this.automationId,
        orders: this.items.map(i => ({orderProductId: i.product.id, orderCount: i.count, orderPrice: i.price})),
        final_price: this.finalPrice,
        payments: this.payments.filter(p => p.amount).map(p => ({method: p.method, amount: p.amount, date: p.date || null})),
        cheques: this.cheques.filter(c => c.amount).map(c => ({number: c.number, bank_name: c.bank_name, amount: c.amount, due_date: c.due_date || null})),
        reason: this.reason,
      })
        .then(response => {
          this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
          this.$emit('saved', this.automationId)
          this.$emit('update:modelValue', false)
        })
        .finally(() => {
          this.saving = false
        })
    },
  }
}
</script>

<style scoped>
.amend-card {
  width: 900px;
  max-width: 96vw;
}
</style>
