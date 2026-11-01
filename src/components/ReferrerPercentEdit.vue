<template>
  <div class="row inline items-center no-wrap q-gutter-x-xs">
    <span>{{ modelValue !== null && modelValue !== undefined && modelValue !== '' ? modelValue + '٪' : '-' }}</span>
    <q-btn v-if="editable" flat round dense size="sm" color="yellow-9" icon="edit" :title="title" :loading="saving">
      <q-popup-edit
        v-model="draft"
        auto-save
        v-slot="scope"
        @before-show="draft = modelValue"
        @save="save"
      >
        <div class="text-caption text-grey-8 q-mb-xs">{{ hint }}</div>
        <q-input
          v-model.number="scope.value"
          type="number"
          dir="ltr"
          min="0"
          max="100"
          dense
          autofocus
          outlined
          label="درصد معرف"
          :rules="[v => (v !== '' && v !== null && Number.isInteger(Number(v)) && v >= 0 && v <= 100) || 'عدد صحیح بین ۰ تا ۱۰۰']"
          @keyup.enter="scope.set"
        />
      </q-popup-edit>
    </q-btn>
  </div>
</template>

<script>
import { api } from 'boot/axios'

/**
 * نمایش و ویرایش درجای درصد معرف.
 * endpoint: آدرس API برای ذخیره، payload: فیلدهای اضافه درخواست (مثل id پروژه).
 * پس از ذخیره، رویداد saved با پاسخ سرور (data) ارسال می‌شود.
 */
export default {
  name: 'ReferrerPercentEdit',
  props: {
    modelValue: { type: [Number, String], default: null },
    endpoint: { type: String, required: true },
    payload: { type: Object, default: () => ({}) },
    editable: { type: Boolean, default: true },
    title: { type: String, default: 'ویرایش درصد معرف' },
    hint: { type: String, default: '' },
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return { draft: this.modelValue, saving: false }
  },
  methods: {
    save(value) {
      const percent = Number(value)
      if (!Number.isInteger(percent) || percent < 0 || percent > 100 || value === '' || value === null) return

      this.saving = true
      api.post(this.endpoint, { ...this.payload, referrer_percent: percent })
        .then(response => {
          this.$emit('update:modelValue', percent)
          this.$emit('saved', response.data.data)
          this.$q.notify({ type: 'positive', position: 'center', message: response.data.message })
        })
        .catch(error => {
          // پیام خطاهای سرور را interceptor در boot/axios نمایش می‌دهد
          if (error.response) return
          const msg = error.response?.data?.message || 'خطا در ویرایش درصد معرف'
          this.$q.notify({ type: 'negative', position: 'center', message: msg })
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>
