<template>
  <!-- صورت سود و زیان پروژه (سرویس نصب) - فقط مدیر -->
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :maximized="!$q.screen.gt.sm">
    <q-card style="width: 1000px; max-width: 100vw;">
      <q-card-section class="row items-center q-pb-sm">
        <div class="col">
          <div class="text-h6">صورت سود و زیان پروژه</div>
          <div v-if="data" class="text-caption text-grey-8">
            {{ data.customer_name }}
            <q-badge class="q-ml-xs" :color="data.is_internal ? 'primary' : 'orange-8'"
                     :label="data.is_internal ? 'خرید از ما' + (data.gross ? ' - فاکتور ' + (data.gross.invoice_number || '') : '') : 'خرید از جای دیگر'"/>
            <q-badge class="q-ml-xs" :color="data.is_final ? 'positive' : 'blue-grey'"
                     :label="data.is_final ? 'تکمیل نهایی' : 'موقت - ' + data.stage_label"/>
          </div>
        </div>
        <q-btn flat round icon="close" v-close-popup/>
      </q-card-section>
      <q-separator/>

      <div v-if="loading && !data" class="text-center q-pa-xl"><q-spinner color="primary" size="2em"/></div>

      <q-card-section v-else-if="data" style="max-height: 78vh" class="scroll q-gutter-y-md">

        <!-- خلاصه -->
        <q-markup-table flat bordered dense separator="cell">
          <tbody>
          <tr v-if="data.is_internal">
            <td>مبلغ کل فاکتور فروش (مبلغ نهایی)</td>
            <td class="text-left text-positive">{{ money(data.sale_amount) }}</td>
          </tr>
          <tr v-if="data.income_total || !data.is_internal">
            <td>دریافتی‌های جانبی (خدمات ارائه شده)</td>
            <td class="text-left text-positive">{{ money(data.income_total) }}</td>
          </tr>
          <tr>
            <td>
              هزینه‌ی واقعی اقلام مصرف شده
              <span v-if="data.items_basis === 'required'" class="text-caption text-orange-9">
                (برآورد از اقلام پیش‌نیاز؛ نصاب هنوز مصرف واقعی را ثبت نکرده)
              </span>
            </td>
            <td class="text-left text-negative">{{ money(-data.items_cost) }}</td>
          </tr>
          <tr class="bg-grey-2">
            <td class="text-weight-medium">سود بر اساس مصرف واقعی</td>
            <td class="text-left text-weight-medium" :class="cls(data.profit_after_items)">{{ money(data.profit_after_items) }}</td>
          </tr>
          <tr v-for="w in data.wages" :key="'w' + w.id">
            <td>دستمزد {{ w.user_name }}<span v-if="w.work_label"> ({{ w.work_label }})</span></td>
            <td class="text-left text-negative">{{ money(-w.amount) }}</td>
          </tr>
          <tr v-for="c in data.costs" :key="'c' + c.id">
            <td>{{ c.title }}</td>
            <td class="text-left text-negative">{{ money(-c.amount) }}</td>
          </tr>
          <tr v-if="data.referrer_amount">
            <td>سهم معرف ({{ data.referrer_percent }}٪ مبلغ فروش)</td>
            <td class="text-left text-negative">{{ money(-data.referrer_amount) }}</td>
          </tr>
          <tr class="bg-blue-1">
            <td class="text-weight-bold">سود نهایی پروژه</td>
            <td class="text-left text-weight-bold text-subtitle1" :class="cls(data.final_profit)">
              {{ money(data.final_profit) }} تومان
            </td>
          </tr>
          <tr v-if="data.gross && data.gross.profit !== null">
            <td class="text-grey-8">سود ناخالص اولیه (ثابت، در لحظه‌ی فروش موفق)</td>
            <td class="text-left text-grey-8">
              {{ money(data.gross.profit) }}
              <span class="text-caption" :class="cls(data.final_profit - data.gross.profit)">
                (اختلاف: {{ money(data.final_profit - data.gross.profit) }})
              </span>
            </td>
          </tr>
          </tbody>
        </q-markup-table>

        <!-- اقلام مصرفی -->
        <q-expansion-item default-opened dense-toggle header-class="bg-grey-2 rounded-borders"
                          icon="inventory_2" :label="itemsTitle" :caption="'جمع: ' + money(data.items_cost) + ' تومان'">
          <div class="q-pa-sm">
            <q-markup-table v-if="priceRows.length" flat bordered dense>
              <thead>
              <tr>
                <th class="text-center">کالا</th>
                <th class="text-center">مقدار</th>
                <th class="text-center">قیمت خرید واحد (تومان)</th>
                <th class="text-center">جمع</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="row in priceRows" :key="row.id">
                <td class="text-center">{{ row.product_name }}</td>
                <td class="text-center">{{ row.quantity }} {{ row.unit || '' }}</td>
                <td class="text-center" style="width: 220px">
                  <q-input dense outlined type="number" dir="ltr" min="0" v-model.number="row.unit_purchase_price"/>
                </td>
                <td class="text-center">{{ money(Math.round((row.quantity || 0) * (row.unit_purchase_price || 0))) }}</td>
              </tr>
              </tbody>
            </q-markup-table>
            <div v-else class="text-grey text-center q-pa-sm">اقلامی برای این پروژه ثبت نشده است</div>
            <div v-if="priceRows.length" class="row justify-between items-center q-mt-sm">
              <div class="text-caption text-grey-8">
                قیمت خرید از فاکتور فروش یا قیمت محصول خوانده شده و فقط برای همین پروژه قابل تغییر است.
              </div>
              <q-btn rounded dense color="primary" icon="save" label="ذخیره قیمت‌ها" class="q-px-sm"
                     :disable="!pricesChanged" :loading="savingPrices" @click="savePrices"/>
            </div>
          </div>
        </q-expansion-item>

        <!-- دستمزدها -->
        <q-expansion-item default-opened dense-toggle header-class="bg-grey-2 rounded-borders" icon="engineering"
                          label="دستمزدها" :caption="'جمع: ' + money(data.wages_total) + ' تومان — در پروفایل هر فرد به‌عنوان دریافتی پروژه نمایش داده می‌شود'">
          <div class="q-pa-sm">
            <q-list v-if="data.wages.length" bordered separator class="rounded-borders">
              <q-item v-for="w in data.wages" :key="w.id">
                <q-item-section>
                  <q-item-label>
                    {{ w.user_name }}
                    <q-badge v-if="w.work_label" outline color="primary" class="q-ml-xs" :label="w.work_label"/>
                    <q-badge v-if="w.is_auto" outline color="grey-7" class="q-ml-xs" label="خودکار از تنظیمات"/>
                  </q-item-label>
                  <q-item-label caption>
                    تاریخ: {{ w.jalali_date }}
                    <span v-if="w.description"> - {{ w.description }}</span>
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-weight-bold">{{ money(w.amount) }}</span>
                    <q-badge :color="w.is_settled ? 'positive' : 'orange'" :label="w.is_settled ? 'تسویه شده' : 'تسویه نشده'"/>
                    <q-btn dense round flat color="yellow-9" icon="edit" @click="openWage(w)"/>
                    <q-btn dense round flat color="negative" icon="delete" @click="confirmDelete('wage', w)"/>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-center q-pa-sm">
              دستمزدی ثبت نشده است (دستمزد پیش‌فرض افراد در تنظیمات ← دستمزد پیش‌فرض تعریف می‌شود)
            </div>
            <q-btn class="q-mt-sm" outline rounded dense color="primary" icon="add" label="ثبت دستمزد" @click="openWage()"/>
          </div>
        </q-expansion-item>

        <!-- هزینه‌ها و دریافتی‌های جانبی -->
        <q-expansion-item default-opened dense-toggle header-class="bg-grey-2 rounded-borders" icon="receipt"
                          label="هزینه‌ها و دریافتی‌های جانبی"
                          :caption="'هزینه: ' + money(data.costs_total) + ' — دریافتی: ' + money(data.income_total) + ' تومان'">
          <div class="q-pa-sm">
            <q-list v-if="financeRows.length" bordered separator class="rounded-borders">
              <q-item v-for="f in financeRows" :key="f.id">
                <q-item-section avatar>
                  <q-badge :color="f.direction === COST ? 'negative' : 'positive'" :label="f.direction_label"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>
                    {{ f.title }}
                    <q-badge v-if="f.source === 2" outline color="grey-7" class="q-ml-xs" label="از فاکتور فروش"/>
                  </q-item-label>
                  <q-item-label caption v-if="f.description">{{ f.description }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-weight-bold" :class="f.direction === COST ? 'text-negative' : 'text-positive'">
                      {{ money(f.amount) }}
                    </span>
                    <q-btn dense round flat color="yellow-9" icon="edit" @click="openFinance(f)"/>
                    <q-btn dense round flat color="negative" icon="delete" @click="confirmDelete('finance', f)"/>
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-center q-pa-sm">هزینه یا دریافتی جانبی ثبت نشده است</div>
            <div class="q-mt-sm q-gutter-x-sm">
              <q-btn outline rounded dense color="negative" icon="remove" label="ثبت هزینه" @click="openFinance(null, COST)"/>
              <q-btn outline rounded dense color="positive" icon="add" label="ثبت دریافتی / خدمت ارائه شده"
                     @click="openFinance(null, INCOME)"/>
            </div>
          </div>
        </q-expansion-item>
      </q-card-section>
    </q-card>

    <!-- فرم دستمزد -->
    <q-dialog v-model="wageDlg">
      <q-card style="width: 520px; max-width: 100vw;">
        <q-form @submit.prevent="saveWage">
          <q-card-section class="text-h6">{{ wageForm.id ? 'ویرایش دستمزد' : 'ثبت دستمزد' }}</q-card-section>
          <q-separator/>
          <q-card-section class="q-gutter-y-md">
            <q-select v-if="!wageForm.id" outlined v-model="wageForm.participant" :options="participantOptions"
                      option-label="label" label="فرد و نوع کار *" @update:model-value="onParticipantSelected"/>
            <div v-else class="text-subtitle2">{{ wageForm.user_name }}</div>
            <q-select outlined v-model="wageForm.work_type" :options="workOptions" emit-value map-options
                      label="نوع کار" clearable/>
            <q-input outlined type="number" dir="ltr" min="1" suffix="تومان" v-model.number="wageForm.amount" label="مبلغ دستمزد *"/>
            <q-input mask="####/##/##" outlined dir="ltr" v-model="wageForm.date" label="تاریخ *">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date today-btn calendar="persian" v-model="wageForm.date" mask="YYYY/MM/DD">
                      <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-toggle v-model="wageForm.is_settled" color="positive" label="تسویه شده"/>
            <q-input outlined autogrow v-model="wageForm.description" label="توضیحات"/>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn type="submit" rounded color="positive" label="ذخیره" :loading="saving"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- فرم هزینه / دریافتی جانبی -->
    <q-dialog v-model="financeDlg">
      <q-card style="width: 520px; max-width: 100vw;">
        <q-form @submit.prevent="saveFinance">
          <q-card-section class="text-h6">
            {{ (financeForm.id ? 'ویرایش ' : 'ثبت ') + (financeForm.direction === COST ? 'هزینه‌ی جانبی' : 'دریافتی جانبی') }}
          </q-card-section>
          <q-separator/>
          <q-card-section class="q-gutter-y-md">
            <q-btn-toggle v-model="financeForm.direction" spread rounded unelevated toggle-color="primary"
                          :options="[{label: 'هزینه', value: COST}, {label: 'دریافتی', value: INCOME}]"/>
            <q-select outlined clearable v-model="financeForm.product" :options="serviceOptions" option-label="name"
                      use-input @filter="filterServices" label="انتخاب از خدمات تعریف شده (اختیاری)"
                      @update:model-value="onServiceSelected">
              <template v-slot:no-option>
                <q-item><q-item-section class="text-grey">خدمتی با این ماهیت در محصولات تعریف نشده است</q-item-section></q-item>
              </template>
            </q-select>
            <q-input outlined v-model="financeForm.title" label="عنوان *" hint="مثلاً حمل و نقل، کارشناس فنی، هزینه‌ی پیش‌بینی نشده"/>
            <q-input outlined type="number" dir="ltr" min="1" suffix="تومان" v-model.number="financeForm.amount" label="مبلغ *"/>
            <q-input outlined autogrow v-model="financeForm.description" label="توضیحات"/>
          </q-card-section>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn type="submit" rounded color="positive" label="ذخیره" :loading="saving"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!-- تایید حذف -->
    <q-dialog v-model="deleteDlg">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white"/>
          <span class="q-ml-sm">{{ deleteTarget && deleteTarget.type === 'wage' ? 'این دستمزد (دریافتی پروفایل فرد) حذف شود؟' : 'این ردیف حذف شود؟' }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="انصراف" color="warning" v-close-popup/>
          <q-btn flat label="حذف" color="negative" :loading="saving" @click="doDelete"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

const COST = 1
const INCOME = 2
const SERVICE = 2

const WORK_OPTIONS = [
  {label: 'نصب کل پروژه', value: 'project'},
  {label: 'نصب پنل', value: 'panel'},
  {label: 'سیم کشی', value: 'wiring'},
  {label: 'راه اندازی', value: 'commissioning'},
  {label: 'بررسی کارشناس فنی', value: 'review'},
]

function todayJalali() {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {year: 'numeric', month: '2-digit', day: '2-digit'})
    .formatToParts(new Date())
  const get = type => parts.find(p => p.type === type)?.value
  return `${get('year')}/${get('month')}/${get('day')}`
}

export default {
  name: 'ProjectFinanceDialog',
  props: {
    modelValue: {type: Boolean, default: false},
    serviceId: {type: String, default: ''}
  },
  emits: ['update:modelValue', 'changed'],
  data() {
    return {
      COST, INCOME,
      workOptions: WORK_OPTIONS,
      loading: false,
      saving: false,
      savingPrices: false,
      data: null,
      priceRows: [],
      users: [],
      services: [],
      serviceOptions: [],

      wageDlg: false,
      wageForm: {},
      financeDlg: false,
      financeForm: {},
      deleteDlg: false,
      deleteTarget: null,
    }
  },
  computed: {
    financeRows() {
      return this.data ? [...this.data.costs, ...this.data.incomes] : []
    },
    itemsTitle() {
      if (!this.data) return ''
      return this.data.items_basis === 'required' ? 'اقلام پیش‌نیاز (برآورد هزینه)' : 'اقلام مصرف شده (ثبت نصاب)'
    },
    pricesChanged() {
      return this.data && this.priceRows.some(r => {
        const original = this.data.items.find(i => i.id === r.id)
        return original && Number(original.unit_purchase_price) !== Number(r.unit_purchase_price)
      })
    },
    // افراد پروژه با نوع کار، و سایر نصاب‌ها/کارشناسان
    participantOptions() {
      const options = (this.data?.participants || []).map(p => ({...p, label: `${p.user_name} - ${p.work_label}`}))
      this.users
        .filter(u => !options.some(o => o.user_id === u.id))
        .forEach(u => options.push({user_id: u.id, user_name: u.name, work_type: null, label: u.name}))
      return options
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.serviceId) {
        this.data = null
        this.fetch()
        this.loadLookups()
      }
    }
  },
  methods: {
    money(value) {
      const n = Math.round(Number(value) || 0)
      return (n < 0 ? '-' : '') + String(Math.abs(n)).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
    },
    cls(value) {
      return Number(value) < 0 ? 'text-negative' : 'text-positive'
    },
    fetch() {
      this.loading = true
      return api.get(`installation-service/${this.serviceId}/finance`)
        .then(response => {
          this.data = response.data.data
          this.priceRows = this.data.items.map(i => ({...i}))
        })
        .finally(() => {
          this.loading = false
        })
    },
    // پس از هر تغییر، صورت سود و زیان دوباره خوانده و به لیست اطلاع داده می‌شود
    reload(message) {
      if (message) this.$q.notify({type: 'positive', position: 'center', message})
      return this.fetch().then(() => this.$emit('changed', {id: this.serviceId, final_profit: this.data.final_profit}))
    },
    loadLookups() {
      if (!this.users.length)
        api.get('technical_experts').then(r => (this.users = r.data.data || []))
      if (!this.services.length)
        api.get('products/list').then(r => (this.services = (r.data.data || []).filter(p => p.kind === SERVICE)))
    },

    // ---------- قیمت اقلام ----------
    savePrices() {
      this.savingPrices = true
      api.put(`installation-service/${this.serviceId}/item-prices`, {
        items: this.priceRows.map(r => ({id: r.id, unit_purchase_price: r.unit_purchase_price || 0}))
      })
        .then(response => this.reload(response.data.message))
        .catch(() => {}) // پیام خطا توسط interceptor نمایش داده می‌شود
        .finally(() => {
          this.savingPrices = false
        })
    },

    // ---------- دستمزد (همان دریافتی پروژه در پروفایل کاربر) ----------
    openWage(item = null) {
      this.wageForm = item ? {
        id: item.id, user_id: item.user_id, user_name: item.user_name, work_type: item.work_type,
        amount: item.amount, date: item.jalali_date, is_settled: item.is_settled,
        settled_at: item.jalali_settled_at || null, description: item.description || '',
      } : {
        id: null, participant: null, user_id: null, work_type: null, amount: null,
        date: todayJalali(), is_settled: false, settled_at: null, description: '',
      }
      this.wageDlg = true
    },
    onParticipantSelected(p) {
      this.wageForm.user_id = p ? p.user_id : null
      if (p && p.work_type) this.wageForm.work_type = p.work_type
    },
    saveWage() {
      if (!this.wageForm.user_id) {
        this.$q.notify({type: 'negative', position: 'center', message: 'فرد را انتخاب کنید'})
        return
      }
      const f = this.wageForm
      const payload = {
        installation_service_id: this.serviceId,
        amount: f.amount,
        date: f.date,
        is_settled: f.is_settled,
        settled_at: f.is_settled ? f.settled_at : null,
        description: f.description,
        work_type: f.work_type,
      }
      this.saving = true
      const request = f.id
        ? api.put(`profile/earnings/${f.id}`, payload)
        : api.post(`profile/${f.user_id}/earnings`, payload)
      request
        .then(response => {
          this.wageDlg = false
          return this.reload(response.data.message)
        })
        .catch(() => {}) // پیام خطا توسط interceptor نمایش داده می‌شود
        .finally(() => {
          this.saving = false
        })
    },

    // ---------- هزینه / دریافتی جانبی ----------
    openFinance(item = null, direction = COST) {
      this.financeForm = item ? {
        id: item.id, direction: item.direction, title: item.title, amount: item.amount, description: item.description || '',
        product: item.product_id ? (this.services.find(s => s.id === item.product_id) || {id: item.product_id, name: item.product_name}) : null,
      } : {id: null, direction, product: null, title: '', amount: null, description: ''}
      this.serviceOptions = this.servicesFor(this.financeForm.direction)
      this.financeDlg = true
    },
    // خدمات هزینه‌ای برای هزینه و خدمات دریافتی برای دریافتی
    servicesFor(direction) {
      const nature = direction === COST ? 1 : 2
      return this.services.filter(s => s.service_nature === nature)
    },
    filterServices(val, update) {
      update(() => {
        const needle = (val || '').toLowerCase()
        this.serviceOptions = this.servicesFor(this.financeForm.direction)
          .filter(s => (s.name || '').toLowerCase().includes(needle))
      })
    },
    onServiceSelected(service) {
      if (!service) return
      this.financeForm.title = service.name
      // پیش‌فرض مبلغ: قیمت خرید برای هزینه و قیمت فروش برای دریافتی (قابل تغییر)
      const amount = Number(this.financeForm.direction === COST ? service.purchase_price : service.selling_price) || null
      if (!this.financeForm.amount && amount) this.financeForm.amount = amount
    },
    saveFinance() {
      const f = this.financeForm
      const payload = {
        direction: f.direction,
        product_id: f.product ? f.product.id : null,
        title: f.title,
        amount: f.amount,
        description: f.description,
      }
      this.saving = true
      const request = f.id
        ? api.put(`installation-service/${this.serviceId}/finance-items/${f.id}`, payload)
        : api.post(`installation-service/${this.serviceId}/finance-items`, payload)
      request
        .then(response => {
          this.financeDlg = false
          return this.reload(response.data.message)
        })
        .catch(() => {}) // پیام خطا توسط interceptor نمایش داده می‌شود
        .finally(() => {
          this.saving = false
        })
    },

    // ---------- حذف ----------
    confirmDelete(type, item) {
      this.deleteTarget = {type, item}
      this.deleteDlg = true
    },
    doDelete() {
      const {type, item} = this.deleteTarget
      const url = type === 'wage'
        ? `profile/earnings/${item.id}`
        : `installation-service/${this.serviceId}/finance-items/${item.id}`
      this.saving = true
      api.delete(url)
        .then(response => {
          this.deleteDlg = false
          return this.reload(response.data.message)
        })
        .catch(() => {}) // پیام خطا توسط interceptor نمایش داده می‌شود
        .finally(() => {
          this.saving = false
        })
    },
  }
}
</script>
