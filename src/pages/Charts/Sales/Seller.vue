<template>
  <q-page class="q-pa-lg">
    <q-card bordered>
      <q-card-section>

        <div :class="$q.screen.gt.sm ? 'row items-center no-wrap' : void 0">
          <div :class="$q.screen.gt.sm ? 'col' : 'col-12'">
            <div class="text-h6">نمودار برترین فروشنده</div>
            <div class="text-subtitle2">{{ pageCaption }}</div>
          </div>
          <q-separator class="q-my-lg" v-if="$q.screen.lt.sm"/>

          <div :class="$q.screen.gt.sm ? 'col-auto' : 'col-12'">
            <div :class="$q.screen.gt.sm ? 'q-gutter-md row items-center' : 'q-gutter-md'">

              <q-input
                filled
                dense clearable mask="####/##/##" dir="ltr" v-model="data.startDate" label="تاریخ شروع">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="data.startDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup label="بستن" color="primary" flat/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-input
                filled
                dense clearable mask="####/##/##" dir="ltr" v-model="data.endDate" label="تاریخ پایان">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="data.endDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup label="بستن" color="primary" flat/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-btn label="اعمال تغییرات" @click.prevent="getTopSeller()" color="teal" icon-right="date_range"/>

            </div>
          </div>
        </div>

      </q-card-section>

      <q-separator inset/>

      <q-card-section>

        <apexchart dir="ltr" type="bar" height="400" :options="chartOptionsTopSeller"
                   :series="seriesTopSeller"/>

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import VueApexCharts from "vue3-apexcharts";
import {api} from 'boot/axios'

export default {
  name: "Seller",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      pageCaption: 'نمودار 30 روز گذشته',
      data: {},
      seriesTopSeller: [],
      chartOptionsTopSeller: {},
    }
  },
  methods: {
    getTopSeller() {
      if (
        (this.data.startDate !== undefined && this.data.startDate !== null && this.data.startDate !== '') &&
        (this.data.endDate !== undefined && this.data.endDate !== null && this.data.endDate !== '')
      ) {
        this.pageCaption = this.data.startDate + ' تا ' + this.data.endDate;
        this.data.startDate = this.data.startDate.replace(/\//g, '-');
        this.data.endDate = this.data.endDate.replace(/\//g, '-');
      } else if (
        (this.data.startDate !== undefined && this.data.startDate !== null && this.data.startDate !== '') &&
        (this.data.endDate === undefined || this.data.endDate === null || this.data.endDate === '')
      ) {
        this.pageCaption = this.data.startDate + ' به بعد';
        this.data.startDate = this.data.startDate.replace(/\//g, '-');
        this.data.endDate = '';
      } else if (
        (this.data.startDate === undefined || this.data.startDate === null || this.data.startDate === '') &&
        (this.data.endDate !== undefined && this.data.endDate !== null && this.data.endDate !== '')
      ) {
        this.pageCaption = 'قبل از ' + this.data.endDate;
        this.data.startDate = '';
        this.data.endDate = this.data.endDate.replace(/\//g, '-');
      } else {
        this.pageCaption = 'نمودار 30 روز گذشته';
        this.data.startDate = '';
        this.data.endDate = '';
      }

      api.post('charts/sales/seller', this.data)
        .then(response => {
          this.seriesTopSeller = [{
            name: "مبلغ فاکتورهای این فروشنده ",
            data: response.data.count
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
              categories: response.data.user,
            }

          }

          this.$q.loading.hide();
        })
        .catch(error => {
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

    this.getTopSeller();


  }
}


</script>

<style scoped>

</style>
