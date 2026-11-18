<template>
  <div>
    <div v-if="loading" class="text-center q-pa-md">
      <q-spinner color="primary" size="2em"/>
    </div>
    <div v-else class="row q-col-gutter-md">
      <div v-for="q in questions.filter(isVisible)" :key="q.key"
           :class="['textarea', 'single', 'multiple'].includes(q.type) && (q.options || []).length > 3 || q.type === 'textarea' ? 'col-12' : 'col-md-6 col-xs-12'">

        <q-input v-if="['text', 'national_code', 'digits', 'mobile', 'phone'].includes(q.type)"
                 outlined :dir="q.type === 'text' ? 'rtl' : 'ltr'"
                 v-model="modelValue[q.key]" :label="q.label || q.title" :placeholder="q.placeholder"
                 :hint="q.depends_on ? q.placeholder : undefined"/>

        <q-input v-else-if="q.type === 'number'"
                 outlined dir="ltr" type="number" :suffix="q.suffix"
                 v-model.number="modelValue[q.key]" :label="q.label || q.title"/>

        <q-input v-else-if="q.type === 'textarea'"
                 outlined autogrow type="textarea"
                 v-model="modelValue[q.key]" :label="q.label || q.title"/>

        <q-select v-else-if="q.type === 'single'"
                  outlined clearable
                  v-model="modelValue[q.key]" :options="q.options" :label="q.label || q.title"/>

        <q-select v-else-if="q.type === 'multiple'"
                  outlined clearable multiple use-chips
                  v-model="modelValue[q.key]" :options="q.options"
                  :label="(q.label || q.title) + (q.max ? ' (حداکثر ' + q.max + ' گزینه)' : '')"
                  :rules="[v => !q.max || !v || v.length <= q.max || 'حداکثر ' + q.max + ' گزینه']"/>
      </div>
    </div>
  </div>
</template>

<script>
import {api} from 'boot/axios'

// تعریف سوالات یک بار از بک‌اند گرفته و نگه داشته می‌شود
let cachedQuestions = null

/**
 * فیلدهای فرم بازدید نوع «ثبت شده از مشتری» برای ثبت/ویرایش در سامانه.
 * سوالات همان سوالات فرم اولیه (درخواست بازدید و پیش‌قرارداد اولیه) است که مشتری از طریق لینک تکمیل می‌کند.
 * modelValue یک آبجکت با کلیدهای سوالات است و مستقیماً مقداردهی می‌شود.
 */
export default {
  name: 'CustomerSurveyFields',
  props: {
    modelValue: {type: Object, required: true}
  },
  data() {
    return {questions: cachedQuestions || [], loading: !cachedQuestions}
  },
  created() {
    if (cachedQuestions) {
      this.ensureKeys()
      return
    }
    api.get('automation/customer-survey/questions')
      .then(response => {
        cachedQuestions = response.data.data
        this.questions = cachedQuestions
        this.ensureKeys()
      })
      .finally(() => {
        this.loading = false
      })
  },
  methods: {
    // سوال وابسته (مثل ظرفیت کولر) فقط وقتی تعداد مربوطه بزرگتر از صفر است نمایش داده می‌شود
    isVisible(q) {
      return !q.depends_on || Number(this.modelValue[q.depends_on]) > 0
    },
    // همه کلیدها در آبجکت وجود داشته باشند تا واکنش‌گرا باشند
    ensureKeys() {
      this.questions.forEach(q => {
        if (!(q.key in this.modelValue)) this.modelValue[q.key] = q.type === 'multiple' ? [] : null
      })
    }
  }
}
</script>
