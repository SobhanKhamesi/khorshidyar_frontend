<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="pc-page q-pa-md">
        <div class="pc-sheet">

          <!-- ============ سربرگ ============ -->
          <header class="pc-header">
            <div class="pc-header__text">
              <div class="pc-header__brand">خورشیدیار یزد</div>
              <div class="pc-header__title">فرم درخواست بازدید و پیش‌قرارداد اولیه نیروگاه خورشیدی</div>
            </div>
            <div class="pc-header__logo">
              <img v-if="!logoFailed" src="/khorshidyar-logo.jpg" style="border-radius: 50%" alt="خورشیدیار یزد" @error="logoFailed = true"/>
              <q-icon v-else name="wb_sunny" size="56px" color="amber-6"/>
            </div>
          </header>

          <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner color="primary" size="3em"/>
          </div>

          <!-- لینک نامعتبر -->
          <div v-else-if="errorMessage" class="text-center q-pa-xl">
            <q-icon name="link_off" color="negative" size="4em"/>
            <div class="text-h6 q-mt-md">{{ errorMessage }}</div>
          </div>

          <!-- ثبت شده -->
          <div v-else-if="isSubmitted" class="text-center q-pa-xl">
            <q-icon name="task_alt" color="positive" size="4em"/>
            <div class="text-h6 q-mt-md">با تشکر از شما 🙏</div>
            <div class="text-grey-8 q-mt-sm">{{ successMessage }}</div>
          </div>

          <div v-else class="pc-body">
            <p class="pc-intro">{{ intro }}</p>

            <!-- ============ بخش‌های ۱ تا ۵ ============ -->
            <section v-for="(title, no) in sections" :key="no" class="pc-section">
              <h2 class="pc-section__title">{{ toPersian(no) }}. {{ title }}</h2>

              <div class="row q-col-gutter-md">
                <div v-for="q in questionsOf(no).filter(isVisible)" :key="q.key" :class="colClass(q)" :ref="'q_' + q.key">

                  <!-- چند انتخابی (نوع درخواست) -->
                  <template v-if="q.type === 'multiple'">
                    <div class="row q-col-gutter-sm">
                      <div v-for="opt in q.options" :key="opt" class="col-sm-6 col-xs-12">
                        <q-checkbox :model-value="(answers[q.key] || []).includes(opt)" :label="opt"
                                    @update:model-value="toggleMultiple(q, opt)"/>
                      </div>
                    </div>
                  </template>

                  <!-- تک انتخابی (ظرفیت) -->
                  <template v-else-if="q.type === 'single'">
                    <div class="row q-col-gutter-sm">
                      <div v-for="opt in q.options" :key="opt" class="col-md-2 col-sm-4 col-xs-6">
                        <q-radio v-model="answers[q.key]" :val="opt" :label="opt" @update:model-value="errors[q.key] = ''"/>
                      </div>
                    </div>
                  </template>

                  <q-input v-else-if="q.type === 'textarea'"
                           v-model="answers[q.key]" outlined autogrow type="textarea"
                           :label="labelOf(q)" :placeholder="q.placeholder"
                           :input-style="{minHeight: q.section === 5 ? '110px' : '56px'}"
                           :error="!!errors[q.key]" :error-message="errors[q.key]"
                           @update:model-value="errors[q.key] = ''"/>

                  <q-input v-else
                           v-model="answers[q.key]" outlined
                           :label="labelOf(q)" :placeholder="q.placeholder" :suffix="q.suffix"
                           :dir="q.type === 'text' ? 'rtl' : 'ltr'"
                           :inputmode="q.type === 'text' ? 'text' : 'numeric'"
                           :error="!!errors[q.key]" :error-message="errors[q.key]"
                           @update:model-value="errors[q.key] = ''"/>

                  <div v-if="errors[q.key] && ['multiple', 'single'].includes(q.type)"
                       class="text-negative text-caption q-mt-xs">{{ errors[q.key] }}</div>
                </div>
              </div>

              <!-- تصویر قبض برق / کنتور (بخش مصرف برق) -->
              <div v-if="Number(no) === 3" class="q-mt-md">
                <div class="text-caption text-grey-8">در صورت امکان، تصویر قبض برق یا تصویر کنتور را نیز بارگذاری کنید (اختیاری، حداکثر {{ toPersian(maxBillImages) }} تصویر).</div>
                <div class="row items-center q-gutter-sm q-mt-xs">
                  <div v-for="(img, i) in billImages" :key="i" class="pc-thumb">
                    <img :src="img" alt="تصویر قبض"/>
                    <q-btn round dense size="xs" color="negative" icon="close" class="pc-thumb__remove" @click="billImages.splice(i, 1)"/>
                  </div>
                  <q-btn v-if="billImages.length < maxBillImages" outline rounded color="primary" icon="add_a_photo"
                         label="بارگذاری تصویر" :loading="processingImages" @click="openBillPicker"/>
                  <input ref="billInput" type="file" accept="image/*" multiple hidden @change="onBillImages"/>
                </div>
                <div v-if="errors.bill_images" class="text-negative text-caption q-mt-xs">{{ errors.bill_images }}</div>
              </div>
            </section>

            <!-- ============ ۶. تأییدیه متقاضی ============ -->
            <section class="pc-section" ref="q_agree">
              <h2 class="pc-section__title">{{ toPersian(Object.keys(sections).length + 1) }}. تأیید متقاضی</h2>
              <p class="pc-agreement">{{ agreement }}</p>

              <q-checkbox v-model="agree" label="موارد فوق را مطالعه کرده و قبول دارم." @update:model-value="errors.agree = ''"/>
              <div v-if="errors.agree" class="text-negative text-caption">{{ errors.agree }}</div>

              <div class="row q-col-gutter-md q-mt-sm">
                <div class="col-md-6 col-xs-12" ref="q_signer_name">
                  <q-input v-model="signerName" outlined label="نام متقاضی"
                           :error="!!errors.signer_name" :error-message="errors.signer_name"
                           @update:model-value="errors.signer_name = ''"/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input :model-value="today" outlined readonly label="تاریخ"/>
                </div>
                <div class="col-12" ref="q_signature">
                  <signature-pad ref="pad" label="امضای متقاضی" :error="errors.signature" @ink="errors.signature = ''"/>
                </div>
              </div>
            </section>

            <div class="text-center q-mt-lg">
              <q-btn unelevated no-caps class="pc-submit" label="ثبت درخواست بازدید و پیش‌قرارداد اولیه"
                     :loading="submitting" @click="submit"/>
            </div>
          </div>

          <!-- ============ پاورقی ============ -->
          <footer class="pc-footer">
            <div>خورشیدیار یزد - مشاوره، طراحی، تأمین و اجرای نیروگاه‌های خورشیدی</div>
            <div>شماره تماس: <span dir="ltr">۰۹۱۳۴۶۰۷۳۱۰</span></div>
          </footer>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {api} from 'boot/axios'
import SignaturePad from 'components/SignaturePad.vue'

const PERSIAN = '۰۱۲۳۴۵۶۷۸۹'
const NUMERIC_TYPES = ['national_code', 'digits', 'number', 'mobile', 'phone']

/**
 * فرم اولیه («فرم درخواست بازدید و پیش‌قرارداد اولیه») که مشتری هنگام ثبت درخواست اتوماسیون
 * از طریق لینک پیامک شده (/request/:token) تکمیل، تأیید و امضا می‌کند.
 * بخش‌ها و سوالات از بک‌اند (intake/{token}) دریافت می‌شود.
 */
export default {
  name: 'IntakeForm',
  components: {SignaturePad},
  data() {
    return {
      loading: true,
      submitting: false,
      processingImages: false,
      logoFailed: false,
      errorMessage: '',
      successMessage: 'فرم شما با موفقیت ثبت شد. کارشناسان ما به‌زودی با شما تماس می‌گیرند.',
      isSubmitted: false,
      intro: '',
      agreement: '',
      sections: {},
      questions: [],
      maxBillImages: 3,
      answers: {},
      billImages: [],
      agree: false,
      signerName: '',
      errors: {},
      today: new Date().toLocaleDateString('fa-IR'),
    }
  },
  computed: {
    token() {
      return this.$route.params.token
    },
  },
  methods: {
    toPersian(n) {
      return String(n).replace(/\d/g, d => PERSIAN[d])
    },
    toLatin(v) {
      return String(v).replace(/[۰-۹]/g, d => PERSIAN.indexOf(d)).replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).trim()
    },
    questionsOf(section) {
      return this.questions.filter(q => String(q.section) === String(section))
    },
    // سوال وابسته (مثل ظرفیت کولر) فقط وقتی تعداد مربوطه بزرگتر از صفر است نمایش داده می‌شود و اجباری است
    isVisible(q) {
      return !q.depends_on || Number(this.toLatin(this.answers[q.depends_on] ?? '')) > 0
    },
    isRequired(q) {
      return q.depends_on ? this.isVisible(q) : q.required !== false
    },
    labelOf(q) {
      return (q.label || q.title) + (this.isRequired(q) ? ' *' : '')
    },
    colClass(q) {
      if (['textarea', 'multiple', 'single'].includes(q.type)) return 'col-12'
      return 'col-md-6 col-xs-12'
    },
    load() {
      api.get('intake/' + this.token)
        .then(response => {
          const data = response.data.data
          this.isSubmitted = data.is_submitted
          this.successMessage = 'این فرم قبلاً تکمیل و ارسال شده است. از همراهی شما سپاسگزاریم.'
          this.intro = data.intro
          this.agreement = data.agreement
          this.sections = data.sections || {}
          this.questions = data.questions || []
          this.maxBillImages = data.max_bill_images || 3
          const answers = {}
          this.questions.forEach(q => {
            answers[q.key] = q.type === 'multiple' ? [] : (q.type === 'single' ? null : (data.defaults?.[q.key] || ''))
          })
          this.answers = answers
          this.signerName = data.defaults?.full_name || ''
        })
        .catch(error => {
          this.errorMessage = error.response?.data?.message || 'لینک فرم نامعتبر است'
        })
        .finally(() => {
          this.loading = false
        })
    },
    toggleMultiple(q, opt) {
      const list = [...(this.answers[q.key] || [])]
      const index = list.indexOf(opt)
      if (index > -1) list.splice(index, 1)
      else list.push(opt)
      this.answers[q.key] = list
      this.errors[q.key] = ''
    },

    // ---------- تصویر قبض / کنتور: پیش از ارسال کوچک و فشرده می‌شود ----------
    // ورودی فایل داخل v-for بخش‌هاست و در Vue 3 ref آن آرایه است
    openBillPicker() {
      const ref = this.$refs.billInput
      const input = Array.isArray(ref) ? ref[0] : ref
      if (input) input.click()
    },
    onBillImages(e) {
      const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'))
      e.target.value = ''
      const room = this.maxBillImages - this.billImages.length
      if (!files.length || room <= 0) return
      this.processingImages = true
      this.errors.bill_images = ''
      Promise.all(files.slice(0, room).map(this.resizeImage))
        .then(images => this.billImages.push(...images))
        .catch(() => {
          this.errors.bill_images = 'خواندن تصویر با خطا مواجه شد، تصویر دیگری انتخاب کنید'
        })
        .finally(() => {
          this.processingImages = false
        })
    },
    resizeImage(file) {
      return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file)
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
          const canvas = document.createElement('canvas')
          canvas.width = Math.round(img.width * scale)
          canvas.height = Math.round(img.height * scale)
          const ctx = canvas.getContext('2d')
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
          URL.revokeObjectURL(url)
          resolve(canvas.toDataURL('image/jpeg', 0.7))
        }
        img.onerror = () => {
          URL.revokeObjectURL(url)
          reject()
        }
        img.src = url
      })
    },

    // اعتبارسنجی سمت کاربر (اعتبارسنجی اصلی در بک‌اند انجام می‌شود)
    validate() {
      const errors = {}
      this.questions.filter(this.isVisible).forEach(q => {
        let value = this.answers[q.key]
        if (typeof value === 'string') value = NUMERIC_TYPES.includes(q.type) ? this.toLatin(value) : value.trim()
        const empty = value === '' || value === null || value === undefined || (Array.isArray(value) && !value.length)
        if (empty) {
          if (this.isRequired(q)) errors[q.key] = 'لطفاً «' + (q.label || q.title) + '» را تکمیل کنید'
        } else if (q.type === 'national_code' && !/^\d{10}$/.test(value)) {
          errors[q.key] = 'کد ملی باید ۱۰ رقم باشد'
        } else if (q.type === 'phone' && !/^0\d{7,10}$/.test(value)) {
          errors[q.key] = 'شماره تماس معتبر نیست (مانند ۰۹۱۲۳۴۵۶۷۸۹)'
        } else if (q.type === 'mobile' && !/^09\d{9}$/.test(value)) {
          errors[q.key] = 'شماره موبایل معتبر نیست (مانند ۰۹۱۲۳۴۵۶۷۸۹)'
        } else if (q.type === 'number' && !/^\d+(\.\d+)?$/.test(value)) {
          errors[q.key] = 'فقط عدد وارد کنید'
        }
      })
      if (!this.agree) errors.agree = 'لطفاً تأییدیه متقاضی را مطالعه و تأیید کنید'
      if (!this.signerName.trim()) errors.signer_name = 'نام متقاضی را وارد کنید'
      if (this.$refs.pad.isEmpty()) errors.signature = 'لطفاً در کادر بالا امضا کنید'
      this.errors = errors
      return !Object.keys(errors).length
    },
    scrollToFirstError() {
      const keys = [...this.questions.map(q => q.key), 'bill_images', 'agree', 'signer_name', 'signature']
      const first = keys.find(k => this.errors[k])
      const ref = first && (this.$refs['q_' + first] || this.$refs.q_agree)
      const el = Array.isArray(ref) ? ref[0] : ref
      if (el && el.scrollIntoView) el.scrollIntoView({behavior: 'smooth', block: 'center'})
    },
    submit() {
      if (!this.validate()) {
        this.$nextTick(this.scrollToFirstError)
        return
      }

      const payload = {}
      this.questions.forEach(q => {
        const v = this.answers[q.key]
        payload[q.key] = typeof v === 'string' ? (NUMERIC_TYPES.includes(q.type) ? this.toLatin(v) : v.trim()) : v
        if (payload[q.key] === '' || !this.isVisible(q)) payload[q.key] = null
      })
      payload.bill_images = this.billImages
      payload.agree = true
      payload.signer_name = this.signerName.trim()
      payload.signature = this.$refs.pad.toDataURL()

      this.submitting = true
      api.post('intake/' + this.token, payload)
        .then(response => {
          this.successMessage = response.data.message
          this.isSubmitted = true
          window.scrollTo({top: 0, behavior: 'smooth'})
        })
        .catch(error => {
          const errors = error.response?.data?.errors
          if (errors) {
            const mapped = {}
            Object.keys(errors).forEach(k => {
              mapped[k.split('.')[0]] = errors[k][0]
            })
            this.errors = mapped
            this.$nextTick(this.scrollToFirstError)
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
.pc-page {
  background: #eef1f6;
  min-height: 100vh;
}

.pc-sheet {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 14px rgba(19, 40, 75, .08);
}

.pc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #13284b;
  color: #fff;
  padding: 22px 26px;
  border-bottom: 6px solid #c9a23f;
}

.pc-header__brand {
  font-size: 1.7rem;
  font-weight: 800;
}

.pc-header__title {
  font-size: 1rem;
  opacity: .92;
  margin-top: 4px;
}

.pc-header__logo {
  flex: none;
  width: 92px;
  height: 92px;
  border: 1px solid #c9a23f;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .06);
}

.pc-header__logo img {
  max-width: 80px;
  max-height: 80px;
}

.pc-body {
  padding: 22px 26px 8px;
}

.pc-intro {
  line-height: 2;
  margin-bottom: 8px;
}

.pc-section {
  margin-top: 22px;
}

.pc-section__title {
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.6;
  color: #13284b;
  margin: 0 0 14px;
  padding: 6px 14px;
  background: #f5f7fb;
  border: 1px solid #e3e8f1;
  border-right: 5px solid #c9a23f;
  border-radius: 8px;
}

.pc-agreement {
  line-height: 2.1;
  text-align: justify;
  font-size: .92rem;
}

.pc-thumb {
  position: relative;
  width: 84px;
  height: 84px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.pc-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pc-thumb__remove {
  position: absolute;
  top: 2px;
  left: 2px;
}

.pc-submit {
  background: #13284b;
  color: #fff;
  border-radius: 10px;
  padding: 8px 28px;
  font-weight: 700;
  max-width: 100%;
}

.pc-footer {
  margin-top: 28px;
  padding: 14px 26px 18px;
  border-top: 1px solid #e3e8f1;
  color: #607086;
  font-size: .82rem;
  line-height: 1.9;
}

@media (max-width: 599px) {
  .pc-header {
    padding: 16px;
  }

  .pc-header__brand {
    font-size: 1.3rem;
  }

  .pc-header__title {
    font-size: .85rem;
  }

  .pc-header__logo {
    width: 64px;
    height: 64px;
  }

  .pc-header__logo img {
    max-width: 54px;
    max-height: 54px;
  }

  .pc-body {
    padding: 16px 14px 8px;
  }
}
</style>
