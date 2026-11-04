<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => $emit('update:modelValue', val)" @show="init">
    <q-card style="width: 750px; max-width: 95vw;">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
        <div class="text-caption text-grey-7" v-if="service">
          مشتری: {{ service.customer ? service.customer.name : '-' }}
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section v-if="service" class="q-gutter-y-md">

        <!-- آخرین عیوب اعلام شده توسط کارشناس -->
        <q-banner v-if="lastDefects" rounded class="bg-red-1 text-negative">
          <div class="text-weight-bold q-mb-xs">عیوب اعلام شده توسط کارشناس فنی:</div>
          <div style="white-space: pre-line">{{ lastDefects }}</div>
        </q-banner>

        <!-- اقلام پیش نیاز (برای مقایسه) -->
        <div v-if="mode !== 'complete'">
          <div class="text-subtitle2 q-mb-xs">اقلام پیش‌نیاز تعیین شده توسط مدیر</div>
          <items-table :items="service.required_items" empty-text="اقلام پیش‌نیاز ثبت نشده است"/>
        </div>

        <!-- ثبت اقلام مصرف شده توسط نصاب -->
        <div v-if="mode === 'installer-submit'">
          <div class="text-subtitle2 q-mb-sm">اقلام مصرف شده در این پروژه</div>
          <installation-items-editor v-model="usedItems"/>
        </div>

        <div v-else-if="mode === 'send-to-review' || mode === 'review'">
          <div class="text-subtitle2 q-mb-xs">اقلام مصرف شده (ثبت شده توسط نصاب)</div>
          <items-table :items="service.used_items" empty-text="اقلام مصرفی ثبت نشده است"/>
        </div>

        <q-select
            v-if="mode === 'send-to-review'"
            outlined
            v-model="expert"
            :options="expertOptions"
            option-label="name"
            option-value="id"
            label="کارشناس فنی بررسی کننده"/>

        <div v-if="mode === 'review'">
          <q-radio v-model="reviewResult" val="approve" label="پروژه مشکلی ندارد - تایید" color="positive"/>
          <q-radio v-model="reviewResult" val="reject" label="نیاز به رفع عیوب - برگشت به نصاب" color="negative"/>
        </div>

        <div v-if="mode === 'complete'" class="text-body1">
          پروژه توسط کارشناس فنی تایید شده است. با تکمیل نهایی، سرویس نصب بسته شده و یک ردیف
          خدمات پس از فروش برای این مشتری ایجاد می‌شود.
        </div>

        <q-input outlined autogrow v-model="description" :label="descriptionLabel"/>
      </q-card-section>

      <q-separator/>
      <q-card-actions align="center">
        <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
        <q-btn rounded :color="submitColor" :label="submitLabel" :loading="saving" @click.prevent="submit"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'
import InstallationItemsEditor from 'components/InstallationItemsEditor.vue'
import ItemsTable from 'components/InstallationItemsTable.vue'

// باید با ثابت های STAGE_* مدل InstallationService در بک اند هم خوان باشد
export const STAGE = {
  DRAFT: 0,
  ASSIGNED: 1,
  INSTALLER_SUBMITTED: 2,
  UNDER_REVIEW: 3,
  NEEDS_FIX: 4,
  APPROVED: 5,
  COMPLETED: 6
}

export default {
  name: "InstallationWorkflowDialog",
  components: {InstallationItemsEditor, ItemsTable},

  props: {
    modelValue: Boolean,
    service: Object,
    // installer-submit | send-to-review | review | complete
    mode: String
  },

  emits: ['update:modelValue', 'saved'],

  data() {
    return {
      saving: false,
      description: '',
      usedItems: [],
      expert: null,
      expertOptions: [],
      reviewResult: 'approve'
    }
  },

  computed: {
    isFixRound() {
      return this.service && this.service.stage === STAGE.NEEDS_FIX
    },
    lastDefects() {
      if (!this.service || !this.isFixRound) return null
      const reject = [...(this.service.histories || [])].reverse().find(h => h.stage === STAGE.NEEDS_FIX)
      return reject ? reject.description : null
    },
    title() {
      return {
        'installer-submit': this.isFixRound ? 'ثبت رفع عیوب و ارسال مجدد به کارشناس' : 'ثبت اقلام مصرفی و ارجاع به مدیر',
        'send-to-review': 'ارسال پروژه برای بررسی کارشناس فنی',
        'review': 'بررسی پروژه توسط کارشناس فنی',
        'complete': 'تکمیل نهایی سرویس نصب'
      }[this.mode]
    },
    descriptionLabel() {
      if (this.mode === 'review' && this.reviewResult === 'reject') return 'عیوبی که نصاب باید برطرف کند'
      if (this.mode === 'installer-submit' && this.isFixRound) return 'توضیح رفع عیوب'
      return 'توضیحات (اختیاری)'
    },
    submitLabel() {
      return {
        'installer-submit': this.isFixRound ? 'ارسال مجدد به کارشناس' : 'ارجاع به مدیر',
        'send-to-review': 'ارسال برای کارشناس',
        'review': this.reviewResult === 'approve' ? 'تایید پروژه' : 'برگشت به نصاب',
        'complete': 'تکمیل نهایی'
      }[this.mode]
    },
    submitColor() {
      return this.mode === 'review' && this.reviewResult === 'reject' ? 'negative' : 'accent'
    }
  },

  methods: {
    init() {
      this.description = ''
      this.reviewResult = 'approve'
      this.expert = null

      if (this.mode === 'installer-submit') {
        // اگر قبلا ثبت شده همان را نمایش بده، وگرنه از اقلام پیش نیاز شروع کن
        const source = (this.service.used_items && this.service.used_items.length)
            ? this.service.used_items
            : (this.service.required_items || [])
        this.usedItems = source.map(i => ({product: i.product, quantity: i.quantity}))
        if (!this.usedItems.length) this.usedItems = [{product: null, quantity: 1}]
      }

      if (this.mode === 'send-to-review') {
        api.get('technical_experts').then(response => {
          // کارشناس فنی یا ادمین
          this.expertOptions = response.data.data.filter(u => Number(u.role) === 1 || Number(u.role) === 0)
          this.expert = this.expertOptions.find(u => u.id === this.service.technical_expert_id) || null
        })
      }
    },

    submit() {
      const endpoints = {
        'installer-submit': 'installer-submit',
        'send-to-review': 'send-to-review',
        'review': 'review',
        'complete': 'complete'
      }

      const payload = {description: this.description}

      if (this.mode === 'installer-submit') {
        payload.items = this.usedItems
            .filter(i => i.product && Number(i.quantity) > 0)
            .map(i => ({product_id: i.product.id, quantity: i.quantity}))
        if (!payload.items.length) return this.notify('اقلام مصرف شده در این پروژه را وارد کنید')
      }
      if (this.mode === 'send-to-review') {
        if (!this.expert) return this.notify('کارشناس فنی را انتخاب کنید')
        payload.expert_id = this.expert.id
      }
      if (this.mode === 'review') {
        if (this.reviewResult === 'reject' && !this.description.trim())
          return this.notify('عیوبی که نصاب باید برطرف کند را وارد کنید')
        payload.result = this.reviewResult
      }

      this.saving = true
      api.post(`installation-service/${this.service.id}/${endpoints[this.mode]}`, payload)
          .then(response => {
            this.$q.notify({timeout: 3000, position: 'center', type: 'positive', message: response.data.message})
            this.$emit('saved', response.data.data)
            this.$emit('update:modelValue', false)
          })
          .catch(() => {
            // خطا توسط interceptor در boot/axios نمایش داده می شود
          })
          .finally(() => {
            this.saving = false
          })
    },

    notify(message) {
      this.$q.notify({timeout: 4000, position: 'center', type: 'negative', message})
    }
  }
}
</script>
