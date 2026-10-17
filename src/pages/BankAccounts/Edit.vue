<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش حساب</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="editForm()">
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
          <q-btn type="submit" rounded class="full-width" color="accent" label="ویرایش"/>
        </q-card-actions>
      </q-form>
    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'


export default {
  name: "BankAccountEdit",
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
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    getData() {
      api.get('bank-accounts/' + this.$route.params.id)
        .then(response => {
          this.bank = response.data.data.bank
          this.number = response.data.data.number
          this.description = response.data.data.description
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    editForm() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      let payload = {};
      payload.id = this.$route.params.id

      if (this.bank !== null && this.bank.id !== undefined)
        payload.bank_id = this.bank.id

      payload.number = this.number
      payload.description = this.description


      api.post('bank-accounts/update', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.$q.loading.hide();
        })
        .catch(() => {
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
    this.getData();


  }
}
</script>

<style scoped>

</style>
