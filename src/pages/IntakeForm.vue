<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="intake-page flex flex-center q-pa-md">

        <q-card flat class="intake-card">

          <!-- در حال بارگذاری -->
          <q-card-section v-if="loading" class="text-center q-pa-xl">
            <q-spinner color="orange-8" size="3em"/>
          </q-card-section>

          <!-- لینک نامعتبر -->
          <q-card-section v-else-if="errorMessage" class="text-center q-pa-xl">
            <q-icon name="link_off" color="negative" size="4em"/>
            <div class="text-h6 q-mt-md">{{ errorMessage }}</div>
          </q-card-section>

          <!-- ثبت شده -->
          <q-card-section v-else-if="isSubmitted" class="text-center q-pa-xl">
            <q-icon name="task_alt" color="positive" size="4em"/>
            <div class="text-h6 q-mt-md">با تشکر از شما 🙏</div>
            <div class="text-grey-8 q-mt-sm">{{ successMessage }}</div>
          </q-card-section>

          <!-- خوش آمدگویی -->
          <q-card-section v-else-if="step === -2" class="text-center q-pa-xl">
            <q-icon name="wb_sunny" color="orange-8" size="4em"/>
            <div class="text-h5 text-weight-bold q-mt-md">ثبت نام نیروگاه خورشیدی</div>
            <div class="text-subtitle1 text-grey-8 q-mt-sm">راهکارهای هوشمند برای تامین انرژی مطمئن</div>
            <q-btn class="q-mt-xl intake-btn" unelevated rounded label="شروع" @click="step = -1"/>
          </q-card-section>

          <!-- شرایط دریافت وام -->
          <q-card-section v-else-if="step === -1" class="q-pa-lg">
            <div class="intake-intro">{{ intro }}</div>
            <div class="text-center q-mt-lg">
              <q-btn class="intake-btn" unelevated rounded label="ادامه" @click="step = 0"/>
            </div>
          </q-card-section>

          <!-- سوالات (هر صفحه یک سوال) -->
          <template v-else>
            <q-linear-progress :value="progress" color="orange-8" track-color="orange-1" size="6px"/>
            <q-card-section class="q-pa-lg">
              <div class="text-caption text-grey-7 q-mb-sm">سوال {{ toPersian(step + 1) }} از {{ toPersian(questions.length) }}</div>
              <div class="text-h6 q-mb-md">{{ current.title }} <span class="text-negative">*</span></div>

              <q-input v-if="['text', 'national_code', 'digits', 'mobile', 'number'].includes(current.type)"
                       v-model="answers[current.key]"
                       outlined autofocus
                       :dir="current.type === 'text' ? 'rtl' : 'ltr'"
                       :inputmode="current.type === 'text' ? 'text' : 'numeric'"
                       :placeholder="current.placeholder"
                       :suffix="current.suffix"
                       :error="!!errors[current.key]" :error-message="errors[current.key]"
                       @keyup.enter="next"/>

              <q-input v-else-if="current.type === 'textarea'"
                       v-model="answers[current.key]"
                       outlined autofocus autogrow type="textarea"
                       :error="!!errors[current.key]" :error-message="errors[current.key]"/>

              <div v-else-if="current.type === 'single'" class="column q-gutter-sm">
                <q-btn v-for="opt in current.options" :key="opt"
                       no-caps unelevated align="right"
                       class="intake-option" :class="{ 'intake-option--active': answers[current.key] === opt }"
                       @click="selectSingle(opt)">
                  <span class="text-left full-width">{{ opt }}</span>
                </q-btn>
              </div>

              <div v-else-if="current.type === 'multiple'" class="column q-gutter-sm">
                <div class="text-caption text-grey-7">حداکثر {{ toPersian(current.max) }} گزینه</div>
                <q-btn v-for="opt in current.options" :key="opt"
                       no-caps unelevated align="right"
                       class="intake-option" :class="{ 'intake-option--active': (answers[current.key] || []).includes(opt) }"
                       @click="toggleMultiple(opt)">
                  <span class="text-left full-width">{{ opt }}</span>
                </q-btn>
              </div>

              <div v-if="errors[current.key] && !['text', 'national_code', 'digits', 'mobile', 'number', 'textarea'].includes(current.type)"
                   class="text-negative text-caption q-mt-sm">{{ errors[current.key] }}</div>
            </q-card-section>

            <q-card-actions class="q-px-lg q-pb-lg">
              <q-btn flat rounded color="grey-8" icon="arrow_forward" label="قبلی" @click="prev"/>
              <q-space/>
              <q-btn v-if="step < questions.length - 1" class="intake-btn" unelevated rounded label="بعدی" @click="next"/>
              <q-btn v-else class="intake-btn" unelevated rounded label="ثبت فرم" :loading="submitting" @click="submit"/>
            </q-card-actions>
          </template>

          <div class="text-center text-caption text-grey-6 q-pb-md">خورشیدیار</div>
        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {api} from 'boot/axios'

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'

/**
 * فرم اولیه عمومی که مشتری از طریق لینک پیامک شده تکمیل می‌کند (مشابه فرم پرس‌لاین).
 * سوالات از بک‌اند (intake/{token}) دریافت می‌شود.
 */
export default {
  name: 'IntakeForm',
  data() {
    return {
      loading: true,
      submitting: false,
      errorMessage: '',
      successMessage: 'فرم شما با موفقیت ثبت شد. کارشناسان ما به‌زودی با شما تماس می‌گیرند.',
      isSubmitted: false,
      intro: '',
      questions: [],
      answers: {},
      errors: {},
      step: -2,
    }
  },
  computed: {
    token() {
      return this.$route.params.token
    },
    current() {
      return this.questions[this.step] || {}
    },
    progress() {
      return this.questions.length ? this.step / this.questions.length : 0
    },
  },
  methods: {
    toPersian(n) {
      return String(n).replace(/\d/g, d => PERSIAN[d])
    },
    // فقط پاسخ‌های عددی به ارقام لاتین تبدیل می‌شوند؛ متن گزینه‌ها دست نمی‌خورد
    isNumeric(q) {
      return ['national_code', 'digits', 'number', 'mobile'].includes(q.type)
    },
    toLatin(v) {
      return String(v).replace(/[۰-۹]/g, d => PERSIAN.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim()
    },
    load() {
      api.get('intake/' + this.token)
        .then(response => {
          const data = response.data.data
          this.isSubmitted = data.is_submitted
          this.successMessage = 'این فرم قبلاً تکمیل و ارسال شده است. از همراهی شما سپاسگزاریم.'
          this.intro = data.intro
          this.questions = data.questions
          const answers = {}
          this.questions.forEach(q => {
            answers[q.key] = q.type === 'multiple' ? [] : (data.defaults?.[q.key] || '')
          })
          this.answers = answers
        })
        .catch(error => {
          this.errorMessage = error.response?.data?.message || 'لینک فرم نامعتبر است'
        })
        .finally(() => {
          this.loading = false
        })
    },
    // اعتبارسنجی سمت کاربر برای سوال جاری (اعتبارسنجی اصلی در بک‌اند انجام می‌شود)
    validateCurrent() {
      const q = this.current
      let value = this.answers[q.key]
      if (typeof value === 'string') value = this.isNumeric(q) ? this.toLatin(value) : value.trim()
      let error = ''

      if (value === '' || value === null || value === undefined || (Array.isArray(value) && !value.length)) {
        error = 'لطفاً به این سوال پاسخ دهید'
      } else if (q.type === 'national_code' && !/^\d{10}$/.test(value)) {
        error = 'کد ملی باید ۱۰ رقم باشد'
      } else if (q.type === 'mobile' && !/^09\d{9}$/.test(value)) {
        error = 'شماره موبایل معتبر نیست (مانند ۰۹۱۲۳۴۵۶۷۸۹)'
      } else if (q.type === 'digits' && !/^\d{5,20}$/.test(value)) {
        error = 'فقط عدد وارد کنید'
      } else if (q.type === 'number' && !/^\d+(\.\d+)?$/.test(value)) {
        error = 'فقط عدد وارد کنید'
      }

      this.errors = {...this.errors, [q.key]: error}
      return !error
    },
    next() {
      if (!this.validateCurrent()) return
      if (this.step < this.questions.length - 1) this.step++
    },
    prev() {
      this.step = this.step > 0 ? this.step - 1 : -1
    },
    selectSingle(opt) {
      this.answers[this.current.key] = opt
      this.errors[this.current.key] = ''
      if (this.step < this.questions.length - 1) setTimeout(() => this.step++, 200)
    },
    toggleMultiple(opt) {
      const key = this.current.key
      const list = [...(this.answers[key] || [])]
      const index = list.indexOf(opt)
      if (index > -1) list.splice(index, 1)
      else if (list.length < (this.current.max || this.current.options.length)) list.push(opt)
      this.answers[key] = list
      this.errors[key] = ''
    },
    submit() {
      if (!this.validateCurrent()) return

      const payload = {}
      this.questions.forEach(q => {
        const v = this.answers[q.key]
        payload[q.key] = typeof v === 'string' ? (this.isNumeric(q) ? this.toLatin(v) : v.trim()) : v
      })

      this.submitting = true
      api.post('intake/' + this.token, payload)
        .then(response => {
          this.successMessage = response.data.message
          this.isSubmitted = true
        })
        .catch(error => {
          const errors = error.response?.data?.errors
          if (errors) {
            // نمایش اولین سوال دارای خطا
            const mapped = {}
            Object.keys(errors).forEach(k => {
              mapped[k.split('.')[0]] = errors[k][0]
            })
            this.errors = mapped
            const firstIndex = this.questions.findIndex(q => mapped[q.key])
            if (firstIndex > -1) this.step = firstIndex
          } else if (!error.response) {
            // پیام خطاهای سرور را interceptor نمایش می‌دهد؛ اینجا فقط خطای شبکه
            this.$q.notify({type: 'negative', position: 'center', message: 'خطا در ارتباط با سرور، دوباره تلاش کنید'})
          }
        })
        .finally(() => {
          this.submitting = false
        })
    },
  },
  created() {
    this.load()
  }
}
</script>

<style scoped>
.intake-page {
  background: linear-gradient(160deg, #fff3e0 0%, #ffe0b2 100%);
}

.intake-card {
  width: 100%;
  max-width: 560px;
  border-radius: 16px;
  overflow: hidden;
}

.intake-intro {
  white-space: pre-line;
  line-height: 2;
}

.intake-btn {
  background: #ff9900;
  color: #fff;
  min-width: 120px;
}

.intake-option {
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background: #fff;
  padding: 10px 14px;
  text-align: right;
  white-space: normal;
}

.intake-option--active {
  border-color: #ff9900;
  background: #fff3e0;
}
</style>
