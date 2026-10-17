<template>
  <q-page class="q-pa-lg">
    <q-card bordered>
      <q-card-section>


        <div class="row items-center no-wrap">
          <div class="col">
            <div v-if="userRole === 0" class="text-h6">گزارش فعالیت کاربران</div>
            <div v-else class="text-h6">گزارش فعالیت من</div>
            <div class="text-subtitle2">{{ pageCaption }}</div>
          </div>

          <div class="col-auto">
            <div class="q-gutter-x-md row items-center">

              <q-input dense clearable mask="####/##/##" dir="ltr" v-model="startDate" label="تاریخ شروع">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="startDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup label="بستن" color="primary" flat/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>


              <q-input dense clearable mask="####/##/##" dir="ltr" v-model="endDate" label="تاریخ پایان">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="endDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup label="بستن" color="primary" flat/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>

              <q-btn label="اعمال تغییرات" @click.prevent="filterData" color="teal" icon-right="date_range"/>

            </div>
          </div>
        </div>

      </q-card-section>

      <q-separator inset/>

      <q-card-section>
        <q-table
          :loading="loading"
          binary-state-sort
          :rows="rows2"
          :filter="filter"
          :grid="$q.screen.xs"
          :columns="columns"
          row-key="uuid"
          :rows-per-page-options="[10]"
        >


          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
          </template>


          <template v-slot:top-right="props">
            <div class="q-gutter-x-sm">
              <q-btn
                color="info"
                :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                @click="props.toggleFullscreen"
              />
              <q-btn
                color="accent"
                icon-right="archive"
                @click="exportTable"/>
            </div>
          </template>

            <template v-slot:top-left>
              <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                <template v-slot:append>
                  <q-icon name="search"/>
                </template>
              </q-input>
              <br/>
              <div v-if="userRole === 0">
                <q-select
                  clearable
                  dense
                  option-label="name"
                  option-value="uuid"
                  outlined
                  use-input
                  v-model="customerCategory"
                  label="انتخاب کاربر"
                  :options="customerCategoryOptions"
                  @filter="filterFn">

                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        یافت نشد
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>

            </template>


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="type" :props="props" dir="ltr">
                {{ props.row.type }}
              </q-td>
              <q-td key="date" :props="props" dir="ltr">
                {{ props.row.date }}
              </q-td>
              <q-td key="SabtKonande" :props="props">
                {{ props.row.SabtKonande }}
              </q-td>
            </q-tr>
          </template>

        </q-table>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script>
import {LocalStorage, QSpinnerPuff} from "quasar";
import {exportFile} from 'quasar'
import {api} from "boot/axios";


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
  name: "UsersReport",

  watch: {
    customerCategory: function (e) {
      if (e !== null) {
        this.rows2 = (this.noFilterRows).filter (o => ( o.user !=null ? o.user.name === e.name :void 0));
      } else {
        this.rows2 = this.noFilterRows;
      }
    }
  },
  data() {
    return {
      filter:'',
      userRole: Number(LocalStorage.getItem('role')),
      startDate: null,
      endDate: null,
      userId: null,
      customerCategory:null,
      users: [],
      pageCaption: '',
      usersOptions: [],
      userCategoryOptions: [],
      customerCategoryOptions:[],
      userCategories: [],
      customerCategories:[],
      loading: false,
      noFilterRows: [], // افزوده شده
      columns: [
        {name: 'type', field: 'type', align: 'center', label: 'عنوان'},
        {name: 'date', field: 'date', align: 'center', label: 'تاریخ / ساعت'},
        {name: 'SabtKonande', field: 'SabtKonande', align: 'center', label: 'کاربر'},
      ],
      rows: [],
      rows2: [],
    }
  },
  methods: {
    filterData() {
      if ((this.startDate !== undefined && this.startDate !== null && this.startDate !== "") && (this.endDate !== undefined && this.endDate !== null && this.endDate !== "")) {
        this.rows2 = this.rows.filter(a => {
          return (a.date >= (this.startDate)) && (a.date <= (this.endDate + '00:00:00'));
        });
      } else if (!(this.startDate !== undefined && this.startDate !== null && this.startDate !== "") && (this.endDate !== undefined && this.endDate !== null && this.endDate !== "")) {
        this.rows2 = this.rows.filter(a => {
          return ((a.date <= (this.endDate + '00:00:00')));
        });
      } else if ((this.startDate !== undefined && this.startDate !== null && this.startDate !== "") && !(this.endDate !== undefined && this.endDate !== null && this.endDate !== "")) {
        this.rows2 = this.rows.filter(a => {
          return (a.date >= (this.startDate));
        });
      } else if (!(this.startDate !== undefined && this.startDate !== null && this.startDate !== "") && !(this.endDate !== undefined && this.endDate !== null && this.endDate !== "")) {
        this.rows2 = this.rows;
      }
    },
    getUsers() {
      api.get('users')
        .then(response => {
          this.customerCategories = response.data.data
          this.customerCategoryOptions = response.data.data
        })
        .finally(() => {
          this.$q.loading.hide();
        })
    },

    getData(userId) {
      let formData = new FormData();

      formData.append('id', userId);

      api.post('UserReport/list', formData)
        .then(response => {
          this.noFilterRows = response.data.data
          this.rows = response.data.data;
          this.rows2 = response.data.data;

        })
    },
    getMine() {
      this.loading = true;
      api.post('UserReport/list')
        .then(response => {
          this.noFilterRows = response.data.data
          this.rows = response.data.data;
          this.rows2 = response.data.data;
          this.loading = false;
        })

    },

    exportTable() {
      const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
        this.rows2.map(row => this.columns.map(col => wrapCsvValue(
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
    },
    filterFn(val, update) {
      if (val === '') {
        update(() => {
          this.customerCategoryOptions = this.customerCategories
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.customerCategoryOptions = this.customerCategories.filter(v => v.name.toLowerCase().indexOf(needle) > -1)
      })
    },

  },

  created() {
    if (this.userRole === 0 ) {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })
      this.getData();
    } else {
      this.getMine();
    }
    this.getUsers();
  }

}

</script>

<style scoped>

</style>
