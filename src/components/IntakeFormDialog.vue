<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :maximized="!$q.screen.gt.sm"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card style="width: 640px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">فرم اولیه مشتری</div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 70vh" class="scroll">
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </div>

        <template v-else-if="form">
          <div class="text-caption text-grey-8 q-mb-md">
            ارسال لینک: {{ form.jalali_created_at }}
            <q-badge v-if="!form.sms_sent" class="q-ml-sm" color="negative" label="پیامک ارسال نشد"/>
          </div>

          <div v-if="!form.is_submitted" class="text-center q-pa-md">
            <q-icon name="hourglass_top" color="orange" size="3em"/>
            <div class="q-mt-sm">مشتری هنوز فرم را تکمیل نکرده است.</div>
            <div class="q-mt-md text-caption text-grey-8">لینک فرم:</div>
            <div dir="ltr" class="text-body2 q-mt-xs" style="word-break: break-all">{{ form.link }}</div>
            <div class="q-mt-sm q-gutter-sm">
              <q-btn dense outline rounded color="primary" icon="content_copy" label="کپی لینک" @click="copyLink"/>
              <q-btn dense outline rounded color="accent" icon="sms" label="ارسال مجدد پیامک" :loading="resending" @click="resend"/>
            </div>
          </div>

          <div v-else class="text-center q-pa-md">
            <q-icon name="task_alt" color="positive" size="3em"/>
            <div class="q-mt-sm">مشتری فرم را در {{ form.jalali_submitted_at }} تکمیل کرده است.</div>
            <div class="text-caption text-grey-8 q-mt-xs">پاسخ‌ها در «فرم بازدید» این درخواست (نوع «ثبت شده از مشتری») ثبت شده و قابل ویرایش است.</div>
          </div>
        </template>
      </q-card-section>

      <q-separator/>
      <q-card-actions align="center">
        <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {copyToClipboard} from 'quasar'
import {api} from 'boot/axios'

/**
 * وضعیت لینک فرم اولیه یک درخواست (کپی لینک و ارسال مجدد تا وقتی مشتری تکمیل نکرده).
 * پاسخ‌های مشتری به‌عنوان فرم بازدید درخواست ذخیره و در SurveyViewDialog نمایش داده می‌شوند.
 */
export default {
  name: 'IntakeFormDialog',
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''}
  },
  emits: ['update:modelValue', 'seen'],
  data() {
    return {loading: false, resending: false, form: null}
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) this.fetch()
    }
  },
  methods: {
    fetch() {
      this.loading = true
      this.form = null
      api.get('automation/intake-form/' + this.automationId)
        .then(response => {
          this.form = response.data.data
          if (this.form.is_submitted) this.$emit('seen', this.automationId)
        })
        .catch(() => {
          this.$emit('update:modelValue', false)
        })
        .finally(() => {
          this.loading = false
        })
    },
    copyLink() {
      copyToClipboard(this.form.link).then(() => {
        this.$q.notify({type: 'positive', position: 'center', message: 'لینک کپی شد'})
      })
    },
    resend() {
      this.resending = true
      api.post('automation/send-intake-form', {automation: this.automationId})
        .then(response => {
          this.$q.notify({type: response.data.data.sms_sent ? 'positive' : 'warning', position: 'center', message: response.data.message})
          this.fetch()
        })
        .finally(() => {
          this.resending = false
        })
    }
  }
}
</script>
