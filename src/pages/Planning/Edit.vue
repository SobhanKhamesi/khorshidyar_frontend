<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش برنامه</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="editForm()">
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


              <q-input dir="ltr" label="تاریخ " outlined v-model="date">
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


              <q-toggle
                checked-icon="check"
                color="positive"
                unchecked-icon="clear"
                :false-value="0"
                :true-value="1"
                v-model="status"
                :label="status === 1 ? 'تکمیل شده' : 'فعال'"
              />


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
  name: "PlanningEdit",
  data() {
    return {
      title: '',
      description: '',
      startTime: '',
      date: '',
      endTime: '',
      status: 0,
    }
  },
  methods: {
    getData() {


      api.get('planning/' + this.$route.params.id)
        .then(response => {
          this.title = response.data.data.title
          this.description = response.data.data.description
          this.startTime = response.data.data.time_start
          this.date = response.data.data.jalali_date
          this.endTime = response.data.data.time_end
          this.status = parseInt(response.data.data.status)

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
      payload.startTime = this.startTime
      payload.date = this.date
      payload.endTime = this.endTime


      api.post('planning/update', payload)
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

  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getData();

  }

}
</script>

<style scoped>

</style>
