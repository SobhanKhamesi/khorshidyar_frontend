<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ثبت سریع پیش فاکتور</div>
        <div class="text-caption text-grey">
          فقط مشتری و اقلام پیش فاکتور را وارد کنید. یک درخواست جدید ساخته می‌شود که مستقیم در مرحله «پیش فاکتور»
          قرار می‌گیرد؛ تکمیل فرم بازدید و ادامه روند را می‌توانید بعداً از طریق ویرایش همان درخواست انجام دهید.
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-select
                option-label="fullName"
                option-value="id"
                outlined
                v-model="customer_id"
                clearable
                use-input
                label="مشتری"
                :options="customersAndLeadsOptions"
                @filter="filterCustomers"
                behavior="dialog">

              <template v-slot:after>
                <q-btn @click.prevent="newCustomerDlg = true" icon="person_add" dense flat rounded/>
              </template>

              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.fullName }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn icon="info" color="info" flat round dense size="sm"
                           title="جزئیات مشتری"
                           @click.stop="openCustomerInfo(scope.opt)"/>
                  </q-item-section>
                </q-item>
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
          <div v-if="customer_id && customer_id.referrer_id" class="col-md-6 col-xs-12 q-gutter-y-md">
            <q-input outlined
                     type="number"
                     dir="ltr" min="0" max="100"
                     v-model="introducerPercent"
                     label="درصد معرف از این فروش"
                     hint="پیش‌فرض از تعریف مشتری؛ فقط برای همین پروژه اعمال می‌شود"
            />
          </div>
          <div class="col-12 q-gutter-y-md">

            <q-input
              label="توضیحات پیش فاکتور"
              v-model="description"
              outlined
              type="textarea"
              autogrow
            />

          </div>
        </div>
      </q-card-section>

      <q-separator/>

      <!-- ============ اقلام پیش فاکتور ============ -->
      <q-card-section>
        <div class="text-subtitle1 q-mb-md">اقلام پیش فاکتور</div>

        <div v-if="productsLoading" class="text-center q-pa-md">
          <q-spinner color="primary" size="2em"/>
        </div>

        <div v-else class="q-gutter-y-md">
          <div
              v-for="(item, index) in invoiceItems"
              :key="item.uid"
              class="row q-col-gutter-sm items-center"
          >
            <div class="col-md-3 col-xs-12">
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
                  <span style="font-size: 12px">{{ item.product && item.product.unit ? item.product.unit.title : 'عدد'}}</span>
                </template>
              </q-input>
            </div>

            <div v-if="isService(item.product)" class="col-md-5 col-xs-12">
              <q-input v-if="isCostService(item.product)" dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                       v-model.number="item.purchasePrice" @update:model-value="v => item.price = v"
                         label="مبلغ هزینه (به فاکتور مشتری اضافه می‌شود)"/>
              <q-input v-else dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                       v-model.number="item.price" label="مبلغ دریافتی"/>
            </div>

            <!-- قیمت خرید همین قلم در این فاکتور (پیش‌فرض: قیمت خرید محصول)؛ مبنای سود ناخالص -->
            <div v-if="!isService(item.product)" class="col-md-2 col-xs-6">
              <q-input dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                       v-model.number="item.purchasePrice" label="قیمت خرید"/>
            </div>

            <div v-if="!isService(item.product)" class="col-md-3 col-xs-6">
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

            <div class="col-md-1 col-xs-6 text-caption text-grey">
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

      <q-card-section class="row items-center justify-end q-gutter-md">
        <div class="text-subtitle1">
          جمع اقلام: <strong>{{ moneyFormat(totalInvoicePrice) }}</strong> تومان
        </div>
        <!-- مبلغ نهایی به‌صورت دستی وارد می‌شود و از جمع اقلام محاسبه نمی‌شود -->
        <q-input outlined dense dir="ltr" type="number" suffix="تومان" style="min-width: 260px"
                 v-model.number="finalPrice" label="مبلغ نهایی (دستی) *">
          <template v-slot:after>
            <q-btn flat dense rounded size="sm" color="primary" label="برابر جمع اقلام" @click="finalPrice = totalInvoicePrice"/>
          </template>
        </q-input>
      </q-card-section>

      <q-separator/>

      <q-card-actions align="center" class="q-py-md">
        <q-btn outline rounded color="accent" label="انصراف" @click="$router.back()"/>
        <q-btn color="accent" rounded :loading="submitting" label="ثبت پیش فاکتور" @click="submitQuickInvoice()"/>
      </q-card-actions>
    </q-card>

    <!-- ============ دیالوگ مشتری جدید ============ -->
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

              <q-input outlined
                       dir="ltr"
                       v-model="newCustomerContactNumber"
                       label="شماره تلفن همراه"/>
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

    <!-- ============ دیالوگ محصول جدید ============ -->
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
    <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>

  </q-page>
</template>

<script>
import {QSpinnerPuff} from 'quasar'
import {VMoney} from "v-money";
import CustomerInfoDialog from 'components/CustomerInfoDialog.vue'
import {api} from 'boot/axios'

// یک آیتم خالی برای پیش فاکتور
function emptyInvoiceItem() {
  return {
    uid: Math.random().toString(36).slice(2),
    product: null,
    count: 1,
    price: null,
    purchasePrice: null
  }
}

export default {
  name: "CreateQuickPreInvoice",
  components: {CustomerInfoDialog},
  directives: {money: VMoney},
  data() {
    return {
      customerInfoDlg: false,
      customerInfoTarget: null,
      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },

      submitting: false,

      // ---------- مشتری ----------
      customer_id: null,
      introducerPercent: '',
      description:'',
      finalPrice: null,
      customersAndLeads: [],
      customersAndLeadsOptions: [],

      newCustomerDlg: false,
      newCustomerContactNumber: '',
      newCustomerName: '',
      newCustomerGender: 0,

      // ---------- پیش فاکتور ----------
      products: [],
      productsFilteredOptions: [],
      productsLoading: false,
      invoiceItems: [emptyInvoiceItem(), emptyInvoiceItem(), emptyInvoiceItem()],

      newProductDlg: false,
      newProductName: '',
      newProductPurchasePrice: 0,
      newProductFirstInventory: 0,
      newProductSellingPrice: 0,
      newDescription: '',
    }
  },
  watch: {
    // درصد پیش‌فرض از تعریف مشتری؛ کاربر می‌تواند آن را فقط برای همین پروژه تغییر دهد
    customer_id(newVal) {
      this.introducerPercent = newVal && newVal.referrer_id ? newVal.referrer_percent : ''
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
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
    },
    // ---------- مشتری ----------
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
            v => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
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

      api.post('customers/quick-add', payload)
          .then(response => {
            this.$q.notify({
              timeout: 3000,
              position: 'center',
              type: 'positive',
              message: response.data.message
            })

            this.getCustomersAndLeads();
            this.newCustomerContactNumber = ''
            this.newCustomerName = ''
            this.newCustomerGender = 0
            this.newCustomerDlg = false
            this.$q.loading.hide();
          })
          .catch(() => {
            this.$q.loading.hide();
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

    // خدمت فقط یک مبلغ دارد: خدمت هزینه ← مبلغ هزینه (قیمت خرید)، خدمت دریافتی ← مبلغ دریافتی (قیمت فروش)
    isService(p) {
      return !!p && p.kind === 2
    },
    isCostService(p) {
      return this.isService(p) && p.service_nature === 1
    },
    // در صورتی که محصول قیمت پیش‌فرض داشته باشد (قیمت فروش)، خودکار در فیلد مبلغ قرار می‌گیرد
    onProductSelected(item) {
      if (this.isService(item.product)) {
        const amount = Number(item.product.service_amount) || 0
        if (this.isCostService(item.product)) {
          if (!item.purchasePrice) item.purchasePrice = amount
          // مبلغ خدمت هزینه از مشتری هم دریافت می‌شود
          item.price = item.purchasePrice
        } else {
          item.purchasePrice = 0
          if (!item.price) item.price = amount
        }
        return
      }
      if (item.product && item.product.selling_price && !item.price) {
        item.price = item.product.selling_price
      }
      if (item.product && (item.purchasePrice === null || item.purchasePrice === '')) {
        item.purchasePrice = Number(item.product.purchase_price) || 0
      }
    },

    addInvoiceItem() {
      this.invoiceItems.push(emptyInvoiceItem())
    },

    removeInvoiceItem(index) {
      if (this.invoiceItems.length === 1) return
      this.invoiceItems.splice(index, 1)
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

    moneyFormat(digits) {
      if (digits === null || digits === undefined) return '0'
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
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

    resetForm() {
      this.customer_id = null
      this.introducerPercent = ''
      this.finalPrice = null
      this.invoiceItems = [emptyInvoiceItem(), emptyInvoiceItem(), emptyInvoiceItem()]
    },

    // ---------- ثبت سریع پیش فاکتور ----------
    submitQuickInvoice() {
      if (!this.customer_id) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'مشتری را انتخاب کنید'})
        return
      }

      if (!this.validateInvoiceItems()) return
      if (this.finalPrice === null || this.finalPrice === '') {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'مبلغ نهایی را وارد نمایید'})
        return
      }

      this.submitting = true

      // تب پرینت رو همینجا و همزمان با کلیک کاربر باز می‌کنیم تا مرورگر آن را پاپ‌آپ ناخواسته تشخیص ندهد؛
      // بعد از موفقیت‌آمیز بودن ثبت، آدرس واقعی پرینت را در همین تب قرار می‌دهیم.
      const canPrint = this.$access.can('sales.print')
      const printTab = canPrint ? window.open('', '_blank') : null

      const orders = this.invoiceItems.map(item => ({
        orderProductId: item.product.id,
        orderPrice: item.price,
        orderPurchasePrice: item.purchasePrice,
        orderCount: item.count,
      }))

      const payload = {
        customer: this.customer_id.id,
        final_price: this.finalPrice,
        referrer_percent: this.introducerPercent,
        invoice_description: this.description,
        orders: orders
      }

      api.post('automation/quick-store', payload)
          .then(response => {
            this.$q.notify({
              message: response.data.message || 'پیش فاکتور با موفقیت ثبت شد',
              type: 'positive'
            })

            const automationId = response.data.data?.id

            if (automationId && canPrint) {
              const printUrl = '/v1/print/' + automationId
              if (printTab) {
                printTab.location.href = printUrl
              } else {
                // اگر مرورگر اجازه باز شدن تب خالی رو هم نداده باشه
                window.open(printUrl, '_blank')
              }
            } else if (printTab) {
              printTab.close()
            }

            this.resetForm()
          })
          .catch(() => {
            if (printTab) printTab.close()
          })
          .finally(() => {
            this.submitting = false;
          });
    },
  },
  created() {
    this.getCustomersAndLeads();
    this.getProducts();
  }
}
</script>

<style scoped>
</style>
