<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em"/>
    </div>

    <div v-else-if="contract" class="row q-col-gutter-md">
      <!-- ============ فرم قرارداد ============ -->
      <div class="col-md-5 col-xs-12 no-print">
        <q-card flat class="border-radius-card">
          <q-card-section class="row items-center">
            <div class="text-h6 col">قرارداد</div>
            <q-btn flat round icon="arrow_back" @click="$router.back()"/>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-banner rounded :class="statusClass">
              <template v-slot:avatar><q-icon :name="statusIcon"/></template>
              <div class="text-weight-bold">{{ contract.status_label }}</div>
              <div v-if="contract.approved_at" class="text-caption">تایید: {{ contract.approved_by }} - {{ contract.approved_at }}</div>
              <div v-if="contract.sent_at" class="text-caption">
                ارسال لینک: {{ contract.sent_at }}
                <q-badge v-if="!contract.sms_sent" color="negative" label="پیامک ارسال نشد"/>
              </div>
              <div v-if="contract.viewed_at" class="text-caption">مشاهده توسط مشتری: {{ contract.viewed_at }}</div>
              <div v-if="contract.signed_at" class="text-caption">امضا: {{ contract.signer_name }} - {{ contract.signed_at }}</div>
            </q-banner>

            <div v-if="contract.link" class="q-mt-sm">
              <div class="text-caption text-grey-8">لینک قرارداد برای مشتری:</div>
              <div dir="ltr" class="text-body2" style="word-break: break-all">{{ contract.link }}</div>
              <div class="q-gutter-sm q-mt-xs">
                <q-btn dense outline rounded color="primary" icon="content_copy" label="کپی لینک" @click="copyLink"/>
                <q-btn v-if="contract.status === 1" dense outline rounded color="accent" icon="sms" label="ارسال مجدد پیامک"
                       :loading="busy === 'resend'" @click="resend"/>
              </div>
            </div>
          </q-card-section>

          <q-separator/>

          <q-card-section>
            <div v-if="isSigned" class="text-caption text-grey-8 q-mb-sm">
              قرارداد امضا شده و قابل ویرایش نیست. برای تغییرات، اصلاحیه فاکتور ثبت کنید (متن امضا شده تغییر نمی‌کند).
            </div>
            <!-- ============ ماده ۳ - مشخصات فنی و اقلام ============ -->
            <div class="q-mb-md">
              <div class="text-subtitle2 text-primary">ماده ۳ - مشخصات فنی و اقلام</div>
              <div class="text-caption text-grey-8 q-mb-sm">
                اقلام پیش فاکتور به‌صورت خودکار اینجا می‌آیند؛ مشخصات هر کدام را تکمیل کنید. در صورت نیاز آیتم دستی اضافه کنید.
              </div>
              <q-card v-for="(item, index) in fields.tech_items" :key="index" flat bordered class="q-mb-sm q-pa-sm">
                <div class="row items-center q-mb-xs">
                  <q-badge :color="item.product_id ? 'teal' : 'deep-purple'" :label="item.product_id ? 'پیش فاکتور' : 'دستی'"/>
                  <q-space/>
                  <q-btn v-if="!item.product_id && !isSigned" flat dense round size="sm" color="negative" icon="delete"
                         @click="fields.tech_items.splice(index, 1)"/>
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-sm-8 col-xs-12">
                    <q-input dense outlined v-model="item.title" label="عنوان قلم" :readonly="isSigned || !!item.product_id"/>
                  </div>
                  <div class="col-sm-4 col-xs-12">
                    <q-input dense outlined dir="ltr" v-model="item.count" label="تعداد" :readonly="isSigned || !!item.product_id"/>
                  </div>
                  <div class="col-12">
                    <q-input dense outlined v-model="item.spec" label="مشخصات فنی (توان، ظرفیت و ...)" :readonly="isSigned"/>
                  </div>
                  <div class="col-sm-6 col-xs-12">
                    <q-input dense outlined v-model="item.brand" label="برند/مدل" :readonly="isSigned"/>
                  </div>
                  <div class="col-sm-6 col-xs-12">
                    <q-input dense outlined v-model="item.warranty" label="مدت گارانتی/تضمین" :readonly="isSigned"/>
                  </div>
                </div>
              </q-card>
              <div v-if="!fields.tech_items.length" class="text-caption text-grey q-mb-sm">پیش فاکتور این درخواست قلمی ندارد.</div>
              <q-btn v-if="!isSigned" dense outline rounded color="primary" icon="add" label="افزودن آیتم دستی" @click="addTechItem"/>
            </div>

            <div v-for="group in groups" :key="group.title" class="q-mb-md">
              <div class="text-subtitle2 text-primary q-mb-xs">{{ group.title }}</div>
              <div class="row q-col-gutter-sm">
                <div v-for="key in group.keys" :key="key" :class="group.wide ? 'col-12' : 'col-sm-6 col-xs-12'">
                  <q-input dense outlined v-model="fields[key]" :label="contract.labels[key]" :readonly="isSigned"
                           :dir="isNumericField(key) ? 'ltr' : 'rtl'"/>
                </div>
              </div>
            </div>
            <div class="text-caption text-grey-8">
              اطلاعات کارفرما، اقلام، مبلغ کل (به عدد و حروف)، پیش‌پرداخت، مانده و چک‌ها به‌صورت خودکار از اطلاعات مشتری و فاکتور این
              درخواست خوانده می‌شود. برای تغییر آن‌ها از «اصلاحیه فاکتور» استفاده کنید.
            </div>
          </q-card-section>

          <q-card-actions v-if="!isSigned" class="q-pa-md q-gutter-sm">
            <q-btn rounded outline color="primary" icon="save" label="ذخیره پیش‌نویس" :loading="busy === 'save'" @click="save"/>
            <q-btn v-if="contract.can_approve" rounded color="positive" icon="verified"
                   :label="contract.status === 1 ? 'ذخیره، تایید مجدد و ارسال' : 'تایید ادمین و ارسال برای مشتری'"
                   :loading="busy === 'approve'" @click="approve"/>
            <div v-else class="text-caption text-grey-8 full-width">
              پس از تکمیل، تایید و ارسال قرارداد برای مشتری توسط ادمین انجام می‌شود.
            </div>
          </q-card-actions>
        </q-card>
      </div>

      <!-- ============ پیش‌نمایش ============ -->
      <div class="col-md-7 col-xs-12">
        <q-card flat class="border-radius-card">
          <q-card-section class="row items-center no-print">
            <div class="text-subtitle1 col">{{ isDraft ? 'پیش‌نمایش قرارداد' : 'متن نهایی ارسال شده برای مشتری' }}</div>
            <q-btn flat rounded icon="print" label="چاپ" @click="print"/>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <contract-document
              :data="contract.data"
              :fields="isDraft ? fields : null"
              :signature="contract.signature || ''"
              :signer-name="contract.signer_name || ''"
              :signed-at="contract.signed_at || ''"/>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- ============ تایید ادمین ============ -->
    <q-dialog v-model="approveDlg">
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">تایید قرارداد</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          متن قرارداد با اطلاعات فعلی ثابت شده و لینک امضا برای مشتری پیامک می‌شود. ادامه می‌دهید؟
        </q-card-section>
        <q-card-actions align="center" class="q-pb-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn rounded color="positive" icon="verified" label="تایید و ارسال" @click="confirmApprove"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {copyToClipboard} from 'quasar'
import {api} from 'boot/axios'
import ContractDocument from 'components/ContractDocument.vue'

/**
 * ویرایش قرارداد مرحله «مذاکره و قرارداد»، تایید ادمین و ارسال لینک امضا برای مشتری.
 */
export default {
  name: 'AutomationContract',
  components: {ContractDocument},
  data() {
    return {
      loading: true,
      busy: '',
      approveDlg: false,
      contract: null,
      fields: {},
      groups: [
        {title: 'ماده ۱ - طرفین قرارداد', keys: ['contract_number', 'contract_date']},
        {title: 'نشانی پروژه', keys: ['project_address'], wide: true},
        {title: 'ماده ۲ - موضوع قرارداد', keys: ['plant_capacity', 'plant_type']},
        {title: 'ماده ۵ - نحوه پرداخت', keys: ['cheque_issuer', 'late_penalty_percent', 'late_penalty_daily']},
        {title: 'ماده ۶ - مدت زمان اجرا', keys: ['execution_duration'], wide: true},
        {title: 'ماده ۱۰ - گارانتی', keys: ['warranty_panel', 'warranty_inverter', 'warranty_battery', 'warranty_structure']},
        {title: 'ماده ۱۳ و ۱۶ - فسخ و حل اختلاف', keys: ['termination_grace_days', 'arbiter']},
      ],
    }
  },
  computed: {
    automationId() {
      return this.$route.params.id
    },
    isDraft() {
      return this.contract && this.contract.status === 0
    },
    isSigned() {
      return this.contract && this.contract.status === 2
    },
    statusClass() {
      return {0: 'bg-orange-1 text-orange-10', 1: 'bg-blue-1 text-blue-10', 2: 'bg-green-1 text-green-10'}[this.contract.status]
    },
    statusIcon() {
      return {0: 'edit_note', 1: 'send', 2: 'verified'}[this.contract.status]
    },
  },
  methods: {
    isNumericField(key) {
      return ['contract_number', 'late_penalty_percent', 'late_penalty_daily', 'termination_grace_days'].includes(key)
    },
    apply(data) {
      this.contract = data
      this.fields = {...data.fields, tech_items: (data.fields.tech_items || []).map(i => ({...i}))}
    },
    // آیتم دستی ماده ۳ (خارج از اقلام پیش فاکتور)
    addTechItem() {
      this.fields.tech_items.push({product_id: null, title: '', count: 1, spec: '', brand: '', warranty: ''})
    },
    load() {
      this.loading = true
      api.get('automation/contract/' + this.automationId)
        .then(response => this.apply(response.data.data))
        .finally(() => {
          this.loading = false
        })
    },
    save() {
      this.busy = 'save'
      return api.post('automation/contract/' + this.automationId, {fields: this.fields})
        .then(response => {
          this.apply(response.data.data)
          this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
        })
        .finally(() => {
          this.busy = ''
        })
    },
    // پلاگین Dialog کوآزار در پروژه فعال نیست؛ تایید با دیالوگ داخل همین صفحه گرفته می‌شود
    approve() {
      this.approveDlg = true
    },
    confirmApprove() {
      this.approveDlg = false
      this.busy = 'approve'
      // ابتدا آخرین تغییرات ذخیره و سپس تایید می‌شود
      api.post('automation/contract/' + this.automationId, {fields: this.fields})
        .then(() => api.post('automation/contract/' + this.automationId + '/approve'))
        .then(response => {
          this.apply(response.data.data)
          this.$q.notify({type: response.data.data.sms_sent ? 'positive' : 'warning', position: 'center', message: response.data.message})
        })
        .finally(() => {
          this.busy = ''
        })
    },
    resend() {
      this.busy = 'resend'
      api.post('automation/contract/' + this.automationId + '/resend')
        .then(response => {
          this.apply(response.data.data)
          this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
        })
        .finally(() => {
          this.busy = ''
        })
    },
    copyLink() {
      copyToClipboard(this.contract.link).then(() => {
        this.$q.notify({type: 'positive', position: 'center', message: 'لینک کپی شد'})
      })
    },
    print() {
      window.print()
    },
  },
  created() {
    this.load()
  }
}
</script>

<style>
@media print {
  .no-print, .q-header, .q-drawer, .q-footer {
    display: none !important;
  }

  .q-page-container {
    padding: 0 !important;
  }
}
</style>
