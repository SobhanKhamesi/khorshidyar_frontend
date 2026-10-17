<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد برنامه جدید</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="title" label="عنوان"/>


              <q-input dir="ltr" label="زمان شروع" mask="time" outlined v-model="startTime">
                <template v-slot:prepend>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="startTime" mask="HH:mm" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input mask="####/##/##" dir="ltr" label="تاریخ" outlined v-model="date">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        today-btn
                        calendar="persian"
                        v-model="date" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-input dir="ltr" label="زمان پایان" mask="time" outlined v-model="endTime">
                <template v-slot:prepend>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="endTime" mask="HH:mm" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


            </div>

            <div class="col-12">
              <q-input
                label="توضیحات"
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
  name: "PlanningCreate",
  data() {
    return {
      title: '',
      description: '',
      startTime: '',
      date: '',
      endTime: '',
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
      payload.startTime = this.startTime
      payload.date = this.date
      payload.endTime = this.endTime

      api.post('planning/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.title = ''
          this.description = ''
          this.startTime = ''
          this.date = ''
          this.endTime = ''
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    }
  }
}
</script>

<style scoped>

</style>
