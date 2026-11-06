<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-indigo-10">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title class="date-time-text text-white">
          <span v-html="dateAndTime"></span>
          <span> - خوش آمدید </span>
          <span>{{ userName }} عزیز </span>
          <span>- </span>
          <span v-if="lastLoggedInDate !== 'null' && lastLoggedInDate !== null">آخرین ورود </span>
          <span v-if="lastLoggedInDate !== 'null' && lastLoggedInDate !== null">{{ lastLoggedInDate }}</span>
        </q-toolbar-title>

        <div class="q-gutter-x-md">
          <q-btn flat icon="bi-bell" round dense>
            <q-menu v-if="!notificationsLoading" style="font-family: IRANSans,serif"
                    :offset="[67, 0]"
            >
              <q-list>
                <q-item v-if="expiredItemsCount > 0"
                        v-for="(item,index) in expiredItems" :key="index"
                        clickable @click="checkExpiredItem(item)">
                  <q-item-section>
                    <q-item-label>{{ item.title }}</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item v-else v-close-popup
                        clickable>
                  <q-item-section>
                    <q-item-label>
                      <i style="color: #cbcbcb">آیتمی جهت نمایش وجود ندارد</i>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>

            <q-badge v-if="expiredItemsCount > 0" class="chatAlarm" rounded color="red" floating>
              {{ expiredItemsCount }}
            </q-badge>

          </q-btn>

          <q-btn round dense v-if="!$q.screen.lt.sm"
                 @click="$q.fullscreen.toggle()" flat
                size="11px" :icon="$q.fullscreen.isActive ? 'bi-fullscreen-exit' : 'bi-fullscreen'"
          />
          <q-btn v-if="!$q.screen.lt.sm" round dense :to="{ name: 'Profile' }" flat icon="eva-person-outline">
            <q-tooltip>پروفایل من</q-tooltip>
          </q-btn>
          <q-btn :to="{ name: 'Users' }" flat icon="eva-people-outline" v-if="userRole === 0"/>
          <q-btn v-if="!$q.screen.lt.sm" round dense :to="{ name: 'Settings' }" flat  icon="bi-gear"/>
          <q-btn v-if="!$q.screen.lt.sm" round dense @click.prevent="logout" color="negative" icon="bi-power"/>
        </div>


        <div v-if="$q.screen.lt.sm" class="q-ml-sm">
          <q-btn-dropdown>

            <q-list>

              <q-item clickable v-close-popup :to="{ name: 'Profile' }">
                <q-item-section avatar>
                  <q-avatar icon="eva-person-outline" color="indigo-10" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>پروفایل من</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup :to="{ name: 'Users' }" v-if="userRole === 0">
                <q-item-section avatar>
                  <q-avatar icon="eva-people-outline" color="teal" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>کاربران</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup :to="{ name: 'Settings' }">
                <q-item-section avatar>
                  <q-avatar icon="eva-settings-2-outline" color="teal" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>تنظیمات</q-item-label>
                </q-item-section>
              </q-item>

              <q-item clickable v-close-popup @click.prevent="logout">
                <q-item-section avatar>
                  <q-avatar icon="eva-power-outline" color="negative" text-color="white"/>
                </q-item-section>
                <q-item-section>
                  <q-item-label>خروج</q-item-label>
                </q-item-section>
              </q-item>


            </q-list>
          </q-btn-dropdown>
        </div>


      </q-toolbar>
    </q-header>


    <q-drawer
      class="side-bar-nav"
      v-model="leftDrawerOpen"
      show-if-above
      content-class="date-time-text"
    >
      <Navbar/>
    </q-drawer>
    <q-page-container style="background: #ECF0F5">
      <router-view/>
    </q-page-container>
  </q-layout>
</template>

<script>
import {api} from 'boot/axios'
import {LocalStorage, QSpinnerPuff} from "quasar";
import Navbar from "components/Navbar.vue";

export default {
  name: 'MainLayout',
  components: {Navbar},

  data() {
    return {
      userRole: this.$q.localStorage.getItem('role'),
      lastLoggedInDate: this.$q.localStorage.getItem('lastLoggedInDate'),
      userName: LocalStorage.getItem('name'),
      notificationsLoading: true,
      leftDrawerOpen: false,
      expiredItemsCount: 0,
      expiredItems: [],
      dateAndTime: ''
    }
  },
  methods: {
    getExpiredItems() {
      api.get('expired-items')
        .then(response => {
          this.expiredItemsCount = response.data.data.length
          this.expiredItems = response.data.data
          this.notificationsLoading = false
        })
        .catch(() => {
          this.notificationsLoading = false
        });
    },
    logout() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      this.$q.localStorage.clear()

      api.get('user/logout')
        .then(() => {
          this.$q.notify({
            position: 'center',
            timeout: 500,
            type: 'positive',
            message: 'خروج از حساب کاربری با موفقیت انجام شد'
          })
        })
        .then(() => {
          this.$q.loading.hide();
        })
        .finally(() => {
          setTimeout(() =>
              location.reload()
            , 500);
        })
    },
    checkExpiredItem(item) {
      if (item.type === 0) {
        this.$router.push({name: 'CheckEdit', params: {id: item.id}})
      } else {
        this.$router.push({name: 'ReminderEdit', params: {id: item.id}})
      }
    },
    currentTime() {
      const time = new Date();
      const date = new Date().toLocaleDateString('fa-IR');
      let hours = time.getHours();
      let configHours = (hours < 10) ? "0" + hours : hours;
      let minutes = time.getMinutes();
      let configMinutes = (minutes < 10) ? "0" + minutes : minutes;
      let seconds = time.getSeconds();
      let configSeconds = (seconds < 10) ? "0" + seconds : seconds
      this.dateAndTime = 'امروز ' + date + ' ساعت ' + configHours + ":" + configMinutes + ":" + configSeconds;
      setTimeout(this.currentTime, 1000);
    }
  },
  created() {
    this.currentTime();
    this.getExpiredItems();
  },
}
</script>
<style>
@media screen and (max-width: 768px) {
  .date-time-text {
    font-size: 12px;
  }
}

@media screen and (min-width: 768px) {
  .date-time-text {
    font-size: 14px;
  }
}
</style>
