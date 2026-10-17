<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست چک ها</div>
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
            <div class="q-gutter-sm">
              <div>
                <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
              </div>

              <q-select dense clearable rounded outlined v-model="checkTypeSearch"
                        :options="checkTypeSearchOptions" label="نوع چک"/>
              <q-select dense clearable rounded outlined v-model="checkStatusSearch"
                        :options="checkStatusSearchOptions" label="وضعیت چک"/>
            </div>

          </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="type" :props="props">

                <q-badge color="warning" v-if="parseInt(props.row.type) === 0" label="پرداختی"/>
                <q-badge color="positive" v-else label="دریافتی"/>

              </q-td>
              <q-td key="status" :props="props">
                <q-badge color="warning" v-if="parseInt(props.row.status) === 0" label="معوق"/>
                <q-badge color="positive" v-else-if="parseInt(props.row.status) === 1" label="پاس شده"/>
                <q-badge color="negative" v-else label="برگشت خورده شده"/>
              </q-td>
              <q-td key="jalali_date" :props="props">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="amount" :props="props">
                {{ moneyFormat(props.row.amount) }}
              </q-td>
              <q-td key="series" :props="props">
                {{ props.row.series }}
              </q-td>
              <q-td key="serial" :props="props">
                {{ props.row.serial }}
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'CheckEdit',params:{id:props.row.id} }"/>
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

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded @click.prevent="deleteItem()" label="تایید"/>
        </q-card-actions>
      </q-card>
    </q-dialog>


  </q-page>
</template>

<script>
import {exportFile} from 'quasar'
import {api} from 'boot/axios'


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


export default {
  name: "ChecksList",

  watch: {
    checkTypeSearch: function (e) {
      if (e === null) {
        if (this.checkStatusSearch === '') {
          this.rows = this.noFilterRows;
        } else {
          this.rows = this.noFilterRows.filter(o => parseInt(o.status) === this.checkStatusSearch.value);
        }
      } else if (e.value === 0) {
        if (this.checkStatusSearch === '') {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 0);
        } else {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 0).filter(o => parseInt(o.status) === this.checkStatusSearch.value);
        }
      } else if (e.value === 1) {
        if (this.checkStatusSearch === '') {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 1);
        } else {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 1).filter(o => parseInt(o.status) === this.checkStatusSearch.value);
        }
      }
    },
    checkStatusSearch: function (e) {
      if (e === null) {
        if (this.checkTypeSearch === '') {
          this.rows = this.noFilterRows;
        } else {
          this.rows = this.noFilterRows.filter(o => parseInt(o.type) === this.checkTypeSearch.value);
        }
      } else if (e.value === 0) {
        if (this.checkTypeSearch === '') {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 0);
        } else {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 0).filter(o => parseInt(o.type) === this.checkTypeSearch.value);
        }
      } else if (e.value === 1) {
        if (this.checkTypeSearch === '') {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 1);
        } else {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 1).filter(o => parseInt(o.type) === this.checkTypeSearch.value);
        }
      } else if (e.value === 2) {
        if (this.checkTypeSearch === '') {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 2);
        } else {
          this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 2).filter(o => parseInt(o.type) === this.checkTypeSearch.value);
        }
      }
    }
  },

  data() {
    return {
      filter: '',

      checkTypeSearch: '',

      checkTypeSearchOptions: [
        {label: 'پرداختی', value: 0},
        {label: 'دریافتی', value: 1}
      ],
      checkStatusSearchOptions: [
        {label: 'معوق', value: 0}, {label: 'پاس شده', value: 1}, {label: 'برگشت خورده', value: 2}
      ],

      checkStatusSearch: '',


      customers: [],
      customersOptions: [],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'type', field: 'type', align: 'center', label: 'نوع'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'jalali_date', field: 'jalali_date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'amount', field: 'amount', align: 'center', label: 'مبلغ (تومان)'},
        {name: 'series', field: 'series', align: 'center', label: 'سری'},
        {name: 'serial', field: 'serial', align: 'center', label: 'سریال'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: [],

    }
  },
  methods: {
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.customersOptions = this.customers
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.customersOptions = this.customers.filter(
          v => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let payload = {};
      payload.id = this.itemFocusingId

      api.post('checks/destroy', payload)
        .then(response => {

          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })

          setTimeout(() => location.reload(), 1200);

          this.deleteConfirmDialog = false;
        })
        .catch(() => {
          this.loading = false
        });
    },
    getData() {
      api.get('checks/list')
        .then(response => {
          this.rows = response.data.data
          this.noFilterRows = response.data.data
          this.loading = false
          this.$q.loading.hide();
        })
        .catch(() => {
          this.loading = false
          this.$q.loading.hide();
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
    }
  },
  created() {

    this.getData()

  }

}

</script>

<style scoped>

</style>
