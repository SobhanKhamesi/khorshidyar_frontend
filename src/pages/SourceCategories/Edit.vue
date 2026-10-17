<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش شیوه آشنایی</div>
      </q-card-section>

      <q-separator/>
      <q-form @submit.prevent="editFormSource()">

        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-12">

              <q-input outlined v-model="titleSource" label="عنوان"/>

            </div>
            <div class="col-12">

              <q-input
                label="توضیحات"
                v-model="descriptionSource"
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
      titleSource: '',
      descriptionSource: '',
    }
  },
  methods: {
    editFormSource () {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.id = this.$route.params.id
      payload.title = this.titleSource
      payload.description = this.descriptionSource


      api.post('source/update', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .then(() => {
          this.titleSource = '';
          this.descriptionSource = '';
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    getData() {
      api.get('source/' + this.$route.params.id)
        .then(response => {
          this.titleSource = response.data.data.title
          this.descriptionSource = response.data.data.description
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
