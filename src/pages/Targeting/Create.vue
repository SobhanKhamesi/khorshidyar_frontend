<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">هدف گذاری جدید</div>
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
                v-model="user"
                use-input
                label="کاربر"
                :options="usersOptions"
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
                outlined
                v-model="month"
                :options="monthOptions"
                label="ماه"
              />
            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input
                min="0"
                suffix="عدد"
                dir="ltr"
                type="number" outlined v-model.number="calls" label="تعداد تماس"
                input-class="text-right"/>

              <q-field
                dir="ltr"
                suffix="تومان"
                label="مبلغ فروش (تومان)"
                input-class="text-right"
                outlined
                v-model="sales">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>

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
  name: "TargetingCreate",
  directives: {money: VMoney},
  data() {
    return {
      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },


      user: null,
      month: null,
      calls: 0,
      sales: 0,

      monthOptions: [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
      ],

      users: [],
      usersOptions: [],
    }
  },
  methods: {
    getUsers() {
      api.get('users')
        .then(response => {
          this.users = response.data.data
          this.usersOptions = response.data.data
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.usersOptions = this.users
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.usersOptions = this.users.filter(
          v => v.name.toLowerCase().indexOf(needle) > -1
        )
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
      if (this.user !== null)
        payload.user = this.user.id
      payload.month = this.month
      payload.calls = this.calls
      payload.sales = this.sales

      api.post('targeting/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.user = null
          this.month = null
          this.calls = 0
          this.sales = 0
          this.$q.loading.hide();

        })
        .finally(() => {
          this.$q.loading.hide();
        });


    }
  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getUsers();

  }
}
</script>

<style scoped>

</style>
