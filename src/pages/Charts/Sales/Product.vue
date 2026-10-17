<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">نمودار فروش محصولات</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>

        <apexchart dir="ltr" type="bar" :options="chartOptionsProductsSaleCount"
                   :series="seriesProductsSaleCount"/>

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import VueApexCharts from "vue3-apexcharts";
import { api } from 'boot/axios'



export default {
  name: "Product",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      chartHeight:300,
      seriesProductsSaleCount: [],
      chartOptionsProductsSaleCount: {}
    }
  },
  methods: {
    filterChart() {

      api.get('charts/sales/products')
        .then(response => {

          if (response.data.count > 10){
            this.chartHeight = response.data.count * 50
          }

          this.seriesProductsSaleCount = [{
            name: "تعداد فروخته شده این محصول",
            data: response.data.data.count
          }]
          this.chartOptionsProductsSaleCount = {
            chart: {
              height: this.chartHeight,
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
              categories: response.data.data.product,
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

    this.filterChart();


  }

}
</script>

<style scoped>

</style>
