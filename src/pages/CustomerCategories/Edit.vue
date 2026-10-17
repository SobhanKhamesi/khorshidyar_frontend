<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش دسته بندی</div>
      </q-card-section>

      <q-separator/>
      <q-form @submit.prevent="editForm()">

        <q-card-section>


          <div class="row q-col-gutter-md">
            <div class="col-12">

              <q-input outlined v-model="title" label="عنوان"/>

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
  name: "CategoryEdit",
  data() {
    return {
      title: '',
      description: '',
    }
  },
  methods: {
    getData() {
      api.get('customers/categories/' + this.$route.params.id)
        .then(response => {
          this.title = response.data.data.title
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
      payload.title = this.title
      payload.description = this.description


      api.post('customers/categories/update', payload)
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
