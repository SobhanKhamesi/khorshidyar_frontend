<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">لیست یادآوری ها</div>
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
            <div class="q-gutter-sm">
              <div>
                <q-input rounded outlined dense v-model="filter" placeholder="جستجو">
                  <template v-slot:append>
                    <q-icon name="search"/>
                  </template>
                </q-input>
              </div>
              <div>
                <q-select dense rounded outlined v-model="remindersStatusSearch"
                          :options="remindersStatusSearchOptions" label="وضعیت"/>
              </div>
            </div>
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
                       :icon="props.expand ? 'remove' : 'add'"
                >
                  <q-tooltip
                    transition-show="scale"
                    transition-hide="scale">
                    توضیحات
                  </q-tooltip>
                </q-btn>
              </q-td>
              <q-td key="title" :props="props" style="white-space: normal">
                {{ props.row.title }}
              </q-td>
              <q-td key="type" :props="props">
                <q-chip dense square text-color="white" :color="meta(props.row.type).color"
                        :icon="meta(props.row.type).icon" :label="meta(props.row.type).label"/>
              </q-td>
              <q-td key="date" :props="props">
                {{ props.row.jalali_date }}
              </q-td>
              <q-td key="status" :props="props">
                <q-badge color="warning" v-if="parseInt(props.row.status) === 0" label="فعال"/>
                <q-badge color="positive" v-else label="تکمیل شده"/>
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.description }}
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn v-if="route(props.row.type)" title="مشاهده" dense round color="primary" icon="visibility"
                       :to="route(props.row.type)"/>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'ReminderEdit',params:{id:props.row.id} }"/>
                <q-btn v-if="$access.can('personal.delete')" title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id)"/>
              </q-td>
            </q-tr>
            <q-tr v-show="props.expand" :props="props">
              <q-td colspan="100%">
                <div>{{ props.row.description }}</div>
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
import {reminderMeta, reminderRoute} from 'src/utils/reminders'


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
  name: "RemindersList",

  watch: {
    remindersStatusSearch: function (e) {
      if (e === 'فعال') {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 0);
      } else if (e === 'تکمیل شده') {
        this.rows = (this.noFilterRows).filter(o => parseInt(o.status) === 1);
      } else {
        this.rows = this.noFilterRows;
      }
    }
  },


  data() {
    return {
      filter: '',

      remindersStatusSearch: '',
      remindersStatusSearchOptions: [
        'تکمیل شده', 'فعال'
      ],

      deleteConfirmDialog: false,
      itemFocusingId: '',
      loading: true,
      columns: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'type', field: row => reminderMeta(row.type).label, align: 'center', label: 'نوع'},
        {name: 'date', field: 'jalali_date', align: 'center', label: 'تاریخ'},
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      noFilterRows: [],
    }
  },
  methods: {
    meta(type) {
      return reminderMeta(type)
    },
    route(type) {
      return reminderRoute(type)
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let payload = {};
      payload.id = this.itemFocusingId

      api.post('reminders/destroy', payload)
        .then(response => {

          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          setTimeout(() =>
              location.reload()
            , 1200);

          this.deleteConfirmDialog = false;
        })
        .catch(() => {
          this.loading = false
        });
    },
    getData() {
      api.get('reminders/list')
        .then(response => {
          this.rows = response.data.data
          this.noFilterRows = response.data.data
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
