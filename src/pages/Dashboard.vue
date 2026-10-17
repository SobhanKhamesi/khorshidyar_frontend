<template>
  <q-page>


    <div class="row w-100 q-mt-md q-mb-none">
      <div class="col-md-6 col-sm-12 col-xs-12 q-px-lg q-pt-md">
        <div class="info-box">
          <span class="info-box-icon bg-primary">
            <q-icon color="black" name="eva-person-outline"/>
          </span>
          <div class="info-box-content text-center">
            <span class="info-box-text">سرنخ</span>
            <span class="info-box-number">{{ leads_count }}</span>
          </div>
        </div>

      </div>
      <!--      <div class="col-md-4 col-sm-12 col-xs-12 q-px-lg q-pt-md">-->

      <!--        <div class="info-box">-->
      <!--          <span class="info-box-icon bg-primary"><q-icon color="black" name="eva-bulb-outline"/></span>-->

      <!--          <div class="info-box-content text-center">-->
      <!--            <span class="info-box-text">فرصت</span>-->
      <!--            <span class="info-box-number">{{ opportunities_count }}</span>-->
      <!--          </div>-->
      <!--        </div>-->

      <!--      </div>-->
      <div class="col-md-6 col-sm-12 col-xs-12 q-px-lg q-pt-md">

        <div class="info-box">
          <span class="info-box-icon bg-primary"><q-icon color="black" name="eva-people-outline"/></span>

          <div class="info-box-content text-center">
            <span class="info-box-text">مشتری</span>
            <span class="info-box-number">{{ customers_count }}</span>
          </div>
        </div>

      </div>

      <div class="col-md-6 col-sm-12 col-xs-12 q-px-lg q-pt-md">

        <div class="info-box">
          <span class="info-box-icon bg-primary">
            <q-icon color="black" name="fa-regular fa-handshake"/>
          </span>
          <div class="info-box-content text-center row">
            <div class="col-6">
              <span class="info-box-text">تعداد فروش های موفق</span>
            </div>
            <div class="col-6">
              <div>
                <span class="info-box-number">   {{ successful_sales }}
                  <span class="">عدد</span>
                </span>
              </div>
              <div>
                <span class="info-box-number">
                  {{moneyFormat(price_successful_sales)}}<span
                  class="">  تومان</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-sm-12 col-xs-12 q-px-lg q-pt-md">

        <div class="info-box">
          <span class="info-box-icon bg-primary">
            <q-icon color="black" name="ti-money"/>
          </span>
          <div class="info-box-content text-center row">
            <div class="col-6">
              <span class="info-box-text">تعداد فروش های ناموفق</span>
            </div>
            <div class="col-6">
              <div>
                <span class="info-box-number">   {{ unsuccessful_sales }}
                  <span class="">عدد</span>
                </span>
              </div>
              <div>
                <span class="info-box-number">
                  {{moneyFormat(price_unsuccessful_sales)}}<span
                  class="">  تومان</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row w-100">

      <div class="col-md-5 col-xs-12 q-py-md q-px-lg">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">دسته بندی مشتریان</div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <apexchart type="pie" height="340" :options="chartOptionsCustomerCategory"
                       :series="seriesCustomerCategory"/>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-md-7 col-xs-12 q-py-md q-px-lg">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">نمودار مهم ترین دلایل شکست فروش</div>
          </q-card-section>
          <q-separator inset/>
          <q-card-section>
            <apexchart type="donut" height="340" :options="chartOptionsFailureCategory"
                       :series="seriesFailureCategory"/>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row w-100">

      <div class="col-md-12 col-xs-12 q-py-md q-px-lg">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">نمودار وضعیت سرنخ ها</div>
          </q-card-section>
          <q-separator/>
          <q-card-section>
            <apexchart dir="ltr" type="line" height="400" :options="ReportchartOptions"
                       :series="seriesReportChart"/>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <div class="row w-100" >
      <div class="col-12 q-py-md q-px-lg">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">نمودار برترین مشتریان</div>
          </q-card-section>
          <q-separator inset/>
          <q-card-section>
            <apexchart dir="ltr" type="bar" height="200" :options="chartOptionsBestCustomer"
                       :series="seriesBestCustomer"/>
          </q-card-section>
        </q-card>
      </div>
    </div>
    <div class="row w-100">
      <div class="col-12 q-py-md q-px-lg">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">نمودار برترین فروشنده</div>
          </q-card-section>
          <q-separator inset/>
          <q-card-section>
            <apexchart dir="ltr" type="bar" height="200" :options="chartOptionsTopSeller"
                       :series="seriesTopSeller"/>
          </q-card-section>
        </q-card>
      </div>
    </div>


    <div class="col-md-7 col-xs-12 q-py-md q-px-lg" v-if="userRole === 0 || userRole === 2" >
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">نمودار گزارش کاربر</div>
        </q-card-section>
        <q-separator inset/>
        <q-card-section>
          <apexchart dir="ltr" type="bar" height="300" :options="chartOptionsCallsCount"
                     :series="seriesCallsCount"/>
        </q-card-section>
      </q-card>
    </div>
    <div class="col-md-7 col-xs-12 q-py-md q-px-lg">
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">نمودار شیوه آشنایی فروش</div>
        </q-card-section>
        <q-separator inset/>
        <q-card-section>
          <apexchart dir="ltr" type="bar" height="300" :options="chartOptionsSalesSource"
                     :series="seriesSalesSource"/>
        </q-card-section>
      </q-card>
    </div>

  </q-page>
</template>

<script>
import VueApexCharts from 'vue3-apexcharts'
import {api} from 'boot/axios'
import {QSpinnerPuff} from "quasar";


export default {
  name: 'Dashboard',
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      userRole: parseInt(this.$q.localStorage.getItem('role')),
      seriesCallsCount: [],
      chartOptionsCallsCount: {},
      seriesSalesSource:[],
      chartOptionsSalesSource:{},
      price_unsuccessful_sales: '',
      unsuccessful_sales: '',
      customers_count: '',
      leads_count: '',
      opportunities_count: '',
      call_tracking_count: '',

      price_successful_sales: '',
      successful_sales: '',

      data: {},
      seriesReportChart: [],
      ReportchartOptions: {},
      statuses: [
        {label: 'تمایل به خرید', value: 0},
        {label: 'نیاز به پیگیری', value: 1},
        {label: 'عدم تمایل به خرید', value: 2},
        {label: 'عدم پاسخگویی', value: 3},
        {label: 'تماس گرفته نشد', value: 4},
      ],

      seriesProductsSaleCount: [],
      chartOptionsProductsSaleCount: {},
      seriesProfit: [],
      chartOptionsProfit: {},
      // seriesInvoicesCount: [],
      // chartOptionsInvoicesCount: {},
      seriesCustomerCategory: [],
      chartOptionsCustomerCategory: {},
      seriesBestCustomer: [],
      chartOptionsBestCustomer: {},
      seriesTopSeller: [],
      chartOptionsTopSeller: {},
      seriesSource: [],
      chartOptionsSource: {},
      seriesBreak: [],
      chartOptionsBreak: {},
      seriesFailureCategory: [],
      chartOptionsFailureCategory: {},
      seriesAdvertisingCategory: [],
      chartOptionsAdvertisingCategory: {},
    }
  },
  methods: {
    getDashboard() {
      this.getWidgets()
      this.getCharts()
    },
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    getWidgets() {


      api.get('dashboard/widgets')
        .then(response => {
          this.price_successful_sales = response.data.data.price_successful_sales
          this.successful_sales = response.data.data.successful_sales
          this.price_unsuccessful_sales = response.data.data.price_unsuccessful_sales
          this.unsuccessful_sales = response.data.data.unsuccessful_sales

          this.customers_count = response.data.data.customers_count
          this.leads_count = response.data.data.leads_count
          this.customers_categories = response.data.data.customers_categories
          this.opportunities_count = response.data.data.opportunities_count
          this.call_tracking_count = response.data.data.call_tracking_count
        })
    },
    getCharts() {
      api.get('dashboard/charts')
        .then(response => {

          this.seriesSalesSource = [{
            name: "تعداد فروش ",
            data: response.data.data.sales_source.count
          }]
          this.chartOptionsSalesSource = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              bar: {
                horizontal: false,
              }
            },
            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title',
              },
              categories: response.data.data.sales_source.salesSource,
            }

          }

          this.seriesCallsCount = [{
            name: "تعداد تماس های کاربر ",
            data: response.data.data.top_user.count
          }]
          this.chartOptionsCallsCount = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              bar: {
                horizontal: false,
              }
            },
            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title',
              },
              categories: response.data.data.top_user.call,
            }

          }



          this.seriesBestCustomer = [{
            name: "مبلغ فاکتورهای این مشتری ",
            data: response.data.data.best_customer.count
          }]
          this.chartOptionsBestCustomer = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              bar: {
                horizontal: true,
              }
            },
            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title',
              },
              categories: response.data.data.best_customer.customer,
            }

          }

          this.seriesTopSeller = [{
            name: "مبلغ فاکتورهای این فروشنده ",
            data: response.data.data.top_seller.count
          }]
          this.chartOptionsTopSeller = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              bar: {
                barHeight: '100%',
                distributed: true,
                horizontal: true,
                dataLabels: {
                  position: 'bottom'
                },
              }
            },

            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title',
              },
              categories: response.data.data.top_seller.user,
            }

          }


          this.seriesSource = response.data.data.source.percent
          this.chartOptionsSource = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              type: 'donut',
            },
            labels: response.data.data.source.source,
            legend: {
              position: 'bottom'
            }
          }

          this.seriesProductsSaleCount = [{
            name: "تعداد خریداری شده از این محصول",
            data: response.data.data.top_products.count
          }]
          this.chartOptionsProductsSaleCount = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              bar: {
                horizontal: false,
              }
            },
            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title',
              },
              categories: response.data.data.top_products.product,
            }

          }
          this.seriesCustomerCategory = response.data.data.customers_categories.percent
          this.chartOptionsCustomerCategory = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              type: 'pie',
            },
            labels: response.data.data.customers_categories.category,
            legend: {
              position: 'bottom'
            }
          }

          this.seriesFailureCategory = response.data.data.failure_Categories.percent
          this.chartOptionsFailureCategory = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              type: 'donut',
            },
            labels: response.data.data.failure_Categories.failure,
            legend: {
              position: 'bottom'
            }
          }

          const data = response.data.data.status.original.chartsData;
          this.seriesReportChart = [];

          Object.keys(data).forEach(user => {
            const userStatuses = data[user];
            const seriesData = [];

            this.statuses.forEach(status => {
              seriesData.push(userStatuses[status.value]);
            });

            this.seriesReportChart.push({
              name: user,
              data: seriesData
            });
          });

          this.ReportchartOptions = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar'
            },
            plotOptions: {
              barhorizontal: false
            },
            xaxis: {
              style: {
                cssClass: 'apexcharts-xaxis-title'
              },
              categories: this.statuses.map(status => status.label)
            }
          }

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
    });


    this.getDashboard();


  }

}
</script>

<style scoped>
.info-box {
  display: block;
  min-height: 90px;
  background: #fff;
  width: 100%;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 15px;
}

.info-box-icon {
  border-radius: 10px 0 0 10px;
  display: block;
  float: left;
  height: 90px;
  width: 90px;
  text-align: center;
  font-size: 45px;
  line-height: 90px;
  background: rgba(0, 0, 0, 0.2);
}

.info-box-content {
  padding: 20px 10px;
  margin-left: 90px;
}

.info-box-text {
  text-transform: uppercase;
}

.info-box-text {
  display: block;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info-box-number {
  display: block;
  font-weight: bold;
  font-size: 18px;
}
</style>
