<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)"
            :maximized="!$q.screen.gt.sm"
            :full-width="!$q.screen.gt.sm"
            :full-height="!$q.screen.gt.sm"
            transition-show="slide-up"
            transition-hide="slide-down">
    <q-card class="dialog-card-big2">
      <q-card-section>
        <div class="text-h6">فرم بازدید</div>
      </q-card-section>

      <q-separator/>

      <q-card-section style="max-height: 75vh" class="scroll">

        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="2em"/>
        </div>

        <div v-else-if="!surveyType" class="text-center text-grey q-pa-lg">
          فرم بازدیدی برای این درخواست ثبت نشده است
        </div>

        <!-- ============ نمایش فرم خانگی ============ -->
        <div v-else-if="surveyType === 1 && home" class="q-gutter-y-md">

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">هدف مشتری</div>
            <q-chip v-for="g in home.goals" :key="g" dense color="primary" text-color="white">{{ g }}</q-chip>
            <span v-if="!home.goals || !home.goals.length" class="text-grey">-</span>
          </div>

          <q-separator/>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <field-row label="کنتور تک فاز"
                         :value="home.meter?.single?.selected ? 'دارد - تعداد: ' + (home.meter.single.count ?? '-') : 'ندارد'"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="کنتور سه فاز"
                         :value="home.meter?.three?.selected ? 'دارد - تعداد: ' + (home.meter.three.count ?? '-') : 'ندارد'"/>
            </div>
          </div>

          <field-row label="تخمین محل نصب دستگاه" :value="home.installLocationNote"/>
          <field-row label="تابلو برق داخلی" :value="yesNo(home.hasInternalPanel)"/>
          <field-row label="محل اتصال سیستم به مصرف کننده" :value="home.connectionPoint"/>
          <field-row label="مقدار کابل مورد نیاز" :value="withUnit(home.cableLength, 'متر')"/>
          <field-row label="محل نصب پنل ها" :value="home.panelLocationNote"/>

          <div v-if="home.panelPhoto">
            <div class="text-subtitle2 text-grey-8 q-mb-xs">عکس محل نصب پنل</div>
            <q-img :src="home.panelPhoto" style="max-width: 220px; border-radius: 8px"/>
          </div>

          <q-separator/>

          <div class="text-subtitle2 text-grey-8">مصرف کننده ها</div>
          <div class="row q-col-gutter-sm">
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.fridge?.selected">
              <field-row label="یخچال و فریزر" :value="'تعداد: ' + (home.consumers.fridge.count ?? '-')"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.lighting?.selected">
              <field-row label="روشنایی" :value="'وات: ' + (home.consumers.lighting.watt ?? '-')"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.tv?.selected">
              <field-row label="تلویزیون" value="دارد"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.rollingDoor?.selected">
              <field-row label="کرکره برقی و درب اتوماتیک" :value="'تعداد: ' + (home.consumers.rollingDoor.count ?? '-')"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.waterPump?.selected">
              <field-row label="پمپ آب" value="دارد"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.elevator?.selected">
              <field-row label="آسانسور" :value="'نوع: ' + (home.consumers.elevator.type ?? '-')"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.cctv?.selected">
              <field-row label="دوربین مداربسته" :value="'تعداد: ' + (home.consumers.cctv.count ?? '-')"/>
            </div>
            <div class="col-md-4 col-xs-6" v-if="home.consumers?.waterCooler?.selected">
              <field-row label="کولر آبی"
                         :value="(home.consumers.waterCooler.type ?? '-') + ' - تعداد: ' + (home.consumers.waterCooler.count ?? '-')"/>
            </div>
          </div>

          <div v-if="home.consumers?.gasCooler?.selected">
            <div class="text-subtitle2 text-grey-8 q-mb-xs">کولر گازی</div>
            <q-markup-table flat bordered dense v-if="home.consumers.gasCooler.items?.length">
              <thead>
              <tr>
                <th class="text-center">ظرفیت</th>
                <th class="text-center">نوع</th>
                <th class="text-center">تعداد</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(g, i) in home.consumers.gasCooler.items" :key="i">
                <td class="text-center">{{ g.size }}</td>
                <td class="text-center">{{ g.inverter ? 'اینورتر' : 'غیر اینورتر' }}</td>
                <td class="text-center">{{ g.count }}</td>
              </tr>
              </tbody>
            </q-markup-table>
            <span v-else class="text-grey">آیتمی ثبت نشده</span>
          </div>

          <q-separator/>

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">اقلام مصرفی در زمان قطعی برق</div>
            <q-chip v-for="i in home.outageItems" :key="i" dense color="orange" text-color="white">{{ i }}</q-chip>
            <span v-if="!home.outageItems || !home.outageItems.length" class="text-grey">-</span>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <field-row label="مدت زمان روشن بودن در شب" :value="withUnit(home.nightDuration, 'ساعت')"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="نوع سیستم" :value="home.systemType"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="تصمیم گیرنده اصلی" :value="home.mainDecisionMaker"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="محدودیت اجرا"
                         :value="home.hasLimitation === true ? 'محدودیت دارد' : (home.hasLimitation === false ? 'آماده شروع نصب' : '-')"/>
            </div>
          </div>

          <field-row label="توضیحات" :value="home.description"/>
        </div>

        <!-- ============ نمایش فرم صنعتی ============ -->
        <div v-else-if="surveyType === 2 && industrial" class="q-gutter-y-md">

          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">هدف از پروژه</div>
            <q-chip v-for="g in industrial.goals" :key="g" dense color="primary" text-color="white">{{ g }}</q-chip>
            <span v-if="!industrial.goals || !industrial.goals.length" class="text-grey">-</span>
          </div>

          <q-separator/>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <field-row label="نوع کنتور" :value="industrial.meterType"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="قسمت انشعاب" :value="withUnit(industrial.branchCapacity, 'کیلووات')"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="ترانس اختصاصی" :value="yesNo(industrial.hasDedicatedTransformer)"/>
            </div>
          </div>

          <q-separator/>

          <div class="text-subtitle2 text-grey-8">قطعی برق</div>
          <div class="row q-col-gutter-md">
            <div class="col-md-4 col-xs-12">
              <field-row label="چند بار در هفته" :value="industrial.outagePerWeek"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <field-row label="هر بار چند ساعت" :value="withUnit(industrial.outageHoursEach, 'ساعت')"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <field-row label="در چه ساعت هایی" :value="industrial.outageTime"/>
            </div>
          </div>
          <div>
            <div class="text-subtitle2 text-grey-8 q-mb-xs">هنگام قطعی برق چه اتفاقی می افتد</div>
            <q-chip v-for="e in industrial.outageEffects" :key="e" dense color="deep-orange" text-color="white">{{ e }}</q-chip>
            <span v-if="!industrial.outageEffects || !industrial.outageEffects.length" class="text-grey">-</span>
          </div>

          <q-separator/>

          <div v-if="industrial.mainConsumers?.length">
            <div class="text-subtitle2 text-grey-8 q-mb-xs">مصرف کننده های اصلی</div>
            <q-markup-table flat bordered dense>
              <thead>
              <tr>
                <th class="text-center">نام</th>
                <th class="text-center">توان</th>
                <th class="text-center">نوع</th>
                <th class="text-center">نوع راه انداز</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(m, i) in industrial.mainConsumers" :key="i">
                <td class="text-center">{{ m.name }}</td>
                <td class="text-center">{{ m.power }}</td>
                <td class="text-center">{{ m.type }}</td>
                <td class="text-center">{{ m.starterType }}</td>
              </tr>
              </tbody>
            </q-markup-table>
          </div>

          <div v-if="industrial.requiredPhotos?.length">
            <div class="text-subtitle2 text-grey-8 q-mb-xs">عکس ها</div>
            <div class="row q-col-gutter-sm">
              <div v-for="(p, i) in industrial.requiredPhotos" :key="i" class="col-auto">
                <q-img :src="p" style="width: 100px; height: 100px; border-radius: 8px"/>
              </div>
            </div>
          </div>

          <field-row label="در صورت قطعی، چه تجهیزاتی باید روشن بماند" :value="industrial.mustStayOnEquipment"/>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <field-row label="برآورد خسارت در لحظه" :value="withUnit(moneyFormat(industrial.damageAtMoment), 'تومان')"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="برآورد خسارت در هر ساعت" :value="withUnit(moneyFormat(industrial.damagePerHour), 'تومان')"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="مدت زمان نیاز پشتیبان در شب" :value="industrial.nightBackupDuration"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="محل نصب" :value="industrial.installLocation"/>
            </div>
          </div>

          <q-separator/>

          <field-row label="وضعیت دیزل ژنراتور" :value="yesNo(industrial.hasDieselGenerator)"/>
          <div v-if="industrial.hasDieselGenerator" class="row q-col-gutter-md">
            <div class="col-md-4 col-xs-12">
              <field-row label="ظرفیت" :value="industrial.dieselCapacity"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <field-row label="مصرف سوخت" :value="industrial.dieselFuelConsumption"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <field-row label="ساعت کار" :value="industrial.dieselWorkingHours"/>
            </div>
          </div>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12">
              <field-row label="سیستم اقتصادی یا حداکثر پایداری" :value="industrial.systemPreference"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <field-row label="نقدی یا اقساطی" :value="industrial.paymentType"/>
            </div>
            <div class="col-12">
              <field-row label="تصمیم گیرنده نهایی" :value="industrial.finalDecisionMaker"/>
            </div>
          </div>

          <field-row label="توضیحات" :value="industrial.description"/>
        </div>

      </q-card-section>

      <q-separator/>
      <q-card-actions align="center">
        <q-btn outline rounded color="accent" label="بستن" v-close-popup/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {h} from 'vue'
import {api} from 'boot/axios'

// const FILE_BASE_URL = process.env.API || ''

// کامپوننت کوچک محلی برای نمایش یک ردیف برچسب/مقدار
// از render function استفاده می شود چون template رشته ای در بیلد runtime-only ویو کار نمی کند
const FieldRow = {
  props: {label: String, value: [String, Number]},
  render() {
    if (this.value === null || this.value === undefined || this.value === '') return null
    return h('div', [
      h('span', {class: 'text-grey-8'}, this.label + ': '),
      h('span', this.value)
    ])
  }
}

export default {
  name: "SurveyViewDialog",
  components: {FieldRow},
  props: {
    modelValue: {type: Boolean, default: false},
    automationId: {type: String, default: ''}
  },
  emits: ['update:modelValue'],
  data() {
    return {
      loading: false,
      surveyType: null,
      home: null,
      industrial: null
    }
  },
  watch: {
    modelValue(val) {
      if (val && this.automationId) {
        this.fetchSurvey()
      }
    }
  },
  methods: {
    yesNo(val) {
      if (val === true) return 'دارد'
      if (val === false) return 'ندارد'
      return '-'
    },
    withUnit(val, unit) {
      if (val === null || val === undefined || val === '' || val === '0') return null
      return val + ' ' + unit
    },
    moneyFormat(digits) {
      if (digits === null || digits === undefined) return null
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
    },
    fetchSurvey() {
      this.loading = true
      this.surveyType = null
      this.home = null
      this.industrial = null

      api.get('automation/' + this.automationId)
          .then(response => {
            const data = response.data.data
            this.surveyType = data.survey_type

            if (data.survey_type === 1 && data.home_survey) {
              const s = data.home_survey
              this.home = {
                goals: s.goals || [],
                meter: {
                  single: {selected: !!s.meter_single_selected, count: s.meter_single_count},
                  three: {selected: !!s.meter_three_selected, count: s.meter_three_count}
                },
                installLocationNote: s.install_location_note,
                hasInternalPanel: s.has_internal_panel,
                connectionPoint: s.connection_point,
                cableLength: s.cable_length,
                panelLocationNote: s.panel_location_note,
                panelPhoto: s.panel_photo_url,
                consumers: {
                  fridge: {selected: !!s.consumer_fridge_selected, count: s.consumer_fridge_count},
                  lighting: {selected: !!s.consumer_lighting_selected, watt: s.consumer_lighting_watt},
                  tv: {selected: !!s.consumer_tv_selected},
                  rollingDoor: {selected: !!s.consumer_rolling_door_selected, count: s.consumer_rolling_door_count},
                  gasCooler: {
                    selected: !!s.consumer_gas_cooler_selected,
                    items: (s.gas_coolers || []).map(g => ({size: g.size, inverter: !!g.inverter, count: g.count}))
                  },
                  waterCooler: {
                    selected: !!s.consumer_water_cooler_selected,
                    type: s.consumer_water_cooler_type,
                    count: s.consumer_water_cooler_count
                  },
                  waterPump: {selected: !!s.consumer_water_pump_selected},
                  elevator: {selected: !!s.consumer_elevator_selected, type: s.consumer_elevator_type},
                  cctv: {selected: !!s.consumer_cctv_selected, count: s.consumer_cctv_count}
                },
                outageItems: s.outage_items || [],
                nightDuration: s.night_duration,
                systemType: s.system_type,
                mainDecisionMaker: s.main_decision_maker,
                hasLimitation: s.has_limitation,
                description: s.description
              }
            } else if (data.survey_type === 2 && data.industrial_survey) {
              const s = data.industrial_survey
              this.industrial = {
                goals: s.goals || [],
                meterType: s.meter_type,
                branchCapacity: s.branch_capacity,
                hasDedicatedTransformer: s.has_dedicated_transformer,
                outagePerWeek: s.outage_per_week,
                outageHoursEach: s.outage_hours_each,
                outageTime: s.outage_time,
                outageEffects: s.outage_effects || [],
                mainConsumers: (s.main_consumers || []).map(m => ({
                  name: m.name, power: m.power, type: m.type, starterType: m.starter_type
                })),
                requiredPhotos: s.required_photos_urls || [],
                mustStayOnEquipment: s.must_stay_on_equipment,
                damageAtMoment: s.damage_at_moment,
                damagePerHour: s.damage_per_hour,
                nightBackupDuration: s.night_backup_duration,
                installLocation: s.install_location,
                hasDieselGenerator: s.has_diesel_generator,
                dieselCapacity: s.diesel_capacity,
                dieselFuelConsumption: s.diesel_fuel_consumption,
                dieselWorkingHours: s.diesel_working_hours,
                systemPreference: s.system_preference,
                paymentType: s.payment_type,
                finalDecisionMaker: s.final_decision_maker,
                description: s.description
              }
            }
          })
          .finally(() => {
            this.loading = false
          })
    }
  }
}
</script>

<style scoped>
</style>
