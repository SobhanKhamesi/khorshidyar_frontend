<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ارسال پیامک</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>

          <div class="q-gutter-y-md">

            <q-select
                outlined
                v-model="sendType"
                emit-value
                map-options
                label="نوع ارسال"
                :options="sendTypeOptions"
                :rules="[val => !!val || 'نوع ارسال را انتخاب نمایید']"
            />

            <q-select
                v-if="sendType === 'specific'"
                option-label="fullName"
                option-value="id"
                multiple
                outlined
                counter
                use-chips
                v-model="receivers"
                use-input
                label="دریافت کنندگان"
                :options="customersOptions"
                :rules="[val => (val && val.length > 0) || 'حداقل یک دریافت کننده را انتخاب نمایید']"
                @filter="filterFn"
                behavior="dialog">

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    یافت نشد
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
                v-if="sendType && sendType !== 'specific'"
                option-label="title"
                option-value="id"
                outlined
                clearable
                emit-value
                map-options
                v-model="categoryId"
                label="دسته بندی (اختیاری)"
                :options="categories">

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    دسته بندی‌ای یافت نشد
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
                label="متن پیامک"
                v-model="body"
                outlined
                autogrow
                :rules="[val => !!val || 'متن پیامک را وارد نمایید']"
            />

          </div>

        </q-card-section>

        <q-card-actions>
          <q-btn type="submit" rounded class="full-width" color="accent" label="ارسال"/>
        </q-card-actions>
      </q-form>

    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

export default {
  name: "SmsCreate",
  data() {
    return {
      sendType: null,
      sendTypeOptions: [
        {label: 'ارسال به لیست مشتریان', value: 'customers'},
        {label: 'ارسال به لیست سرنخ‌ها', value: 'leads'},
        {label: 'ارسال به هر دو لیست', value: 'both'},
        {label: 'ارسال به شخص مورد نظر', value: 'specific'},
      ],
      categoryId: null,
      categories: [],
      body: '',
      receivers: [],
      customers: [],
      customersOptions: []
    }
  },
  methods: {
    getCustomers() {
      return api.get('customers/all')
          .then(response => {
            this.customers = response.data.data
            this.customersOptions = response.data.data
          })
          .catch(() => {
          });
    },
    getCategories() {
      return api.get('customers/categories/list')
          .then(response => {
            this.categories = response.data.data
          })
          .catch(() => {
          });
    },
    resetForm() {
      this.sendType = null;
      this.categoryId = null;
      this.body = '';
      this.receivers = [];
    },
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.type = this.sendType
      payload.category_id = this.sendType === 'specific' ? null : this.categoryId
      payload.body = this.body
      payload.receivers = this.sendType === 'specific' ? this.receivers : []

      api.post('sms/store', payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.resetForm();

            this.$q.loading.hide();
          })
          .catch((error) => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'negative',
              message: error?.response?.data?.message || 'خطا در ارسال پیامک'
            })
            this.$q.loading.hide();
          });

    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.customersOptions = this.customers
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.customersOptions = this.customers.filter(
            v => v.fullName.toLowerCase().indexOf(needle) > -1
        )
      })
    },
  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    Promise.all([
      this.getCustomers(),
      this.getCategories()
    ]).finally(() => {
      this.$q.loading.hide();
    })

  }
}
</script>

<style scoped>

</style>
