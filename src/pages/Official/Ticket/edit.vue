<template>
  <q-page class="q-pa-lg">
    <q-card bordered>
      <q-card-section>
        <div class="text-h6">ویرایش تیکت</div>
      </q-card-section>

      <q-separator inset/>

      <q-form @submit.prevent="editForm()">
        <q-card-section>


          <div class="row justify-around q-gutter-md">
            <div class="col-md-12 col-xs-12 q-gutter-y-md q-ma-none">

              <q-select
                option-label="name"
                option-value="id"
                outlined
                v-model="userId"
                input-debounce="0"
                use-input
                label="مسئول انجام فعالیت"
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
                option-label="fullName"
                option-value="id"
                outlined
                v-model="customer_id"
                input-debounce="0"
                use-input
                label="فعالیت مربوط به"
                :options="customersOptions"
                @filter="filterCustomers"
                behavior="dialog">

                <template v-slot:after>
                  <q-btn @click.prevent="newCustomerDlg = true" icon="person_add" dense flat/>
                </template>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input outlined v-model="time" label="مدت زمان انجام فعالیت"/>

              <q-input outlined v-model="title" label="عنوان فعالیت"/>

              <div>
                <q-checkbox v-model="descriptionTicket" label="آیا این فعالیت نیاز به توضیحات بیشتری دارد؟"/>
              </div>

              <q-input v-if="descriptionTicket === 1" outlined v-model="description" label="توضیحات"/>


            </div>

          </div>

        </q-card-section>

        <q-card-actions>
          <q-btn type="submit" class="full-width" color="primary" label="ویرایش"/>
        </q-card-actions>
      </q-form>

    </q-card>
    <q-dialog v-model="newCustomerDlg">
      <q-card style="width: 400px; max-width: 80vw;">
        <q-form @submit.prevent="submitNewCustomer()">
          <q-card-section>
            <div class="text-h6 q-mb-lg">مشتری جدید</div>

            <div class="q-gutter-md">

              <div>
                <q-radio v-model="newCustomerGender" :val="0" label="آقا"/>
                <q-radio v-model="newCustomerGender" :val="1" label="خانم"/>
              </div>

              <q-input outlined v-model="newCustomerName" label="نام و نام خانوادگی"/>

              <q-input outlined
                       dir="ltr"
                       v-model="newCustomerContactNumber"
                       label="شماره تلفن همراه"/>

            </div>

          </q-card-section>

          <q-card-actions align="center" class="text-primary">
            <q-btn color="warning" label="انصراف" v-close-popup/>
            <q-btn color="positive" label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'
import {VMoney} from 'v-money'
import {ref} from "vue";

export default {
  name: "TicketEdit",
  directives: {money: VMoney},
  data() {
    return {
      descriptionTicket: false,
      description: '',
      customer_id: '',
      users: [],
      usersOptions: [],
      customersOptions: [],
      newCustomerDlg: false,
      time: '',
      title: '',
      newCustomerGender: 0,
      newCustomerName: '',
      newCustomerContactNumber: '',
      userId: '',

    }
  },
  methods: {
    getCustomersAndClues() {
      api.get('customers/all')
        .then(response => {
          this.customersAndCluesOptions = response.data.data
          this.customersAndClues = response.data.data

          const customers = response.data.data.filter(item => parseInt(item.status) === 3)

          this.customersOptions = customers
          this.customers = customers

        })
    },
    getUsers() {
      api.get('users')
        .then(response => {
          this.users = response.data.data
          this.usersOptions = response.data.data
        })
        .finally(() => {
          this.$q.loading.hide();
        })
    },
    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          if (this.invoiceType === 0) {
            this.customersAndCluesOptions = this.customersAndClues
          } else {
            this.customersOptions = this.customers
          }
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()

        if (this.invoiceType === 0) {
          this.customersAndCluesOptions = this.customersAndClues.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
          )
        } else {
          this.customersOptions = this.customers.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
          )
        }
      })
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
    editForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      let postData = {};
      postData.id = this.$route.params.id
      if (this.user !== null)
        postData.userId = this.userId.id
      postData.customer = this.customer_id.id
        postData.time = this.time
      postData.title = this.title,
        postData.description = this.description,
        postData.descriptionTicket = this.descriptionTicket,


        api.post('ticket/update', postData)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

          })
          .then(() => {
            this.userId = null
            this.customer_id = ''
            this.time = ''
            this.title = ''
            this.description = ''
            this.descriptionTicket = false


          })
          .finally(() => {
            this.$q.loading.hide();
          });


    },
    submitNewCustomer() {


      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {}
      postData.contact_number = this.newCustomerContactNumber
      postData.name = this.newCustomerName
      postData.gender = this.newCustomerGender


      api.post('customers/quick-add', postData)
        .then(response => {


          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.invoiceCustomer = response.data.data

        })
        .then(() => {
          this.getCustomersAndClues();
        })
        .then(() => {
          this.newCustomerContactNumber = ''
          this.newCustomerName = ''
          this.newCustomerGender = 0
          this.newCustomerDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });

    },
    getData() {

      api.post('ticket/show/' + this.$route.params.id)
        .then(response => {
          this.userId = response.data.data.user
          this.customer_id = response.data.data.customer
          this.time = response.data.data.time
          this.title = response.data.data.title
          this.description = response.data.data.description
          this.descriptionTicket = Number(response.data.data.descriptionTicket)


          this.$q.loading.hide();

        })
        .finally(() => {
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

    this.getUsers();
    this.getData();
    this.getCustomersAndClues();
  }
}
</script>

<style scoped>

</style>
