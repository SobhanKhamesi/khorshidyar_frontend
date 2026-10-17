<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="q-pa-md flex flex-center bg-grey-2">

        <q-card flat class="border-radius-card survey-card">

          <!-- در حال بارگذاری -->
          <q-card-section v-if="loading" class="text-center q-pa-xl">
            <q-spinner color="accent" size="3em"/>
            <div class="text-grey q-mt-md">در حال دریافت اطلاعات نظرسنجی...</div>
          </q-card-section>

          <!-- لینک نامعتبر -->
          <q-card-section v-else-if="invalidToken" class="text-center q-pa-xl">
            <q-icon name="link_off" color="negative" size="4em"/>
            <div class="text-h6 q-mt-md">{{ errorMessage || 'لینک نظرسنجی نامعتبر است' }}</div>
          </q-card-section>

          <!-- قبلاً ثبت شده یا الان با موفقیت ثبت شد -->
          <q-card-section v-else-if="isSubmitted" class="text-center q-pa-xl">
            <q-icon name="task_alt" color="positive" size="4em"/>
            <div class="text-h6 q-mt-md">با تشکر از شما 🙏</div>
            <div class="text-grey-8 q-mt-sm">نظر شما با موفقیت ثبت شده است</div>

            <div class="q-mt-lg">
              <div class="rating-stars rating-stars-readonly" dir="ltr">
                <div class="rating-stars-base">
                  <q-icon v-for="n in 5" :key="'ro-base-'+n" name="star" size="34px" color="grey-4"/>
                </div>
                <div class="rating-stars-fill" :style="{ width: readonlyFillPercent + '%' }">
                  <q-icon v-for="n in 5" :key="'ro-fill-'+n" name="star" size="34px" color="amber-7"/>
                </div>
              </div>
              <div class="text-subtitle1 text-weight-bold q-mt-sm" dir="ltr">
                {{ submittedRating.toFixed(1) }} / 5
              </div>
            </div>

            <div v-if="submittedFeedback" class="q-mt-md text-right">
              <div class="text-caption text-grey-7">بازخورد شما:</div>
              <div class="text-body2">{{ submittedFeedback }}</div>
            </div>
          </q-card-section>

          <!-- فرم نظرسنجی -->
          <template v-else>
            <q-card-section>
              <div class="text-h6 text-center">نظرسنجی خدمات پس از فروش</div>
              <div class="text-caption text-grey-7 text-center q-mt-xs">
                لطفاً میزان رضایت خود را از خدمات پس از فروش ارزیابی کنید
              </div>
            </q-card-section>

            <q-separator/>

            <q-card-section v-if="serviceInfo">
              <q-list dense>
                <q-item v-if="serviceInfo.customer_name">
                  <q-item-section side><q-icon name="person"/></q-item-section>
                  <q-item-section>{{ serviceInfo.customer_name }}</q-item-section>
                </q-item>
                <q-item v-if="serviceInfo.service_type">
                  <q-item-section side><q-icon name="build"/></q-item-section>
                  <q-item-section>نوع خدمت: {{ serviceInfo.service_type }}</q-item-section>
                </q-item>
                <q-item v-if="serviceInfo.problem">
                  <q-item-section side><q-icon name="report_problem"/></q-item-section>
                  <q-item-section>{{ serviceInfo.problem }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>

            <q-separator/>

            <q-card-section class="text-center">
              <div class="text-subtitle2 q-mb-md">امتیاز خود را با کشیدن روی ستاره‌ها انتخاب کنید</div>

              <div
                  class="rating-stars"
                  dir="ltr"
                  ref="starsBar"
                  @mousedown="onPointerDown"
                  @mousemove="onPointerMove"
                  @mouseup="onPointerUp"
                  @mouseleave="onPointerUp"
                  @touchstart.prevent="onPointerDown"
                  @touchmove.prevent="onPointerMove"
                  @touchend="onPointerUp"
              >
                <div class="rating-stars-base">
                  <q-icon v-for="n in 5" :key="'base-'+n" name="star" size="46px" color="grey-4"/>
                </div>
                <div class="rating-stars-fill" :style="{ width: fillPercent + '%' }">
                  <q-icon v-for="n in 5" :key="'fill-'+n" name="star" size="46px" color="amber-7"/>
                </div>
              </div>

              <div class="text-h5 text-weight-bold q-mt-sm" dir="ltr">
                {{ rating !== null ? rating.toFixed(1) : '—' }} / 5
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                برای انتخاب دقیق‌تر (مثلاً ۴.۸ یا ۳.۱) روی هر نقطه از نوار ستاره‌ها بکشید
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                  outlined
                  autogrow
                  v-model="feedback"
                  label="بازخورد شما (اختیاری)"
                  placeholder="نظر یا پیشنهاد خود را بنویسید..."
              />
            </q-card-section>

            <q-card-actions class="q-px-md q-pb-md">
              <q-btn
                  class="full-width"
                  rounded
                  color="accent"
                  label="ثبت نظرسنجی"
                  :loading="submitting"
                  @click="submitSurvey"
              />
            </q-card-actions>
          </template>

        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {api} from 'boot/axios'

export default {
  name: 'AfterSalesServiceSurvey',

  data() {
    return {
      loading: true,
      invalidToken: false,
      errorMessage: '',

      isSubmitted: false,
      submittedRating: 0,
      submittedFeedback: '',

      serviceInfo: null,

      rating: null,
      feedback: '',
      dragging: false,
      submitting: false,
    }
  },

  computed: {
    token() {
      return this.$route.params.token
    },
    fillPercent() {
      if (this.rating === null) return 0
      return (this.rating / 5) * 100
    },
    readonlyFillPercent() {
      return (this.submittedRating / 5) * 100
    },
  },

  methods: {
    fetchSurvey() {
      this.loading = true
      api.get(`survey/${this.token}`)
          .then(response => {
            const data = response.data.data

            this.serviceInfo = data.service

            if (data.is_submitted) {
              this.isSubmitted = true
              this.submittedRating = Number(data.rating) || 0
              this.submittedFeedback = data.feedback || ''
            }
          })
          .catch(error => {
            this.invalidToken = true
            this.errorMessage = error?.response?.data?.message || 'لینک نظرسنجی نامعتبر است'
          })
          .finally(() => {
            this.loading = false
          })
    },

    onPointerDown(e) {
      this.dragging = true
      this.updateRatingFromEvent(e)
    },

    onPointerMove(e) {
      if (this.dragging) {
        this.updateRatingFromEvent(e)
      }
    },

    onPointerUp() {
      this.dragging = false
    },

    updateRatingFromEvent(e) {
      const rect = this.$refs.starsBar.getBoundingClientRect()
      const clientX = (e.touches && e.touches.length) ? e.touches[0].clientX : e.clientX
      let ratio = (clientX - rect.left) / rect.width
      ratio = Math.min(Math.max(ratio, 0), 1)

      let value = ratio * 5
      value = Math.round(value * 10) / 10

      if (value >= 5) value = 5

      this.rating = value
    },

    submitSurvey() {
      if (this.rating === null) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'لطفاً امتیاز خود را با انتخاب روی ستاره‌ها مشخص کنید'})
        return
      }

      this.submitting = true

      api.post(`survey/${this.token}`, {
        rating: this.rating,
        feedback: this.feedback,
      })
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message,
            })

            const data = response.data.data
            this.isSubmitted = true
            this.submittedRating = Number(data.rating) || this.rating
            this.submittedFeedback = data.feedback || this.feedback
          })
          .catch(error => {
            const message = error?.response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
            this.$q.notify({timeout: 4000, position: 'bottom', type: 'negative', message})
          })
          .finally(() => {
            this.submitting = false
          })
    },
  },

  created() {
    this.fetchSurvey()
  },
}
</script>

<style scoped>
.survey-card {
  width: 100%;
  max-width: 520px;
}

.rating-stars {
  position: relative;
  display: inline-block;
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.rating-stars-readonly {
  cursor: default;
}

.rating-stars-base,
.rating-stars-fill {
  display: flex;
}

.rating-stars-fill {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
  pointer-events: none;
}
</style>
