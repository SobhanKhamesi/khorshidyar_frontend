<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ایجاد مشتری جدید</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="submitForm()">
        <q-card-section>

          <div class="row q-col-gutter-md">


            <div class="col-2">
              <q-radio v-model="customerType" :val="0" label="حقیقی"/>
              <q-radio v-model="customerType" :val="1"
                       label="حقوقی"/>
            </div>

            <div class="col-10" v-if="customerType === 0">
              <q-radio v-model="customerGender" :val="0" label="آقا"/>
              <q-radio v-model="customerGender" :val="1" label="خانم"/>
            </div>
            <div class="col-10" v-if="customerType === 1">
            </div>

            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="customerName"
                       :label="customerType === 1 ? 'نام سازمان / شرکت' : 'نام و نام خانوادگی'"
                      />

              <q-input outlined v-model="nationalCode" dir="ltr" maxlength="10"
                       :label="customerType === 1 ? 'شناسه ملی ' : 'کد ملی '"/>

              <q-input v-if="customerType === 0" mask="####/##/##" outlined dir="ltr" v-model="customerBirthdate"
                       label="تاریخ تولد" >
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        today-btn
                        calendar="persian"
                        v-model="customerBirthdate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-input v-if="customerType === 0" mask="####/##/##" outlined dir="ltr" v-model="customerMarriageDate"
                       label="تاریخ ازدواج" >
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        today-btn
                        calendar="persian"
                        v-model="customerMarriageDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-select outlined v-model="province" label="استان "
                        :options="provincesOptions"/>


              <q-select outlined v-model="customerCity" label="شهر "
                        :options="cityOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      استان مورد نظر را انتخاب نمایید
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input outlined v-model="postalCode" dir="ltr" maxlength="10"
                       :label="customerType === 1 ? 'کد پستی ' : 'کد پستی '"/>

              <q-input outlined v-model="address"
                       :label="customerType === 1 ? 'آدرس ' : 'آدرس '"/>

              <q-input v-if="customerType === 0" outlined v-model="customerJob" label="شغل" />
              <q-input v-if="customerType === 0" autogrow outlined v-model="customerJobAddress"
                       label="آدرس محل کار" />



            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined
                       dir="ltr" maxlength="11"
                       v-model="customerContactNumber"
                       :label="customerType === 1 ? 'تلفن تماس' : 'شماره تلفن همراه'"
                       >
                <template v-slot:after>
                  <q-btn v-if="showNewInput === false" @click.prevent="toggleNewInput"
                         icon="eva-plus-circle-outline" dense flat
                         rounded/>
                </template>

              </q-input>

              <q-input outlined v-if="showNewInput"
                       dir="ltr" maxlength="11"
                       v-model="customerContactNumber1"
                       :label="customerType === 1 ? 'تلفن تماس ' : 'شماره تلفن همراه '"
                      >

                <template v-slot:after>
                  <q-btn @click.prevent="toggleMinusInput" icon="eva-minus-circle-outline" dense flat
                         rounded/>
                  <q-btn v-if="showNewInput1 === false" @click.prevent="toggleNewInput2"
                         icon="eva-plus-circle-outline" dense flat
                         rounded/>
                </template>

              </q-input>

              <q-input outlined v-if="showNewInput1"
                       dir="ltr" maxlength="11"
                       v-model="customerContactNumber2"
                       :label="customerType === 1 ? 'تلفن تماس ' : 'شماره تلفن همراه '"
                       >

                <template v-slot:after>
                  <q-btn @click.prevent="toggleMinusInput1" icon="eva-minus-circle-outline" dense flat
                         rounded/>
                </template>

              </q-input>

              <q-input outlined
                       dir="ltr"
                       v-if="customerType === 0"
                       v-model="customerLandlineNumber"
                       label="تلفن ثابت"
                      />

              <q-select
                option-label="title"
                option-value="id"
                outlined
                clearable
                v-model="customerCategory"
                label="دسته بندی"
                :options="customerCategoryOptions"
                use-input
                @filter="filterFn"
               >

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select v-if="customerType === 0"
                        outlined
                        clearable
                        v-model="customerDisc"
                        label="مدل رفتاری"
                        :options="discOptions"
                        >

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-select
                  option-label="name"
                  option-value="id"
                  outlined
                  clearable
                  v-model="introducer"
                  label="معرف"
                  :options="introducerOptions"
                  use-input
                  @filter="filterFn">

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:after>
                  <q-btn @click.prevent="newIntroducerDlg = true"
                         icon="eva-plus-circle-outline" dense flat
                         rounded/>
                </template>
              </q-select>

              <q-select outlined multiple v-model="CommunicationWays" label="راه های ارتباطی"
                        :options="communicationOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-italic text-grey">
                      ارتباطی وجود ندارد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-input outlined v-if="showcustomerEitaa"
                       dir="ltr"
                       label="ایتا"
                       v-model="customerEitaa"
                       maxlength="11"
                       />

              <q-input outlined v-if="showcustomerWhatsapp"
                       dir="ltr"
                       label="واتس آپ"
                       v-model="customerWhatsapp"
                      />

              <q-input outlined v-if="showcustomerTelegram"
                       dir="ltr"
                       label="تلگرام"
                       v-model="customerTelegram"
                       />

              <q-input outlined v-if="showcustomerInstagram"
                       dir="ltr"
                       label="اینستاگرم"
                       v-model="customerInstagram"
                      />

              <q-input outlined v-if="showcustomerEmail"
                       dir="ltr"
                       label="ایمیل"
                       v-model="customerEmail"
                       type="email"
                      />

              <q-input outlined center v-if="showcustomerWebSite"
                       dir="ltr"
                       label="وب سایت"
                       v-model="customerWebSite"
                      />

            </div>

            <div class="col-12">
              <q-input
                label="توضیحات بیشتر"
                v-model="customerDescription"
                outlined
                autogrow
              />
            </div>
          </div>
        </q-card-section>


        <div v-if="customerType === 1" class="q-pa-md">
          <q-table
            flat bordered class="border-radius-table"
            :rows-per-page-options="[0]"
            title="اشخاص"
            no-data-label="آیتمی ثبت نشده"
            :rows="dataPersons"
            :loading="loadingPersons"
            :columns="columnsPersons">

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="name" :props="props">
                  {{ (parseInt(props.row.gender) === 0 ? ' آقای ' : ' خانم ') + props.row.name }}
                </q-td>
                <q-td key="contact_number" :props="props">
                  {{ props.row.contact_number }}
                </q-td>
                <q-td key="position" :props="props">
                  {{ props.row.position }}
                </q-td>
                <q-td key="disc" :props="props">
                  {{ props.row.disc }}
                </q-td>
                <q-td key="whatsapp" :props="props">
                  {{ props.row.whatsapp }}
                </q-td>
                <q-td key="email" :props="props">
                  {{ props.row.email }}
                </q-td>
                <q-td key="action" :props="props">
                  <q-btn title="حذف" dense color="negative" icon="delete" round
                         @click="removePerson(dataPersons.indexOf(props.row))"/>
                </q-td>
              </q-tr>
            </template>


            <template v-slot:top-right>

              <q-btn label="آیتم جدید" color="primary" rounded @click="newPersonDlg = true"/>

            </template>


          </q-table>
        </div>


        <q-card-actions>
          <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
        </q-card-actions>
      </q-form>
    </q-card>

    <q-dialog v-model="newIntroducerDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card bordered>
        <q-card-section>
          <div class="text-h6">ایجاد معرف</div>
        </q-card-section>
        <q-separator inset/>
        <q-form @submit.prevent="submitFormIntroducer()">
          <q-card-section>
            <q-card-section>
              <q-input
                  v-model="introducerName"
                  label="نام معرف *"
                  outlined
                  dense
              />
              <q-input
                  v-model="introducerDescription"
                  label="توضیحات"
                  outlined
                  dense
                  type="textarea"
                  class="q-mt-sm"
                  rows="3"
              />
            </q-card-section>
          </q-card-section>
          <q-card-actions>
            <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>


    <q-dialog v-model="newPersonDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیتم جدید</div>
        </q-card-section>

        <q-card-section class="q-pt-none">

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">
              <div>
                <q-radio v-model="newPersonGender" :val="0" label="آقا"/>
                <q-radio v-model="newPersonGender" :val="1" label="خانم"/>
              </div>
              <q-input outlined v-model="newPersonName" label="نام و نام خانوادگی"/>


              <q-select
                outlined
                v-model="newPersonPosition"
                clearable
                label="سمت"
                :options="positionOptions">

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


              <q-select
                outlined
                v-model="newPersonDisc"
                clearable
                label="مدل رفتاری"
                :options="discOptions">

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

              <q-input outlined
                       dir="ltr"
                       v-model="newPersonContactNumber"
                       label="شماره تلفن همراه"/>

              <q-input outlined
                       dir="ltr"
                       label="واتس آپ"
                       v-model="newPersonWhatsapp"/>

              <q-input outlined
                       dir="ltr"
                       label="ایمیل"
                       v-model="newPersonEmail"
                       type="email"/>

            </div>
          </div>


        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :loading="loadingPersons" label="افزودن" @click="addPerson()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import {QSpinnerPuff} from 'quasar'
import {api} from 'boot/axios'

const provinces = {
  "آذربایجان شرقی": ["کشکسرای", "سهند", "سیس", "دوزدوزان", "تیمورلو", "صوفیان", "سردرود", "هادیشهر", "هشترود", "زرنق", "ترکمانچای", "ورزقان", "تسوج", "زنوز", "ایلخچی", "شرفخانه", "مهربان", "مبارک شهر", "تیکمه داش", "باسمنج", "سیه رود", "میانه", "خمارلو", "خواجه", "بناب مرند", "قره آغاج", "وایقان", "مراغه", "ممقان", "خامنه", "خسروشاه", "لیلان", "نظرکهریزی", "اهر", "بخشایش", "آقکند", "جوان قلعه", "کلیبر", "مرند", "اسکو", "شندآباد", "شربیان", "گوگان", "بستان آباد", "تبریز", "جلفا", "اچاچی", "هریس", "یامچی", "خاروانا", "کوزه کنان", "خداجو(خراجو)", "آذرشهر", "شبستر", "سراب", "ملکان", "بناب", "هوراند", "کلوانق", "ترک", "عجب شیر", "آبش احمد"],
  "آذربایجان غربی": ["تازه شهر", "نالوس", "ایواوغلی", "شاهین دژ", "گردکشانه", "باروق", "سیلوانه", "بازرگان", "نازک علیا", "ربط", "تکاب", "دیزج دیز", "سیمینه", "نوشین", "میاندوآب", "مرگنلر", "سلماس", "آواجیق", "قطور", "محمودآباد", "خوی", "نقده", "سرو", "خلیفان", "پلدشت", "میرآباد", "اشنویه", "زرآباد", "بوکان", "پیرانشهر", "چهاربرج", "قوشچی", "شوط", "ماکو", "سیه چشمه", "سردشت", "کشاورز", "فیرورق", "محمدیار", "ارومیه", "مهاباد", "قره ضیاءالدین"],
  "اردبیل": ["پارس آباد", "فخراباد", "کلور", "نیر", "اردبیل", "اسلام اباد", "تازه کندانگوت", "مشگین شهر", "جعفرآباد", "نمین", "اصلاندوز", "مرادلو", "خلخال", "کوراییم", "هیر", "گیوی", "گرمی", "لاهرود", "هشتجین", "عنبران", "تازه کند", "قصابه", "رضی", "سرعین", "بیله سوار", "آبی بیگلو"],
  "اصفهان": ["گزبرخوار", "زیار", "زرین شهر", "گلشن", "پیربکران", "خالدآباد", "سجزی", "گوگد", "تیران", "ونک", "دهق", "زواره", "کاشان", "ابوزیدآباد", "اصغرآباد", "بافران", "شهرضا", "خور", "مجلسی", "هرند", "فولادشهر", "کمشچه", "کلیشادوسودرجان", "لای بید", "قهجاورستان", "چرمهین", "رزوه", "فریدونشهر", "طرق رود", "نصرآباد", "برزک", "سفیدشهر", "سمیرم", "گلدشت", "اردستان", "جوشقان قالی", "بویین ومیاندشت", "کرکوند", "درچه", "انارک", "دولت آباد", "ایمانشهر", "گرگاب", "حسن اباد", "سده لنجان", "حبیب آباد", "بهاران شهر", "میمه", "تودشک", "گلشهر", "رضوانشهر", "داران", "علویجه", "نیک آباد", "مشکات", "آران وبیدگل", "خوانسار", "نجف آباد", "منظریه", "فرخی", "دیزیچه", "اژیه", "زاینده رود", "خورزوق", "قهدریجان", "شاهین شهر", "بهارستان", "چمگردان", "دهاقان", "برف انبار", "بادرود", "کوهپایه", "گلپایگان", "عسگران", "حنا", "کهریزسنگ", "مهاباد", "کامو و چوگان", "افوس", "زیباشهر", "کوشک", "نایین", "سین", "زازران", "مبارکه", "ورزنه", "ورنامخواست", "شاپورآباد", "فلاورجان", "وزوان", "اصفهان", "باغ بهادران", "چادگان", "دامنه", "نطنز", "محمدآباد", "نیاسر", "نوش آباد", "کمه", "جوزدان", "قمصر", "جندق", "طالخونچه", "خمینی شهر", "باغشاد", "دستگرد", "ابریشم"],
  "البرز": ["چهارباغ", "آسارا", "کرج", "طالقان", "شهرجدیدهشتگرد", "محمدشهر", "مشکین دشت", "نظرآباد", "هشتگرد", "ماهدشت", "اشتهارد", "کوهسار", "گرمدره", "تنکمان", "گلسار", "کمال شهر", "فردیس"],
  "ایلام": ["آبدانان", "شباب", "موسیان", "بدره", "ایلام", "ایوان", "مهران", "آسمان آباد", "پهله", "مهر", "سراب باغ", "بلاوه", "میمه", "دره شهر", "ارکواز", "مورموری", "توحید", "دهلران", "لومار", "چوار", "زرنه", "صالح آباد", "سرابله", "ماژین", "دلگشا"],
  "بوشهر": ["ریز", "برازجان", "بندرریگ", "اهرم", "دوراهک", "خورموج", "نخل تقی", "کلمه", "بندردیلم", "وحدتیه", "بنک", "چغادک", "بندردیر", "کاکی", "جم", "دالکی", "بندرگناوه", "آباد", "آبدان", "خارک", "شنبه", "بوشکان", "انارستان", "شبانکاره", "سیراف", "دلوار", "بردستان", "بادوله", "عسلویه", "تنگ ارم", "امام حسن", "سعد آباد", "بندرکنگان", "بوشهر", "بردخون", "آب پخش"],
  "تهران": ["شاهدشهر", "پیشوا", "جوادآباد", "ارجمند", "ری", "نصیرشهر", "رودهن", "اندیشه", "نسیم شهر", "صباشهر", "ملارد", "شمشک", "پاکدشت", "باقرشهر", "احمد آباد مستوفی", "کیلان", "قرچک", "فردوسیه", "گلستان", "ورامین", "فیروزکوه", "فشم", "پرند", "آبعلی", "چهاردانگه", "تهران", "بومهن", "وحیدیه", "صفادشت", "لواسان", "فرون اباد", "کهریزک", "رباطکریم", "آبسرد", "باغستان", "صالحیه", "شهریار", "قدس", "تجریش", "شریف آباد", "حسن آباد", "اسلامشهر", "دماوند", "پردیس"],
  "چهارمحال و بختیاری": ["وردنجان", "گوجان", "گهرو", "سورشجان", "سرخون", "شهرکرد", "منج", "بروجن", "پردنجان", "سامان", "فرخ شهر", "صمصامی", "طاقانک", "کاج", "نقنه", "لردگان", "باباحیدر", "دستنا", "سودجان", "بازفت", "هفشجان", "سردشت", "فرادبنه", "چلیچه", "بن", "فارسان", "شلمزار", "نافچ", "دشتک", "بلداجی", "آلونی", "گندمان", "جونقان", "ناغان", "هارونی", "چلگرد", "کیان", "اردل", "سفیددشت", "مال خلیفه"],
  "خراسان جنوبی": ["اسلامیه", "شوسف", "قاین", "عشق آباد", "طبس مسینا", "ارسک", "آیسک", "نیمبلوک", "دیهوک", "سربیشه", "محمدشهر", "بیرجند", "فردوس", "نهبندان", "اسفدن", "گزیک", "حاجی آباد", "سه قلعه", "آرین شهر", "مود", "خوسف", "قهستان", "بشرویه", "سرایان", "خضری دشت بیاض", "طبس", "اسدیه", "زهان"],
  "خراسان رضوی": ["بار", "نیل شهر", "جنگل", "درود", "رباط سنگ", "سلطان آباد", "فریمان", "گناباد", "کاریز", "همت آباد", "سلامی", "باجگیران", "بجستان", "چناران", "درگز", "کلات", "چکنه", "نصرآباد", "بردسکن", "مشهد", "کدکن", "نقاب", "قلندرآباد", "کاشمر", "شاندیز", "نشتیفان", "ششتمد", "شادمهر", "عشق آباد", "چاپشلو", "رشتخوار", "قدمگاه", "صالح آباد", "داورزن", "فرهادگرد", "کاخک", "مشهدریزه", "جغتای", "مزدآوند", "قوچان", "یونسی", "سنگان", "نوخندان", "کندر", "نیشابور", "احمدابادصولت", "شهراباد", "رضویه", "تربت حیدریه", "باخرز", "سفیدسنگ", "بیدخت", "تایباد", "فیروزه", "قاسم آباد", "سبزوار", "فیض آباد", "گلمکان", "لطف آباد", "شهرزو", "خرو", "تربت جام", "انابد", "ملک آباد", "بایک", "دولت آباد", "سرخس", "ریوش", "طرقبه", "خواف", "روداب", "خلیل آباد"],
  "خراسان شمالی": ["چناران شهر", "راز", "پیش قلعه", "قوشخانه", "شوقان", "اسفراین", "گرمه", "قاضی", "شیروان", "حصارگرمخان", "آشخانه", "تیتکانلو", "جاجرم", "بجنورد", "درق", "آوا", "زیارت", "سنخواست", "صفی آباد", "ایور", "فاروج", "لوجلی"],
  "خوزستان": ["هفتگل", "بیدروبه", "شاوور", "حمزه", "گتوند", "شرافت", "منصوریه", "زهره", "رامهرمز", "بندرامام خمینی", "کوت عبداله", "میداود", "چغامیش", "ملاثانی", "چم گلک", "حر", "شمس آباد", "آبژدان", "چویبده", "مسجدسلیمان", "مقاومت", "ترکالکی", "دارخوین", "سردشت", "لالی", "کوت سیدنعیم", "حمیدیه", "دهدز", "قلعه تل", "میانرود", "رفیع", "اندیمشک", "الوان", "سالند", "صالح شهر", "اروندکنار", "سرداران", "تشان", "رامشیر", "شادگان", "بندرماهشهر", "جایزان", "بستان", "ویس", "اهواز", "فتح المبین", "شهر امام", "قلعه خواجه", "حسینیه", "گلگیر", "مینوشهر", "سماله", "شوشتر", "بهبهان", "هندیجان", "ابوحمیظه", "آغاجاری", "ایذه", "صیدون", "سیاه منصور", "هویزه", "آزادی", "شوش", "دزفول", "جنت مکان", "آبادان", "گوریه", "خرمشهر", "مشراگه", "خنافره", "چمران", "امیدیه", "سوسنگرد", "شیبان", "الهایی", "باغ ملک", "صفی آباد"],
  "زنجان": ["سجاس", "زرین رود", "آب بر", "ارمغانخانه", "کرسف", "هیدج", "سلطانیه", "خرمدره", "نیک پی", "قیدار", "ابهر", "دندی", "حلب", "نوربهار", "گرماب", "چورزق", "زنجان", "سهرورد", "صایین قلعه", "ماه نشان", "زرین آباد"],
  "سمنان": ["ایوانکی", "مجن", "دامغان", "سرخه", "مهدی شهر", "شاهرود", "سمنان", "کهن آباد", "گرمسار", "کلاته خیج", "دیباج", "درجزین", "رودیان", "بسطام", "امیریه", "میامی", "شهمیرزاد", "بیارجمند", "کلاته", "آرادان"],
  "سیستان و بلوچستان": ["محمدی", "شهرک علی اکبر", "بنجار", "گلمورتی", "نگور", "راسک", "بنت", "قصرقند", "جالق", "هیدوچ", "نوک آباد", "زهک", "بمپور", "پیشین", "گشت", "محمدآباد", "زاهدان", "زابلی", "چاه بهار", "زرآباد", "بزمان", "اسپکه", "فنوج", "سراوان", "ادیمی", "زابل", "دوست محمد", "ایرانشهر", "سرباز", "سیرکان", "میرجاوه", "نصرت آباد", "سوران", "خاش", "کنارک", "محمدان", "نیک شهر"],
  "فارس": ["کازرون", "کارزین (فتح آباد)", "فدامی", "خومه زار", "سلطان شهر", "فیروزآباد", "دبیران", "باب انار", "رامجرد", "سروستان", "قره بلاغ", "ارسنجان", "دژکرد", "بیرم", "دهرم", "شیراز", "ایزدخواست", "علامرودشت", "اوز", "وراوی", "بیضا", "نی ریز", "کنارتخته", "امام شهر", "جهرم", "بابامنیر", "گراش", "فسا", "شهرپیر", "حسن اباد", "کامفیروز", "خنج", "خانه زنیان", "استهبان", "بوانات", "لطیفی", "فراشبند", "زرقان", "صغاد", "اشکنان", "قایمیه", "گله دار", "دوبرجی", "آباده طشک", "خرامه", "میمند", "افزر", "دوزه", "سیدان", "کوپن", "زاهدشهر", "قادراباد", "سده", "بنارویه", "سعادت شهر", "شهرصدرا", "سورمق", "حسامی", "جویم", "خوزی", "اردکان", "قطرویه", "نودان", "مبارک آباددیز", "داراب", "نورآباد", "کوار", "نوبندگان", "حاجی آباد", "خاوران", "مرودشت", "کوهنجان", "ششده", "مزایجان", "ایج", "خور", "نوجین", "لپویی", "بهمن", "اهل", "خشت", "مهر", "جنت شهر", "مشکان", "بالاده", "قیر", "قطب آباد", "خانیمن", "مصیری", "میانشهر", "صفاشهر", "اقلید", "عمادده", "مادرسلیمان", "داریان", "رونیز", "کره ای", "لار", "اسیر", "هماشهر", "آباده", "لامرد"],
  "قزوین": ["سگزآباد", "بیدستان", "کوهین", "رازمیان", "خرمدشت", "آبگرم", "شال", "شریفیه", "اقبالیه", "نرجه", "ارداق", "الوند", "خاکعلی", "سیردان", "ضیاڈآباد", "بویین زهرا", "محمدیه", "محمودآبادنمونه", "معلم کلایه", "اسفرورین", "آوج", "دانسفهان", "آبیک", "قزوین", "تاکستان"],
  "قم": ["کهک", "قم", "سلفچگان", "جعفریه", "قنوات", "دستجرد"],
  "کردستان": ["قروه", "توپ آغاج", "سروآباد", "بویین سفلی", "زرینه", "دلبران", "سنندج", "یاسوکند", "موچش", "بانه", "مریوان", "سریش آباد", "صاحب", "دهگلان", "بابارشانی", "دیواندره", "برده رشه", "شویشه", "بیجار", "اورامان تخت", "کانی سور", "کانی دینار", "دزج", "سقز", "بلبان آباد", "پیرتاج", "کامیاران", "آرمرده", "چناره"],
  "کرمان": ["کهنوج", "بلوک", "پاریز", "گنبکی", "زنگی آباد", "بم", "خانوک", "کیانشهر", "جوپار", "عنبرآباد", "جوزم", "نظام شهر", "لاله زار", "کشکوییه", "زیدآباد", "هنزا", "چترود", "جبالبارز", "سیرجان", "رودبار", "کرمان", "بافت", "صفاییه", "منوجان", "اندوهجرد", "هجدک", "خورسند", "امین شهر", "بردسیر", "رفسنجان", "هماشهر", "محمدآباد", "اختیارآباد", "بروات", "ریحان", "کوهبنان", "ماهان", "دوساری", "دهج", "فاریاب", "گلزار", "بهرمان", "بلورد", "فهرج", "کاظم آباد", "جیرفت", "نجف شهر", "قلعه گنج", "باغین", "بزنجان", "زرند", "نودژ", "گلباف", "راور", "خاتون اباد", "نرماشیر", "دشتکار", "مس سرچشمه", "خواجو شهر", "رابر", "راین", "درب بهشت", "یزدان شهر", "زهکلوت", "محی آباد", "مردهک", "شهداد", "ارزوییه", "نگار", "شهربابک", "انار"],
  "کرمانشاه": ["سنقر", "شاهو", "بانوره", "تازه آباد", "هلشی", "جوانرود", "قصرشیرین", "نوسود", "کرند", "کوزران", "بیستون", "حمیل", "گیلانغرب", "سطر", "روانسر", "پاوه", "ازگله", "کرمانشاه", "میان راهان", "کنگاور", "سرپل ذهاب", "ریجاب", "باینگان", "هرسین", "اسلام آبادغرب", "سرمست", "سومار", "نودشه", "گهواره", "رباط", "صحنه", "گودین"],
  "کهگیلویه وبویراحمد": ["گراب سفلی", "لنده", "سی سخت", "دهدشت", "یاسوج", "سرفاریاب", "دوگنبدان", "چیتاب", "لیکک", "دیشموک", "مادوان", "باشت", "پاتاوه", "قلعه رییسی", "مارگون", "چرام", "سوق"],
  "گلستان": ["سیمین شهر", "مزرعه", "رامیان", "فراغی", "گنبدکاووس", "کردکوی", "مراوه", "بندرترکمن", "نگین شهر", "آق قلا", "سرخنکلاته", "گالیکش", "سنگدوین", "دلند", "بندرگز", "نوده خاندوز", "مینودشت", "گرگان", "گمیش تپه", "علی اباد", "خان ببین", "کلاله", "اینچه برون", "فاضل آباد", "تاتارعلیا", "نوکنده", "آزادشهر", "انبارآلوم", "جلین"],
  "گیلان": ["منجیل", "شلمان", "خشکبیجار", "ماکلوان", "سنگر", "مرجقل", "لیسار", "رضوانشهر", "رحیم آباد", "لوندویل", "احمدسرگوراب", "لوشان", "اطاقور", "لشت نشاء", "فومن", "چوبر", "بازار جمعه", "کلاچای", "بندرانزلی", "املش", "رستم آباد", "لاهیجان", "توتکابن", "لنگرود", "کوچصفهان", "صومعه سرا", "اسالم", "دیلمان", "رودسر", "کیاشهر", "شفت", "رودبار", "کومله", "رشت", "ماسوله", "خمام", "ماسال", "واجارگاه", "هشتپر (تالش)", "پره سر", "بره سر", "آستارا", "رودبنه", "جیرنده", "چاف و چمخاله", "لولمان", "گوراب زرمیخ", "حویق", "سیاهکل", "چابکسر", "آستانه اشرفیه", "رانکوه"],
  "لرستان": ["چالانچولان", "بیران شهر", "ویسیان", "شول آباد", "پلدختر", "کوهدشت", "هفت چشمه", "بروجرد", "الشتر", "مومن آباد", "دورود", "زاغه", "چقابل", "الیگودرز", "معمولان", "کوهنانی", "نورآباد", "سپیددشت", "سراب دوره", "ازنا", "گراب", "خرم آباد", "اشترینان", "فیروزآباد", "درب گنبد"],
  "مازندران": ["گلوگاه", "گلوگاه", "پل سفید", "دابودشت", "چالوس", "کیاسر", "بهنمیر", "تنکابن", "کلاردشت", "ایزدشهر", "گتاب", "سلمان شهر", "ارطه", "امیرکلا", "کوهی خیل", "پایین هولار", "گزنک", "محمودآباد", "رامسر", "نوشهر", "خلیل شهر", "کیاکلا", "نور", "مرزیکلا", "فریدونکنار", "زیرآب", "امامزاده عبدالله", "هچیرود", "فریم", "هادی شهر", "نشتارود", "پول", "بهشهر", "کلارآباد", "بلده", "بابل", "جویبار", "آلاشت", "آمل", "نکا", "کتالم وسادات شهر", "بابلسر", "شیرود", "شیرگاه", "رویان", "زرگرمحله", "عباس اباد", "قایم شهر", "خوش رودپی", "مرزن آباد", "ساری", "رینه", "سرخرود", "خرم آباد", "کجور", "رستمکلا", "سورک", "چمستان"],
  "مرکزی": ["آستانه", "خنجین", "نراق", "کمیجان", "آشتیان", "رازقان", "مهاجران", "غرق آباد", "خنداب", "قورچی باشی", "خشکرود", "ساروق", "محلات", "شازند", "ساوه", "میلاجرد", "تفرش", "زاویه", "اراک", "توره", "نوبران", "فرمهین", "دلیجان", "پرندک", "کارچان", "نیمور", "هندودر", "آوه", "جاورسیان", "خمین", "مامونیه", "داودآباد", "شهباز"],
  "هرمزگان": ["بیکاء", "تیرور", "گروک", "قشم", "کوشکنار", "کیش", "سرگز", "بندرعباس", "زیارتعلی", "سندرک", "کوهستک", "لمزان", "رویدر", "قلعه قاضی", "فارغان", "ابوموسی", "هشتبندی", "سردشت", "درگهان", "پارسیان", "کنگ", "جناح", "تازیان پایین", "دهبارز", "میناب", "سیریک", "سوزا", "خمیر", "چارک", "حاجی اباد", "فین", "بندرجاسک", "گوهران", "هرمز", "دشتی", "بندرلنگه", "بستک", "تخت"],
  "همدان": ["زنگنه", "دمق", "سرکان", "آجین", "جورقان", "برزول", "فامنین", "سامن", "بهار", "فرسفج", "شیرین سو", "مریانج", "فیروزان", "قروه درجزین", "ازندریان", "لالجین", "گل تپه", "گیان", "ملایر", "صالح آباد", "تویسرکان", "اسدآباد", "همدان", "نهاوند", "رزن", "جوکار", "مهاجران", "کبودرآهنگ", "قهاوند"],
  "یزد": ["مروست", "مهردشت", "حمیدیا", "تفت", "اشکذر", "ندوشن", "یزد", "عقدا", "بهاباد", "ابرکوه", "زارچ", "نیر", "اردکان", "هرات", "بفروییه", "شاهدیه", "بافق", "خضرآباد", "میبد", "مهریز", "احمدآباد"],
};


export default {
  name: "CustomerCreate",
  watch: {
    province: function (e) {
      const collator = new Intl.Collator('fa');
      if (provinces[e] !== undefined) {
        this.cityOptions = provinces[e].sort(collator.compare);
        this.customerCity = ''
      }
    },
    CommunicationWays: function (e) {
      // console.log(e)

      if (e.includes('ایتا')) {
        this.showcustomerEitaa = true
      } else {
        this.showcustomerEitaa = false
      }
      if (e.includes('واتس آپ')) {
        this.showcustomerWhatsapp = true
      } else {
        this.showcustomerWhatsapp = false
      }
      if (e.includes('تلگرام')) {
        this.showcustomerTelegram = true
      } else {
        this.showcustomerTelegram = false
      }
      if (e.includes('اینستاگرام')) {
        this.showcustomerInstagram = true
      } else {
        this.showcustomerInstagram = false
      }
      if (e.includes('ایمیل')) {
        this.showcustomerEmail = true
      } else {
        this.showcustomerEmail = false
      }
      if (e.includes('وب سایت')) {
        this.showcustomerWebSite = true
      } else {
        this.showcustomerWebSite = false
      }
    }
  },
  data() {
    return {
      province: '',
      customerCity: '',
      cityOptions: [],
      provincesOptions: [
        "آذربایجان شرقی",
        "آذربایجان غربی",
        "اردبیل",
        "اصفهان",
        "البرز",
        "ایلام",
        "بوشهر",
        "تهران",
        "چهارمحال و بختیاری",
        "خراسان جنوبی",
        "خراسان رضوی",
        "خراسان شمالی",
        "خوزستان",
        "زنجان",
        "سمنان",
        "سیستان و بلوچستان",
        "فارس",
        "قزوین",
        "قم",
        "کردستان",
        "کرمان",
        "کرمانشاه",
        "کهگیلویه وبویراحمد",
        "گلستان",
        "گیلان",
        "لرستان",
        "مازندران",
        "مرکزی",
        "هرمزگان",
        "همدان",
        "یزد"
      ],
      customerType: 0,
      customerGender: 0,
      customerName: '',
      customerJob: '',
      customerJobAddress: '',
      customerBirthdate: '',
      customerMarriageDate: '',
      customerCategory: null,
      customerLandlineNumber: '',
      customerContactNumber: '',
      customerContactNumber1: '',
      customerContactNumber2: '',
      customerDisc: '',

      introducer: null,
      introducerOptions: [],
      introducers: [],

      customerDescription: '',
      postalCode: '',
      address: '',
      nationalCode: '',

      CommunicationWays: [],
      customerEitaa: '',
      customerEmail: '',
      customerWhatsapp: '',
      customerTelegram: '',
      customerInstagram: '',
      showcustomerEmail: false,
      showNewInput: false,
      showNewInput1: false,
      showcustomerEitaa: false,
      showcustomerWhatsapp: false,
      showcustomerTelegram: false,
      showcustomerInstagram: false,
      showcustomerWebSite: false,
      customerWebSite: '',


      newPersonGender: 0,
      newPersonName: '',
      newPersonContactNumber: '',
      newPersonPosition: '',
      newPersonDisc: null,
      newPersonWhatsapp: '',
      newPersonEmail: '',


      customerCategories: [],
      customerCategoryOptions: [],

      discOptions: ['D', 'I', 'S', 'C'],
      positionOptions: ['مدیر عامل', 'مدیر فروش', 'مدیر IT', 'کارشناس فروش', 'مدیر داخلی', 'مدیر اجرایی', 'حسابدار', 'شریک تجاری'],
      communicationOptions: ['ایتا', 'واتس آپ', 'تلگرام', 'اینستاگرام', 'ایمیل', 'وب سایت'],


      columnsPersons: [
        {name: 'name', align: 'center', label: 'نام', field: 'name'},
        {name: 'contact_number', align: 'center', label: 'تلفن تماس', field: 'contact_number'},
        {name: 'position', align: 'center', label: 'سمت', field: 'position'},
        {name: 'disc', align: 'center', label: 'مدل رفتاری', field: 'disc'},
        {name: 'whatsapp', align: 'center', label: 'واتساپ', field: 'whatsapp'},
        {name: 'email', align: 'center', label: 'ایمیل', field: 'email'},
        {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
      ],
      dataPersons: [],
      newPersonDlg: false,
      loadingPersons: false,

      newIntroducerDlg: false,
      introducerName: null,
      introducerDescription: null,
    }
  },
  methods: {
    toggleNewInput() {
      this.showNewInput = !this.showNewInput;
    },
    toggleNewInput2() {
      this.showNewInput1 = !this.showNewInput1;

    },
    toggleMinusInput() {
      this.showNewInput = !this.showNewInput;
      this.leadContactNumber1 = null;
    },
    toggleMinusInput1() {
      this.showNewInput1 = !this.showNewInput1;
      this.leadContactNumber2 = null;
    },
    addPerson() {
      this.newPersonDlg = false
      this.loadingPersons = true

      setTimeout(() => {
        let newPerson = {
          gender: this.newPersonGender,
          name: this.newPersonName,
          contact_number: this.newPersonContactNumber,
          position: this.newPersonPosition,
          disc: this.newPersonDisc,
          whatsapp: this.newPersonWhatsapp,
          email: this.newPersonEmail,
        }

        this.dataPersons.push(newPerson)

        this.newPersonGender = 0;
        this.newPersonName = '';
        this.newPersonContactNumber = '';
        this.newPersonPosition = '';
        this.newPersonDisc = null;
        this.newPersonWhatsapp = '';
        this.newPersonEmail = '';

        this.loadingPersons = false
      }, 500)
    },
    removePerson(index) {
      this.loadingPersons = true
      setTimeout(() => {
        this.dataPersons = [...this.dataPersons.slice(0, index), ...this.dataPersons.slice(index + 1)]
        this.loadingPersons = false
      }, 500)
    },

    getCategories() {
      api.get('customers/categories/list')
        .then(response => {
          this.customerCategories = response.data.data
          this.customerCategoryOptions = response.data.data
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },

    getIntroducers() {
      api.get('referrers/list')
          .then(response => {
            this.introducers = response.data.data
            this.introducerOptions = response.data.data
          })
          .finally(() => {
            this.$q.loading.hide();
          })
    },


    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};


      if (this.customerCategory !== null && this.customerCategory.id !== undefined)
        payload.category = this.customerCategory.id

      payload.national_code = this.nationalCode
      payload.postal_code = this.postalCode
      payload.address = this.address

      payload.type = this.customerType
      payload.gender = this.customerGender
      payload.name = this.customerName
      payload.job = this.customerJob
      payload.job_address = this.customerJobAddress
      payload.birth_date = this.customerBirthdate
      payload.marriage_date = this.customerMarriageDate
      payload.province = this.province
      payload.city = this.customerCity
      payload.email = this.customerEmail
      payload.landline_number = this.customerLandlineNumber
      payload.contact_number = this.customerContactNumber
      payload.contact_number1 = this.customerContactNumber1
      payload.contact_number2 = this.customerContactNumber2
      payload.communicate = this.CommunicationWays
      payload.disc = this.customerDisc
      payload.eitaa = this.customerEitaa
      payload.whatsapp = this.customerWhatsapp
      payload.telegram = this.customerTelegram
      payload.instagram = this.customerInstagram
      payload.website = this.customerWebSite
      payload.description = this.customerDescription

      if (this.introducer !== null && this.introducer.id !== undefined)
        payload.referrer = this.introducer.id

      payload.persons = this.dataPersons;

      api.post('customers/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.dataPersons = [];


          this.customerType = 0;
          this.customerGender = 0;
          this.customerName = '';
          this.customerJob = null;
          this.customerJobAddress = '';
          this.customerBirthdate = '';
          this.customerMarriageDate = '';
          this.customerCategory = null;
          this.province = '';
          this.customerCity = '';
          this.nationalCode = '';
          this.postalCode = '';
          this.address = '';
          this.customerContactNumber1 = '';
          this.customerContactNumber2 = '';
          this.CommunicationWays = '';
          this.customerEitaa = '';
          this.customerEmail = '';
          this.customerWebSite = '';
          this.customerLandlineNumber = '';
          this.customerContactNumber = '';
          this.customerDisc = '';
          this.customerWhatsapp = '';
          this.customerTelegram = '';
          this.customerInstagram = '';
          this.customerDescription = '';
          this.introducer = '';

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },

    submitFormIntroducer() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const payload = {
        name: this.introducerName,
        description: this.introducerDescription
      }

      api.post('referrers/store', payload)
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })
          })

          .then(() => {
            this.introducerName = '';
            this.introducerDescription = '';
            this.getIntroducers();
            this.newIntroducerDlg = false
          })
          .finally(() => {
            this.$q.loading.hide();
          });
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.customerCategoryOptions = this.customerCategories
          this.introducerOptions = this.introducers
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.customerCategoryOptions = this.customerCategories.filter(v => v.title.toLowerCase().indexOf(needle) > -1)
        this.introducerOptions = this.introducers.filter(v => v.title.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getCategories();
    this.getIntroducers();

  }

}
</script>

<style scoped>

</style>
