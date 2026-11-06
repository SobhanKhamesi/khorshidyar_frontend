<template>
  <q-page :class="$q.screen.lt.sm ? 'q-pa-sm' : 'q-pa-md'">
    <div v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em"/>
    </div>

    <template v-else-if="user">
      <!-- سربرگ پروفایل -->
      <q-card flat class="border-radius-card q-mb-md">
        <q-card-section class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar :size="$q.screen.lt.sm ? '64px' : '84px'" color="indigo-10" text-color="white">
              <img v-if="user.profile" :src="fileUrl('profile', user.profile)" alt="">
              <span v-else>{{ initials }}</span>
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h6 text-weight-bold">{{ user.name }}</div>
            <div class="row items-center q-gutter-xs q-mt-xs">
              <q-badge color="indigo-6" :label="user.role_label || 'بدون سمت'"/>
              <q-badge v-if="user.status === 1" color="negative" label="غیرفعال"/>
              <span class="text-caption text-grey-7" dir="ltr">@{{ user.username }}</span>
            </div>
          </div>
          <div class="col-xs-12 col-sm-auto" v-if="!user.is_self">
            <q-btn outline rounded color="accent" icon="arrow_forward" label="بازگشت به کاربران"
                   :to="{name: 'Users'}" :class="$q.screen.lt.sm ? 'full-width' : ''"/>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat class="border-radius-card">
        <q-tabs v-model="tab" dense outside-arrows mobile-arrows class="text-blue-grey-10" active-color="primary"
                indicator-color="primary" align="justify" narrow-indicator>
          <q-tab name="info" icon="badge" :label="$q.screen.lt.sm ? 'اطلاعات' : 'اطلاعات شخصی'"/>
          <q-tab name="earnings" icon="payments" :label="$q.screen.lt.sm ? 'دریافتی‌ها' : 'دریافتی پروژه‌ها'"/>
          <q-tab v-if="user.is_self" name="account" icon="manage_accounts"
                 :label="$q.screen.lt.sm ? 'حساب' : 'تنظیمات حساب'"/>
        </q-tabs>
        <q-separator/>

        <q-tab-panels v-model="tab" animated>
          <!-- اطلاعات شخصی -->
          <q-tab-panel name="info" :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <q-form @submit.prevent="saveInfo()">
              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12">
                  <q-input outlined v-model="info.name" label="نام و نام خانوادگی *"/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dir="ltr" v-model="info.national_code" label="کد ملی" mask="##########"
                           inputmode="numeric" input-class="text-right"/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined readonly :model-value="user.role_label || '-'" label="سمت"
                           hint="سمت توسط مدیر از صفحه کاربران تعیین می‌شود"/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dir="ltr" v-model="info.phone" label="شماره ثابت" inputmode="tel"
                           input-class="text-right" hint="همراه با پیش‌شماره، مثال: 02112345678"/>
                </div>

                <div class="col-12">
                  <div class="row items-center q-mb-sm">
                    <div class="text-subtitle2 col">شماره‌های همراه</div>
                    <q-btn flat dense rounded color="primary" icon="add" label="افزودن شماره"
                           @click="info.mobiles.push('')" :disable="info.mobiles.length >= 10"/>
                  </div>
                  <div class="row q-col-gutter-sm">
                    <div v-for="(mobile, index) in info.mobiles" :key="index" class="col-md-4 col-sm-6 col-xs-12">
                      <q-input outlined dense dir="ltr" v-model="info.mobiles[index]" mask="###########"
                               inputmode="tel" input-class="text-right"
                               :label="index === 0 ? 'شماره همراه اصلی' : 'شماره همراه ' + (index + 1)">
                        <template v-slot:append>
                          <q-btn flat round dense icon="close" color="negative" size="sm"
                                 @click="info.mobiles.splice(index, 1)">
                            <q-tooltip>حذف شماره</q-tooltip>
                          </q-btn>
                        </template>
                      </q-input>
                    </div>
                  </div>
                  <div class="text-caption text-grey-7 q-mt-xs" v-if="info.mobiles.length">
                    شماره اول برای پیامک‌های سامانه (مثلاً اعلام شماره نصاب به مشتری) استفاده می‌شود.
                  </div>
                  <div class="text-caption text-grey q-mt-xs" v-else>شماره همراهی ثبت نشده است</div>
                </div>

                <div class="col-12">
                  <q-input outlined autogrow v-model="info.address" label="آدرس منزل"/>
                </div>
              </div>
              <div class="q-mt-md">
                <q-btn type="submit" rounded color="accent" label="ذخیره اطلاعات" :loading="savingInfo"
                       :class="$q.screen.lt.sm ? 'full-width' : 'q-px-xl'"/>
              </div>
            </q-form>
          </q-tab-panel>

          <!-- دریافتی پروژه‌ها -->
          <q-tab-panel name="earnings" :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row items-center q-col-gutter-sm q-mb-md">
              <div class="col-md-3 col-sm-4 col-xs-6">
                <q-select outlined dense v-model="earningsYear" :options="earnings.years" label="سال"
                          @update:model-value="getEarnings()"/>
              </div>
              <div class="col"></div>
              <div class="col-xs-6 col-sm-auto" v-if="user.can_manage_earnings">
                <q-btn color="positive" rounded icon="add" label="ثبت دریافتی" class="full-width"
                       @click="openEarningDialog()"/>
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mb-md">
              <div class="col-sm-4 col-xs-12">
                <q-card flat bordered class="summary-card">
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">جمع دریافتی سال {{ earnings.year }}</div>
                    <div class="text-subtitle1 text-weight-bold">{{ moneyFormat(earnings.summary.total) }} تومان</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-sm-4 col-xs-6">
                <q-card flat bordered class="summary-card summary-settled">
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">تسویه شده</div>
                    <div class="text-subtitle1 text-weight-bold text-positive">
                      {{ moneyFormat(earnings.summary.settled) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-sm-4 col-xs-6">
                <q-card flat bordered class="summary-card summary-unsettled">
                  <q-card-section class="q-pa-sm">
                    <div class="text-caption text-grey-7">تسویه نشده</div>
                    <div class="text-subtitle1 text-weight-bold text-negative">
                      {{ moneyFormat(earnings.summary.unsettled) }}
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <div v-if="earningsLoading" class="text-center q-pa-lg">
              <q-spinner color="primary" size="2em"/>
            </div>
            <div v-else-if="!earnings.months.length" class="text-center text-grey q-pa-lg">
              در سال {{ earnings.year }} دریافتی ثبت نشده است
            </div>
            <q-list v-else bordered separator class="rounded-borders">
              <q-expansion-item v-for="month in earnings.months" :key="month.month" default-opened
                                header-class="bg-grey-2">
                <template v-slot:header>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ month.month_name }} {{ earnings.year }}</q-item-label>
                    <q-item-label caption>
                      {{ month.items.length }} پروژه - جمع {{ moneyFormat(month.total) }} تومان
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge v-if="month.unsettled > 0" color="negative" class="q-pa-xs">
                      تسویه نشده: {{ moneyFormat(month.unsettled) }}
                    </q-badge>
                    <q-badge v-else color="positive" class="q-pa-xs" label="تسویه کامل"/>
                  </q-item-section>
                </template>

                <q-list separator>
                  <q-item v-for="item in month.items" :key="item.id" class="q-py-sm">
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ item.project_title }}
                        <q-badge v-if="item.work_label" outline color="primary" class="q-ml-xs" :label="item.work_label"/>
                      </q-item-label>
                      <q-item-label caption>
                        تاریخ: {{ item.jalali_date }}
                        <span v-if="item.is_settled && item.jalali_settled_at"> - تسویه: {{ item.jalali_settled_at }}</span>
                      </q-item-label>
                      <q-item-label caption v-if="item.description">{{ item.description }}</q-item-label>
                      <q-item-label v-if="$q.screen.lt.sm" class="q-mt-xs">
                        <span class="text-weight-bold">{{ moneyFormat(item.amount) }} تومان</span>
                        <q-badge :color="item.is_settled ? 'positive' : 'orange'" class="q-ml-sm"
                                 :label="item.is_settled ? 'تسویه شده' : 'تسویه نشده'"/>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side v-if="!$q.screen.lt.sm">
                      <div class="text-weight-bold text-dark">{{ moneyFormat(item.amount) }} تومان</div>
                      <q-badge :color="item.is_settled ? 'positive' : 'orange'"
                               :label="item.is_settled ? 'تسویه شده' : 'تسویه نشده'"/>
                    </q-item-section>
                    <q-item-section side v-if="user.can_manage_earnings">
                      <div class="row no-wrap">
                        <q-btn flat round dense size="sm" :color="item.is_settled ? 'grey' : 'positive'"
                               :icon="item.is_settled ? 'undo' : 'task_alt'" @click="toggleSettled(item)">
                          <q-tooltip>{{ item.is_settled ? 'برگرداندن به تسویه نشده' : 'تسویه شد' }}</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="sm" color="yellow-9" icon="edit"
                               @click="openEarningDialog(item)">
                          <q-tooltip>ویرایش</q-tooltip>
                        </q-btn>
                        <q-btn flat round dense size="sm" color="negative" icon="delete"
                               @click="deleteEarning(item)">
                          <q-tooltip>حذف</q-tooltip>
                        </q-btn>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
            </q-list>
          </q-tab-panel>

          <!-- تنظیمات حساب (منتقل شده از صفحه تنظیمات) -->
          <q-tab-panel v-if="user.is_self" name="account" :class="$q.screen.lt.sm ? 'q-pa-sm' : ''">
            <div class="row q-col-gutter-lg">
              <div class="col-md-6 col-xs-12">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">اطلاعات ورود و تصاویر</div>
                <q-form @submit.prevent="changeAccountInfo()" class="q-gutter-y-md">
                  <q-input outlined v-model="account.username" label="نام کاربری" dir="ltr" input-class="text-right"/>
                  <q-file accept=".jpg, .png, .jpeg" clearable outlined v-model="account.profile" label="تصویر پروفایل">
                    <template v-slot:prepend>
                      <q-icon name="account_circle"/>
                    </template>
                  </q-file>
                  <q-file accept=".jpg, .png, .jpeg" clearable outlined v-model="account.emza" label="تصویر امضاء">
                    <template v-slot:prepend>
                      <q-icon name="attach_file"/>
                    </template>
                  </q-file>
                  <div v-if="user.emza" class="text-caption text-grey-7">
                    امضای فعلی:
                    <img :src="fileUrl('emza', user.emza)" alt="" class="emza-preview">
                  </div>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ویرایش"
                         :loading="savingAccount"/>
                </q-form>
              </div>
              <div class="col-md-6 col-xs-12">
                <div class="text-subtitle1 text-weight-bold q-mb-sm">تغییر گذرواژه</div>
                <q-form @submit.prevent="changePassword()" class="q-gutter-y-md">
                  <q-input v-for="field in passwordFields" :key="field.key" outlined dir="ltr"
                           v-model="password[field.key]" :type="password.visible[field.key] ? 'text' : 'password'"
                           :label="field.label">
                    <template v-slot:append>
                      <q-icon :name="password.visible[field.key] ? 'visibility' : 'visibility_off'"
                              class="cursor-pointer"
                              @click="password.visible[field.key] = !password.visible[field.key]"/>
                    </template>
                  </q-input>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="تغییر گذرواژه"
                         :loading="savingPassword"/>
                </q-form>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </template>

    <q-dialog v-model="deleteDlg">
      <q-card style="max-width: 420px">
        <q-card-section v-if="deletingItem">
          دریافتی {{ moneyFormat(deletingItem.amount) }} تومانی پروژه «{{ deletingItem.project_title }}» حذف شود؟
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn rounded color="negative" label="حذف" :loading="deleting" @click="confirmDeleteEarning()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ثبت / ویرایش دریافتی -->
    <q-dialog v-model="earningDlg" :maximized="$q.screen.lt.sm">
      <q-card style="width: 560px; max-width: 100vw;">
        <q-form @submit.prevent="saveEarning()">
          <q-card-section class="row items-center">
            <div class="text-h6 col">{{ earningForm.id ? 'ویرایش دریافتی پروژه' : 'ثبت دریافتی پروژه' }}</div>
            <q-btn flat round dense icon="close" v-close-popup/>
          </q-card-section>
          <q-separator/>
          <q-card-section class="q-gutter-y-md">
            <q-select outlined v-model="earningForm.installation_service_id" :options="projectOptions"
                      option-value="id" option-label="title" emit-value map-options use-input input-debounce="0"
                      @filter="filterProjects" label="پروژه (سرویس نصب) *" :loading="projectsLoading">
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    سرویس نصبی که این کاربر در آن نصاب یا کارشناس فنی بوده یافت نشد
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-input outlined dir="ltr" :model-value="earningAmountText" @update:model-value="onAmountInput"
                     inputmode="numeric" input-class="text-right" label="مبلغ دریافتی (تومان) *"/>
            <q-input mask="####/##/##" outlined dir="ltr" v-model="earningForm.date" label="تاریخ *"
                     hint="سال و ماه دریافتی بر اساس این تاریخ مشخص می‌شود">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date today-btn calendar="persian" v-model="earningForm.date" mask="YYYY/MM/DD">
                      <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-toggle v-model="earningForm.is_settled" color="positive" label="تسویه شده"/>
            <q-input v-if="earningForm.is_settled" mask="####/##/##" outlined dir="ltr"
                     v-model="earningForm.settled_at" label="تاریخ تسویه" hint="خالی = امروز">
              <template v-slot:prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy transition-show="scale" transition-hide="scale">
                    <q-date today-btn calendar="persian" v-model="earningForm.settled_at" mask="YYYY/MM/DD">
                      <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input outlined autogrow v-model="earningForm.description" label="توضیحات"/>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn type="submit" rounded color="positive" label="ذخیره" :loading="savingEarning"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import {api} from 'boot/axios'

const emptyEarnings = () => ({year: null, years: [], summary: {total: 0, settled: 0, unsettled: 0, count: 0}, months: []})

export default {
  name: 'Profile',
  data() {
    return {
      loading: true,
      user: null,
      tab: 'info',
      info: {name: '', national_code: '', mobiles: [], phone: '', address: ''},
      savingInfo: false,

      earnings: emptyEarnings(),
      earningsYear: null,
      earningsLoading: false,

      earningDlg: false,
      earningForm: {},
      savingEarning: false,
      deleteDlg: false,
      deletingItem: null,
      deleting: false,
      projects: [],
      projectOptions: [],
      projectsLoading: false,

      account: {username: '', profile: null, emza: null},
      savingAccount: false,
      password: {current: '', new: '', reNew: '', visible: {current: false, new: false, reNew: false}},
      passwordFields: [
        {key: 'current', label: 'گذرواژه فعلی'},
        {key: 'new', label: 'گذرواژه جدید'},
        {key: 'reNew', label: 'تکرار گذرواژه جدید'},
      ],
      savingPassword: false,
    }
  },
  computed: {
    // شناسه کاربر در آدرس (برای مدیر)؛ بدون آن پروفایل کاربر جاری نمایش داده می‌شود
    userKey() {
      return this.$route.params.id || 'me'
    },
    initials() {
      return (this.user?.name || '?').trim().charAt(0)
    },
    earningAmountText() {
      return this.earningForm.amount ? this.moneyFormat(this.earningForm.amount) : ''
    }
  },
  watch: {
    userKey() {
      this.tab = 'info'
      this.load()
    }
  },
  methods: {
    load() {
      this.loading = true
      this.earnings = emptyEarnings()
      this.earningsYear = null
      api.get(`profile/${this.userKey}`).then(response => {
        this.setUser(response.data.data)
        this.getEarnings()
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.loading = false
      })
    },
    setUser(user) {
      this.user = user
      this.info = {
        name: user.name || '',
        national_code: user.national_code || '',
        mobiles: [...(user.mobiles || [])],
        phone: user.phone || '',
        address: user.address || '',
      }
      if (!this.info.mobiles.length) this.info.mobiles.push('')
      this.account.username = user.username
    },
    saveInfo() {
      this.savingInfo = true
      const payload = {...this.info, mobiles: this.info.mobiles.filter(m => m)}
      api.put(`profile/${this.userKey}`, payload).then(response => {
        this.notifySuccess(response.data.message)
        this.setUser(response.data.data)
        if (this.user.is_self) {
          this.$q.localStorage.set('name', this.user.name)
        }
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.savingInfo = false
      })
    },

    // ---- دریافتی‌ها ----
    getEarnings() {
      this.earningsLoading = true
      api.get(`profile/${this.userKey}/earnings`, {params: {year: this.earningsYear || undefined}}).then(response => {
        this.earnings = response.data.data
        this.earningsYear = this.earnings.year
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.earningsLoading = false
      })
    },
    loadProjects() {
      if (this.projects.length) return
      this.projectsLoading = true
      api.get(`profile/${this.userKey}/projects`).then(response => {
        this.projects = response.data.data
        this.projectOptions = this.projects
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.projectsLoading = false
      })
    },
    filterProjects(val, update) {
      update(() => {
        const needle = (val || '').toLowerCase()
        this.projectOptions = this.projects.filter(p => p.title.toLowerCase().includes(needle))
      })
    },
    openEarningDialog(item = null) {
      this.loadProjects()
      this.earningForm = item ? {
        id: item.id,
        installation_service_id: item.installation_service_id,
        amount: item.amount,
        date: item.jalali_date,
        is_settled: item.is_settled,
        settled_at: item.jalali_settled_at || '',
        description: item.description || '',
      } : {
        id: null, installation_service_id: null, amount: null, date: '', is_settled: false, settled_at: '', description: ''
      }
      // پروژه‌ی دریافتی در حال ویرایش، حتی اگر در لیست پروژه‌های کاربر نباشد، قابل نمایش باشد
      if (item && !this.projects.some(p => p.id === item.installation_service_id)) {
        this.projects.push({id: item.installation_service_id, title: item.project_title})
        this.projectOptions = this.projects
      }
      this.earningDlg = true
    },
    onAmountInput(value) {
      const persian = '۰۱۲۳۴۵۶۷۸۹'
      const digits = String(value || '').replace(/[۰-۹]/g, d => persian.indexOf(d)).replace(/\D/g, '')
      this.earningForm.amount = digits ? Number(digits) : null
    },
    earningPayload(form) {
      return {
        installation_service_id: form.installation_service_id,
        amount: form.amount,
        date: form.date,
        is_settled: form.is_settled,
        settled_at: form.is_settled ? (form.settled_at || null) : null,
        description: form.description,
      }
    },
    saveEarning() {
      this.savingEarning = true
      const payload = this.earningPayload(this.earningForm)
      const request = this.earningForm.id
        ? api.put(`profile/earnings/${this.earningForm.id}`, payload)
        : api.post(`profile/${this.userKey}/earnings`, payload)
      request.then(response => {
        this.notifySuccess(response.data.message)
        this.earningDlg = false
        this.getEarnings()
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.savingEarning = false
      })
    },
    toggleSettled(item) {
      const payload = this.earningPayload({
        ...item, date: item.jalali_date, is_settled: !item.is_settled, settled_at: null,
      })
      api.put(`profile/earnings/${item.id}`, payload).then(() => {
        this.notifySuccess(payload.is_settled ? 'دریافتی تسویه شد' : 'دریافتی به حالت تسویه نشده برگشت')
        this.getEarnings()
      }).catch(error => this.notifyError(error))
    },
    deleteEarning(item) {
      this.deletingItem = item
      this.deleteDlg = true
    },
    confirmDeleteEarning() {
      this.deleting = true
      api.delete(`profile/earnings/${this.deletingItem.id}`).then(response => {
        this.notifySuccess(response.data.message)
        this.deleteDlg = false
        this.getEarnings()
      }).catch(error => this.notifyError(error)).finally(() => {
        this.deleting = false
      })
    },

    // ---- تنظیمات حساب ----
    changeAccountInfo() {
      this.savingAccount = true
      const postData = new FormData()
      postData.append('username', this.account.username)
      postData.append('name', this.user.name)
      if (this.account.emza) postData.append('emza', this.account.emza)
      if (this.account.profile) postData.append('profile', this.account.profile)

      api.post('user/update-info', postData).then(response => {
        this.notifySuccess(response.data.message)
        if (this.account.profile) {
          this.$q.localStorage.set('profile', response.data.data)
          location.reload()
          return
        }
        this.account.emza = null
        this.load()
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.savingAccount = false
      })
    },
    changePassword() {
      this.savingPassword = true
      const postData = new FormData()
      postData.append('currentPassword', this.password.current)
      postData.append('newPassword', this.password.new)
      postData.append('reNewPassword', this.password.reNew)

      api.post('user/update-password', postData).then(response => {
        this.notifySuccess(response.data.message)
        this.password.current = ''
        this.password.new = ''
        this.password.reNew = ''
      }).catch(error => {
        this.notifyError(error)
      }).finally(() => {
        this.savingPassword = false
      })
    },

    // ---- کمکی ----
    fileUrl(folder, file) {
      const base = (api.defaults.baseURL || '').replace(/api\/?$/, '')
      return `${base}${folder}/${file}`
    },
    moneyFormat(value) {
      return Number(value || 0).toLocaleString('en-US')
    },
    notifySuccess(message) {
      this.$q.notify({timeout: 2500, position: 'center', type: 'positive', message: message || 'با موفقیت انجام شد'})
    },
    // خطاهای اعتبارسنجی، 401، 404، 422 و 500 را interceptor در boot/axios نمایش می‌دهد
    notifyError(error) {
      const response = error?.response
      if (response && (response.data?.errors || [401, 404, 422, 500].includes(response.status))) return
      const message = response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
      this.$q.notify({timeout: 4000, position: 'center', type: 'negative', message})
    },
  },
  created() {
    this.load()
  }
}
</script>

<style scoped>
.summary-card {
  border-radius: 10px;
}

.summary-settled {
  border-right: 4px solid var(--q-positive);
}

.summary-unsettled {
  border-right: 4px solid var(--q-negative);
}

.emza-preview {
  max-height: 60px;
  max-width: 160px;
  vertical-align: middle;
  margin-right: 8px;
}
</style>
