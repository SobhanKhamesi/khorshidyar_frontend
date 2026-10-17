<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد دسته بندی جدید</div>
      </q-card-section>

      <q-separator/>
      <q-form @submit.prevent="submitForm()">

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
  name: "CategoryCreate",
  data() {
    return {
      title: '',
      description: '',
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


      api.post('customers/categories/store', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.title = '';
          this.description = '';
          this.$q.loading.hide();
        });
    }
  }
}
</script>

<style scoped>

</style>
