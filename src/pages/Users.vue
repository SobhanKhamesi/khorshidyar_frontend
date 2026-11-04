<template>
  <q-page class="q-pa-lg">
    <div class="row justify-around q-gutter-md">
      <div class="col-md-5 col-xs-12">
        <q-card bordered>
          <q-card-section>
            <div class="text-h6">لیست کاربران</div>
          </q-card-section>

          <q-list bordered>
            <div v-for="(user , index) in usersList" :key="index">
              <q-item class="q-my-sm" clickable v-ripple>
                <q-item-section avatar>
                  <q-avatar size="xl" color="primary" text-color="white">
                    <span style="font-size: 12px;font-weight: 500" v-if="user.role === 0">ادمین</span>
                    <span class="text-center" style="font-size: 12px;font-weight: 500" v-else-if="user.role === 1">کارشناس فنی</span>
                    <span style="font-size: 12px;font-weight: 500" v-else-if="user.role === 2">نصاب</span>
                    <span style="font-size: 12px;font-weight: 500" v-else-if="user.role === 3">کارشناس فروش</span>
                    <span style="font-size: 12px;font-weight: 500" v-else-if="user.role === 4">مدیر فروش</span>
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ user.name }}</q-item-label>
                  <q-item-label caption lines="1">{{ user.username }}</q-item-label>
                </q-item-section>

                <q-item-section side>

                  <div v-if="user.status === 0">
                    <q-badge color="green-7" label="فعال"/>
                    <q-btn flat icon="edit" color="yellow-7" title="ویرایش" @click="openEditUserDlg(user)"/>
                    <q-btn flat icon="block" color="red-7" title="مسدود کردن" @click="changeUserStatus(user.id)"/>
                  </div>
                  <div v-else-if="user.status === 1">
                    <q-badge color="red-7" label="غیر فعال"/>
                    <q-btn flat icon="edit" color="yellow-7" title="ویرایش" @click="openEditUserDlg(user)"/>
                    <q-btn flat icon="task_alt" color="green-7" title="فعال کردن" @click="changeUserStatus(user.id)"/>
                  </div>
                </q-item-section>
              </q-item>
              <q-separator />

            </div>
          </q-list>
        </q-card>

      </div>
      <div class="col-md-5 col-xs-12">
        <q-card bordered>
          <q-card-section>
            <div class="text-h6">افزودن کاربر</div>
          </q-card-section>

          <q-separator inset/>

          <q-form @submit.prevent="submitNewUser()">

            <q-card-section class="q-gutter-md">

              <q-select :options="roleOptions" outlined label="سمت" map-options emit-value v-model="newUserRole"/>

              <q-input outlined v-model="newUserName"
                       label="نام"/>

              <q-input outlined dir="ltr" v-model="newUserMobile"
                       label="شماره همراه (برای پیامک ارجاع)"/>

              <q-input outlined dir="ltr" v-model="newUserUsername"
                       label="نام کاربری"/>

              <q-input outlined dir="ltr" v-model="newUserPassword" :type="isNewPw ? 'password' : 'text'"
                       label="گذرواژه کاربر">
                <template v-slot:append>
                  <q-icon
                    :name="isNewPw ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isNewPw = !isNewPw"
                  />
                </template>
              </q-input>

              <q-input outlined dir="ltr" v-model="newUserRePassword" :type="isReNewPw ? 'password' : 'text'"
                       label="تکرار گذرواژه کاربر">
                <template v-slot:append>
                  <q-icon
                    :name="isReNewPw ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isReNewPw = !isReNewPw"
                  />
                </template>
              </q-input>
            </q-card-section>

            <q-card-actions>
              <q-btn type="submit" class="full-width" color="primary" label="ثبت"/>
            </q-card-actions>
          </q-form>
        </q-card>
      </div>


    </div>

  </q-page>

  <q-dialog v-model="editUserDlg">
    <q-card bordered :class="{'min-width-dlg' : $q.screen.gt.sm}">
      <q-card-section>
        <div class="text-h6">ویرایش کاربر</div>
      </q-card-section>

      <q-separator inset/>

      <q-form @submit.prevent="submitEditUser()">

        <q-card-section class="q-gutter-md">

          <q-select :options="roleOptions" outlined label="سمت" map-options emit-value v-model="editUserRole"/>

          <q-input outlined v-model="editUserName"
                   label="نام"/>

          <q-input outlined dir="ltr" v-model="editUserMobile"
                   label="شماره همراه (برای پیامک ارجاع)"/>

          <q-input outlined dir="ltr" v-model="editUserUsername"
                   label="نام کاربری"/>

          <q-input outlined dir="ltr" v-model="editUserPassword" :type="isNewPw ? 'password' : 'text'"
                   label="گذرواژه کاربر" hint="برای تغییر رمز این فیلد را پر کنید در غیر این صورت آن را خالی بگذارید">
            <template v-slot:append>
              <q-icon
                :name="isNewPw ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isNewPw = !isNewPw"
              />
            </template>
          </q-input>

          <q-input outlined dir="ltr" v-model="editUserRePassword" :type="isReNewPw ? 'password' : 'text'"
                   label="تکرار گذرواژه کاربر"
                   hint="برای تغییر رمز این فیلد را پر کنید در غیر این صورت آن را خالی بگذارید">
            <template v-slot:append>
              <q-icon
                :name="isReNewPw ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isReNewPw = !isReNewPw"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions>
          <q-btn type="submit" class="full-width" color="primary" label="ثبت"/>
        </q-card-actions>
      </q-form>
    </q-card>

  </q-dialog>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

export default {
  name: "Users",
  data() {
    return {
      userRole: this.$q.localStorage.getItem('role'),
      usersList: [],

      editUserDlg: false,
      focusItem: null,
      newUserPassword: '',
      newUserRePassword: '',
      newUserUsername: '',
      newUserMobile: '',
      newUserName: '',
      newUserRole: null,

      editUserPassword: '',
      editUserRePassword: '',
      editUserUsername: '',
      editUserMobile: '',
      editUserName: '',
      editUserUuid: '',
      editUserRole: null,

      roleOptions: [
        {label: 'ادمین', value: 0},
        {label: 'کارشناس فنی', value: 1},
        {label: 'نصاب', value: 2},
        {label: 'کارشناس فروش', value: 3},
        {label: 'مدیر فروش', value: 4},
      ],
      isCurrentPw: true,
      isNewPw: true,
      isReNewPw: true,
    }
  },
  methods: {
    getData() {
      api.get('users-info')
        .then(response => {
          this.usersList = response.data.data
        })
        .finally(() => {
          this.$q.loading.hide();
        })
    },

    submitNewUser() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        name: this.newUserName,
        username: this.newUserUsername,
        mobile: this.newUserMobile,
        password: this.newUserPassword,
        rePassword: this.newUserRePassword,
        role: this.newUserRole,
      }
      api.post('user/store', payload)
        .then(response => {
          this.$q.notify({
            timeout: 1500,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

        })
        .then(() => {
          this.newUserName = '';
          this.newUserUsername = '';
          this.newUserMobile = '';
          this.newUserPassword = '';
          this.newUserRePassword = '';
          this.newUserRole = null;
        })
        .finally(() => {
          this.$q.loading.hide();
          this.getData()
        })
    },
    submitEditUser() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        id: this.editUserUuid,
        name: this.editUserName,
        username: this.editUserUsername,
        mobile: this.editUserMobile,
        password: this.editUserPassword,
        rePassword: this.editUserRePassword,
        role: this.editUserRole,
      }
      api.post('user/edit', payload)
        .then(response => {
          this.$q.notify({
            timeout: 1500,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

        })
        .then(() => {
          this.editUserName = '';
          this.editUserUsername = '';
          this.editUserPassword = '';
          this.editUserRePassword = '';
          this.editUserRole = null;
          this.editUserDlg = false;
        })
        .finally(() => {
          this.$q.loading.hide();
          this.getData()
        })
    },
    openEditUserDlg(user) {
      this.editUserDlg = true
      this.editUserUsername = user.username
      this.editUserMobile = user.mobile || ''
      this.editUserName = user.name
      this.editUserRole = user.role
      this.editUserUuid = user.id
    },
    changeUserStatus(userId) {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {}
      postData.id = userId

      api.post('user/toggle-status', postData)
        .then(response => {

          this.$q.notify({
            timeout: 1000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

        })
        .finally(() => {
          this.$q.loading.hide();
          this.getData()
        })
    }
  },
  created() {

    if (this.userRole !== 0) {
      this.$q.notify({
        timeout: 1500,
        position: 'center',
        type: 'negative',
        message: 'دسترسی ندارید !'
      })
      this.$router.push('/')
      return
    }

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    });

    this.getData();


  }
}
</script>

<style scoped>
.min-width-dlg {
  min-width: 500px;
}
</style>
