<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>

        <div :class="$q.screen.gt.sm ? 'row items-center no-wrap' : void 0">
          <div :class="$q.screen.gt.sm ? 'col' : 'col-12'">
            <div class="text-h6">نمودار هدف گذاری</div>
            <div class="text-subtitle2">{{ pageCaption }}</div>
          </div>

          <br v-if="$q.screen.lt.sm"/>

          <div :class="$q.screen.gt.sm ? 'col-auto' : 'col-12'">
            <div :class="$q.screen.gt.sm ? 'q-gutter-md row items-center' : 'q-gutter-md'">
              <q-select
                style="min-width: 200px;"
                outlined
                dense
                v-model="date"
                :options="datesArray"
                label="ماه"
              />

              <q-btn
                color="primary" rounded
                label="اعمال تغییرات" @click.prevent="filterChart" icon-right="date_range"/>
            </div>
          </div>
        </div>

      </q-card-section>

      <q-separator/>

      <q-card-section>

        <apexchart dir="ltr" type="line" height="400" :options="chartOptionsInvoicesCount"
                   :series="seriesInvoicesCount"/>

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import VueApexCharts from "vue3-apexcharts";
import {api} from 'boot/axios'


export default {
  name: "Invoice",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      pageCaption: 'نمودار ماه جاری',
      chartCount: [],
      datesArray: null,
      date: null,
      chartDates: [],
      seriesInvoicesCount: [],
      chartOptionsInvoicesCount: {}
    }
  },
  methods: {
    filterChart() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      });

      let payload={}
      payload.date = this.date


      api.post('charts/activities/targeting', payload)
        .then(response => {

          if (this.datesArray === null) {
            this.datesArray = response.data.data.dates;
          }

          if (this.date === null) {
            this.date = response.data.data.dates[0];
          }

          this.seriesInvoicesCount = [{
            name: 'فروش',
            data: response.data.data.forosh
          }, {
            name: 'مانده هدف',
            data: response.data.data.mande
          }]

          this.chartOptionsInvoicesCount = {
            tooltip: {
              shared: true,
              intersect: false,
              y: {
                formatter: function (value) {
                  return (("" + value).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")) + ' تومان';
                },
              },
            },
            colors: ["#00AD2A", "#D28C00"],
            chart: {
              zoom: {
                enabled: false
              },
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              toolbar: {
                show: false
              },
              type: 'bar',
              height: 350,
              stacked: true,
            },
            stroke: {
              show: true,
              width: 2,
              colors: ['transparent']
            },
            xaxis: {
              categories: response.data.data.users,
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
    this.filterChart();
  }

}
</script>

<style scoped>

</style>
