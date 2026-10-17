<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card-big2">
      <q-card-section>
        <div class="text-h6">{{ dlgTitle }}</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div v-if="loading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em"/>
        </div>

        <q-markup-table v-else-if="items.length" flat bordered dense>
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

        <div v-if="!loading" class="row justify-end q-mt-md">
          <div class="text-subtitle1">
            جمع کل: <strong>{{ moneyFormat(finalPrice) }}</strong> تومان
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
  name: "PreInvoiceItemsDialog",
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''}
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      dlgTitle: "",
      items: [],
      finalPrice: null
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) {
        this.fetchItems()
      }
    }
  },
  methods: {
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
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
            this.dlgTitle = Number(data.status) === 3 ? "اقلام فاکتور فروش" : "اقلام پیش فاکتور"
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
