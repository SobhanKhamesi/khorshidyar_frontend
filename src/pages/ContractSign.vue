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

              <signature-pad ref="pad" :error="errors.signature" @ink="errors.signature = ''"/>

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
import SignaturePad from 'components/SignaturePad.vue'

/**
 * صفحه عمومی قرارداد: مشتری متن نهایی تایید شده را می‌بیند و به‌صورت دیجیتال امضا می‌کند.
 */
export default {
  name: 'ContractSign',
  components: {ContractDocument, SignaturePad},
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
        })
    },

    submit() {
      this.errors = {}
      if (!this.form.name.trim()) this.errors.signer_name = 'نام و نام خانوادگی را وارد نمایید'
      if (this.$refs.pad.isEmpty()) this.errors.signature = 'لطفاً در کادر بالا امضا کنید'
      if (!this.form.agree) this.errors.agree = 'لطفاً تایید کنید که قرارداد را مطالعه کرده‌اید'
      if (Object.values(this.errors).some(Boolean)) return

      const signature = this.$refs.pad.toDataURL()
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
