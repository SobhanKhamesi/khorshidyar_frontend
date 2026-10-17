<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش یادآوری</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="editForm()">
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


              <q-toggle
                checked-icon="check"
                color="positive"
                unchecked-icon="clear"
                :false-value="0"
                :true-value="1"
                v-model="status"
                :label="status === 1 ? 'تکمیل شده' : 'فعال'"
              />

              <div v-if="type === 1">
                <q-toggle
                  v-if="!birthdaySmsSent"
                  v-model="sendSms"
                  color="positive"
                  label="ارسال پیامک تبریک تولد"
                />
                <div v-else class="text-positive text-caption">
                  پیامک تبریک تولد قبلاً برای این مشتری ارسال شده است
                </div>
              </div>

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
  name: "ReminderEdit",



  data() {
    return {
      title: '',
      description: '',
      status: '',
      date: '',
      type: 0,
      birthdaySmsSent: false,
      sendSms: false,
    }
  },
  methods: {
    getData() {
      api.get('reminders/' + this.$route.params.id)
        .then(response => {
          this.title = response.data.data.title
          this.description = response.data.data.description
          this.date = response.data.data.jalali_date
          this.status = parseInt(response.data.data.status)
          this.type = parseInt(response.data.data.type)
          this.birthdaySmsSent = !!response.data.data.birthday_sms_sent
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
      payload.status = this.status
      payload.title = this.title
      payload.description = this.description
      payload.date = this.date
      payload.send_sms = this.sendSms

      api.post('reminders/update', payload)
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
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },
  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    });

    this.getData();

  },
  updated() {
    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    });

    this.getData();

  }
}
</script>

<style scoped>

</style>
