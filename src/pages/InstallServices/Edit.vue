<template>
  <q-page class="q-pa-md">

    <div v-if="serviceLoading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3em"/>
      <div class="text-grey q-mt-sm">در حال دریافت اطلاعات سرویس نصب...</div>
    </div>

    <q-form v-else @submit.prevent="submitForm('final')">

      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ویرایش سرویس نصب</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <q-select
                  option-label="fullName"
                  option-value="id"
                  outlined
                  v-model="customer_id"
                  use-input
                  label="مشتری"
                  :options="customersAndLeadsOptions"
                  @filter="filterCustomers"
                  @update:model-value="onCustomerSelected"
                  behavior="dialog">

                <template v-slot:after>
                  <q-btn @click.prevent="newCustomerDlg = true" icon="person_add" dense flat rounded/>
                </template>

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="q-mb-xs">این نصب مربوط به کدام خرید است؟</div>
              <q-radio v-model="purchaseSource" val="1" label="خرید شده از ما"
                       @update:model-value="onPurchaseSourceChange"/>
              <q-radio v-model="purchaseSource" val="2" label="خریداری شده از جای دیگر"
                       @update:model-value="onPurchaseSourceChange"/>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <div class="row q-col-gutter-md border-radius-card q-mt-sm" v-if="customer_id">

        <div class="col-md-8 col-xs-12 q-gutter-y-md">

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات نصب</div>
              <div class="row q-col-gutter-md">

                <div class="col-md-6 col-xs-12">
                  <q-input outlined v-model="address" label="آدرس" autogrow/>
                </div>
                <div class="col-md-6 col-xs-12">
                  <q-input outlined dir="ltr" v-model="contactNumber" label="شماره تماس"/>
                </div>

                <div class="col-12">
                  <q-input
                      v-if="purchaseSource !== '1' || !selectedAutomationId"
                      outlined
                      autogrow
                      v-model="productDescription"
                      label="توضیحات محصول / سیستم نصب شده"
                  />
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-input mask="####/##/##" outlined dir="ltr" v-model="surveyDate" label="تاریخ بازدید">
                    <template v-slot:prepend>
                      <q-icon name="event" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-date today-btn
                                  calendar="persian"
                                  v-model="surveyDate" mask="YYYY-MM-DD">
                            <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                          </q-date>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-md-6 col-xs-12">
                  <q-select
                      option-label="name"
                      option-value="id"
                      outlined
                      v-model="technicalExpertId"
                      label="کارشناس فنی"
                      :options="technicalExpertOptions">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

              </div>
            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات نصاب ها</div>

              <div v-for="role in installerRoles" :key="role.key" class="q-mb-lg">
                <div class="text-caption text-grey-8 q-mb-xs">{{ role.label }}</div>
                <div class="row q-col-gutter-md items-start">

                  <div class="col-md-4 col-xs-12">
                    <q-select
                        option-label="name"
                        option-value="id"
                        outlined
                        dense
                        v-model="installers[role.key].installer"
                        label="انتخاب نصاب"
                        :options="installerOptions"
                        @update:model-value="onInstallerContextChanged(role)">
                      <template v-slot:after>
                        <q-btn @click.prevent="openNewInstallerDlg(role.key)" icon="person_add" dense flat rounded/>
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">یافت نشد</q-item-section>
                        </q-item>
                      </template>
                    </q-select>
                  </div>

                  <div class="col-md-2 col-xs-6">
                    <q-input mask="####/##/##" outlined dense dir="ltr"
                             v-model="installers[role.key].date" label="تاریخ نصب"
                             @update:model-value="onInstallerContextChanged(role)">
                      <template v-slot:prepend>
                        <q-icon name="event" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-date today-btn
                                    calendar="persian"
                                    v-model="installers[role.key].date" mask="YYYY-MM-DD"
                                    @update:model-value="onInstallerContextChanged(role)">
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-date>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-md-2 col-xs-6">
                    <q-input outlined dense dir="ltr" v-model="installers[role.key].startTime" label="ساعت شروع">
                      <template v-slot:prepend>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time v-model="installers[role.key].startTime" format24h>
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-md-2 col-xs-6">
                    <q-input outlined dense dir="ltr" v-model="installers[role.key].endTime" label="ساعت پایان">
                      <template v-slot:prepend>
                        <q-icon name="access_time" class="cursor-pointer">
                          <q-popup-proxy transition-show="scale" transition-hide="scale">
                            <q-time v-model="installers[role.key].endTime" format24h>
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </q-time>
                          </q-popup-proxy>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>

                  <div class="col-md-2 col-xs-12 flex flex-center">
                    <q-btn
                        round
                        flat
                        color="primary"
                        icon="event_available"
                        :disable="!installers[role.key].installer"
                        @click.prevent="openInstallerCalendar(role)">
                      <q-tooltip>تقویم کاری نصاب</q-tooltip>
                    </q-btn>
                  </div>

                </div>
                <q-separator v-if="role.key !== installerRoles[installerRoles.length - 1].key" class="q-mt-md"/>
              </div>

            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اقلام مصرفی</div>

              <div
                  v-for="(item, index) in consumableItems"
                  :key="index"
                  class="row q-col-gutter-md items-start q-mb-sm">

                <div class="col-md-7 col-xs-12">
                  <q-select
                      option-label="name"
                      option-value="id"
                      outlined
                      dense
                      use-input
                      clearable
                      v-model="item.product"
                      label="انتخاب محصول"
                      :options="productOptions"
                      @filter="filterProducts"
                      behavior="dialog">
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">یافت نشد</q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </div>

                <div class="col-md-3 col-xs-8">
                  <q-input
                      outlined
                      dense
                      type="number"
                      min="0"
                      step="1"
                      v-model.number="item.quantity"
                      label="تعداد"/>
                </div>

                <div class="col-md-2 col-xs-4 flex flex-center">
                  <q-btn
                      v-if="index >= 1"
                      round
                      flat
                      dense
                      color="negative"
                      icon="delete"
                      @click.prevent="removeConsumableRow(index)">
                    <q-tooltip>حذف ردیف</q-tooltip>
                  </q-btn>
                </div>

              </div>

              <q-btn
                  outline
                  rounded
                  dense
                  color="accent"
                  icon="add"
                  label="افزودن ردیف"
                  @click.prevent="addConsumableRow"/>
            </q-card-section>
          </q-card>

        </div>

        <div class="col-md-4 col-xs-12 q-gutter-y-md">

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اطلاعات مشتری</div>
              <q-list dense>
                <q-item>
                  <q-item-section side>
                    <q-icon name="person"/>
                  </q-item-section>
                  <q-item-section>{{ customer_id.name || customer_id.fullName }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.contact_number">
                  <q-item-section side>
                    <q-icon name="call"/>
                  </q-item-section>
                  <q-item-section dir="ltr" class="text-right">{{ customer_id.contact_number }}</q-item-section>
                </q-item>
                <q-item v-if="customer_id.address">
                  <q-item-section side>
                    <q-icon name="place"/>
                  </q-item-section>
                  <q-item-section>{{ customer_id.address }}</q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-subtitle1 q-mb-md">اتوماسیون های موفق مشتری</div>

              <div v-if="automationsLoading" class="text-grey text-caption">
                در حال دریافت اطلاعات...
              </div>

              <div v-else-if="!customerAutomations.length" class="text-grey text-caption">
                هیچ اتوماسیون موفقی برای این مشتری ثبت نشده است
              </div>

              <q-list bordered separator v-else>
                <q-item
                    v-for="automation in customerAutomations"
                    :key="automation.id"
                    clickable
                    :disable="purchaseSource !== '1'"
                    :active="selectedAutomationId === automation.id"
                    active-class="bg-accent text-white"
                    @click="selectAutomation(automation)">
                  <q-item-section>
                    <q-item-label>
                      {{ surveyTypeLabel(automation.surveyType) + ' ( ' + (automation.invoice_number || '') + ' ) ' }}
                    </q-item-label>
                    <q-item-label caption
                                  :class="selectedAutomationId === automation.id ? 'text-white' : 'text-grey-7'">
                      تاریخ: {{ automation.jalali_date }}
                    </q-item-label>
                    <q-item-label caption
                                  v-if="automation.description"
                                  :class="selectedAutomationId === automation.id ? 'text-white' : 'text-grey-7'">
                      {{ automation.description }}
                    </q-item-label>
                    <q-item-section class="q-mt-xs">
                      <div>محصولات فاکتور : </div>
                      <div v-for="order in automation.orders" class="q-gutter-x-xs">
                        <span class="text-grey-8">نام محصول : {{ order.product.name }}</span>
                        <span>,</span>
                        <span class="text-grey-8">تعداد :  {{ order.count }}</span>
                        <span>,</span>
                        <span class="text-grey-8">قیمت :  {{ Number(order.price).toLocaleString('en-US') + ' تومان' }}</span>
                      </div>
                    </q-item-section>
                  </q-item-section>
                  <q-item-section side v-if="selectedAutomationId === automation.id">
                    <q-icon name="check_circle"/>
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="purchaseSource !== '1'" class="text-caption text-grey q-mt-sm">
                برای انتخاب اتوماسیون، ابتدا نوع خرید را «خرید شده از ما» انتخاب کنید
              </div>
            </q-card-section>
          </q-card>

        </div>
      </div>

      <!-- ============ دکمه های ثبت ============ -->
      <q-card-actions v-if="customer_id" class="q-gutter-sm">
        <q-btn
            outline
            rounded
            class="col"
            color="negative"
            label="انصراف"
            :to="{ name: 'InstallationServiceList' }"/>
        <q-btn
            outline
            rounded
            class="col"
            color="grey-8"
            label="ذخیره به صورت موقت"
            @click.prevent="submitForm('temporary')"/>
        <q-btn
            type="submit"
            rounded
            class="col"
            color="accent"
            label="ذخیره نصب نهایی"/>
      </q-card-actions>

    </q-form>

    <q-dialog v-model="newCustomerDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewCustomer()">
          <q-card-section>
            <div class="text-h6">مشتری جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">
              <div>
                <q-radio v-model="newCustomerGender" :val="0" label="آقا"/>
                <q-radio v-model="newCustomerGender" :val="1" label="خانم"/>
              </div>
              <q-input outlined v-model="newCustomerName" label="نام و نام خانوادگی"/>
              <q-input outlined dir="ltr" v-model="newCustomerContactNumber" label="شماره تلفن همراه"/>
              <q-input outlined v-model="newCustomerAddress" label="آدرس"/>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newInstallerDlg">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewInstaller()">
          <q-card-section>
            <div class="text-h6">نصاب جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">
              <q-input outlined v-model="newInstallerName" label="نام"/>
            </div>
            <div class="q-gutter-md q-mt-sm">
              <q-input outlined v-model="newInstallerUserName" label="نام کاربری"/>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <!--
      این دیالوگ صرفاً اطلاعاتی است: روزهای کاری نصاب و بازه‌های از قبل رزرو
      شده‌ی او را نشان می‌دهد. هیچ آیتم از پیش آماده‌ای برای کلیک/انتخاب
      ساعت نصب وجود ندارد؛ ساعت شروع/پایان همیشه با تایپ خود کاربر در فرم
      اصلی وارد می‌شود.
    -->
    <q-dialog v-model="installerCalendarDlg">
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">
            تقویم کاری نصاب
            <span v-if="installerCalendarTarget" class="text-grey text-subtitle2">
              ({{ installerCalendarTarget.label }})
            </span>
          </div>
        </q-card-section>
        <q-separator/>

        <q-card-section>
          <div v-if="installerCalendarLoading" class="text-center text-grey q-pa-md">
            در حال دریافت اطلاعات...
          </div>

          <div v-else>
            <div class="text-subtitle2 q-mb-sm">روزهای کاری</div>

            <q-list bordered separator dense v-if="installerWorkingDays.length">
              <q-item v-for="day in installerWorkingDays" :key="day.weekday">
                <q-item-section>{{ weekdayLabel(day.weekday) }}</q-item-section>
                <q-item-section side>
                  <q-badge :color="day.is_active ? 'positive' : 'grey-5'">
                    {{ day.is_active ? 'فعال' : 'غیرفعال' }}
                  </q-badge>
                </q-item-section>
                <q-item-section side v-if="day.is_active" class="text-grey-8" dir="ltr">
                  {{ (day.start_time || '').substring(0, 5) }} - {{ (day.end_time || '').substring(0, 5) }}
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey text-caption">
              برای این نصاب روز کاری ثبت نشده است
            </div>

            <q-separator class="q-my-md"/>

            <div class="row items-center justify-between q-mb-sm">
              <div class="text-subtitle2">
                وضعیت روز انتخابی
                <span v-if="installerCalendarTarget && installers[installerCalendarTarget.key].date"
                      class="text-grey-7">
                  ({{ installers[installerCalendarTarget.key].date }})
                </span>
              </div>
              <q-btn
                  v-if="installerCalendarTarget && installers[installerCalendarTarget.key].date"
                  flat dense round icon="refresh"
                  @click="fetchInstallerDayAvailability(installers[installerCalendarTarget.key].installer.id, installers[installerCalendarTarget.key].date)">
                <q-tooltip>بروزرسانی</q-tooltip>
              </q-btn>
            </div>

            <div v-if="!installerCalendarTarget || !installers[installerCalendarTarget.key].date"
                 class="text-grey text-caption">
              برای مشاهده‌ی ساعت کاری و نوبت‌های رزرو شده، ابتدا تاریخ نصب را در فرم انتخاب کنید
            </div>
            <div v-else-if="installerDayAvailabilityLoading" class="text-center text-grey q-pa-md">
              در حال دریافت اطلاعات روز...
            </div>
            <div v-else-if="installerDayAvailability && !installerDayAvailability.is_working_day"
                 class="text-negative text-caption">
              این تاریخ جزو روزهای کاری نصاب نیست
            </div>
            <div v-else-if="installerDayAvailability">
              <div class="text-caption text-grey-8 q-mb-sm" dir="ltr">
                ساعت کاری: {{ installerDayAvailability.work_start }} - {{ installerDayAvailability.work_end }}
              </div>

              <div v-if="!installerDayAvailability.busy.length" class="text-grey text-caption">
                در حال حاضر نوبت رزرو شده‌ای برای این روز ثبت نشده است
              </div>
              <div v-else class="row q-gutter-sm">
                <q-chip
                    v-for="(range, index) in installerDayAvailability.busy"
                    :key="index"
                    square
                    :color="chipColor(range.type)"
                    text-color="white">
                  {{ range.start }} - {{ range.end }} ({{ range.type_label }})
                </q-chip>
              </div>

              <!-- راهنمای رنگ‌ها، دقیقاً هم‌رنگ با تقویم کاری نصاب -->
              <div v-if="installerDayAvailability.busy.length" class="row q-col-gutter-sm items-center q-mt-sm">
                <div
                    v-for="item in legendItems"
                    :key="item.role"
                    class="row items-center q-mr-md q-mb-xs">
                  <q-chip dense square :color="item.color" text-color="white" class="q-mr-xs" style="width: 16px; min-width: 16px; height: 16px;"/>
                  <span class="text-caption">{{ item.label }}</span>
                </div>
              </div>

              <div class="text-caption text-grey-7 q-mt-sm">
                ساعت شروع/پایانی که در فرم وارد می‌کنید باید در بازه‌ی ساعت کاری بالا و خارج از
                بازه‌های رزرو شده باشد.
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

// همان پالت رنگی و برچسب‌های تقویم کاری نصاب (InstallerCalendar.vue /
// InstallersCalendarOverview.vue)، تا نمایش بازه‌های رزرو شده در این فرم
// دقیقاً با تقویم کاری هم‌خوانی داشته باشد.
const TYPE_COLORS = {
  panel: 'primary',
  wiring: 'orange',
  commissioning: 'teal',
  after_sale: 'purple',
}

const TYPE_LABELS = {
  panel: 'نصب پنل',
  wiring: 'نصب سیم‌کشی',
  commissioning: 'نصب و راه‌اندازی',
  after_sale: 'خدمات پس از فروش',
}

export default {
  name: "EditInstallationService",

  data() {
    return {

      serviceId: this.$route.params.id,
      serviceLoading: true,
      // تا زمانی که اطلاعات سرویس از بک‌اند در فرم پر می‌شود، این پرچم true
      // است تا onCustomerSelected/onPurchaseSourceChange فرم را ریست نکنند.
      isHydrating: false,

      legendItems: Object.keys(TYPE_LABELS).map(role => ({
        role,
        label: TYPE_LABELS[role],
        color: TYPE_COLORS[role],
      })),

      customer_id: null,
      status: null,

      newCustomerDlg: false,
      newCustomerName: '',
      newCustomerContactNumber: '',
      newCustomerAddress: '',
      newCustomerGender: 0,

      customersAndLeads: [],
      customersAndLeadsOptions: [],

      purchaseSource: '1',

      address: '',
      contactNumber: '',
      productDescription: '',
      surveyDate: '',
      technicalExpertId: null,
      technicalExpertOptions: [],

      customerAutomations: [],
      automationsLoading: false,
      selectedAutomationId: null,

      installerRoles: [
        {key: 'panel', label: 'نصاب پنل'},
        {key: 'wiring', label: 'نصاب سیم کشی'},
        {key: 'commissioning', label: 'نصاب راه اندازی'}
      ],
      installers: {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      },
      installerOptions: [],

      products: [],
      productOptions: [],
      consumableItems: [
        {product: null, quantity: 1},
        {product: null, quantity: 1},
        {product: null, quantity: 1}
      ],

      newInstallerDlg: false,
      newInstallerName: '',
      newInstallerUserName: '',

      installerCalendarDlg: false,
      installerCalendarTarget: null,
      installerCalendarLoading: false,
      installerWorkingDays: [],
      installerDayAvailability: null,
      installerDayAvailabilityLoading: false
    }
  },

  methods: {

    getCustomersAndLeads() {
      api.get('customers/all')
          .then(response => {
            this.customersAndLeadsOptions = response.data.data
            this.customersAndLeads = response.data.data
          })
    },

    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          this.customersAndLeadsOptions = this.customersAndLeads
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.customersAndLeadsOptions = this.customersAndLeads.filter(
            v => (v.name || v.fullName || '').toLowerCase().indexOf(needle) > -1
        )
      })
    },

    onCustomerSelected(customer) {
      // در حالت هیدریت (پر کردن فرم از اطلاعات سرویس موجود) نباید فرم ریست شود
      if (this.isHydrating) {
        if (customer) {
          this.getCustomerAutomations(customer.id)
        }
        return
      }

      this.resetInstallInfo()
      this.customerAutomations = []

      if (!customer) return

      this.address = customer.address || ''
      this.contactNumber = customer.contact_number || ''

      this.getCustomerAutomations(customer.id)
    },

    submitNewCustomer() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.contact_number = this.newCustomerContactNumber
      payload.name = this.newCustomerName
      payload.gender = this.newCustomerGender
      payload.address = this.newCustomerAddress

      api.post('customers/quick-add', payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getCustomersAndLeads();
            this.customer_id = response.data.data
            this.onCustomerSelected(response.data.data)

            this.newCustomerContactNumber = ''
            this.newCustomerName = ''
            this.newCustomerAddress = ''
            this.newCustomerGender = 0
            this.newCustomerDlg = false
            this.$q.loading.hide();
          })
          .catch((error) => {
            this.$q.loading.hide();
          });
    },

    getCustomerAutomations(customerId) {
      this.automationsLoading = true
      api.get(`installation-service/customer/${customerId}/automations`)
          .then(response => {
            this.customerAutomations = response.data.data
          })
          .finally(() => {
            this.automationsLoading = false
          })
    },

    selectAutomation(automation) {
      if (this.purchaseSource !== '1') return

      this.selectedAutomationId = automation.id
      this.surveyDate = automation.jalali_visit_date || ''
      this.technicalExpertId = automation.technical_expert || null
      this.productDescription = automation.description || ''
    },

    onPurchaseSourceChange() {
      this.selectedAutomationId = null
      this.surveyDate = ''
      this.technicalExpertId = null
      this.productDescription = ''
    },

    surveyTypeLabel(type) {
      if (type === 1) return 'کارشناسی خانگی'
      if (type === 2) return 'کارشناسی صنعتی'
      return 'نامشخص'
    },

    getTechnicalExperts() {
      api.get('technical_experts')
          .then(response => {
            this.technicalExpertOptions = response.data.data
          })
    },

    getInstallers() {
      api.get('installers')
          .then(response => {
            this.installerOptions = response.data.data
          })
    },

    getProducts() {
      api.get('products/list')
          .then(response => {
            this.products = response.data.data
            this.productOptions = response.data.data
          })
    },

    filterProducts(val, update) {
      if (val === '') {
        update(() => {
          this.productOptions = this.products
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.productOptions = this.products.filter(
            p => (p.name || '').toLowerCase().indexOf(needle) > -1
        )
      })
    },

    addConsumableRow() {
      this.consumableItems.push({product: null, quantity: 1})
    },

    removeConsumableRow(index) {
      this.consumableItems.splice(index, 1)
    },

    resetConsumableItems() {
      this.consumableItems = [
        {product: null, quantity: 1},
        {product: null, quantity: 1},
        {product: null, quantity: 1}
      ]
    },

    openNewInstallerDlg(roleKey) {
      this.newInstallerTargetRole = roleKey
      this.newInstallerDlg = true
    },

    submitNewInstaller() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.name = this.newInstallerName
      payload.username = this.newInstallerUserName

      api.post('users/quick-add', payload)
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getInstallers()

            if (this.newInstallerTargetRole) {
              this.installers[this.newInstallerTargetRole].installer = response.data.data
            }

            this.newInstallerName = ''
            this.newInstallerTargetRole = null
            this.newInstallerDlg = false
            this.$q.loading.hide();
          })
          .catch((error) => {
            this.$q.loading.hide();
          });
    },

    weekdayLabel(weekday) {
      const labels = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه']
      return labels[weekday] ?? '-'
    },

    chipColor(role) {
      return TYPE_COLORS[role] || 'grey'
    },

    openInstallerCalendar(role) {
      const installer = this.installers[role.key].installer
      if (!installer) return

      this.installerCalendarTarget = role
      this.installerCalendarDlg = true
      this.installerWorkingDays = []
      this.installerDayAvailability = null
      this.installerCalendarLoading = true

      api.get(`installer-working-days/${installer.id}`)
          .then(response => {
            this.installerWorkingDays = response.data.data
          })
          .catch()
          .finally(() => {
            this.installerCalendarLoading = false
          })

      if (this.installers[role.key].date) {
        this.fetchInstallerDayAvailability(installer.id, this.installers[role.key].date)
      }
    },

    // فقط جهت نمایش اطلاعاتی (ساعت کاری نصاب + بازه‌های از قبل رزرو شده)؛
    // هیچ بازه‌ی آماده‌ای برای کلیک/انتخاب نمی‌سازد. کاربر همچنان خودش ساعت
    // شروع و پایان دلخواه را در فرم تایپ می‌کند.
    fetchInstallerDayAvailability(installerId, date) {
      if (!installerId || !date) return

      this.installerDayAvailabilityLoading = true
      api.get(`installer-appointments/available-slots/${installerId}`, {
        params: {date: date}
      })
          .then(response => {
            this.installerDayAvailability = response.data.data
          })
          .catch()
          .finally(() => {
            this.installerDayAvailabilityLoading = false
          })
    },

    onInstallerContextChanged(role) {
      this.installerDayAvailability = null
      const item = this.installers[role.key]
      if (this.installerCalendarDlg
          && this.installerCalendarTarget
          && this.installerCalendarTarget.key === role.key
          && item.installer
          && item.date) {
        this.fetchInstallerDayAvailability(item.installer.id, item.date)
      }
    },

    fetchService() {
      this.serviceLoading = true
      api.get(`installation-service/${this.serviceId}`)
          .then(response => {
            this.populateForm(response.data.data)
          })
          .finally(() => {
            this.serviceLoading = false
          })
    },

    populateForm(service) {
      this.isHydrating = true

      this.status = service.status

      // نوع خرید در فرم به صورت رشته ('1'/'2') نگه داشته می‌شود (به خاطر q-radio)
      this.purchaseSource = String(service.purchase_source)

      this.address = service.address || ''
      this.contactNumber = service.contact_number || ''
      this.productDescription = service.description || ''

      // survey_date از بک‌اند به صورت جلالی و با جداکننده‌ی "/" برمی‌گردد
      // (jalali_survey_date)؛ در فرم مانند بقیه‌ی فیلدهای تاریخ با "-" نگه داشته می‌شود.
      this.surveyDate = service.jalali_survey_date
          ? service.jalali_survey_date.replaceAll('/', '-')
          : ''

      this.technicalExpertId = service.technical_expert || null
      this.selectedAutomationId = service.automation_id || null

      // مشتری: باید همان شکل آبجکتی مورد استفاده در q-select (customer_id) باشد
      this.customer_id = service.customer || null
      if (this.customer_id) {
        this.getCustomerAutomations(this.customer_id.id)
      }

      // نصاب‌ها: از روی installer_appointments بر اساس نوع (type) هر نقش پر می‌شود.
      // اگر نوبتی برای یک نقش لغو شده باشد (status === 3)، آن نقش خالی نمایش داده می‌شود.
      const typeMap = {panel: 1, wiring: 2, commissioning: 3}
      const appointments = service.installer_appointments || []

      this.installers = {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      }

      for (const roleKey of Object.keys(typeMap)) {
        const appointment = appointments.find(a => Number(a.type) === typeMap[roleKey])
        if (!appointment || Number(appointment.status) === 3) {
          continue
        }

        this.installers[roleKey] = {
          installer: appointment.installer || null,
          date: appointment.jalali_date ? appointment.jalali_date.replaceAll('/', '-') : '',
          startTime: appointment.start_time ? appointment.start_time.substring(0, 5) : '',
          endTime: appointment.end_time ? appointment.end_time.substring(0, 5) : ''
        }
      }

      // اقلام مصرفی
      const items = service.installation_service_items || []
      this.consumableItems = items.length
          ? items.map(item => ({product: item.product || null, quantity: item.quantity}))
          : [
            {product: null, quantity: 1},
            {product: null, quantity: 1},
            {product: null, quantity: 1}
          ]

      this.$nextTick(() => {
        this.isHydrating = false
      })
    },

    resetInstallInfo() {
      this.purchaseSource = '1'
      this.address = ''
      this.contactNumber = ''
      this.productDescription = ''
      this.surveyDate = ''
      this.technicalExpertId = null
      this.selectedAutomationId = null
      this.installers = {
        panel: {installer: null, date: '', startTime: '', endTime: ''},
        wiring: {installer: null, date: '', startTime: '', endTime: ''},
        commissioning: {installer: null, date: '', startTime: '', endTime: ''}
      }
      this.resetConsumableItems()
    },

    validateFinal() {
      for (const role of this.installerRoles) {
        const item = this.installers[role.key]
        if (!item.installer || !item.date || !item.startTime || !item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `اطلاعات «${role.label}» تکمیل نشده است`
          })
          return false
        }
        if (item.startTime >= item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `ساعت پایان «${role.label}» باید بعد از ساعت شروع باشد`
          })
          return false
        }
      }
      if (!this.surveyDate) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'تاریخ بازدید را وارد کنید'})
        return false
      }
      if (!this.technicalExpertId) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'کارشناس فنی را انتخاب کنید'})
        return false
      }
      return true
    },

    validateTemporary() {
      for (const role of this.installerRoles) {
        const item = this.installers[role.key]
        const hasAny = item.installer || item.date || item.startTime || item.endTime
        const hasAll = item.installer && item.date && item.startTime && item.endTime

        if (hasAny && !hasAll) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `اطلاعات «${role.label}» را کامل وارد کنید یا کاملاً خالی بگذارید`
          })
          return false
        }
        if (hasAll && item.startTime >= item.endTime) {
          this.$q.notify({
            type: 'negative',
            position: 'bottom',
            message: `ساعت پایان «${role.label}» باید بعد از ساعت شروع باشد`
          })
          return false
        }
      }
      return true
    },

    submitForm(status) {
      if (status === 'final' && !this.validateFinal()) {
        return
      }
      if (status === 'temporary' && !this.validateTemporary()) {
        return
      }

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        status: status === 'final' ? 2 : 1,
        customer_id: this.customer_id.id,
        purchase_source: this.purchaseSource,
        automation_id: this.purchaseSource === '1' ? this.selectedAutomationId : null,
        address: this.address,
        contact_number: this.contactNumber,
        description: this.productDescription,
        survey_date: this.surveyDate,
        technical_expert: this.technicalExpertId,
        installers: {
          panel: {
            installer_id: this.installers.panel.installer ? this.installers.panel.installer.id : null,
            date: this.installers.panel.date,
            start_time: this.installers.panel.startTime,
            end_time: this.installers.panel.endTime
          },
          wiring: {
            installer_id: this.installers.wiring.installer ? this.installers.wiring.installer.id : null,
            date: this.installers.wiring.date,
            start_time: this.installers.wiring.startTime,
            end_time: this.installers.wiring.endTime
          },
          commissioning: {
            installer_id: this.installers.commissioning.installer ? this.installers.commissioning.installer.id : null,
            date: this.installers.commissioning.date,
            start_time: this.installers.commissioning.startTime,
            end_time: this.installers.commissioning.endTime
          }
        },
        items: this.consumableItems
            .filter(item => item.product && Number(item.quantity) > 0)
            .map(item => ({
              product_id: item.product.id,
              quantity: item.quantity
            }))
      }

      api.put(`installation-service/${this.serviceId}`, payload)
          .then(response => {

            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.$router.push({name: 'InstallationServiceList'})
          })
          .finally(()=>{
            this.$q.loading.hide();

          })
    }
  },

  created() {
    this.getCustomersAndLeads();
    this.getInstallers();
    this.getTechnicalExperts();
    this.getProducts();
    this.fetchService();
  }
}
</script>

<style scoped>

</style>
