<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست درخواست ها</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
          :loading="loading"
          flat bordered class="border-radius-table"
          :rows="rows"
          :filter="filter"
          :columns="columns"
          :rows-per-page-options="[10]"
        >

          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
          </template>

          <template v-slot:top-right="props">
            <div class="q-gutter-sm">
              <q-btn
                round
                color="info"
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
              />
              <q-btn
                round
                color="negative"
                size="13px"
                icon="ti-export"
                @click="exportTable()"/>
            </div>
          </template>


          <template v-slot:top-left>
            <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="sabtKonande" :props="props">
                {{ props.row.sabtKonande }}
              </q-td>
              <q-td key="customer_name" :props="props">
                <q-btn
                  @click.prevent="openCustomerInfo(props.row.customer)"
                  :label="props.row.customer.name" dense flat/>
                <div v-if="props.row.intake_form">
                  <q-badge class="cursor-pointer"
                           :color="props.row.intake_form.is_submitted ? 'positive' : 'orange'"
                           :label="props.row.intake_form.is_submitted ? 'فرم اولیه تکمیل شد' : 'در انتظار تکمیل فرم توسط مشتری'"
                           @click="showIntakeForm(props.row)"/>
                  <q-icon v-if="props.row.intake_form.is_submitted && !props.row.intake_form.seen_at"
                          name="notifications_active" color="negative" size="18px" class="q-ml-xs" title="فرم جدید، هنوز بررسی نشده"/>
                </div>
              </q-td>
              <q-td key="referrer_percent" :props="props">
                <template v-if="props.row.customer && props.row.customer.referrer_id">
                  <referrer-percent-edit
                    v-model="props.row.referrer_percent"
                    endpoint="automation/referrer-percent"
                    :payload="{ id: props.row.id }"
                    hint="فقط برای همین پروژه اعمال می‌شود"
                    @saved="data => props.row.referrer_income = data.referrer_income"
                  />
                  <div v-if="props.row.referrer_income" class="text-caption text-positive">
                    {{ Number(props.row.referrer_income).toLocaleString('en-US') }} تومان
                  </div>
                </template>
                <span v-else>-</span>
              </q-td>
              <q-td key="survey_type" :props="props">
                <q-badge v-if="props.row.survey_type" :color="surveyTypeColor(props.row.survey_type)">
                  {{ surveyTypeLabel(props.row.survey_type) }}
                </q-badge>
                <span v-else>-</span>
              </q-td>
              <q-td key="date" :props="props">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="vazieat" :props="props">
                <q-btn v-if="userRole === 0 || userRole === 1" @click="acceptRow(props.row)" color="positive"
                       icon="task_alt" rounded
                       dense/>
                <!--                <q-btn class="q-mx-sm" v-if="userRole === 0 || userRole === 1" @click="cancelRow(props.row)" color="negative" icon="eva-close-circle-outline" rounded-->
                <!--                       dense/>-->

                <q-badge v-else label="در انتظار بررسی حسابداری" color="orange"/>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn
                  @click.prevent="showSurveyForm(props.row.id)"
                  title="نمایش فرم بازدید" dense round color="brown" icon="assignment"/>
                <q-btn
                  @click.prevent="showComments(props.row.id)"
                  title="کامنت ها" dense round color="blue" icon="forum">
                  <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                    {{ props.row.commentsCount }}
                  </q-badge>
                </q-btn>

                <!--                <q-btn :href="'/v1/print/' + props.row.id" target="_blank" title="پرینت" dense round-->
                <!--                       color="positive" icon="print"/>-->
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                       :to="{ name:'EditAutomation',params:{id:props.row.id} }"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id)"/>
              </q-td>
            </q-tr>
          </template>


        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="deleteConfirmDialog"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیا از حذف این آیتم اطمینان دارید؟</div>
        </q-card-section>

        <q-card-section class="row items-center">
          <q-select
            option-label="title"
            option-value="id"
            outlined
            clearable
            v-model="failure"
            label=" علت شکست"
            :options="failureAutomationOptions"
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
              <q-btn @click.prevent="newFailureDlg = true"
                     icon="eva-plus-circle-outline" dense flat
                     rounded/>
            </template>
          </q-select>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded @click.prevent="deleteItem()" label="تایید"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ============ دیالوگ ثبت پیش فاکتور ============ -->
    <q-dialog v-model="acceptRowDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              persistent
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big2">
        <q-card-section>
          <div class="text-h6">ثبت پیش فاکتور</div>
          <div class="text-caption text-grey">
            مشتری: {{ selectedInvoice?.customer?.name }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section style="max-height: 60vh" class="scroll">
          <div v-if="productsLoading || invoiceItemsLoading" class="text-center q-pa-md">
            <q-spinner color="primary" size="2em"/>
          </div>

          <div v-else class="q-gutter-y-md">
            <div
              v-for="(item, index) in invoiceItems"
              :key="item.uid"
              class="row q-col-gutter-sm items-center"
            >
              <div class="col-md-4 col-xs-12">
                <q-select
                  dense outlined
                  option-label="name"
                  option-value="id"
                  use-input
                  v-model="item.product"
                  label="محصول"
                  :options="productsFilteredOptions"
                  @filter="filterProducts"
                  @update:model-value="onProductSelected(item)"
                >
                  <template v-slot:after>
                    <q-btn @click.prevent="newProductDlg = true" icon="eva-plus-circle-outline" dense flat rounded/>
                  </template>

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">یافت نشد</q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

              <div class="col-md-2 col-xs-6">
                <q-input
                  dense outlined type="number" min="1"
                  v-model.number="item.count"
                  label="تعداد"
                >
                  <template v-slot:append>
                    <span
                      style="font-size: 12px">{{ item.product && item.product.unit ? item.product.unit.title : 'عدد' }}</span>
                  </template>
                </q-input>
              </div>

              <div class="col-md-3 col-xs-6">
                <q-input
                  dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                  v-model.number="item.price"
                  label="مبلغ واحد"
                >
                  <template v-slot:append>
                    <q-btn
                      v-if="item.product"
                      dense flat round size="sm"
                      color="primary"
                      icon="payments"
                      @click.stop
                    >
                      <q-tooltip>مشاهده قیمت‌های محصول</q-tooltip>
                      <q-menu anchor="bottom right" self="top right">
                        <q-list style="min-width: 220px">
                          <q-item-label header>انتخاب قیمت محصول</q-item-label>

                          <q-item
                            clickable v-close-popup
                            @click="item.price = item.product.purchase_price"
                          >
                            <q-item-section>
                              <q-item-label>قیمت همکاری</q-item-label>
                              <q-item-label caption>
                                {{ moneyFormat(item.product.purchase_price) }} تومان
                              </q-item-label>
                            </q-item-section>
                          </q-item>

                          <q-separator/>

                          <q-item
                            clickable v-close-popup
                            @click="item.price = item.product.selling_price"
                          >
                            <q-item-section>
                              <q-item-label>قیمت فروش</q-item-label>
                              <q-item-label caption>
                                {{ moneyFormat(item.product.selling_price) }} تومان
                              </q-item-label>
                            </q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </template>
                </q-input>
              </div>

              <div class="col-md-2 col-xs-6 text-caption text-grey">
                {{ moneyFormat((item.count || 0) * (item.price || 0)) }} تومان
              </div>

              <div class="col-md-1 col-xs-6 text-left">
                <q-btn
                  dense round flat color="negative" icon="delete"
                  :disable="invoiceItems.length === 1"
                  @click="removeInvoiceItem(index)"
                />
              </div>
            </div>

            <div class="row justify-start q-mt-sm">
              <q-btn
                icon="add"
                color="primary"
                outline
                rounded
                dense
                @click="addInvoiceItem()"
              />
            </div>
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section class="row justify-end">
          <div class="text-subtitle1">
            جمع کل: <strong>{{ moneyFormat(totalInvoicePrice) }}</strong> تومان
          </div>
        </q-card-section>

        <q-card-section class="row justify-end">
          <div class="col-12 q-gutter-y-md">

            <q-input
              label="توضیحات بیشتر"
              v-model="description"
              outlined
              type="textarea"
              autogrow
            />

          </div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup @click="resetInvoiceDialog()"/>
          <q-btn color="accent" rounded :loading="acceptingInvoice" label="ثبت پیش فاکتور و تایید"
                 @click="submitInvoice()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showCommentsDlg">
      <q-card style="width: 800px; max-width: 90vw;">
        <q-card-section>

          <q-table
            :loading="commentsLoading"
            binary-state-sort
            :rows="commentsRows"
            title="کامنت ها"

            :columns="commentsColumns"
            :rows-per-page-options="[0]"
          >

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:top-right>
              <q-btn @click="newCommentDlg = true;" title="کامنت جدید" dense color="indigo"
                     icon="eva-plus-outline" round/>
            </template>


            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="user" :props="props">
                  {{ props.row.user.name }}
                </q-td>
                <q-td key="content" :props="props">
                  {{ props.row.content }}
                </q-td>
                <q-td key="date" :props="props">
                  {{ props.row.jalali_date }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteCommentConfirmation(props.row.id)"/>
                </q-td>
              </q-tr>
            </template>


          </q-table>

        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="newCommentDlg">
      <q-card style="width: 500px; max-width: 90vw;">

        <q-card-section>
          <div class="text-h6 q-mb-lg">کامنت جدید</div>
          <div class="q-gutter-md">
            <q-input
              outlined
              v-model="newCommentContent"
              autogrow/>
          </div>
        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" label="لغو" v-close-popup/>
          <q-btn color="teal" @click.prevent="createComment" label="افزودن"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteCommentConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteCommentItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newFailureDlg">
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ایجاد دلایل شکست</div>
        </q-card-section>
        <q-separator inset/>
        <q-form @submit.prevent="submitFormFailure()">
          <q-card-section>
            <div class="row justify-around q-gutter-md">
              <div class="col-md-11 col-xs-12">
                <q-input outlined v-model="titleFailure" label="عنوان"/>
              </div>
              <div class="col-md-11 col-xs-12">
                <q-input
                  label="توضیحات"
                  v-model="descriptionFailure"
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
    </q-dialog>
    <q-dialog v-model="newProductDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewProduct()">
          <q-card-section>
            <div class="text-h6">ایجاد محصول جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="row q-col-gutter-md">
              <div class="col-md-6 col-xs-12 q-gutter-y-md">
                <q-input outlined v-model="newProductName" label="نام"/>

                <q-field
                  dir="ltr"
                  suffix="تومان"
                  label="قیمت همکاری"
                  input-class="text-right"
                  outlined
                  v-model="newProductPurchasePrice">

                  <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                    <input :id="id" class="q-field__input text-right" :value="modelValue"
                           @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                           v-show="floatingLabel">
                  </template>
                </q-field>


              </div>
              <div class="col-md-6 col-xs-12 q-gutter-y-md">
                <q-input
                  min="0"
                  suffix="عدد"
                  dir="ltr"
                  type="number" outlined v-model.number="newProductFirstInventory" label="موجودی اولیه"
                  input-class="text-right"/>

                <q-field
                  dir="ltr"
                  suffix="تومان"
                  label="قیمت فروش"
                  input-class="text-right"
                  outlined
                  v-model="newProductSellingPrice">

                  <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                    <input :id="id" class="q-field__input text-right" :value="modelValue"
                           @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                           v-show="floatingLabel">
                  </template>
                </q-field>

              </div>

              <div class="col-12">
                <q-input
                  label="توضیحات بیشتر"
                  v-model="newDescription"
                  outlined
                  autogrow
                />
              </div>
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center" class="q-py-md">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded type="submit" label="ثبت"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>


    <survey-view-dialog v-model="surveyViewDlg" :automation-id="surveyViewAutomationId"/>
    <intake-form-dialog v-model="intakeFormDlg" :automation-id="intakeFormAutomationId" @seen="markIntakeSeen"/>
    <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>

  </q-page>
</template>

<script>
import {exportFile, LocalStorage, QSpinnerPuff} from 'quasar'
import {VMoney} from "v-money";
import {api} from 'boot/axios'
import SurveyViewDialog from "components/SurveyViewDialog.vue";
import IntakeFormDialog from "components/IntakeFormDialog.vue";
import PreInvoiceItemsDialog from "components/PreInvoiceItemsDialog.vue";
import CustomerInfoDialog from "components/CustomerInfoDialog.vue";
import ReferrerPercentEdit from "components/ReferrerPercentEdit.vue";

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0
    ? formatFn(val)
    : val
  formatted = formatted === void 0 || formatted === null
    ? ''
    : String(formatted)
  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

// یک آیتم خالی برای پیش فاکتور
function emptyInvoiceItem() {
  return {
    uid: Math.random().toString(36).slice(2),
    product: null,
    count: 1,
    price: null
  }
}

export default {
  name: "ListRequest",
  components: {ReferrerPercentEdit, CustomerInfoDialog, PreInvoiceItemsDialog, SurveyViewDialog, IntakeFormDialog},
  directives: {money: VMoney},
  data() {
    return {
      intakeFormDlg: false,
      intakeFormAutomationId: '',
      customerInfoDlg: false,
      customerInfoTarget: null,

      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },

      // ---------- نمایش فرم بازدید ----------
      surveyViewDlg: false,
      surveyViewAutomationId: '',

      focusedAutomationId: '',

      description: '',
      newFailureDlg: false,
      titleFailure: '',
      descriptionFailure: '',
      userRole: Number(LocalStorage.getItem('role')),
      commentsRows: [],
      commentsColumns: [
        {name: 'user', field: 'user', align: 'center', label: 'کاربر'},
        {name: 'content', field: 'content', align: 'center', label: 'متن'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ'},
        {name: 'operation', field: 'operation', align: 'center', label: 'عملیات'},
      ],

      newProductDlg: false,
      newProductName: '',
      newProductPurchasePrice: 0,
      newProductFirstInventory: 0,
      newProductSellingPrice: 0,
      newDescription: '',

      newCommentDlg: false,
      newCommentContent: '',
      commentForUUID: '',

      deleteCommentConfirmDialog: false,
      itemCommentFocusingId: '',
      showCommentsDlg: false,
      commentsLoading: false,
      acceptRowDlg: false,
      cancelRowDlg: false,
      acceptingInvoice: false,
      cancelingInvoice: false,
      filter: '',
      failureAutomation: [],
      failureAutomationOptions: [],
      failure: null,
      Text_canceling: '',

      selectedInvoice: null,

      // ---------- پیش فاکتور ----------
      products: [],
      productsFilteredOptions: [],
      productsLoading: false,
      invoiceItemsLoading: false,
      invoiceItems: [emptyInvoiceItem(), emptyInvoiceItem(), emptyInvoiceItem()],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'sabtKonande', align: 'center', label: 'ثبت شده توسط'},
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'referrer_percent', field: 'referrer_percent', align: 'center', label: 'درصد معرف'},
        {name: 'survey_type', field: 'survey_type', align: 'center', label: 'نوع کارشناسی'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'vazieat', field: 'vazieat', align: 'center', label: 'وضعیت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: []
    }
  },
  watch: {
    invoiceItems(e) {
      console.log(e)
    }
  },
  computed: {
    totalInvoicePrice() {
      return this.invoiceItems.reduce(
        (sum, item) => sum + ((item.count || 0) * (item.price || 0)),
        0
      )
    }
  },
  methods: {
    // نمایش فرم اولیه‌ای که مشتری تکمیل کرده است
    // فرم تکمیل شده همان فرم بازدید درخواست است؛ در غیر این صورت وضعیت لینک (کپی/ارسال مجدد) نمایش داده می‌شود
    showIntakeForm(row) {
      if (row.intake_form.is_submitted) {
        this.showSurveyForm(row.id)
        if (!row.intake_form.seen_at) {
          api.get('automation/intake-form/' + row.id).then(() => this.markIntakeSeen(row.id))
        }
        return
      }
      this.intakeFormAutomationId = row.id
      this.intakeFormDlg = true
    },
    markIntakeSeen(automationId) {
      const row = this.rows.find(r => r.id === automationId)
      if (row && row.intake_form && !row.intake_form.seen_at) row.intake_form.seen_at = new Date().toISOString()
    },
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
    },
    submitNewProduct() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.name = this.newProductName
      payload.purchasePrice = this.newProductPurchasePrice
      payload.firstInventory = this.newProductFirstInventory
      payload.sellingPrice = this.newProductSellingPrice
      payload.description = this.newDescription

      api.post('products/store', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.getProducts();
          this.newProductName = ''
          this.newProductPurchasePrice = 0
          this.newProductFirstInventory = 0
          this.newProductSellingPrice = 0
          this.newDescription = ''
          this.newProductDlg = false

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });

    },

    // ---------- نمایش فرم بازدید ----------
    showSurveyForm(id) {
      this.surveyViewAutomationId = id
      this.surveyViewDlg = true
    },

    surveyTypeLabel(type) {
      if (type === 1) return 'خانگی'
      if (type === 2) return 'صنعتی'
      if (type === 3) return 'ثبت شده از مشتری'
      return '-'
    },
    surveyTypeColor(type) {
      if (type === 1) return 'teal'
      if (type === 2) return 'deep-orange'
      if (type === 3) return 'purple'
      return 'grey'
    },
    //____________ایجاد دلایل شکست____________
    submitFormFailure() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleFailure
      postData.description = this.descriptionFailure

      api.post('failure/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .then(() => {
          this.titleFailure = '';
          this.descriptionFailure = '';
          this.getFailure();
        })
        .finally(() => {
          this.newFailureDlg = false
          this.$q.loading.hide();
        });
    },
    getFailure() {
      api.get('failure/list')
        .then(response => {
          this.failureAutomation = response.data.data
          this.failureAutomationOptions = response.data.data
        })
        .finally(() => {
          this.$q.loading.hide();
        })
    },

    getData() {
      this.loading = true
      api.get('automation/list/0')
        .then(response => {
          this.rows = response.data.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        });
    },

    // ---------- پیش فاکتور ----------
    getProducts() {
      this.productsLoading = true
      return api.get('products/list')
        .then(response => {
          this.products = response.data.data
          this.productsFilteredOptions = response.data.data
        })
        .finally(() => {
          this.productsLoading = false
        })
    },

    filterProducts(val, update) {
      if (val === '') {
        update(() => {
          this.productsFilteredOptions = this.products
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.productsFilteredOptions = this.products.filter(
          p => p.name.toLowerCase().indexOf(needle) > -1
        )
      })
    },

    // در صورتی که محصول قیمت پیش‌فرض داشته باشد (قیمت فروش)، خودکار در فیلد مبلغ قرار می‌گیرد
    onProductSelected(item) {
      if (item.product && item.product.selling_price && !item.price) {
        item.price = item.product.selling_price
      }
    },

    addInvoiceItem() {
      this.invoiceItems.push(emptyInvoiceItem())
    },

    removeInvoiceItem(index) {
      if (this.invoiceItems.length === 1) return
      this.invoiceItems.splice(index, 1)
    },

    resetInvoiceDialog() {
      this.invoiceItems = [emptyInvoiceItem(), emptyInvoiceItem(), emptyInvoiceItem()]
      this.selectedInvoice = null
    },

    validateInvoiceItems() {
      for (const item of this.invoiceItems) {
        if (!item.product) {
          this.$q.notify({type: 'negative', position: 'bottom', message: 'محصول را برای همه آیتم ها انتخاب کنید'})
          return false
        }
        if (!item.count || item.count <= 0) {
          this.$q.notify({type: 'negative', position: 'bottom', message: 'تعداد باید بزرگتر از صفر باشد'})
          return false
        }
        if (item.price === null || item.price === undefined || item.price < 0) {
          this.$q.notify({type: 'negative', position: 'bottom', message: 'مبلغ را برای همه آیتم ها وارد کنید'})
          return false
        }
      }
      return true
    },

    acceptRow(invoice) {
      this.selectedInvoice = invoice
      this.invoiceItems = [emptyInvoiceItem(), emptyInvoiceItem(), emptyInvoiceItem()]
      this.acceptRowDlg = true;

      const ensureProducts = this.products.length === 0
        ? this.getProducts()
        : Promise.resolve()

      this.invoiceItemsLoading = true
      ensureProducts
        .then(() => this.loadExistingInvoiceItems(invoice.id))
        .finally(() => {
          this.invoiceItemsLoading = false
        })
    },

    // آیتم های قبلاً ثبت شده برای این پیش فاکتور (در صورت وجود) را واکشی و در فرم قرار می‌دهد
    loadExistingInvoiceItems(automationId) {
      return api.get('automation/' + automationId)
        .then(response => {
          const orders = response.data.data?.orders || []

          if (orders.length > 0) {
            this.invoiceItems = orders.map(order => this.mapOrderToInvoiceItem(order))
          }
        })
        .catch(() => {
          // در صورت خطا در واکشی آیتم های قبلی، همان آیتم های خالی پیش‌فرض باقی می‌ماند
        })
    },

    // تبدیل آیتم دریافتی از سرور به فرمت مورد استفاده در فرم پیش فاکتور
    mapOrderToInvoiceItem(order) {
      let product = order.product || null

      if (product && product.id !== undefined && product.id !== null) {
        const matchedProduct = this.products.find(p => p.id === product.id)
        if (matchedProduct) product = matchedProduct
      } else if (order.product_name) {
        product = {id: null, name: order.product_name}
      }

      return {
        uid: Math.random().toString(36).slice(2),
        product: product,
        count: order.count,
        price: order.price
      }
    },

    // cancelRow(invoice) {
    //   this.selectedInvoice = invoice
    //   this.cancelRowDlg = true;
    // },

    submitInvoice() {
      if (!this.validateInvoiceItems()) return

      this.acceptingInvoice = true;

      const orders = this.invoiceItems.map(item => ({
        orderProductId: item.product.id,
        orderPrice: item.price,
        orderCount: item.count,
      }))

      const payload = {
        id: this.selectedInvoice.id,
        description: this.description,
        orders: orders
      }

      api.post('automation/accept', payload)
        .then(() => {
          this.$q.notify({
            message: 'پیش فاکتور با موفقیت ثبت و درخواست تایید شد',
            type: 'positive'
          })

          this.getData();
          this.acceptRowDlg = false;
          this.resetInvoiceDialog();
        })
        .finally(() => {
          this.acceptingInvoice = false;
        });
    },
    // cancelInvoice() {
    //   this.cancelingInvoice = true;
    //   api.get('automation/cancel/' + this.selectedInvoice.id)
    //       .then(response => {
    //         this.cancelingInvoice = false;
    //         this.cancelRowDlg = false;
    //         this.$q.notify({
    //           message: 'با موفقیت به مرحله اول برگشت داده شد',
    //           type: 'positive'
    //         })
    //
    //         this.getData();
    //
    //       })
    //       .catch(() => {
    //         this.cancelingInvoice = false
    //       });
    // },
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let payload = {};
      if (this.failure !== null && this.failure.id !== undefined)
        payload.failure = this.failure.id
      payload.id = this.itemFocusingId


      api.post('automation/destroy', payload)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            timeout: 1000,
            message: response.data.message
          })
          this.deleteConfirmDialog = false;
          this.loading = false;
          this.getData();
        })
        .catch(() => {
          this.loading = false;
        });
    },

    exportTable() {
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
        this.rows.map(row => this.columns.map(col => wrapCsvValue(
          typeof col.field === 'function'
            ? col.field(row)
            : row[col.field === void 0 ? col.name : col.field],
          col.format
        )).join(','))
      ).join('\r\n')


      const status = exportFile(
        'table-export.csv',
        "\ufeff" + content,
        'text/csv')


      if (status !== true) {
        this.$q.notify({
          message: 'مرورگر دسترسی دانلود فایل را بسته است.',
          color: 'negative',
          icon: 'warning'
        })
      }
    },
    createComment() {

      let formData = new FormData();
      formData.append('id', this.commentForUUID);
      formData.append('content', this.newCommentContent);

      api.post('automation/new-comment', formData)
        .then(response => {
          this.showComments(this.commentForUUID)
          this.newCommentDlg = false;
          this.newCommentContent = ''
          this.$q.loading.hide();
          this.$q.notify({
            message: 'باموفقیت ایجاد شد',
            type: 'positive'
          })


        })
    },

    showComments(id) {
      this.showCommentsDlg = true;
      this.commentsLoading = true;
      this.commentForUUID = id;


      let formData = new FormData();
      formData.append('id', id);
      api.post('automation/comments', formData)
        .then(response => {
          this.commentsRows = response.data.data
          this.commentsLoading = false
        })
    },

    deleteCommentConfirmation(id) {
      this.deleteCommentConfirmDialog = true;
      this.itemCommentFocusingId = id;
    },
    deleteCommentItem() {
      this.commentsLoading = true;

      let data = new FormData();
      data.append('id', this.itemCommentFocusingId)

      api.post('automation/comment/destroy', data)
        .then(response => {
          this.showComments(this.commentForUUID);
          this.deleteCommentConfirmDialog = false;
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
    },
  },
  created() {
    this.getData();
    this.getFailure();
  }

}

</script>

<style scoped>

</style>
