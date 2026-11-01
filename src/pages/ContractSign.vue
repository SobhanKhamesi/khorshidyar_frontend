<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <q-page class="sign-page q-pa-md">

        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em"/>
        </div>

        <q-card v-else-if="errorMessage" flat class="sign-card text-center q-pa-xl">
          <q-icon name="description" color="grey-6" size="4em"/>
          <div class="text-h6 q-mt-md">{{ errorMessage }}</div>
        </q-card>

        <div v-else class="sign-card">
          <q-banner v-if="isSigned" rounded class="bg-green-1 text-green-10 q-mb-md no-print">
            <template v-slot:avatar><q-icon name="verified"/></template>
            {{ successMessage || 'این قرارداد در ' + signedAt + ' توسط ' + signerName + ' امضا شده است.' }}
          </q-banner>

          <q-card flat class="q-pa-sm">
            <contract-document :data="data" :signature="signature" :signer-name="signerName" :signed-at="signedAt"
                               signature-placeholder="پس از امضا در پایین صفحه، اینجا نمایش داده می‌شود"/>
          </q-card>

          <!-- ============ امضا ============ -->
          <q-card v-if="!isSigned" flat class="q-mt-md no-print">
            <q-card-section>
              <div class="text-h6">امضای قرارداد</div>
              <div class="text-caption text-grey-8">پس از مطالعه کامل قرارداد، نام خود را وارد و در کادر زیر امضا کنید.</div>
            </q-card-section>
            <q-card-section class="q-pt-none q-gutter-y-md">
              <q-input outlined v-model="form.name" label="نام و نام خانوادگی امضاکننده"
                       :error="!!errors.signer_name" :error-message="errors.signer_name"/>

              <div>
                <div class="row items-center q-mb-xs">
                  <div class="col text-subtitle2">امضا</div>
                  <q-btn flat dense rounded color="grey-8" icon="refresh" label="پاک کردن" @click="clearPad"/>
                </div>
                <canvas ref="pad" class="sign-pad"
                        @pointerdown="startDraw" @pointermove="draw" @pointerup="endDraw" @pointerleave="endDraw" @pointercancel="endDraw"/>
                <div v-if="errors.signature" class="text-negative text-caption">{{ errors.signature }}</div>
              </div>

              <q-checkbox v-model="form.agree" label="قرارداد را به‌طور کامل مطالعه کرده و مفاد آن را می‌پذیرم"/>
              <div v-if="errors.agree" class="text-negative text-caption">{{ errors.agree }}</div>
            </q-card-section>
            <q-card-actions class="q-pa-md">
              <q-btn class="full-width" rounded unelevated color="positive" icon="draw" label="ثبت امضا و تایید قرارداد"
                     :loading="submitting" @click="submit"/>
            </q-card-actions>
          </q-card>

          <div class="text-center q-mt-md no-print">
            <q-btn rounded outline color="primary" icon="print" label="چاپ / ذخیره PDF" @click="print"/>
          </div>
        </div>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import {api} from 'boot/axios'
import ContractDocument from 'components/ContractDocument.vue'

/**
 * صفحه عمومی قرارداد: مشتری متن نهایی تایید شده را می‌بیند و به‌صورت دیجیتال امضا می‌کند.
 */
export default {
  name: 'ContractSign',
  components: {ContractDocument},
  data() {
    return {
      loading: true,
      submitting: false,
      errorMessage: '',
      successMessage: '',
      data: null,
      isSigned: false,
      signature: '',
      signerName: '',
      signedAt: '',
      form: {name: '', agree: false},
      errors: {},
      drawing: false,
      hasInk: false,
    }
  },
  computed: {
    token() {
      return this.$route.params.token
    },
  },
  methods: {
    load() {
      api.get('contract/' + this.token)
        .then(response => {
          const d = response.data.data
          this.data = d.data
          this.isSigned = d.is_signed
          this.signature = d.signature || ''
          this.signerName = d.signer_name || ''
          this.signedAt = d.signed_at || ''
          this.form.name = d.data?.employer?.name?.replace(/^(آقای|خانم|شرکت)\s+/, '') || ''
        })
        .catch(error => {
          this.errorMessage = error.response?.data?.message || 'لینک قرارداد نامعتبر است'
        })
        .finally(() => {
          this.loading = false
          // کادر امضا فقط بعد از پایان بارگذاری در صفحه رندر می‌شود
          if (!this.isSigned && !this.errorMessage) this.$nextTick(this.setupPad)
        })
    },

    // ---------- صفحه امضا ----------
    setupPad() {
      const canvas = this.$refs.pad
      if (!canvas || !canvas.offsetWidth) return false
      const ratio = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * ratio
      canvas.height = canvas.offsetHeight * ratio
      this.padWidth = canvas.offsetWidth
      const ctx = canvas.getContext('2d')
      ctx.scale(ratio, ratio)
      ctx.lineWidth = 2.8
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = '#0d47a1'
      this.ctx = ctx
      this.hasInk = false
      return true
    },
    // اگر عرض کادر عوض شود (مثلاً چرخش گوشی) مقیاس canvas به‌هم می‌ریزد؛ کادر از نو آماده می‌شود
    onResize() {
      const canvas = this.$refs.pad
      if (canvas && this.ctx && canvas.offsetWidth !== this.padWidth) this.setupPad()
    },
    point(e) {
      const rect = this.$refs.pad.getBoundingClientRect()
      return {x: e.clientX - rect.left, y: e.clientY - rect.top}
    },
    startDraw(e) {
      // در صورت آماده نبودن (مثلاً رندر دیرهنگام) در اولین لمس آماده می‌شود
      if (!this.ctx && !this.setupPad()) return
      e.preventDefault()
      this.$refs.pad.setPointerCapture(e.pointerId)
      this.drawing = true
      const p = this.point(e)
      this.ctx.beginPath()
      this.ctx.moveTo(p.x, p.y)
    },
    draw(e) {
      if (!this.drawing) return
      e.preventDefault()
      const p = this.point(e)
      this.ctx.lineTo(p.x, p.y)
      this.ctx.stroke()
      this.hasInk = true
      this.errors.signature = ''
    },
    endDraw() {
      this.drawing = false
    },
    // فقط محدوده امضا (با کمی حاشیه) ذخیره می‌شود تا در کادر امضای قرارداد خوانا و بزرگ دیده شود
    croppedSignature() {
      const canvas = this.$refs.pad
      const {width, height} = canvas
      const pixels = this.ctx.getImageData(0, 0, width, height).data
      let minX = width, minY = height, maxX = -1, maxY = -1
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (pixels[(y * width + x) * 4 + 3] > 0) {
            if (x < minX) minX = x
            if (x > maxX) maxX = x
            if (y < minY) minY = y
            if (y > maxY) maxY = y
          }
        }
      }
      if (maxX < 0) return canvas.toDataURL('image/png')

      const pad = 12 * (window.devicePixelRatio || 1)
      minX = Math.max(minX - pad, 0)
      minY = Math.max(minY - pad, 0)
      maxX = Math.min(maxX + pad, width - 1)
      maxY = Math.min(maxY + pad, height - 1)

      const out = document.createElement('canvas')
      out.width = maxX - minX + 1
      out.height = maxY - minY + 1
      out.getContext('2d').drawImage(canvas, minX, minY, out.width, out.height, 0, 0, out.width, out.height)
      return out.toDataURL('image/png')
    },
    clearPad() {
      if (!this.ctx) return
      const canvas = this.$refs.pad
      this.ctx.clearRect(0, 0, canvas.width, canvas.height)
      this.hasInk = false
    },

    submit() {
      this.errors = {}
      if (!this.form.name.trim()) this.errors.signer_name = 'نام و نام خانوادگی را وارد نمایید'
      if (!this.hasInk) this.errors.signature = 'لطفاً در کادر بالا امضا کنید'
      if (!this.form.agree) this.errors.agree = 'لطفاً تایید کنید که قرارداد را مطالعه کرده‌اید'
      if (Object.values(this.errors).some(Boolean)) return

      const signature = this.croppedSignature()
      this.submitting = true
      api.post('contract/' + this.token + '/sign', {signer_name: this.form.name.trim(), signature, agree: true})
        .then(response => {
          this.successMessage = response.data.message
          this.signature = signature
          this.signerName = this.form.name.trim()
          this.signedAt = new Date().toLocaleDateString('fa-IR')
          this.isSigned = true
          window.scrollTo({top: 0, behavior: 'smooth'})
        })
        .catch(error => {
          const errors = error.response?.data?.errors
          if (errors) Object.keys(errors).forEach(k => {
            this.errors[k] = errors[k][0]
          })
        })
        .finally(() => {
          this.submitting = false
        })
    },
    print() {
      window.print()
    },
  },
  created() {
    this.load()
  },
  mounted() {
    window.addEventListener('resize', this.onResize)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.onResize)
  }
}
</script>

<style scoped>
.sign-page {
  background: #eef2f7;
}

.sign-card {
  max-width: 920px;
  margin: 0 auto;
}

.sign-pad {
  width: 100%;
  height: 180px;
  border: 2px dashed #90a4ae;
  border-radius: 10px;
  background: #fff;
  touch-action: none;
  cursor: crosshair;
}

@media print {
  .no-print {
    display: none !important;
  }

  .sign-page {
    background: #fff;
    padding: 0 !important;
  }
}
</style>
