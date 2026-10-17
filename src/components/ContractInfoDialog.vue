<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card-big2">
      <q-card-section>
        <div class="text-h6">اطلاعات قرارداد</div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 65vh" class="scroll">
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em"/>
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
        <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

export default {
  name: "ContractInfoDialog",
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''}
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      contractItems: [],
      payments: [],
      cheques: []
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) {
        this.fetchContractInfo()
      }
    }
  },
  methods: {
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
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
          })
          .finally(() => {
            this.loading = false
          })
    }
  }
}
</script>

<style scoped>
</style>
