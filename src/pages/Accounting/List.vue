<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست فاکتور ها</div>
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

              <div>
                <q-select dense rounded outlined v-model="factorTypeSearch" :options="factorTypeSearchOptions"
                          clearable
                          label="نوع فاکتور"/>
              </div>
            </div>

          </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="type" :props="props">

                <q-badge color="teal-6" v-if="parseInt(props.row.type) === 0" label="پیش فاکتور"/>
                <q-badge color="primary" v-else-if="parseInt(props.row.type) === 2" label="فاکتور خرید"/>
                <q-badge color="accent" v-else-if="parseInt(props.row.type) === 3" label="فاکتور فروش"/>
                <q-badge color="lime-10" v-else-if="parseInt(props.row.type) === 4" label="فاکتور برگشت از خرید"/>
                <q-badge color="secondary" v-else-if="parseInt(props.row.type) === 5" label="فاکتور برگشت از فروش"/>


              </q-td>
              <q-td key="number" :props="props">
                {{ props.row.number }}
              </q-td>
              <q-td key="customer_name" :props="props">
                {{ props.row.customer.fullName }}
              </q-td>
              <q-td key="final_price" :props="props">
                {{ moneyFormat(props.row.final_price) }}
              </q-td>
              <q-td key="date" :props="props">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn :href="'/v6/print/' + props.row.id" target="_blank" title="پرینت" dense round
                       color="positive" icon="print"/>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'InvoiceEdit',params:{id:props.row.id} }"/>
                <q-btn v-if="$access.can('accounting.manage')" title="حذف" dense round color="negative" icon="delete"
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
  name: "InvoicesList",
  watch: {
    factorTypeSearch: function (e) {
      if (e === null) {
        this.rows = this.noFilterRows;
      } else if (e.value === 0) {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 0);
      } else if (e.value === 2) {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 2);
      } else if (e.value === 3) {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 3);
      } else if (e.value === 4) {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 4);
      } else if (e.value === 5) {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.type) === 5);
      }
    }
  },
  data() {
    return {
      filter: '',

      factorTypeSearch: '',
      factorTypeSearchOptions: [
        {label: 'پیش فاکتور', value: 0},
        {label: 'فاکتور خرید', value: 2},
        {label: 'فاکتور فروش', value: 3},
        {label: 'فاکتور برگشت از خرید', value: 4},
        {label: 'فاکتور برگشت از فروش', value: 5},
      ],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'type', field: 'type', align: 'center', label: 'نوع فاکتور'},
        {name: 'number', field: 'number', align: 'center', label: 'شماره فاکتور'},
        {name: 'customer_name', field: 'customer_name', align: 'center', label: 'مشتری'},
        {name: 'final_price', field: 'final_price', align: 'center', label: 'مبلغ (تومان)'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ', sortable: true},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: []
    }
  },
  methods: {
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let payload = {};
      payload.id = this.itemFocusingId

      api.post('accounting/destroy', payload)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })

          this.deleteConfirmDialog = false;
          this.loading = false;
          this.getData();
        })
        .catch(() => {
          this.loading = false
        });
    },
    getData() {
      this.loading = true
      api.get('accounting/list')
        .then(response => {
          this.noFilterRows = response.data.data
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
