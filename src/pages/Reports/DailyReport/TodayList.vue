<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست گزارشات امروز</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
          flat bordered class="border-radius-table"
          :loading="loading"
          :rows="rows"
          :filter="filter"
          :columns="columns"
          :rows-per-page-options="[10]"
        >


          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
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
              <q-td key="user" :props="props">
                {{ props.row.user.name }}
              </q-td>
              <q-td key="jalali_date" :props="props" dir="ltr">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="action" :props="props">
                <q-btn @click.prevent="showReport(props.row.user.name,props.row.jalali_date,props.row.id)"
                       title="مشاهده"
                       dense
                       rounded
                       color="teal"
                       icon="remove_red_eye"/>
              </q-td>
            </q-tr>
          </template>

        </q-table>
      </q-card-section>
    </q-card>


    <q-dialog
      transition-show="rotate" transition-hide="rotate"
      v-if="singleReportDlg !== undefined && singleReportDlg !== null" v-model="singleReportDlg">
      <q-card class="dialog-card-big-x">
        <q-card-section>
          <div class="text-h6" v-if="this.singleReportTitle !== undefined && this.singleReportTitle !== null">
            {{ singleReportTitle }}
          </div>
        </q-card-section>

        <q-separator/>

        <q-card-section>

          <div class="row q-col-gutter-sm">
            <div class="col-md-6 col-xs-12">
              <q-input
                mask="time"
                dir="ltr" label="ساعت شروع" readonly outlined v-model="reportStartTime"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input
                mask="time"
                dir="ltr" label="ساعت پایان" readonly outlined v-model="reportEndTime"/>
            </div>
            <div class="col-12">
              <q-table
                flat bordered class="border-radius-table"
                title="گزارش ساعت کاری"
                no-data-label="آیتمی ثبت نشده"
                hide-pagination
                :rows="reportItems"
                :rows-per-page-options="[0]"
                :columns="columnsItems">


                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="time" :props="props">
                      {{ props.row.time }}
                    </q-td>
                    <q-td key="body" :props="props">
                      {{ props.row.body }}
                    </q-td>
                  </q-tr>
                </template>


              </q-table>
            </div>
          </div>

        </q-card-section>

      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'

export default {
  name: "DailyReportList",
  data() {
    return {
      columnsItems: [
        {name: 'time', align: 'center', label: 'ساعت انجام کار', field: 'time'},
        {name: 'body', align: 'center', label: 'شرح', field: 'body'}
      ],

      reportStartTime: '',
      reportEndTime: '',
      reportItems: [],

      reportItem: [],
      singleReportDlg: false,

      filter: '',
      loading: true,
      columns: [
        {name: 'user', field: 'user', align: 'center', label: 'نام کاربر'},
        {name: 'jalali_date', field: 'jalali_date', align: 'center', label: 'تاریخ'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: [],
      singleReportTitle: null
    }
  },
  methods: {
    showReport(reporterName, reportDate, id) {
      this.singleReportDlg = true;
      this.reportItem = {};
      this.getReport(id);
      this.singleReportTitle = 'گزارش کاری ' + reporterName + ' - تاریخ : ' + reportDate;
    },

    getReport(id) {


      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      api.get('daily-reports/' + id)
        .then(response => {

          this.reportStartTime = response.data.data.start_time;
          this.reportEndTime = response.data.data.end_time;
          this.reportItems = response.data.data.items;


          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },
    getData() {
      api.get('daily-reports/index/today')
        .then(response => {
          this.rows = response.data.data
          this.noFilterRows = response.data.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        });
    },
  },
  created() {
    this.getData()
  }

}

</script>

<style scoped>

</style>
