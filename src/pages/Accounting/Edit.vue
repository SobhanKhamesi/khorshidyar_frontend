<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="editForm()" class="q-gutter-md">
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ویرایش فاکتور</div>
        </q-card-section>
        <q-separator/>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input autofocus dir="ltr" outlined v-model="invoiceNumber" label="شماره فاکتور"/>
              <q-input mask="####/##/##" outlined dir="ltr" v-model="invoiceDate" label="تاریخ">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="invoiceDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-select
                option-label="fullName"
                option-value="id"
                outlined
                v-model="invoiceCustomer"
                use-input
                label="مشتری"
                :options="invoiceType === 0 ? customersAndLeadsOptions : customersOptions"
                @filter="filterCustomers"
                behavior="dialog">

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
            <div class="col-md-6 col-xs-12 q-gutter-y-md">


              <q-select
                readonly
                map-options
                emit-value
                outlined
                v-model="invoiceType"
                label="نوع فاکتور"
                :options="invoiceTypeOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


              <q-input
                label="توضیحات بیشتر"
                v-model="invoiceDescription"
                outlined
                autogrow
              />

            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-table
            flat bordered class="border-radius-table"
            :rows-per-page-options="[0]"
            title="محصولات"
            no-data-label="آیتمی ثبت نشده"
            :rows="dataOrders"
            :loading="loadingOrders"
            :columns="columnsOrders">

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="orderProductName" :props="props">
                  {{ props.row.orderProductName }}
                </q-td>
                <q-td key="orderCount" :props="props">
                  {{ moneyFormat(props.row.orderCount) }}
                </q-td>
                <q-td key="orderPurchasePrice" :props="props">
                  {{ moneyFormat(props.row.orderPurchasePrice) }}
                </q-td>
                <q-td key="orderPrice" :props="props">
                  {{ moneyFormat(props.row.orderPrice) }}
                </q-td>
                <q-td key="orderTotalPrice" :props="props">
                  {{ moneyFormat(props.row.orderTotalPrice) }}
                </q-td>
                <q-td key="action" :props="props">
                  <q-btn title="حذف" dense color="negative" icon="delete" round
                         @click="removeOrder(props.row)"/>
                </q-td>
              </q-tr>
            </template>

            <template v-slot:top-right>

              <q-btn label="آیتم جدید" color="primary" rounded @click="newOrderDlg = true"/>


            </template>


            <template v-slot:bottom>
              <q-tr>
                <q-td colspan="100%">
                  <span>مبلغ کل : </span>
                  <b>{{ moneyFormat(tableTotalPrice) }}</b>
                  <span> تومان</span>
                </q-td>
              </q-tr>
            </template>


          </q-table>
        </q-card-section>
      </q-card>
      <q-card flat class="border-radius-card">
        <div>
          <q-card-section>
            <div class="text-h6">پرداخت</div>
          </q-card-section>
          <q-separator/>


          <q-card-section>
            <div class="q-gutter-y-md">
              <q-select
                outlined
                option-label="fullDetails"
                option-value="id"
                emit-value
                map-options
                clearable
                v-model="invoicePosBankAccount"
                label="دستگاه پوز"
                :options="payPosBankOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

              <q-field
                dir="ltr"
                suffix="تومان"
                label="مبلغ دستگاه پوز"
                input-class="text-right"
                outlined
                v-model="invoicePayPos">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>

              <q-field
                dir="ltr"
                suffix="تومان"
                label="نقد"
                input-class="text-right"
                outlined
                v-model="invoiceCashPay">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>
            </div>

            <q-table
              flat bordered class="border-radius-table q-mt-md"
              title="چک"
              no-data-label="آیتمی ثبت نشده"
              :rows="dataChecks"
              :loading="loadingChecks"
              :columns="columnsChecks">

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td key="series" :props="props">
                    {{ props.row.series }}
                  </q-td>
                  <q-td key="serial" :props="props">
                    {{ props.row.serial }}
                  </q-td>
                  <q-td key="date" :props="props">
                    {{ props.row.date }}
                  </q-td>
                  <q-td key="amount" :props="props">
                    {{ moneyFormat(props.row.amount) }}
                  </q-td>
                  <q-td key="bank" :props="props">
                    {{ props.row.bank }}
                  </q-td>
                  <q-td key="bankAccount" :props="props">
                    {{ props.row.bankAccount }}
                  </q-td>
                  <q-td key="action" :props="props">
                    <q-btn title="حذف" dense color="negative" icon="delete" round
                           @click="removeCheck(dataChecks.indexOf(props.row))"/>
                  </q-td>
                </q-tr>
              </template>


              <template v-slot:top-right>

                <q-btn label="آیتم جدید" color="primary" rounded @click="newCheckDlg = true"/>

              </template>


            </q-table>
          </q-card-section>
        </div>
        <q-card-actions>
          <q-btn type="submit" rounded class="full-width" color="accent" label="ویرایش"/>
        </q-card-actions>
      </q-card>

    </q-form>


    <q-dialog v-model="newOrderDlg"
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

          <div class="q-gutter-y-md">

            <q-select
              clearable
              option-label="name"
              option-value="id"
              @filter="filterProducts"
              outlined
              v-model="newOrderProduct"
              label="محصول"
              :options="orderProductNameOptions"
              use-input>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    یافت نشد
                  </q-item-section>
                </q-item>
              </template>
            </q-select>


            <q-field
              v-if="invoiceType === 0 || invoiceType === 3 || invoiceType === 5"
              dir="ltr"
              suffix="تومان"
              label="مبلغ خرید"
              input-class="text-right"
              outlined
              v-model="newOrderPurchasePrice">

              <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                <input :id="id" class="q-field__input text-right" :value="modelValue"
                       @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                       v-show="floatingLabel">
              </template>
            </q-field>

            <q-field
              dir="ltr"
              suffix="تومان"
              label="مبلغ"
              input-class="text-right"
              outlined
              v-model="newOrderPrice">

              <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                <input :id="id" class="q-field__input text-right" :value="modelValue"
                       @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                       v-show="floatingLabel">
              </template>
            </q-field>


            <q-input
              outlined
              min="1"
              type="number"
              v-model.number="newOrderCount"
              suffix="عدد"
              dir="ltr"
              label="تعداد"/>
          </div>

        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :disable="loadingOrders" @click.prevent="addOrder()" label="افزودن"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="newCheckDlg"
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

              <q-input
                outlined
                v-model="newCheckSeries"
                dir="ltr"
                label="سری"
                input-class="text-right"/>

              <q-input mask="####/##/##" outlined dir="ltr" v-model="newCheckDate"
                       label="تاریخ">
                <template v-slot:prepend>

                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date
                        today-btn
                        calendar="persian"
                        v-model="newCheckDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-select
                option-label="name"
                option-value="id"
                outlined
                use-input
                behavior="dialog"
                @filter="filterBanks"
                v-model="newCheckBank"
                label="بانک"
                :options="checkBankOptions">
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

              <q-input
                outlined
                v-model="newCheckSerial"
                dir="ltr"
                label="سریال"
                input-class="text-right"/>


              <q-field
                dir="ltr"
                suffix="تومان"
                label="مبلغ"
                input-class="text-right"
                outlined
                v-model="newCheckAmount">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>


              <q-select
                outlined
                option-label="fullDetails"
                option-value="id"
                v-model="newCheckBankAccount"
                label="حساب بانکی"
                :options="checkBankAccountsOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


            </div>
          </div>


        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded :disable="loadingChecks" @click.prevent="addCheck()" label="افزودن"/>
        </q-card-actions>
      </q-card>
    </q-dialog>


    <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>

  </q-page>
</template>


<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'
import {VMoney} from 'v-money'
import CustomerInfoDialog from 'components/CustomerInfoDialog.vue'


export default {
  name: "InvoiceEdit",
  components: {CustomerInfoDialog},
  directives: {money: VMoney},
  watch: {
    newOrderProduct: function (product) {

      if (product != null) {

        if (this.invoiceType === 0 || this.invoiceType === 3 || this.invoiceType === 5) {
          this.newOrderPurchasePrice = parseInt(product.purchase_price)
          this.newOrderPrice = parseInt(product.selling_price)
          this.productInventory = parseInt(product.inventory)
        } else {
          this.newOrderPrice = parseInt(product.purchase_price)
          this.newOrderPurchasePrice = 0
          this.productInventory = 1
        }
      } else {
        this.newOrderPurchasePrice = 0
        this.newOrderPrice = 0
        this.productInventory = 1
      }

    },
  },
  data() {
    return {
      customerInfoDlg: false,
      customerInfoTarget: null,

      newOrderProduct: null,
      newOrderPurchasePrice: 0,
      newOrderPrice: 0,
      newOrderCount: 1,
      productInventory: 0,

      invoiceNumber: '',
      invoiceDate: '',
      invoiceCustomer: null,
      invoiceType: null,
      invoiceDescription: '',
      invoicePayPos: 0,
      invoicePosBankAccount: null,
      invoiceCashPay: 0,

      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },

      tableTotalPrice: 0,

      invoiceTypeOptions: [
        {label: 'پیش فاکتور', value: 0},
        {label: 'فاکتور خرید', value: 2},
        {label: 'فاکتور فروش', value: 3},
        {label: 'فاکتور برگشت از خرید', value: 4},
        {label: 'فاکتور برگشت از فروش', value: 5},
      ],

      newCheckDlg: false,
      loadingChecks: false,
      dataChecks: [],
      newCheckSeries: '',
      newCheckSerial: '',
      newCheckDate: '',
      newCheckAmount: 0,
      newCheckBankAccount: null,
      newCheckBank: null,

      loadingOrders: false,
      dataOrders: [],
      newOrderDlg: false,

      newCustomerContactNumber: '',
      newCustomerName: '',
      newCustomerGender: 0,
      newCustomerDlg: false,


      columnsOrders: [],
      columnsChecks: [
        {name: 'series', align: 'center', label: 'سری', field: 'series'},
        {name: 'serial', align: 'center', label: 'سریال', field: 'serial'},
        {name: 'date', align: 'center', label: 'تاریخ', field: 'date'},
        {name: 'amount', align: 'center', label: 'مبلغ (تومان)', field: 'amount'},
        {name: 'bank', align: 'center', label: 'بانک', field: 'bank'},
        {name: 'bankAccount', align: 'center', label: 'حساب بانکی', field: 'bankAccount'},
        {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
      ],


      checkBankAccountsOptions: [],
      customersAndLeads: [],
      customersAndLeadsOptions: [],
      customers: [],
      customersOptions: [],
      checkBanks: [],
      checkBankOptions: [],


      orderProductName: [],
      orderProductNameOptions: [],
      payPosBank: [],
      payPosBankOptions: []
    }
  },
  methods: {
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
    },
    getBanks() {
      api.get('banks/list')
        .then(response => {
          this.checkBanks = response.data.data
          this.checkBankOptions = response.data.data
        })
    },
    getCustomersAndLeads() {
      api.get('customers/all')
        .then(response => {
          this.customersAndLeadsOptions = response.data.data
          this.customersAndLeads = response.data.data

          const customers = response.data.data.filter(item => parseInt(item.status) === 3)

          this.customersOptions = customers
          this.customers = customers

        })
    },
    getProducts() {
      api.get('products/list')
        .then(response => {
          this.orderProductNameOptions = response.data.data
          this.orderProductName = response.data.data
        })
    },
    getBankAccounts() {
      api.get('bank-accounts/list')
        .then(response => {
          this.payPosBank = response.data.data
          this.payPosBankOptions = response.data.data
          this.checkBankAccountsOptions = response.data.data
        })
    },
    removeCheck(index) {
      this.loadingChecks = true
      setTimeout(() => {
        this.dataChecks = [...this.dataChecks.slice(0, index), ...this.dataChecks.slice(index + 1)]
        this.loadingChecks = false
      }, 500)
    },
    addCheck() {

      const realCheckAmount = this.newCheckAmount.toString().replaceAll(',', '')

      if (!(realCheckAmount > 0 &&
        this.newCheckBankAccount !== null &&
        this.newCheckBank !== null &&
        this.newCheckSeries.length > 0 &&
        this.newCheckSerial.length > 0 &&
        this.newCheckDate.length > 0)) {
        this.$q.notify({
          timeout: 3000,
          position: 'bottom',
          type: 'negative',
          message: 'فیلد ها را تکمیل نمایید'
        })
        return 0
      }

      this.loadingChecks = true

      setTimeout(() => {
        const newCheck = {
          series: this.newCheckSeries,
          serial: this.newCheckSerial,
          date: this.newCheckDate,
          amount: this.newCheckAmount,
          bankAccountId: this.newCheckBankAccount.id,
          bankAccount: this.newCheckBankAccount.fullDetails,
          bankId: this.newCheckBank.id,
          bank: this.newCheckBank.name
        }

        this.dataChecks.push(newCheck)


        this.newCheckSeries = ''
        this.newCheckSerial = ''
        this.newCheckDate = ''
        this.newCheckAmount = 0
        this.newCheckBankAccount = null
        this.newCheckBank = null

        this.loadingChecks = false
        this.newCheckDlg = false
      }, 500)
    },
    addOrder() {

      const realProductPurchasePrice = (this.newOrderPurchasePrice).toString().replaceAll(',', '')
      const realProductPrice = (this.newOrderPrice).toString().replaceAll(',', '')
      const realOrderCount = (this.newOrderCount).toString().replaceAll(',', '')

      if (!(this.newOrderProduct !== null && realProductPrice > 0 && realOrderCount > 0)) {
        this.$q.notify({
          timeout: 3000,
          position: 'bottom',
          type: 'negative',
          message: 'محصول را انتخاب و قیمت را وارد نمایید'
        })
        return 0
      }

      if ((this.invoiceType === 0 || this.invoiceType === 3) && realOrderCount > this.productInventory) {
        if (this.invoiceType === 0 || this.invoiceType === 3) {
          this.$q.notify({
            timeout: 3000,
            position: 'bottom',
            type: 'negative',
            message: 'موجودی انبار کافی نیست. موجودی : ' + this.productInventory
          })
          return 0
        }
      }

      this.loadingOrders = true

      setTimeout(() => {

        const newProduct = {
          orderProductId: this.newOrderProduct.id,
          orderProductName: this.newOrderProduct.name,
          orderCount: realOrderCount,
          orderPurchasePrice: realProductPurchasePrice,
          orderPrice: realProductPrice,
          orderTotalPrice: realOrderCount * realProductPrice
        }

        this.dataOrders.push(newProduct)

        this.loadingOrders = false;
        this.newOrderDlg = false

        this.tableTotalPrice += newProduct.orderTotalPrice


        this.newOrderProduct = null;
        this.newOrderPurchasePrice = 0;
        this.newOrderPrice = 0;
        this.newOrderCount = 1;
        this.productInventory = 0;


      }, 500)


    },
    removeOrder(order) {
      const index = this.dataOrders.indexOf(order);
      this.loadingOrders = true
      setTimeout(() => {
        this.dataOrders = [...this.dataOrders.slice(0, index), ...this.dataOrders.slice(index + 1)]

        this.tableTotalPrice -= order.orderTotalPrice;
        this.loadingOrders = false
      }, 500)
    },
    filterProducts(val, update) {
      if (val === '') {
        update(() => {
          this.orderProductNameOptions = this.orderProductName
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.orderProductNameOptions = this.orderProductName.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          if (this.invoiceType === 0) {
            this.customersAndLeadsOptions = this.customersAndLeads
          } else {
            this.customersOptions = this.customers
          }
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()

        if (this.invoiceType === 0) {
          this.customersAndLeadsOptions = this.customersAndLeads.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
          )
        } else {
          this.customersOptions = this.customers.filter(
            v => v.name.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    },
    filterBanks(val, update) {
      if (val === '') {
        update(() => {
          this.checkBankOptions = this.checkBanks
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.checkBankOptions = this.checkBanks.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },


    getData() {

      api.get('accounting/' + this.$route.params.id)
        .then(response => {
          const invoiceType = parseInt(response.data.data.type);
          if (invoiceType === 0 || invoiceType === 3 || invoiceType === 5) {
            this.columnsOrders = [
              {name: 'orderProductName', align: 'center', label: 'نام محصول', field: 'orderProductName'},
              {name: 'orderCount', align: 'center', label: 'تعداد', field: 'orderCount'},
              {name: 'orderPurchasePrice', align: 'center', label: 'مبلغ خرید (تومان)', field: 'orderPurchasePrice'},
              {name: 'orderPrice', align: 'center', label: 'مبلغ (تومان)', field: 'orderPrice'},
              {name: 'orderTotalPrice', align: 'center', label: 'مجموع (تومان)', field: 'orderTotalPrice'},
              {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
            ]
          } else {
            this.columnsOrders = [
              {name: 'orderProductName', align: 'center', label: 'نام محصول', field: 'orderProductName'},
              {name: 'orderCount', align: 'center', label: 'تعداد', field: 'orderCount'},
              {name: 'orderPrice', align: 'center', label: 'مبلغ (تومان)', field: 'orderPrice'},
              {name: 'orderTotalPrice', align: 'center', label: 'مجموع (تومان)', field: 'orderTotalPrice'},
              {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
            ];
          }

          this.invoiceNumber = response.data.data.number
          this.invoiceDate = response.data.data.jalali_date
          this.invoiceCustomer = response.data.data.customer
          this.invoiceType = invoiceType
          this.invoiceDescription = response.data.data.description
          this.invoicePayPos = parseInt(response.data.data.pay_pos)
          this.invoicePosBankAccount = response.data.data.pos_bank_account
          this.invoiceCashPay = parseInt(response.data.data.pay_cash)

          response.data.data.orders.forEach((item) => {

            let newProduct = {}
            newProduct.orderProductId = item.product.id
            newProduct.orderProductName = item.product.name
            newProduct.orderCount = parseInt(item.count)

            if (invoiceType === 0 || invoiceType === 3 || invoiceType === 5) {
              newProduct.orderPurchasePrice = parseInt(item.purchase_price)
              newProduct.orderPrice = parseInt(item.selling_price)
              newProduct.orderTotalPrice = parseInt(item.count) * parseInt(item.selling_price)
            } else {
              newProduct.orderPrice = parseInt(item.purchase_price)
              newProduct.orderTotalPrice = parseInt(item.count) * parseInt(item.purchase_price)
            }

            this.dataOrders.push(newProduct);
          })


          response.data.data.checks.forEach((item) => {

            let newCheck = {}

            newCheck.series = item.series
            newCheck.serial = item.serial
            newCheck.date = item.jalali_date
            newCheck.amount = item.amount
            if (item.bank_account !== null) {
              newCheck.bankAccountId = item.bank_account.id
              newCheck.bankAccount = item.bank_account.fullDetails
            }
            if (item.bank !== null) {
              newCheck.bankId = item.bank.id
              newCheck.bank = item.bank.name
            }

            this.dataChecks.push(newCheck);
          })


          this.tableTotalPrice = parseInt(response.data.data.final_price)

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    editForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      let payload = {}
      payload.id = this.$route.params.id;
      payload.number = this.invoiceNumber
      payload.date = this.invoiceDate
      if (this.customer !== null)
        payload.customer = this.invoiceCustomer.id
      payload.type = this.invoiceType
      payload.description = this.invoiceDescription
      payload.payPos = this.invoicePayPos


      payload.posBankAccount = this.invoicePosBankAccount


      payload.payCash = this.invoiceCashPay

      payload.orders = this.dataOrders;
      payload.checks = this.dataChecks;


      api.post('accounting/update', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    }
  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getBanks();
    this.getCustomersAndLeads();
    this.getProducts();
    this.getBankAccounts();
    this.getData();

  }
}
</script>

<style scoped>

</style>
