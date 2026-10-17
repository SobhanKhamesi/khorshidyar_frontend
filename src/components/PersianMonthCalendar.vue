<template>
  <div>
    <div class="row items-center justify-between q-mb-md">
      <q-btn flat round dense icon="chevron_right" @click="goNext"/>
      <div class="text-subtitle1 text-weight-bold">
        {{ monthNamesFa[jMonth - 1] }} {{ jYear }}
      </div>
      <q-btn flat round dense icon="chevron_left" @click="goPrev"/>
    </div>

    <div class="calendar-grid">
      <div class="calendar-header-cell text-caption text-grey-8" v-for="wd in weekDaysFa" :key="wd">
        {{ wd }}
      </div>

      <template v-for="(week, wIndex) in weeks">
        <div
          v-for="(day, dIndex) in week"
          :key="wIndex + '-' + dIndex"
          class="calendar-day-cell"
          :class="{
            'calendar-day-empty': !day,
            'calendar-day-today': day && day.isToday,
            'calendar-day-off': day && !isWorkingDay(day)
          }">
          <template v-if="day">
            <div class="row items-center justify-between">
              <span class="text-weight-bold">{{ day.jDate }}</span>
              <q-badge v-if="!isWorkingDay(day)" color="grey-5" rounded/>
            </div>

            <slot
              :day="day"
              :events="eventsByDate[day.gregorian] || []"
              :is-working-day="isWorkingDay(day)"/>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import moment from 'moment-jalaali'

moment.loadPersian({usePersianDigits: false, dialect: 'persian-modern'})

export default {
  name: "PersianMonthCalendar",

  props: {
    // سال و ماه شمسی که در حال نمایشش هستیم (v-model سبک: jYear.sync / jMonth.sync)
    jYear: {type: Number, required: true},
    jMonth: {type: Number, required: true}, // 1 تا 12

    // آرایه ای از رخدادها - هرکدوم باید فیلد date به فرمت گرگوری YYYY-MM-DD داشته باشه
    events: {type: Array, default: () => []},

    // آرایه ای از شماره روزهای هفته کاری (۰=شنبه ... ۶=جمعه)؛ اگر null باشه یعنی همه روزها کاری هستن
    workingWeekdays: {type: Array, default: null}
  },

  data() {
    return {
      weekDaysFa: ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'],
      monthNamesFa: [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
      ]
    }
  },

  computed: {
    weeks() {
      const start = moment().jYear(this.jYear).jMonth(this.jMonth - 1).jDate(1)
      // روش مستقل از نسخه moment-jalaali برای گرفتن تعداد روزهای ماه شمسی:
      // روز اول ماه بعد رو می‌گیریم و یک روز عقب می‌ریم
      const daysInMonth = start.clone().add(1, 'jMonth').subtract(1, 'day').jDate()
      // تبدیل روز هفته گرگوری (۰=یکشنبه) به روز هفته شمسی (۰=شنبه)
      const offset = (start.day() + 1) % 7

      const cells = []
      for (let i = 0; i < offset; i++) cells.push(null)

      for (let d = 1; d <= daysInMonth; d++) {
        const m = moment().jYear(this.jYear).jMonth(this.jMonth - 1).jDate(d)
        cells.push({
          jDate: d,
          jWeekday: (m.day() + 1) % 7,
          gregorian: m.format('YYYY-MM-DD'),
          isToday: m.isSame(moment(), 'day')
        })
      }

      while (cells.length % 7 !== 0) cells.push(null)

      const weeks = []
      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7))
      }
      return weeks
    },

    eventsByDate() {
      const map = {}
      for (const ev of this.events) {
        if (!map[ev.date]) map[ev.date] = []
        map[ev.date].push(ev)
      }
      for (const key in map) {
        map[key].sort((a, b) => (a.time || '').localeCompare(b.time || ''))
      }
      return map
    }
  },

  methods: {
    isWorkingDay(day) {
      if (!this.workingWeekdays) return true
      return this.workingWeekdays.includes(day.jWeekday)
    },

    goPrev() {
      let jy = this.jYear
      let jm = this.jMonth - 1
      if (jm < 1) {
        jm = 12
        jy -= 1
      }
      this.$emit('change-month', {jYear: jy, jMonth: jm})
    },

    goNext() {
      let jy = this.jYear
      let jm = this.jMonth + 1
      if (jm > 12) {
        jm = 1
        jy += 1
      }
      this.$emit('change-month', {jYear: jy, jMonth: jm})
    }
  }
}
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-header-cell {
  text-align: center;
  padding: 4px 0;
}

.calendar-day-cell {
  min-height: 96px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 4px;
  overflow: hidden;
}

.calendar-day-empty {
  border: none;
}

.calendar-day-today {
  border-color: var(--q-accent);
  border-width: 2px;
}

.calendar-day-off {
  background-color: #fafafa;
  opacity: 0.6;
}
</style>
