<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد یادآور جدید</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="title" label="عنوان"/>

            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input
                mask="####/##/##" outlined dir="ltr" v-model="date" label="تاریخ">
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
  name: "ReminderCreate",
  data() {
    return {
      title: '',
      description: '',
      date: '',
    }
  },
  methods: {
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      let payload = {};
      payload.title = this.title
      payload.description = this.description
      payload.date = this.date

      api.post('reminders/store', payload)
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

          this.title = ''
          this.description = ''
          this.date = ''
        })


    }
  }
}
</script>

<style scoped>

</style>
