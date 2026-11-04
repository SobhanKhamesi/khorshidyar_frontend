<template>
  <div>
    <div
        v-for="(item, index) in modelValue"
        :key="index"
        class="row q-col-gutter-md items-start q-mb-sm">

      <div class="col-md-7 col-xs-12">
        <q-select
            option-label="name"
            option-value="id"
            outlined
            dense
            use-input
            clearable
            v-model="item.product"
            label="انتخاب محصول"
            :options="productOptions"
            @filter="filterProducts"
            behavior="dialog">
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">یافت نشد</q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>

      <div class="col-md-3 col-xs-8">
        <q-input
            outlined
            dense
            type="number"
            min="0"
            step="any"
            v-model.number="item.quantity"
            label="تعداد / مقدار">
          <template v-slot:append>
            <span class="text-caption text-grey-8">{{ unitTitle(item.product) }}</span>
          </template>
        </q-input>
      </div>

      <div class="col-md-2 col-xs-4 flex flex-center">
        <q-btn
            round
            flat
            dense
            color="negative"
            icon="delete"
            @click.prevent="removeRow(index)">
          <q-tooltip>حذف ردیف</q-tooltip>
        </q-btn>
      </div>

    </div>

    <q-btn
        outline
        rounded
        dense
        color="accent"
        icon="add"
        label="افزودن ردیف"
        @click.prevent="addRow"/>
  </div>
</template>

<script>
import {api} from 'boot/axios'

// ردیف های اقلام سرویس نصب: فقط محصول + تعداد با واحد محصول
export default {
  name: "InstallationItemsEditor",

  props: {
    modelValue: {type: Array, required: true}
  },

  emits: ['update:modelValue'],

  data() {
    return {
      products: [],
      productOptions: []
    }
  },

  methods: {
    unitTitle(product) {
      return product && product.unit ? product.unit.title : ''
    },

    addRow() {
      this.$emit('update:modelValue', [...this.modelValue, {product: null, quantity: 1}])
    },

    removeRow(index) {
      this.$emit('update:modelValue', this.modelValue.filter((_, i) => i !== index))
    },

    filterProducts(val, update) {
      update(() => {
        const needle = (val || '').toLowerCase()
        this.productOptions = needle
            ? this.products.filter(p => (p.name || '').toLowerCase().indexOf(needle) > -1)
            : this.products
      })
    }
  },

  created() {
    api.get('products/list')
        .then(response => {
          this.products = response.data.data
          this.productOptions = response.data.data
        })
  }
}
</script>
