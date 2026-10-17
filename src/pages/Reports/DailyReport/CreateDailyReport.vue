<template>
  <q-page class="q-pa-md">
    <div v-show="fullLoaded">
      <div v-if="todo">
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">فرم گزارش کاری روزانه</div>
          </q-card-section>

          <q-separator/>

          <q-form>
            <q-card-section>

              <div class="row q-col-gutter-md">
                <div class="col-md-6 col-xs-12 q-gutter-y-md">


                  <q-input dir="ltr" label="ساعت شروع" outlined v-model="startTime" mask="time"
                           :rules="['time']">
                    <template v-slot:prepend>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-time v-model="startTime">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div class="col-md-6 col-xs-12 q-gutter-y-md">
                  <q-input dir="ltr" label="ساعت پایان" outlined v-model="endTime" mask="time"
                           :rules="['time']">
                    <template v-slot:prepend>
                      <q-icon name="access_time" class="cursor-pointer">
                        <q-popup-proxy transition-show="scale" transition-hide="scale">
                          <q-time v-model="endTime">
                            <div class="row items-center justify-end">
                              <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>

                </div>

                <div class="col-12">
                  <q-table
                    flat bordered class="border-radius-table"
                    title="گزارش ساعت کاری"
                    no-data-label="آیتمی ثبت نشده"
                    :rows="dataItems"
                    :rows-per-page-options="[0]"
                    :loading="loadingItems"
                    :columns="columnsItems">


                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="time" :props="props">
                          {{ props.row.time }}
                        </q-td>
                        <q-td key="body" :props="props">
                          {{ props.row.body }}
                        </q-td>
                        <q-td key="action" :props="props">
                          <q-btn title="حذف" dense color="negative" icon="delete" round
                                 @click="removeItem(dataItems.indexOf(props.row))"/>
                        </q-td>
                      </q-tr>
                    </template>


                    <template v-slot:top-right>

                      <q-btn label="آیتم جدید" color="primary" rounded @click="newItemDlg = true"/>

                    </template>


                  </q-table>
                </div>


              </div>


            </q-card-section>

            <q-card-actions class="q-gutter-y-md">
              <q-btn rounded @click.prevent="saveTodayReportForm()" class="full-width" color="primary" label="ثبت موقت"/>
              <q-btn rounded @click.prevent="confirm=true;" class="full-width" color="accent" label="ثبت نهایی"/>
            </q-card-actions>
          </q-form>
        </q-card>
        <q-dialog v-model="confirm"
                  :maximized="!$q.screen.gt.sm"
                  :full-width="!$q.screen.gt.sm"
                  :full-height="!$q.screen.gt.sm"
                  transition-show="slide-up"
                  transition-hide="slide-down"
        >
          <q-card class="dialog-card-big">
            <q-card-section>
              <div class="text-h6">از ثبت نهایی گزارش امروز خود اطمینان دارید؟</div>
            </q-card-section>

            <q-separator/>
            <q-card-actions align="center" class="q-py-md">
              <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
              <q-btn color="accent" rounded @click.prevent="submitTodayReportForm()" label="تایید"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
        <q-dialog v-model="newItemDlg"
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
                  outlined
                  v-model="newItemTime"
                  label="ساعت انجام کار"
                  :options="workDoingTimeOptions">

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        یافت نشد
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>


                <q-input
                  label="شرح"
                  v-model="newItemBody"
                  outlined
                  autogrow/>

              </div>

            </q-card-section>


            <q-separator/>
            <q-card-actions align="center" class="q-py-md">
              <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
              <q-btn color="accent" rounded :disable="loadingItems" @click.prevent="addRow()" label="افزودن"/>
            </q-card-actions>
          </q-card>
        </q-dialog>
      </div>
      <div v-else>
        <q-card flat class="border-radius-card">
          <q-card-section>
            <div class="text-h6">گزارش کاری امروز شما ثبت شده است</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<script>
import {api} from 'boot/axios'
import {QSpinnerPuff} from "quasar";

export default {
  name: 'CreateDailyReport',
  data() {
    return {
      confirm: false,
      workDoingTimeOptions: [
        '8-9', '9-10', '10-11', '11-12', '12-13', '13-14', '14-15:30'
      ],

      startTime: '',
      endTime: '',
      newItemTime: null,
      newItemBody: '',

      dataReportWorkTimes: [],
      rowsReportsHistory: [],

      loadingHistory: true,

      reportItem: {},
      data: {},
      todo: false,
      singleReportTitle: '',
      singleReportDlg: false,
      historyDlg: false,
      fullLoaded: false,

      newWorkTimeItem: [],
      dataItems: [],
      newItemDlg: false,
      loadingItems: false,
      columnsItems: [
        {name: 'time', align: 'center', label: 'ساعت انجام کار', field: 'time'},
        {name: 'body', align: 'center', label: 'شرح', field: 'body'},
        {name: 'action', align: 'center', label: 'عملیات', field: 'action'}
      ],


    }
  },
  methods: {
    addRow() {
      if (this.newItemTime.length > 0 && this.newItemBody.length > 0) {

        this.newItemDlg = false
        this.loadingItems = true

        setTimeout(() => {
          const newRow = {
            time: this.newItemTime,
            body: this.newItemBody
          }
          this.dataItems.push(newRow)

          this.newItemTime = '';
          this.newItemBody = '';

          this.loadingItems = false
        }, 500)

      }
    },

    submitTodayReportForm() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })


      let payload = {}
      payload.startTime = this.startTime
      payload.endTime = this.endTime
      payload.items = this.dataItems;


      api.post('daily-reports/store', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })


          this.dataItems = [];
          this.todo = false;
          this.confirm = false;
          this.getAndCheckForm()

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    saveTodayReportForm() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.startTime = this.startTime
      payload.endTime = this.endTime
      payload.items = this.dataItems;

      api.post('daily-reports/save', payload)
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
    },
    removeItem(index) {
      this.loadingItems = true
      setTimeout(() => {
        this.dataItems = [...this.dataItems.slice(0, index), ...this.dataItems.slice(index + 1)]
        this.loadingItems = false
      }, 500)
    },

    getAndCheckForm() {

      api.get('daily-reports/my-list')
        .then(response => {
          this.rowsReportsHistory = response.data.data.rows
          this.todo = response.data.data.todo


          if (response.data.data.saved !== undefined && response.data.data.saved !== null) {
            let savedData = response.data.data.saved;

            this.startTime = savedData.start_time
            this.endTime = savedData.end_time

            this.dataItems = savedData.items;
          }

          this.fullLoaded = true;

          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },

  },
  created() {

    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    });

    this.getAndCheckForm();


  }
}
</script>
<style>
</style>
