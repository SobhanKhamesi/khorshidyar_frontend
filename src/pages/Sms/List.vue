<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست پیامک های ارسال شده</div>
      </q-card-section>

      <q-separator/>

      <q-card-section>
        <q-table
            flat bordered class="border-radius-table"
            :loading="loading"
            :rows="rows"
            :filter="filter"
            :columns="columns"
            row-key="id"
            :rows-per-page-options="[10]"
        >

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
            <q-input outlined rounded dense v-model="filter" placeholder="جستجو">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>

          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
          </template>

          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width/>
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-btn size="sm" color="accent" round dense @click="props.expand = !props.expand"
                       :icon="props.expand ? 'remove' : 'add'">
                  <q-tooltip
                      transition-show="scale"
                      transition-hide="scale">
                    دریافت کنندگان
                  </q-tooltip>
                </q-btn>
              </q-td>
              <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props">
                {{ col.value }}
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div>{{ props.row.receivers }}</div>
              </q-td>
            </q-tr>
          </template>


        </q-table>
      </q-card-section>
    </q-card>
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
  name: "SmsList",
  data() {
    return {
      filter: '',
      loading: true,
      columns: [
        {name: 'receiver_type_label', field: 'receiver_type_label', align: 'center', label: 'نوع ارسال'},
        {name: 'category', field: row => row.category?.title || '-', align: 'center', label: 'دسته بندی'},
        {name: 'body', field: 'body', align: 'center', label: 'متن'},
        {name: 'count', field: 'count', align: 'center', label: 'تعداد'},
        {name: 'SabtKonande', field: 'SabtKonande', align: 'center', label: 'ثبت کننده'},
        {name: 'jalali_created_at', field: 'jalali_created_at', align: 'center', label: 'تاریخ'}
      ],
      rows: []
    }
  },
  methods: {
    getData() {
      api.get('sms/list')
          .then(response => {
            this.rows = response.data.data
            this.loading = false
          })
          .catch(() => {
            this.loading = false
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
          'text/csv'
      )


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
