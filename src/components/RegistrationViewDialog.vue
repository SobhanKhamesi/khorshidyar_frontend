<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :maximized="!$q.screen.gt.sm"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card style="width: 640px; max-width: 95vw">
      <q-card-section>
        <div class="text-h6">فرم ثبت نام آنلاین</div>
        <div v-if="registration" class="text-caption text-grey-8">
          ثبت شده در {{ registration.jalali_created_at }}
          <q-badge v-if="!registration.is_new_customer" class="q-ml-sm" color="orange"
                   label="این شماره پیش از ثبت نام در سامانه وجود داشت"/>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 70vh" class="scroll">
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </div>
        <q-markup-table v-else-if="registration" flat bordered dense separator="cell">
          <tbody>
          <tr v-for="row in registration.rows" :key="row.key">
            <td class="text-grey-8" style="width: 40%; white-space: normal">{{ row.title }}</td>
            <td style="white-space: normal">{{ row.value ?? '-' }}</td>
          </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>

      <q-separator/>
      <q-card-actions align="center">
        <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {api} from 'boot/axios'

/**
 * پاسخ‌های فرم ثبت نام آنلاین یک سرنخ (صفحه عمومی /register).
 * با باز شدن، ثبت نام «دیده شده» می‌شود و زنگوله/یادآوری آن برطرف می‌شود.
 */
export default {
  name: 'RegistrationViewDialog',
  props: {
    modelValue: {type: Boolean, default: false},
    customerId: {type: String, default: ''}
  },
  emits: ['update:modelValue', 'seen'],
  data() {
    return {loading: false, registration: null}
  },
  watch: {
    modelValue(val) {
      if (val && this.customerId) this.fetch()
    }
  },
  methods: {
    fetch() {
      this.loading = true
      this.registration = null
      api.get('customers/leads/registration/' + this.customerId)
        .then(response => {
          this.registration = response.data.data
          this.$emit('seen', this.customerId)
        })
        .catch(() => {
          this.$emit('update:modelValue', false)
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>
