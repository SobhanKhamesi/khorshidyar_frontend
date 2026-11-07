<template>
  <router-link :to="{ name: 'Dashboard' }">
    <q-item
        v-if="profile === null"
        clickable
        v-ripple>
      <q-item-section avatar>
        <q-avatar>
          <img alt="logo" src="../assets/img/boomrang-logo.png">
        </q-avatar>
      </q-item-section>
      <q-item-section>نرم افزار بومرنگ</q-item-section>
    </q-item>
    <q-item
        v-if="profile !== null"
        clickable
        v-ripple>
      <q-item-section avatar>
        <q-btn round color="red">
          <q-avatar size="50px">
            <img :src="'https://free-demo.boomrangcrm.com/profile/' + profile"/>
          </q-avatar>
        </q-btn>
      </q-item-section>
      <q-item-section>
        {{ userName }} عزیز
      </q-item-section>
    </q-item>
  </router-link>
  <q-separator/>

  <q-list class="rounded-borders">

    <router-link :to="{ name: 'Dashboard' }">
      <q-expansion-item
          icon="bi-speedometer2"
          expand-icon=" "
          expanded-icon=" "
          :content-inset-level="0"
          group="side-bar-nav"
          label="داشبورد"/>
    </router-link>
    <router-link
        :to="{ name: 'UserReport' }">
      <q-expansion-item
          icon="eva-person-done-outline"
          expand-icon=" "
          expanded-icon=""
          :content-inset-level="0"
          group="side-bar-nav"
          label="گزارش فعالیت کاربران">
      </q-expansion-item>
    </router-link>

    <!-- هر بخش فقط برای نقش‌هایی که به آن دسترسی دارند نمایش داده می‌شود (src/utils/access.js) -->
    <q-expansion-item v-if="can('LeadsList')" :content-inset-level="0"
                      group="side-bar-nav"
                      icon="bi-person"
                      label="سرنخ">
      <q-item v-ripple clickable :to="{ name: 'LeadCreate' }">
        <q-item-section>سرنخ جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'LeadsList' }">
        <q-item-section>لیست سرنخ ها</q-item-section>
      </q-item>
    </q-expansion-item>


    <router-link v-if="can('CustomersOpportunities')" :to="{ name: 'CustomersOpportunities' }">
      <q-expansion-item
          icon="bi-person-add"
          expand-icon=" "
          expanded-icon=""
          :content-inset-level="0"
          group="side-bar-nav"
          label="فرصت"/>
    </router-link>

    <q-expansion-item
        v-if="can('CustomersList')"
        :content-inset-level="0"
        group="side-bar-nav"
        icon="bi-person-check"
        label="مشتری">

      <q-item v-ripple clickable :to="{ name: 'CustomerCreate' }">
        <q-item-section>ثبت مشتری جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'CustomersList' }">
        <q-item-section>لیست مشتریان</q-item-section>
      </q-item>

    </q-expansion-item>

    <router-link v-if="can('introducerList')" :to="{ name: 'introducerList' }">
      <q-expansion-item
          icon="eva-people-outline"
          expand-icon=" "
          expanded-icon=""
          :content-inset-level="0"
          group="side-bar-nav"
          label="معرف ها"/>
    </router-link>

<!--    <q-expansion-item-->
<!--        group="side-bar-nav"-->
<!--        icon="bi-calculator"-->
<!--        label="حسابداری فروش">-->
<!--      <q-item v-ripple clickable :to="{ name: 'InvoiceCreate' }">-->
<!--        <q-item-section>فاکتور جدید</q-item-section>-->
<!--      </q-item>-->
<!--      <q-item v-ripple clickable :to="{ name: 'InvoicesList' }">-->
<!--        <q-item-section>لیست فاکتور ها</q-item-section>-->
<!--      </q-item>-->


<!--      <q-expansion-item switch-toggle-side dense-toggle :header-inset-level="0" :content-inset-level="1"-->
<!--                        label="حساب بانکی">-->
<!--        <q-item v-ripple clickable :to="{ name: 'BankAccountCreate' }">-->
<!--          <q-item-section>حساب جدید</q-item-section>-->
<!--        </q-item>-->
<!--        <q-item v-ripple clickable :to="{ name: 'BankAccountsList' }">-->
<!--          <q-item-section>لیست حساب ها</q-item-section>-->
<!--        </q-item>-->
<!--      </q-expansion-item>-->


<!--      <q-expansion-item switch-toggle-side dense-toggle :header-inset-level="0" :content-inset-level="1"-->
<!--                        label="چک">-->
<!--        <q-item v-ripple clickable :to="{ name: 'CheckCreate' }">-->
<!--          <q-item-section>چک جدید</q-item-section>-->
<!--        </q-item>-->
<!--        <q-item v-ripple clickable :to="{ name: 'ChecksList' }">-->
<!--          <q-item-section>لیست چک ها</q-item-section>-->
<!--        </q-item>-->
<!--      </q-expansion-item>-->

<!--    </q-expansion-item>-->


    <q-expansion-item
        v-if="can('ListRequest')"
        group="side-bar-nav"
        label="">
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="bi-diagram-3"/>
        </q-item-section>
        <q-item-section>
          <span>اتوماسیون فروش</span>
        </q-item-section>
        <q-item-section side v-if="check_sum_count">
          <span class="blink-me">{{ sum_count }}</span>
        </q-item-section>
      </template>
      <router-link :to="{ name: 'CreateQuickPreInvoice' }">
        <q-item v-ripple clickable>
          <q-item-section>* ثبت سریع پیش فاکتور</q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'CreateRequest' }">
        <q-item v-ripple clickable>
          <q-item-section>درخواست جدید</q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'ListRequest' }">
        <q-item v-ripple clickable>
          <q-item-section>لیست درخواست ها</q-item-section>
          <q-item-section side v-if="intake_form_count > 0">
            <q-icon name="notifications_active" color="negative" size="20px"
                    :title="intake_form_count + ' فرم اولیه جدید توسط مشتری تکمیل شده است'"/>
          </q-item-section>
          <q-item-section side v-if="check_darkhast_count">
            <span class="blink-me">{{ darkhast_count }}</span>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'ListPreInvoice' }">
        <q-item v-ripple clickable>
          <q-item-section>لیست پیش فاکتور ها</q-item-section>
          <q-item-section side v-if="check_pishfactor_count">
            <span class="blink-me">{{ pishfactor_count }}</span>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'ListContract' }">
        <q-item v-ripple clickable>
          <q-item-section>لیست مذاکره و قرارداد</q-item-section>
          <q-item-section side v-if="contract_signed_count > 0">
            <q-icon name="history_edu" color="positive" size="20px"
                    :title="contract_signed_count + ' قرارداد توسط مشتری امضا شده است'"/>
          </q-item-section>
          <q-item-section side v-if="check_mozakere_count">
            <span class="blink-me">{{ mozakere_count }}</span>
          </q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'ListFinal' }">
        <q-item v-ripple clickable>
          <q-item-section>فروش های موفق</q-item-section>
        </q-item>
      </router-link>
      <router-link :to="{ name: 'listcanseling' }">
        <q-item v-ripple clickable>
          <q-item-section>فروش های ناموفق</q-item-section>
        </q-item>
      </router-link>
    </q-expansion-item>

    <q-expansion-item
        v-if="can('InstallServiceList')"
        group="side-bar-nav"
        label="">
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="bi-diagram-3"/>
        </q-item-section>
        <q-item-section>
          <span>سرویس نصب</span>
        </q-item-section>
        <q-item-section side v-if="check_installation_service_count">
          <span class="blink-me">{{ installation_service_count }}</span>
        </q-item-section>
      </template>
      <q-item v-if="can('InstallServiceCreate')" v-ripple clickable :to="{ name: 'InstallServiceCreate' }">
        <q-item-section>ثبت سرویس جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'InstallServiceList' }">
        <q-item-section>لیست سرویس ها</q-item-section>
        <q-item-section side v-if="check_installation_service_count">
          <span class="blink-me">{{ installation_service_count }}</span>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
        v-if="can('AfterSalesServiceList')"
        group="side-bar-nav"
        label="">
      <template v-slot:header>
        <q-item-section avatar>
          <q-icon name="bi-diagram-3"/>
        </q-item-section>
        <q-item-section>
          <span>خدمات پس از فروش</span>
        </q-item-section>
        <q-item-section side v-if="poor_rating_count > 0">
          <q-icon name="sentiment_very_dissatisfied" color="negative" size="20px"
                  :title="poor_rating_count + ' نظرسنجی ضعیف نیازمند بررسی'"/>
        </q-item-section>
        <q-item-section side v-if="check_after_sale_count">
          <span class="blink-me">{{ after_sale_count }}</span>
        </q-item-section>
      </template>
      <q-item v-if="can('AfterSalesServiceCreate')" v-ripple clickable :to="{ name: 'AfterSalesServiceCreate' }">
        <q-item-section>ثبت خدمت جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'AfterSalesServiceList' }">
        <q-item-section>لیست خدمات</q-item-section>
        <q-item-section side v-if="poor_rating_count > 0">
          <q-icon name="sentiment_very_dissatisfied" color="negative" size="20px"
                  :title="poor_rating_count + ' نظرسنجی ضعیف نیازمند بررسی'"/>
        </q-item-section>
        <q-item-section side v-if="check_after_sale_count">
          <span class="blink-me">{{ after_sale_count }}</span>
        </q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
        group="side-bar-nav"
        icon="bi-repeat"
        label="مدیریت ارجاع به کاربران">
      <q-item v-ripple clickable :to="{ name: 'TicketCreate' }">
        <q-item-section>تیکت جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'TicketList' }">
        <q-item-section>لیست تیکت ها</q-item-section>
      </q-item>
    </q-expansion-item>

<!--    <q-expansion-item-->
<!--        group="side-bar-nav"-->
<!--        icon="bi-pass"-->
<!--        label="گزارشات">-->

<!--      <q-expansion-item switch-toggle-side dense-toggle :header-inset-level="0"-->
<!--                        :content-inset-level="1"-->
<!--                        label="گزارش روزانه">-->
<!--        <q-item v-ripple clickable :to="{ name: 'DailyReportList' }">-->
<!--          <q-item-section>لیست گزارش ها</q-item-section>-->
<!--        </q-item>-->
<!--        <q-item v-ripple clickable :to="{ name: 'DailyReportTodayList' }">-->
<!--          <q-item-section>گزارش های امروز</q-item-section>-->
<!--        </q-item>-->
<!--        <q-item v-ripple clickable :to="{ name: 'DailyReportCreate' }">-->
<!--          <q-item-section>ثبت گزارش جدید</q-item-section>-->
<!--        </q-item>-->
<!--      </q-expansion-item>-->

<!--    </q-expansion-item>-->


    <q-expansion-item
        v-if="can('ProductsList')"
        group="side-bar-nav"
        icon="ti-package"
        label="انبارداری">
      <q-item v-ripple clickable :to="{ name: 'ProductCreate' }">
        <q-item-section>محصول جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'ProductsList' }">
        <q-item-section>لیست محصولات</q-item-section>
      </q-item>
    </q-expansion-item>


    <q-expansion-item
        v-if="can('LeadsStatus')"
        group="side-bar-nav"
        icon="ti-bar-chart"
        label="نمودار">
      <q-expansion-item label="تحلیل سرنخ ها">
        <q-item v-ripple clickable :to="{ name: 'LeadsStatus' }">
          <q-item-section>نمودار وضعیت سرنخ ها</q-item-section>
        </q-item>
        <q-item v-ripple clickable :to="{ name: 'LeadsMethod' }">
          <q-item-section>نمودار شیوه آشنایی سرنخ ها</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item label="تحلیل فروش">
        <q-item v-ripple clickable :to="{ name: 'ProductChart' }">
          <q-item-section>نمودار فروش محصولات</q-item-section>
        </q-item>
        <q-item v-ripple clickable :to="{ name: 'SellerChart' }">
          <q-item-section>نمودار برترین فروشنده</q-item-section>
        </q-item>
      </q-expansion-item>
      <q-expansion-item label="تحلیل فعالیت ها">
<!--        <q-item v-ripple clickable :to="{ name: 'TargetingChart' }">-->
<!--          <q-item-section>نمودار هدف گذاری</q-item-section>-->
<!--        </q-item>-->
        <q-item v-ripple clickable :to="{ name: 'Call' }">
          <q-item-section>نمودار تعداد تماس کاربران</q-item-section>
        </q-item>
      </q-expansion-item>

    </q-expansion-item>


    <q-expansion-item v-if="can('TargetingList')" :content-inset-level="0"
                      group="side-bar-nav"
                      icon="ti-target"
                      label="هدف گذاری">
      <q-item v-ripple clickable :to="{ name: 'TargetingCreate' }"
              v-if="can('TargetingCreate')"
      >
        <q-item-section>هدف گذاری جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'TargetingList' }">
        <q-item-section>لیست هدف گذاری ها</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
        group="side-bar-nav"
        icon="bi-bell"
        label="یادآوری">
      <q-item v-ripple clickable :to="{ name: 'ReminderCreate' }">
        <q-item-section>یادآوری جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'RemindersList' }">
        <q-item-section>لیست یادآوری ها</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
        group="side-bar-nav"
        icon="bi-calendar-week"
        label="قرار ملاقات">
      <q-item v-ripple clickable :to="{ name: 'PlanningCreate' }">
        <q-item-section>برنامه جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'PlanningList' }">
        <q-item-section>لیست برنامه ها</q-item-section>
      </q-item>
    </q-expansion-item>

    <q-expansion-item
        v-if="can('SmsList')"
        group="side-bar-nav"
        icon="bi-envelope-heart"
        label="پیامک">
      <q-item v-ripple clickable :to="{ name: 'SmsCreate' }">
        <q-item-section>پیامک جدید</q-item-section>
      </q-item>
      <q-item v-ripple clickable :to="{ name: 'SmsList' }">
        <q-item-section>لیست پیامک های ارسالی</q-item-section>
      </q-item>
    </q-expansion-item>


  </q-list>


</template>

<script>
import {defineComponent} from 'vue'
import {LocalStorage} from "quasar";
import {api} from "boot/axios";
import {canAccessRoute, currentRole, setAccess} from "src/utils/access";

export default defineComponent({
  name: 'Navbar',
  emits: ['notifications-changed'],
  data() {
    return {
      userName: LocalStorage.getItem('name'),
      userRole: currentRole(),
      profile: this.$q.localStorage.getItem('profile'),

      darkhast_count: 0,
      pishfactor_count: 0,
      mozakere_count : 0,
      after_sale_count : 0,
      installation_service_count : 0,
      check_darkhast_count: false,
      check_after_sale_count: false,
      check_installation_service_count: false,
      check_pishfactor_count: false,
      check_mozakere_count: false,
      sum_count: 0,
      // فرم‌های اولیه تکمیل شده توسط مشتری که هنوز در کارتابل دیده نشده‌اند
      intake_form_count: 0,
      // قراردادهایی که مشتری امضا کرده و هنوز در کارتابل دیده نشده‌اند
      contract_signed_count: 0,
      // نظرسنجی‌های ضعیف خدمات پس از فروش که هنوز بررسی نشده‌اند
      poor_rating_count: 0,
      // تعداد آیتم‌های زنگوله منوی بالا (null: هنوز دریافت نشده)
      notifications_count: null,
      check_sum_count: false,
    }
  },
  methods: {
    can(routeName) {
      return canAccessRoute(routeName)
    },
    checking() {

      if (this.isRequesting) {
        return;
      }

      this.isRequesting = true;

      api.get('checking')
          .then(response => {

            // به‌روزرسانی نقش و سطوح دسترسی (تغییرات ادمین بدون ورود مجدد اعمال می‌شود)
            setAccess(response.data.data.role, response.data.data.permissions)
            this.userRole = currentRole()

            this.darkhast_count = response.data.data.darkhast_count
            this.pishfactor_count = response.data.data.pishfactor_count
            this.mozakere_count = response.data.data.mozakere_count
            this.check_darkhast_count = this.darkhast_count > 0;
            this.check_pishfactor_count = this.pishfactor_count > 0;
            this.check_mozakere_count = this.mozakere_count > 0;

            this.sum_count = this.darkhast_count + this.pishfactor_count + this.mozakere_count
            this.check_sum_count = this.sum_count > 0

            this.after_sale_count = response.data.data.after_sale_count
            this.check_after_sale_count = this.after_sale_count > 0;

            this.installation_service_count = response.data.data.installation_service_count

            this.intake_form_count = response.data.data.intake_form_count || 0
            this.contract_signed_count = response.data.data.contract_signed_count || 0
            // نظرسنجی‌های ضعیف (امتیاز ۰ تا ۲) که دلیل نارضایتی‌شان هنوز بررسی نشده
            this.poor_rating_count = response.data.data.poor_rating_count || 0
            this.check_installation_service_count = this.installation_service_count > 0;

            // اعلان‌ها (فرم اولیه تکمیل شده، قرارداد امضا شده، نظرسنجی ضعیف و ...) در بک‌اند به‌صورت یادآوری ساخته می‌شوند
            // و در زنگوله منوی بالا نمایش داده می‌شوند؛ با تغییر تعدادشان لیست زنگوله به‌روز می‌شود
            const notificationsCount = response.data.data.notifications_count || 0
            if (this.notifications_count !== null && notificationsCount !== this.notifications_count) {
              this.$emit('notifications-changed')
              if (notificationsCount > this.notifications_count)
                this.playAlarm()
            }
            this.notifications_count = notificationsCount

            setTimeout(() => {
              this.isRequesting = false;
              this.checking();
            }, 10000);
          })
    },

    // صدای کوتاه هنگام رسیدن اعلان جدید به زنگوله
    playAlarm() {
      try {
        // صدای کوتاه آلارم (در صورت اجازه مرورگر)
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        osc.frequency.value = 880
        osc.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      } catch (e) {
        // مرورگر پخش صدا را اجازه نداده است
      }
    },

    getData() {
      api.get('user/show')
          .then(response => {
            this.profile = response.data.data.profile
          })
          .finally(() => {
            this.$q.loading.hide();
          })
    },
  },
  created() {
    this.getData()
    this.checking()
  }
})
</script>

<style>
.blink-me {
  height: 21px;
  padding-left: 1px;
  padding-top: 1px;
  width: 20px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  color: #fff;
  background-color: red;
  border-radius: 50%;
  animation: blinker 2s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

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
