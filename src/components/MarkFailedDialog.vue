<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 460px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">تبدیل فروش موفق به ناموفق</div>
        <div class="text-caption text-grey-8">این فروش به لیست «فروش‌های ناموفق» منتقل می‌شود و در صورت نیاز از همان‌جا قابل بازگردانی است.</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <q-select outlined clearable v-model="failure" :options="failureOptions" option-label="title" option-value="id"
                  label="دلیل شکست" :loading="loading"/>
        <q-input outlined autogrow type="textarea" v-model="reason" class="q-mt-md"
                 label="توضیحات (در سابقه کامنت‌ها ثبت می‌شود)"/>
      </q-card-section>
      <q-card-actions align="center" class="q-pb-md">
        <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
        <q-btn rounded color="negative" icon="cancel" label="تبدیل به ناموفق" :loading="saving" @click="submit"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

/**
 * تبدیل یک فروش (از جمله فروش موفق) به ناموفق با انتخاب دلیل شکست.
 */
export default {
  name: 'MarkFailedDialog',
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''},
  },
  emits: ['update:modelValue', 'saved'],
  data() {
    return {loading: false, saving: false, failure: null, reason: '', failureOptions: []}
  },
  watch: {
    modelValue(val) {
      if (!val) return
      this.failure = null
      this.reason = ''
      if (!this.failureOptions.length) {
        this.loading = true
        api.get('failure/list')
          .then(response => {
            this.failureOptions = response.data.data
          })
          .finally(() => {
            this.loading = false
          })
      }
    }
  },
  methods: {
    submit() {
      if (!this.failure) {
        this.$q.notify({type: 'negative', position: 'center', message: 'دلیل شکست را انتخاب نمایید'})
        return
      }
      this.saving = true
      api.post('automation/destroy', {id: this.automationId, failure: this.failure.id, reason: this.reason})
        .then(() => {
          this.$q.notify({type: 'positive', position: 'center', message: 'فروش به ناموفق تبدیل شد'})
          this.$emit('saved', this.automationId)
          this.$emit('update:modelValue', false)
        })
        .finally(() => {
          this.saving = false
        })
    }
  }
}
</script>
