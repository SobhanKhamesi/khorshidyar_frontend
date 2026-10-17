<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="dialog-card-big2">
      <q-card-section>
        <div class="text-h6">اطلاعات مشتری</div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 65vh" class="scroll">
        <div v-if="!customer" class="text-center text-grey q-pa-md">
          اطلاعاتی برای نمایش وجود ندارد
        </div>

        <div v-else class="row q-col-gutter-md">
          <div class="col-md-6 col-xs-12" v-for="(row, i) in rows" :key="i">
            <div class="text-caption text-grey">{{ row.label }}</div>
            <div class="text-subtitle2">{{ row.value }}</div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "CustomerInfoDialog",
  props: {
    modelValue: {type: Boolean, default: false},
    customer: {type: Object, default: null}
  },
  emits: ['update:modelValue'],
  computed: {
    rows() {
      if (!this.customer) return []

      const statusLabels = {0: 'سرنخ', 1: 'فرصت', 2: 'در حال تبدیل', 3: 'مشتری'}
      const typeLabels = {0: 'آقا', 1: 'خانم', 2: 'حقوقی', 3: 'حقیقی'}

      const c = this.customer

      const candidates = [
        {label: 'نام', value: c.fullName || c.name},
        {label: 'نوع', value: typeLabels[c.type]},
        {label: 'وضعیت', value: statusLabels[c.status]},
        {label: 'شماره تماس', value: c.contact_number},
        {label: 'شماره تماس دوم', value: c.contact_number1},
        {label: 'شماره تماس سوم', value: c.contact_number2},
        {label: 'تلفن ثابت', value: c.landline_number},
        {label: 'کد ملی', value: c.national_code},
        {label: 'کد پستی', value: c.postal_code},
        {label: 'استان', value: c.province},
        {label: 'شهر', value: c.city},
        {label: 'آدرس', value: c.address},
        {label: 'ایمیل', value: c.email},
        {label: 'شغل', value: c.job},
        {label: 'آدرس محل کار', value: c.job_address},
        {label: 'دسته‌بندی', value: c.category ? c.category.title : null},
        {label: 'شیوه آشنایی', value: c.source ? c.source.title : null},
        {label: 'معرف', value: c.referrer ? (c.referrer.name || c.referrer.title) : null},
        {label: 'تاریخ تولد', value: c.jalali_birth_date},
        {label: 'تاریخ ازدواج', value: c.jalali_marriage_date},
        {label: 'توضیحات', value: c.description},
        {label: 'ثبت کننده', value: c.SabtKonande},
        {label: 'تاریخ ثبت', value: c.jalali_created},
      ]

      return candidates.filter(row => row.value !== null && row.value !== undefined && row.value !== '')
    }
  }
}
</script>

<style scoped>
</style>
