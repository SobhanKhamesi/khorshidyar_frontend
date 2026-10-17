<template>
  <div class="container-fluid">
    <div class="row d-flex vh-100">
      <div class="col-md-4 col-xs-12 q-pa-lg">
        <q-form @submit.prevent="login()">
          <div class="text-center q-gutter-y-md">
            <img width="100" src="../assets/img/boomrang-logo.png"/>

            <h4 class="text-bold text-accent q-pa-none q-ma-none font-gohar">خوش آمدید</h4>


            <div class="q-gutter-x-xs" style="font-size: 18px;">
              <span style="display: inline-block">نرم افزار ارتباط با مشتری</span>
              <span style="display: inline-block">بومرنگ</span>
            </div>


            <div class="q-py-sm"></div>


            <div class="q-mb-none" style="font-size: 16px;font-weight: 500;">ورود به حساب کاربری</div>
            <div class="q-py-sm">
              <q-separator/>
            </div>
            <q-input
              dir="ltr" outlined v-model="username" label="نام کاربری">

              <template v-slot:prepend>
                <q-icon name="person"/>
              </template>

            </q-input>

            <q-input
              dir="ltr"
              type="password"
              outlined
              v-model="password"
              label="گذرواژه"
            >
              <template v-slot:prepend>
                <q-icon name="lock"/>
              </template>

            </q-input>

            <div class="text-left">
              <q-checkbox size="sm" v-model="remember" label="من را به خاطر بسپار"/>
            </div>

            <q-btn :loading="logging"
                   size="lg"
                   rounded
                   class="full-width"
                   label="ورود"
                   type="submit"
                   color="accent"
            />

          </div>
        </q-form>
      </div>
      <div class="col-md-8 col-xs-12 crm-bg"></div>
    </div>
  </div>
</template>

<script>
import {api} from "boot/axios";

export default {
  data() {
    return {
      logging: false,
      remember: false,
      username: '',
      password: '',
    }
  },
  methods: {
    login() {
      this.logging = true;

      let payload = {}
      payload.username = this.username
      payload.password = this.password

      api.post('/user/login', payload)
        .then(response => {

          this.$q.notify({
            position: 'center',
            timeout: 500,
            type: 'positive',
            message: 'ورود با موفقیت انجام شد'
          })


          this.$q.localStorage.set('auth', true)
          this.$q.localStorage.set('token', response.data.data.token)
          this.$q.localStorage.set('role', response.data.data.role)
          this.$q.localStorage.set('name', response.data.data.name)
          this.$q.localStorage.set('username', response.data.data.username)
          this.$q.localStorage.set('id', response.data.data.id)
          this.$q.localStorage.set('lastLoggedInDate', response.data.data.lastLoggedInDate)

          setTimeout(() =>
              location.reload()
            , 500);

          this.logging = false
        })
        .catch(() => {
          this.logging = false
        });
    }
  }
}
</script>

<style>
.crm-bg {
  background: url('../assets/img/bg.jpg') center / cover no-repeat;
}
</style>
