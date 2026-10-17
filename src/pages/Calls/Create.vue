<template>
  <q-page class="q-pa-md">

    <q-card flat class="border-radius-card">
      <q-card-section>

        <div class="text-h6">ایجاد سابقه مکالمه جدید</div>
        <div class="text-subtitle2">{{ customer.fullName }}</div>

      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-select
                outlined
                v-model="clueCall"
                use-input
                label="نوع تماس"
                :options="clueOption">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


              <q-input mask="####/##/##" outlined dir="ltr" v-model="date" label="تاریخ تماس">
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


              <q-input outlined dir="ltr" v-model="time" mask="time" label="ساعت تماس">
                <template v-slot:prepend>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="time">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="انتخاب" color="primary" flat/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-select
                outlined
                map-options
                emit-value
                v-model="leadStatus"
                label="وضعیت"
                :options="leadStatusOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

            </div>

            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="subject" label="خلاصه تماس"/>

              <q-input mask="####/##/##" outlined dir="ltr" v-model="reFollowDate" label="تاریخ پیگیری مجدد">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="reFollowDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-input outlined dir="ltr" v-model="reFollowTime" mask="time" label="ساعت پیگیری مجدد">
                <template v-slot:prepend>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-time v-model="reFollowTime">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-select
                outlined
                v-model="reFollowSubject"
                label="موضوع پیگیری مجدد"
                :options="callReFollowDateSubjectOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


              <q-select
                v-if="customerType === 2"
                option-label="name"
                option-value="name"
                outlined
                v-model="newCallContacted"
                use-input
                label="تماس گرفته شده با"
                :options="dataPersons"
                behavior="dialog">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <div class="col-md-11 col-xs-12" v-if="leadStatus === 2">

                <q-select
                  outlined
                  v-model="rejectReason"
                  label="علت عدم تمایل"
                  :options="rejectOptions">

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        یافت نشد
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

              </div>

              <div class="col-12" v-if="leadStatus !== 2">
                <q-input
                  label="توضیحات بیشتر"
                  v-model="description"
                  outlined
                  autogrow
                />
              </div>
            </div>
            <div class="col-12" v-if="leadStatus === 2">
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
import {VMoney} from "v-money";

export default {
  name: "CallCreate",
  directives: {money: VMoney},

  data() {
    return {
      checkboxValue: false,
      subject: '',
      clueCall: '',
      description: '',
      date: '',
      time: '',
      reFollowDate: '',
      reFollowTime: '',
      reFollowSubject: null,
      leadStatus: null,
      rejectReason: '',
      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },
      callReFollowDateSubjectOptions: [
        'اطلاعاتی که فرستادم بررسی شد؟',
        'هماهنگی جهت ملاقات حضوری',
        'هماهنگی جهت ملاقات مجازی',
        'پیگیری وضعیت روند کاری',
        'استعلام انجام شد؟',
        'پیش فاکتور بررسی شد؟'
      ],

      leadStatusOptions: [
        {label: 'تمایل به خرید', value: 0},
        {label: 'نیاز به پیگیری', value: 1},
        {label: 'عدم تمایل به خرید', value: 2},
        {label: 'عدم پاسخگویی', value: 3},
        {label: 'تماس گرفته نشد', value: 4},
      ],

      rejectOptions: [
        'عدم موجودی',
        'شرایط پرداخت',
        'قیمت بالا',
        'نوع پرداخت',
        'درخواست خدمات متفاوت',
        'عدم نیاز مشتری',
        'عدم ارتباط',
        'پیگیری نامناسب',
        'دلایل دیگر',
      ],

      clueOption: ['تماس ورودی', 'تماس خروجی',],

      customer: {},
      customerType: null,
      newCallContacted: null,
      dataPersons: [],
      deleteConfirmDialog: false,

    }
  },
  methods: {
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.id = this.customer.id
      payload.subject = this.subject
      payload.date = this.date
      payload.time = this.time
      payload.contacted = this.newCallContacted
      payload.reFollowDate = this.reFollowDate
      payload.reFollowTime = this.reFollowTime
      payload.reFollowSubject = this.reFollowSubject
      payload.lead_status = this.leadStatus
      payload.reject_reason = this.rejectReason
      payload.type_call = this.clueCall
      payload.description = this.description

      api.post('calls/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })


          this.subject = ''
          this.date = ''
          this.time = ''
          this.newCallContacted = null
          this.reFollowDate = ''
          this.reFollowTime = ''
          this.reFollowSubject = null
          this.leadStatus = null
          this.rejectReason = ''
          this.clueCall = ''
          this.description = ''
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },

    getData() {
      api.get('calls/list/' + this.$route.params.id)
        .then(response => {
          this.customer = response.data.data.customer;
          this.customerType = response.data.data.customer.type;

          if (this.customerType === 2)
            this.dataPersons = response.data.data.customer.persons

          if (response.data.data.customer.lead_status !== null) {
            this.leadStatus = parseInt(response.data.data.customer.lead_status)
          }
          this.rejectReason = this.customer.reject_reason
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
