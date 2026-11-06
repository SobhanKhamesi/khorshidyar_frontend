<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>

        <div class="text-h6">لیست خدمات پس از فروش</div>
      </q-card-section>
      <q-separator/>
      <q-card-section>
        <div class="row items-center q-gutter-md q-mb-sm">
          <q-toggle v-model="onlyNeedsReview" color="negative"
                    :label="'فقط نظرسنجی‌های ضعیف بررسی‌نشده (' + needsReviewCount + ')'"/>
          <div class="row items-center q-gutter-xs text-caption">
            <span class="legend-box legend-box-poor"></span>
            <span>نظرسنجی ضعیف، نیازمند بررسی دلیل نارضایتی</span>
          </div>
        </div>
        <q-table :loading="loading" flat bordered class="border-radius-table" :rows="filteredRows" :filter="filter"
                 :columns="columns" :rows-per-page-options="[10]">
          <template v-slot:loading>
            <q-inner-loading showing color="primary"/>
          </template>
          <template v-slot:top-right="props">
            <div class="q-gutter-sm">
              <q-btn round color="info" :icon="props.inFullscreen ? 'fullscreen_exit' : 'fullscreen'"
                     @click="props.toggleFullscreen"/>
              <q-btn round color="negative" size="13px" icon="ti-export" @click="exportTable()"/>
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
            <q-tr :props="props" :class="rowClass(props.row)">
              <q-td key="customer" :props="props"> {{ props.row.customer ? props.row.customer.fullName : '-' }}</q-td>
              <q-td key="service_type" :props="props"> {{
                  props.row.service_type ? props.row.service_type.title : '-'
                }}
              </q-td>
              <q-td key="status" :props="props">
                <q-badge :color="statusColor(props.row.status)"> {{ props.row.status_label }}</q-badge>
              </q-td>
              <q-td key="source" :props="props">
                <q-badge :color="sourceColor(props.row.source)" outline> {{ props.row.source_label }}</q-badge>
              </q-td>
              <q-td key="request_date" :props="props"> {{ props.row.jalali_request_date || '-' }}</q-td>
              <q-td key="responsible_user" :props="props">
                {{ props.row.responsible_user ? props.row.responsible_user.name : '-' }}
              </q-td>
              <q-td key="follow_up_date" :props="props">
                {{ props.row.jalali_follow_up_date || '-' }}
                <q-icon v-if="isUrgentFollowUp(props.row)" name="warning" color="negative" size="16px"
                        class="q-mr-xs">
                  <q-tooltip>نیازمند پیگیری امروز یا فردا</q-tooltip>
                </q-icon>
              </q-td>
              <q-td key="rating" :props="props">
                <template v-if="getSubmittedRating(props.row)">
                  <q-badge :color="levelColor(getSubmittedRating(props.row).level)">
                    {{ getSubmittedRating(props.row).level_label }}
                    ({{ Number(getSubmittedRating(props.row).rating).toFixed(1) }})
                  </q-badge>
                  <q-icon v-if="getSubmittedRating(props.row).needs_review" name="notifications_active"
                          color="negative" size="18px" class="q-mr-xs">
                    <q-tooltip>نارضایتی مشتری؛ دلیل آن باید بررسی شود</q-tooltip>
                  </q-icon>
                  <q-icon v-else-if="getSubmittedRating(props.row).reviewed_at" name="task_alt"
                          color="positive" size="18px" class="q-mr-xs">
                    <q-tooltip>دلیل نارضایتی بررسی شده است</q-tooltip>
                  </q-icon>
                </template>
                <span v-else>-</span>
              </q-td>
              <q-td key="action" :props="props" class="q-gutter-x-sm">
                <q-btn @click.prevent="showDetails(props.row.id)" title="مشخصات بیشتر" dense round color="brown"
                       icon="info"/>
                <q-btn v-if="isOpen(props.row)" @click.prevent="openCompleteDialog(props.row.id)" title="تکمیل کردن"
                       dense round color="positive" icon="check"/>
                <q-btn v-if="getSubmittedRating(props.row)" @click.prevent="showRatingDialog(props.row)"
                       title="نظرسنجی مشتری" dense round color="deep-purple" icon="star"/>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                       :to="{ name:'AfterSalesServiceEdit', params:{id:props.row.id} }"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteConfirmation(props.row.id)"/>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
    <q-dialog v-model="deleteConfirmDialog">
      <q-card>
        <q-card-section class="row items-center"><span
            class="q-mr-sm">آیا از حذف این خدمت پس از فروش اطمینان دارید؟</span></q-card-section>
        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" :loading="deleting" @click.prevent="deleteItem()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="detailsDlg">
      <q-card style="width: 700px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">مشخصات خدمت پس از فروش</div>
        </q-card-section>
        <q-separator/>
        <q-card-section v-if="detailsLoading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </q-card-section>
        <q-card-section v-else-if="details">
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">مشتری</div>
              <div class="text-body1">{{ details.customer ? details.customer.fullName : '-' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">نوع خدمت</div>
              <div class="text-body1">{{ details.service_type ? details.service_type.title : '-' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">وضعیت</div>
              <q-badge :color="statusColor(details.status)">{{ details.status_label }}</q-badge>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">منبع</div>
              <q-badge :color="sourceColor(details.source)" outline>{{ details.source_label }}</q-badge>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">مسئول (نصاب)</div>
              <div class="text-body1">{{ details.responsible_user ? details.responsible_user.name : '-' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">تاریخ ثبت درخواست</div>
              <div class="text-body1">{{ details.jalali_request_date || '-' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">تاریخ مراجعه نصاب</div>
              <div class="text-body1">{{ details.jalali_follow_up_date || '-' }}</div>
            </div>
            <div class="col-md-6 col-xs-12">
              <div class="text-caption text-grey-7">تاریخ ایجاد</div>
              <div class="text-body1">{{ details.jalali_date || '-' }}</div>
            </div>
            <div class="col-12">
              <div class="text-caption text-grey-7">مشکل</div>
              <div class="text-body1">{{ details.problem || '-' }}</div>
            </div>
            <div class="col-12" v-if="details.resolution_description">
              <div class="text-caption text-grey-7">نتیجه پیگیری</div>
              <div class="text-body1">{{ details.resolution_description }}</div>
            </div>
            <div class="col-12" v-if="details.installation_service_id">
              <div class="text-caption text-grey-7">مرتبط با سرویس نصب</div>
              <div class="text-body1">{{ details.installation_service_title || 'سرویس نصب' }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="completeDlg">
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitComplete()">
          <q-card-section>
            <div class="text-h6">تکمیل خدمت پس از فروش</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input outlined autogrow v-model="completeResolutionDescription" label="توضیحات نتیجه پیگیری" required/>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="text-bold">آیا پیامک لینک نظرسنجی ارسال شود؟</div>
            <div class="row items-center q-gutter-md">
              <q-radio v-model="sendSms" :val="true" label="بله" />
              <q-radio v-model="sendSms" :val="false" label="خیر" />
            </div>
          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="positive" rounded label="تکمیل" type="submit" :loading="completing"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="ratingDlg">
      <q-card style="width: 480px; max-width: 95vw;">
        <q-card-section>
          <div class="text-h6">نظرسنجی مشتری</div>
        </q-card-section>
        <q-separator/>
        <q-card-section v-if="selectedRating" class="text-center">
          <div class="rating-stars-readonly" dir="ltr">
            <div class="rating-stars-base">
              <q-icon v-for="n in 5" :key="'rd-base-'+n" name="star" size="34px" color="grey-4"/>
            </div>
            <div class="rating-stars-fill" :style="{ width: ratingFillPercent + '%' }">
              <q-icon v-for="n in 5" :key="'rd-fill-'+n" name="star" size="34px" color="amber-7"/>
            </div>
          </div>
          <div class="text-subtitle1 text-weight-bold q-mt-sm" dir="ltr">
            {{ Number(selectedRating.rating).toFixed(1) }} / 5
          </div>
          <q-badge :color="levelColor(selectedRating.level)" class="q-mt-xs text-body2">
            سطح رضایت: {{ selectedRating.level_label }}
          </q-badge>

          <div class="q-mt-md text-right" v-if="selectedRating.feedback">
            <div class="text-caption text-grey-7">بازخورد مشتری:</div>
            <div class="text-body2">{{ selectedRating.feedback }}</div>
          </div>
          <div class="text-caption text-grey q-mt-md" v-else>
            مشتری بازخورد متنی ثبت نکرده است
          </div>
        </q-card-section>
        <template v-if="selectedRating && selectedRating.level === LEVEL_POOR">
          <q-separator/>
          <q-card-section class="text-right">
            <template v-if="selectedRating.reviewed_at">
              <div class="text-caption text-grey-7">نتیجه بررسی دلیل نارضایتی:</div>
              <div class="text-body2">{{ selectedRating.review_description }}</div>
              <div class="text-caption text-grey q-mt-xs">
                {{ selectedRating.reviewer ? selectedRating.reviewer.name : '' }}
                - {{ selectedRating.jalali_reviewed_at }}
              </div>
            </template>
            <template v-else>
              <q-banner dense rounded class="bg-red-1 text-negative q-mb-sm">
                <template v-slot:avatar>
                  <q-icon name="notifications_active" color="negative"/>
                </template>
                رضایت مشتری ضعیف است؛ دلیل نارضایتی را بررسی و نتیجه را ثبت کنید.
              </q-banner>
              <q-input outlined autogrow v-model="reviewDescription" label="دلیل نارضایتی و نتیجه بررسی"/>
              <div class="text-center q-mt-sm">
                <q-btn color="negative" rounded label="ثبت بررسی" :loading="reviewing" @click="submitReview()"/>
              </div>
            </template>
          </q-card-section>
        </template>
        <q-separator/>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script> import {exportFile} from 'quasar'
import {api} from 'boot/axios'

function wrapCsvValue(val, formatFn) {
  let formatted = formatFn !== void 0 ? formatFn(val) : val
  formatted = formatted === void 0 || formatted === null ? '' : String(formatted)
  formatted = formatted.split('"').join('""')
  return `"${formatted}"`
}

// same status codes as backend AfterSalesService model
const STATUS_PENDING = 1
const STATUS_IN_PROGRESS = 2
// same level codes as backend Rating model
const LEVEL_POOR = 1
const LEVEL_AVERAGE = 2

export default {
  name: "ListAfterSalesService",
  data() {
    return {
      loading: true,
      filter: '',
      rows: [],
      columns: [
        {name: 'customer', field: 'customer', align: 'center', label: 'مشتری'},
        {
          name: 'service_type',
          field: 'service_type',
          align: 'center',
          label: 'نوع خدمت'
        },
        {name: 'status', field: 'status', align: 'center', label: 'وضعیت'}, {
          name: 'source',
          field: 'source',
          align: 'center',
          label: 'منبع'
        },
        {
          name: 'request_date',
          field: 'request_date',
          align: 'center',
          label: 'تاریخ ثبت درخواست',
          sortable: true
        },
        {
          name: 'responsible_user',
          field: 'responsible_user',
          align: 'center',
          label: 'مسئول'
        },
        {
          name: 'follow_up_date',
          field: 'follow_up_date',
          align: 'center',
          label: 'تاریخ مراجعه نصاب',
          sortable: true
        },
        {name: 'rating', field: 'rating', align: 'center', label: 'نظرسنجی'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      deleteConfirmDialog: false,
      itemFocusingId: '',
      deleting: false,
      detailsDlg: false,
      detailsLoading: false,
      details: null,
      completeDlg: false,
      completingServiceId: '',
      completeResolutionDescription: '',
      sendSms: true,
      completing: false,
      ratingDlg: false,
      selectedRating: null,
      LEVEL_POOR,
      onlyNeedsReview: this.$route.query.poor === '1',
      reviewDescription: '',
      reviewing: false
    }
  },
  computed: {
    filteredRows() {
      if (!this.onlyNeedsReview) return this.rows
      return this.rows.filter(row => this.needsReview(row))
    },
    needsReviewCount() {
      return this.rows.filter(row => this.needsReview(row)).length
    },
    ratingFillPercent() {
      if (!this.selectedRating) return 0
      return (Number(this.selectedRating.rating) / 5) * 100
    }
  },
  methods: {
    getData() {
      this.loading = true
      api.get('after-sales-service/list').then(response => {
        this.rows = response.data.data
      }).catch((error) => {
        this.notifyError(error)
      }).finally(() => {
        this.loading = false
      })
    },
    statusColor(status) {
      const map = {
        1: 'orange',
        2: 'blue', 3: 'positive', 4: 'grey'
      }
      return map[status] || 'grey'
    },

    sourceColor(source) {
      return source === 1 ? 'teal' : 'purple'
    },
    isOpen(service) {
      return service.status !== 3 && service.status !== 4
    },
    // returns 'YYYY-MM-DD' for a Date object, using local time (avoids UTC day-shift issues)
    toDateKey(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    // mirrors backend logic:
    // whereIn('follow_up_date', [today, tomorrow]) + status in [PENDING, IN_PROGRESS]
    isUrgentFollowUp(row) {
      if (!row || !row.follow_up_date) return false
      if (row.status !== STATUS_PENDING && row.status !== STATUS_IN_PROGRESS) return false

      const followUpKey = String(row.follow_up_date).substring(0, 10)

      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() - 1)

      return followUpKey === this.toDateKey(today) || followUpKey === this.toDateKey(tomorrow)
    },
    getSubmittedRating(service) {
      if (!service.ratings || !service.ratings.length) return null
      return service.ratings.find(r => r.is_submitted) || null
    },
    showRatingDialog(service) {
      this.selectedRating = this.getSubmittedRating(service)
      this.reviewDescription = ''
      this.ratingDlg = true
    },
    needsReview(row) {
      const rating = this.getSubmittedRating(row)
      return !!(rating && rating.needs_review)
    },
    rowClass(row) {
      if (this.needsReview(row)) return 'row-poor-rating'
      return this.isUrgentFollowUp(row) ? 'row-urgent-followup' : ''
    },
    levelColor(level) {
      if (level === LEVEL_POOR) return 'negative'
      if (level === LEVEL_AVERAGE) return 'orange'
      return 'positive'
    },
    submitReview() {
      if (!this.reviewDescription) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'دلیل نارضایتی و نتیجه بررسی را وارد کنید'})
        return
      }
      this.reviewing = true
      api.put(`after-sales-service/rating-review/${this.selectedRating.id}`, {review_description: this.reviewDescription}).then(response => {
        this.$q.notify({timeout: 3000, position: 'center', type: 'positive', message: response.data.message})
        this.selectedRating = response.data.data
        this.getData()
      }).catch((error) => {
        this.notifyError(error)
      }).finally(() => {
        this.reviewing = false
      })
    },
    showDetails(id) {
      this.detailsDlg = true
      this.detailsLoading = true
      this.details = null
      api.get(`after-sales-service/${id}`).then(response => {
        this.details = response.data.data
      }).catch((error) => {
        this.notifyError(error)
        this.detailsDlg = false
      }).finally(() => {
        this.detailsLoading = false
      })
    },

    openCompleteDialog(id) {
      this.completingServiceId = id
      this.completeResolutionDescription = ''
      this.completeDlg = true
    },
    submitComplete() {
      if (!this.completeResolutionDescription) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'توضیحات نتیجه پیگیری را وارد کنید'})
        return
      }
      this.completing = true
      api.put(`after-sales-service/complete/${this.completingServiceId}`, {resolution_description: this.completeResolutionDescription,send_sms : this.sendSms}).then(response => {
        this.$q.notify({timeout: 3000, position: 'center', type: 'positive', message: response.data.message})
        this.completeDlg = false
        this.getData()
      }).catch((error) => {
        this.notifyError(error)
      }).finally(() => {
        this.completing = false
      })
    },
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true
      this.itemFocusingId = id
    }, deleteItem() {
      this.deleting = true
      api.delete(`after-sales-service/destroy/${this.itemFocusingId}`).then(response => {
        this.$q.notify({type: 'positive', position: 'center', timeout: 1000, message: response.data.message})
        this.deleteConfirmDialog = false
        this.getData()
      }).catch((error) => {
        this.notifyError(error)
      }).finally(() => {
        this.deleting = false
      })
    }, notifyError(error) {
      const message = error?.response?.data?.message || 'خطایی رخ داده است، دوباره تلاش کنید'
      this.$q.notify({timeout: 4000, position: 'center', type: 'negative', message})
    },
    exportTable() {
      const columns = this.columns.filter(c => c.name !== 'action')
      const content = [columns.map(col => wrapCsvValue(col.label))].concat(this.rows.map(row => columns.map(col => {
        let val
        if (col.name === 'customer')
          val = row.customer ? row.customer.fullName : '-'
        else if (col.name === 'service_type')
          val = row.service_type ? row.service_type.title : '-'
        else if (col.name === 'status')
          val = row.status_label
        else if (col.name === 'source')
          val = row.source_label
        else if (col.name === 'responsible_user')
          val = row.responsible_user ? row.responsible_user.name : '-'
        else if (col.name === 'request_date')
          val = row.jalali_request_date || '-'
        else if (col.name === 'follow_up_date')
          val = row.jalali_follow_up_date || '-'
        else if (col.name === 'rating') {
          const rating = this.getSubmittedRating(row)
          val = rating ? `${rating.level_label} (${Number(rating.rating).toFixed(1)})` : '-'
        }
        else
          val = row[col.field] || '-'
        return wrapCsvValue(val, col.format)
      }).join(','))).join('\r\n')
      const status = exportFile('after-sales-services-export.csv', "\ufeff" + content, 'text/csv')
      if (status !== true) {
        this.$q.notify({message: 'مرورگر دسترسی دانلود فایل را بسته است.', color: 'negative', icon: 'warning'})
      }
    }
  },
  watch: {
    // آلارم نظرسنجی ضعیف در منو با ?poor=1 به همین صفحه هدایت می‌کند
    '$route.query.poor'(value) {
      this.onlyNeedsReview = value === '1'
      this.getData()
    }
  },
  created() {
    this.getData()
  }
}

</script>

<style scoped>
.rating-stars-readonly {
  position: relative;
  display: inline-block;
}

.rating-stars-base,
.rating-stars-fill {
  display: flex;
}

.rating-stars-fill {
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
  white-space: nowrap;
}

.row-urgent-followup :deep(td) {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

.row-poor-rating :deep(td) {
  background-color: rgba(244, 67, 54, 0.22) !important;
}

.legend-box-poor {
  background-color: rgba(244, 67, 54, 0.22);
  border: 1px solid rgba(244, 67, 54, 0.6);
}

.legend-box {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  display: inline-block;
}

.legend-box-urgent {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.4);
}
</style>
