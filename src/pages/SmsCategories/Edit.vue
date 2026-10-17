<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش دسته بندی پیامک</div>
      </q-card-section>

      <q-separator/>
      <q-form @submit.prevent="editFormSms()">

        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-12">

              <q-input outlined readonly v-model="titleSms" label="عنوان"/>

            </div>
            <div class="col-12">

              <q-input
                label="متن پیامک"
                type="textarea"
                v-model="descriptionSms"
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
  name: "SmsEdit",
  data() {
    return {
      titleSms: '',
      descriptionSms: '',
    }
  },
  methods: {
    editFormSms () {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.id = this.$route.params.id
      payload.title = this.titleSms
      payload.description = this.descriptionSms


      api.post('source/sms/update', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    getData() {
      api.get('source/sms/' + this.$route.params.id)
        .then(response => {
          this.titleSms = response.data.data.title
          this.descriptionSms = response.data.data.description
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
