<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد حساب جدید</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-select
                option-label="name"
                option-value="id"
                outlined
                use-input
                behavior="dialog"
                @filter="filterFn"
                v-model="bank"
                label="بانک"
                :options="banksOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input
                outlined
                v-model="number"
                dir="ltr"
                label="شماره حساب"
                input-class="text-right"/>


            </div>

            <div class="col-12">
              <q-input
                label="توضیحات بیشتر"
                v-model="description"
                outlined
                autogrow
              />
            </div>

          </div>

        </q-card-section>

        <q-card-actions>
          <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

export default {
  name: "BankAccountCreate",
  data() {
    return {
      bank: null,
      number: '',
      description: '',
      banks: [],
      banksOptions: []
    }
  },
  methods: {
    getBanks() {
      api.get('banks/list')
        .then(response => {
          this.banks = response.data.data
          this.banksOptions = response.data.data
          this.$q.loading.hide();
        });
    },
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};


      if (this.bank !== null && this.bank.id !== undefined)
        payload.bank_id = this.bank.id

      payload.number = this.number
      payload.description = this.description


      api.post('bank-accounts/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.bank = null
          this.number = ''
          this.description = ''
          this.$q.loading.hide();
        });
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.banksOptions = this.banks
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.banksOptions = this.banks.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  created() {


    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getBanks();


  }
}
</script>

<style scoped>

</style>
