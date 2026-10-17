<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">نمودار شیوه آشنایی سرنخ ها</div>
      </q-card-section>
      <q-separator inset/>
      <q-card-section>

        <apexchart dir="ltr" type="donut" height="440px" :options="chartOptionsSource" :series="seriesSource"/>

      </q-card-section>

    </q-card>
  </q-page>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";
import {api} from 'boot/axios'
import {QSpinnerPuff} from "quasar";

export default {
  name: "LeadsMethod",
  components: {
    apexchart: VueApexCharts,
  },
  data() {
    return {
      seriesSource: [],
      chartOptionsSource: {},
    }
  },
  methods: {
    getCharts() {

      api.get('charts/leads/method')
        .then(response => {



          this.seriesSource = response.data.data.percent
          this.chartOptionsSource = {
            chart: {
              fontFamily: 'IRANSans, Tahoma, sans-serif',
              type: 'donut',
            },
            labels: response.data.data.source,
            legend: {
              position: 'bottom'
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

    this.getCharts();


  }
}
</script>

<style scoped>

</style>
