<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش دلایل شکست</div>
      </q-card-section>

      <q-separator/>
      <q-form @submit.prevent="editFormFailure()">

        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-12">

              <q-input outlined v-model="titleFailure" label="عنوان"/>

            </div>
            <div class="col-12">

              <q-input
                label="توضیحات"
                v-model="descriptionFailure"
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
  name: "FailureEdit",
  data() {
    return {
      titleFailure: '',
      descriptionFailure: '',
    }
  },
  methods: {
    editFormFailure () {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.id = this.$route.params.id
      payload.title = this.titleFailure
      payload.description = this.descriptionFailure


      api.post('failure/update', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .then(() => {
          this.titleFailure = '';
          this.descriptionFailure = '';
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    getData() {
      api.get('failure/' + this.$route.params.id)
        .then(response => {
          this.titleFailure = response.data.data.title
          this.descriptionFailure = response.data.data.description
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
