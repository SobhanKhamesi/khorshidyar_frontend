<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :persistent="editing">
    <q-card class="dialog-card-big2" style="max-width: 900px; width: 900px;">
      <q-card-section class="row items-center">
        <div class="text-h6 col">{{ editing ? 'ویرایش پرداختی ها و چک ها' : 'اطلاعات قرارداد' }}</div>
        <q-btn v-if="!editing && !loading" rounded dense outline color="yellow-9" icon="edit" label="ویرایش"
               class="q-px-sm" @click="startEdit"/>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 65vh" class="scroll">
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em"/>
        </div>

        <!-- حالت ویرایش روش پرداخت: در هر مرحله از اتوماسیون، حتی فروش موفق -->
        <div v-else-if="editing" class="q-gutter-y-md">
          <div class="text-caption text-grey">
            مبلغ نهایی: {{ moneyFormat(finalPrice) }} تومان
          </div>

          <div>
            <div class="text-subtitle2 q-mb-sm">پرداختی ها</div>
            <div v-for="(p, index) in editPayments" :key="p.uid" class="row q-col-gutter-sm items-center q-mb-xs">
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
                <q-btn dense round flat color="negative" icon="delete" @click="editPayments.splice(index, 1)"/>
              </div>
            </div>
            <q-btn label="افزودن پرداختی" icon="add" color="primary" outline rounded dense
                   @click="editPayments.push(emptyPayment())"/>
          </div>

          <div>
            <div class="text-subtitle2 q-mb-sm">چک ها</div>
            <div v-for="(c, index) in editCheques" :key="c.uid" class="row q-col-gutter-sm items-center q-mb-xs">
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
                <q-btn dense round flat color="negative" icon="delete" @click="editCheques.splice(index, 1)"/>
              </div>
            </div>
            <q-btn label="افزودن چک" icon="add" color="primary" outline rounded dense
                   @click="editCheques.push(emptyCheque())"/>
          </div>

          <div v-if="paidSum && paidSum !== Number(finalPrice || 0)" class="text-orange-9 text-caption">
            <q-icon name="warning"/>
            مجموع پرداختی‌ها و چک‌ها ({{ moneyFormat(paidSum) }} تومان) با مبلغ نهایی ({{ moneyFormat(finalPrice) }} تومان) برابر نیست.
          </div>

          <q-input outlined autogrow type="textarea" v-model="reason" label="علت اصلاحیه (در سابقه کامنت‌ها ثبت می‌شود)"/>
        </div>

        <div v-else class="q-gutter-y-md">

<!--          <div>-->
<!--            <div class="text-subtitle2 q-mb-xs">اقلام قرارداد</div>-->
<!--            <q-markup-table v-if="contractItems.length" flat bordered dense>-->
<!--              <thead>-->
<!--              <tr>-->
<!--                <th class="text-center">شرح</th>-->
<!--                <th class="text-center">مبلغ</th>-->
<!--              </tr>-->
<!--              </thead>-->
<!--              <tbody>-->
<!--              <tr v-for="(item, i) in contractItems" :key="i">-->
<!--                <td class="text-center">{{ item.title }}</td>-->
<!--                <td class="text-center">{{ moneyFormat(item.amount) }}</td>-->
<!--              </tr>-->
<!--              </tbody>-->
<!--            </q-markup-table>-->
<!--            <div v-else class="text-grey">آیتمی ثبت نشده</div>-->
<!--          </div>-->

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

export default {
  name: "ContractInfoDialog",
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
      contractItems: [],
      payments: [],
      cheques: [],
      finalPrice: null,
      editPayments: [],
      editCheques: [],
      reason: ''
    }
  },
  computed: {
    paidSum() {
      return [...this.editPayments, ...this.editCheques].reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) {
        this.editing = false
        this.fetchContractInfo()
      }
    }
  },
  methods: {
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
    },
    emptyPayment() {
      return {uid: ++uid, method: null, amount: null, date: ''}
    },
    emptyCheque() {
      return {uid: ++uid, number: '', bank_name: '', amount: null, due_date: ''}
    },
    fetchContractInfo() {
      this.loading = true
      this.contractItems = []
      this.payments = []
      this.cheques = []

      api.get('automation/' + this.automationId)
          .then(response => {
            const data = response.data.data
            this.contractItems = data.contract_items || []
            this.payments = data.payments || []
            this.cheques = data.cheques || []
            this.finalPrice = data.final_price
          })
          .finally(() => {
            this.loading = false
          })
    },
    startEdit() {
      this.editPayments = this.payments.map(p => ({uid: ++uid, method: p.method, amount: Number(p.amount), date: p.jalali_date || ''}))
      this.editCheques = this.cheques.map(c => ({
        uid: ++uid, number: c.number || '', bank_name: c.bank_name || '', amount: Number(c.amount), due_date: c.jalali_due_date || ''
      }))
      this.reason = ''
      this.editing = true
    },
    submit() {
      this.saving = true
      // فقط پرداختی‌ها و چک‌ها ارسال می‌شود؛ اقلام و مبلغ نهایی دست نمی‌خورند
      api.post('automation/amend', {
        id: this.automationId,
        payments: this.editPayments.filter(p => p.amount).map(p => ({method: p.method, amount: p.amount, date: p.date || null})),
        cheques: this.editCheques.filter(c => c.amount).map(c => ({
          number: c.number, bank_name: c.bank_name, amount: c.amount, due_date: c.due_date || null
        })),
        reason: this.reason,
      })
          .then(response => {
            this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
            this.editing = false
            this.fetchContractInfo()
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
