<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست هدف گذاری ها</div>
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
              <q-td key="month" :props="props">
                {{ props.row.month }}
              </q-td>
              <q-td key="sales" :props="props">
                {{ moneyFormat(props.row.sales) }}
              </q-td>
              <q-td key="calls" :props="props">
                {{ props.row.calls }}
              </q-td>
              <q-td key="status" :props="props">
                <q-badge v-if="props.row.status[0]" color="positive" label="به هدف رسیده"/>
                <q-badge v-else-if="!props.row.status[0] && props.row.status[1] === 0" color="dark"
                         label="به هدف نرسیده"/>
                <q-badge v-else color="orange" label="در انتظار"/>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'TargetingEdit',params:{id:props.row.id} }"/>
                <q-btn v-if="$access.can('targeting.manage')" title="حذف" dense round color="negative" icon="delete"
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
        <q-card-actions align="center">
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
  name: "TargetingList",
  data() {
    return {
      filter: '',
      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'user', field: 'user', align: 'center', label: 'کاربر'},
        {name: 'month', field: 'month', align: 'center', label: 'تاریخ'},
        {name: 'sales', field: 'sales', align: 'center', label: 'مبلغ فروش (تومان)'},
        {name: 'calls', field: 'target', align: 'center', label: 'تعداد تماس'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: []
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

      api.post('targeting/destroy', payload)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
          this.getData();
          this.deleteConfirmDialog = false;
        })
        .catch(() => {
          this.loading = false
        });
    },
    getData() {
      api.get('targeting/list')
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
