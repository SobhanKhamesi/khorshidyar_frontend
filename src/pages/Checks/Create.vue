<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد چک جدید</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-xs-12 q-gutter-y-md">

              <q-select
                outlined
                map-options
                emit-value
                v-model="type"
                label="نوع"
                :options="checkTypeOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input mask="####/##/##" outlined dir="ltr" v-model="date"
                       label="تاریخ">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="date" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-select
                option-label="name"
                option-value="id"
                outlined
                use-input
                clearable     behavior="dialog"
                @filter="filterBanks"
                v-model="bank"
                label="بانک"
                :options="checkBankOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


            </div>
            <div class="col-md-4 col-xs-12 q-gutter-y-md">

              <q-select
                outlined
                map-options
                emit-value
                v-model="status"
                label="وضعیت"
                :options="checkStatusOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input
                outlined
                v-model="series"
                dir="ltr"
                label="سری"
                input-class="text-right"/>

              <q-select
                option-label="name"
                option-value="id"
                outlined
                use-input
                behavior="dialog"
                @filter="filterCustomers"
                v-model="customer"
                label="مشتری"
                :options="checkCustomers">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


            </div>
            <div class="col-md-4 col-xs-12 q-gutter-y-md">


              <q-field
                dir="ltr"
                suffix="تومان"
                label="مبلغ"
                input-class="text-right"
                outlined
                v-model="amount">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>

              <q-input
                outlined
                v-model="serial"
                dir="ltr"
                label="سریال"
                input-class="text-right"/>

              <q-select
                option-label="fullDetails"
                clearable      option-value="id"
                outlined
                v-model="bankAccount"
                label="حساب"
                :options="checkBankAccountsOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


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
import {VMoney} from 'v-money'


export default {
  name: "CheckCreate",
  directives: {money: VMoney},
  data() {
    return {
      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },


      type: null,
      date: '',
      bank: null,
      status: null,
      series: '',
      customer: null,
      amount: '',
      serial: '',
      bankAccount: null,
      description: '',


      checkTypeOptions: [
        {label: 'پرداختی', value: 0},
        {label: 'دریافتی', value: 1}
      ],
      checkStatusOptions: [
        {label: 'معوق', value: 0}, {label: 'پاس شده', value: 1}, {label: 'برگشت خورده', value: 2}
      ],


      checkBankAccounts: [],
      checkBankAccountsOptions: [],

      checkCustomers: [],
      checkCustomersOptions: [],

      checkBanks: [],
      checkBankOptions: []
    }
  },
  methods: {
    getCustomers() {
      api.get('customers/list')
        .then(response => {
          this.checkCustomers = response.data.data
          this.checkCustomersOptions = response.data.data
        })
    },
    getBankAccounts() {
      api.get('bank-accounts/list')
        .then(response => {
          this.checkBankAccounts = response.data.data
          this.checkBankAccountsOptions = response.data.data
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    getBanks() {
      api.get('banks/list')
        .then(response => {
          this.checkBanks = response.data.data
          this.checkBankOptions = response.data.data
        })
    },
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.type = this.type
      payload.date = this.date
      if (this.bank !== null)
        payload.bank = this.bank.id
      payload.status = this.status
      payload.series = this.series
      if (this.customer !== null)
        payload.customer = this.customer.id
      payload.amount = this.amount
      payload.serial = this.serial
      if (this.bankAccount !== null)
        payload.bankAccount = this.bankAccount.id


      api.post('checks/store', payload)
        .then(response => {


          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          setTimeout(() =>
              location.reload()
            , 1200);


          this.type = null
          this.date = ''
          this.bank = null
          this.status = null
          this.series = ''
          this.customer = null
          this.amount = ''
          this.serial = ''
          this.bankAccount = null
          this.description = ''
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },
    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          this.checkCustomers = this.checkCustomersOptions
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.checkCustomers = this.checkCustomersOptions.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterBanks(val, update) {
      if (val === '') {
        update(() => {
          this.checkBankOptions = this.checkBanks
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.checkBankOptions = this.checkBanks.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
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

    this.getBanks();
    this.getCustomers();
    this.getBankAccounts();

  }
}
</script>

<style scoped>

</style>
