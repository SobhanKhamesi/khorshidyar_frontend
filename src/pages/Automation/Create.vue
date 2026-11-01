<template>
  <q-page class="q-pa-md">
    <q-form @submit.prevent="submitForm()" class="q-gutter-md">
      <q-card flat class="border-radius-card">
        <q-card-section>
          <div class="text-h6">ایجاد درخواست جدید</div>
        </q-card-section>
        <q-separator/>
        <q-card-section class="q-pb-none">
          <q-btn-toggle
            v-model="requestMode"
            spread no-caps rounded unelevated
            toggle-color="accent" color="grey-3" text-color="grey-9"
            :options="[
              {label: 'تکمیل فرم بازدید توسط کارشناس', value: 'expert'},
              {label: 'ارسال فرم اولیه برای تکمیل توسط مشتری', value: 'customer'}
            ]"
          />
          <div v-if="requestMode === 'customer'" class="text-caption text-grey-8 q-mt-sm">
            لینک فرم اولیه برای مشتری پیامک می‌شود و درخواست در کارتابل «درخواست‌ها» ثبت می‌شود.
            پس از تکمیل فرم توسط مشتری، در کارتابل اعلان نمایش داده می‌شود.
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div v-if="requestMode === 'expert'" class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input mask="####/##/##" outlined dir="ltr" v-model="visitDate" label="تاریخ بازدید">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy transition-show="scale" transition-hide="scale">
                      <q-date today-btn
                              calendar="persian"
                              v-model="visitDate" mask="YYYY-MM-DD">
                        <q-btn v-close-popup color="accent" outline rounded label="بستن"/>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">
              <q-select
                option-label="fullName"
                option-value="id"
                outlined
                v-model="customer_id"
                clearable
                use-input
                label="مشتری"
                :options="customersAndLeadsOptions"
                @filter="filterCustomers"
                behavior="dialog">

                <template v-slot:after>
                  <q-btn @click.prevent="newCustomerDlg = true" icon="person_add" dense flat rounded/>
                </template>

                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.fullName }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn icon="info" color="info" flat round dense size="sm"
                             title="جزئیات مشتری"
                             @click.stop="openCustomerInfo(scope.opt)"/>
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div v-if="customer_id && customer_id.referrer != null" class="col-md-6 col-xs-12 q-gutter-y-md">
              <q-input outlined
                       type="number"
                       dir="ltr" maxlength="3"
                       v-model="introducerPercent"
                       label="درصد معرف از این فروش"
              />
            </div>

            <div v-if="requestMode === 'customer'" class="col-12">
              <q-input outlined autogrow type="textarea" v-model="description" label="توضیحات (اختیاری)"/>
            </div>
            <div v-if="requestMode === 'expert'" class="col-md-6 col-xs-12 q-gutter-y-md">
              <q-select
                option-label="name"
                option-value="id"
                outlined
                v-model="expert_id"
                clearable
                use-input
                label="کارشناس فنی"
                :options="technicalExpertOptions"
                @filter="filterTechnicalExperts"
                behavior="dialog">

                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>
        </q-card-section>
        <template v-if="requestMode === 'expert'">
        <q-card-section>
          <div class="text-subtitle1 q-mb-md">فرم بازدید</div>
          <q-select
            outlined
            clearable
            emit-value
            map-options
            v-model="surveyType"
            label="نوع کارشناسی"
            :options="surveyTypeOptions"
          />
        </q-card-section>

        <q-separator v-if="surveyType"/>

        <!-- ============ فرم کارشناسی خانگی ============ -->
        <q-card-section v-if="surveyType === 1">
          <div class="row q-col-gutter-md">

            <div class="col-12">
              <q-select multiple use-chips outlined v-model="home.goals"
                        label="هدف مشتری" :options="homeGoalOptions"/>
            </div>

            <div class="col-md-4 col-xs-12">
              <q-checkbox v-model="home.meter.single.selected" label="کنتور تک فاز"/>
              <template v-if="home.meter.single.selected">
                <q-input class="q-mt-sm" dense outlined type="number"
                         v-model.number="home.meter.single.count" label="تعداد"/>
                <q-input class="q-mt-sm" dense outlined dir="ltr" type="number" suffix="آمپر"
                         v-model.number="home.meter.single.amp" label="مقدار آمپر"/>
              </template>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-checkbox v-model="home.meter.three.selected" label="کنتور سه فاز"/>
              <template v-if="home.meter.three.selected">
                <q-input class="q-mt-sm" dense outlined type="number"
                         v-model.number="home.meter.three.count" label="تعداد"/>
                <q-input class="q-mt-sm" dense outlined dir="ltr" type="number" suffix="آمپر"
                         v-model.number="home.meter.three.amp" label="مقدار آمپر"/>
              </template>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-checkbox v-model="home.meter.demand.selected" label="کنتور دیماندی (عادی)"/>
              <template v-if="home.meter.demand.selected">
                <q-input class="q-mt-sm" dense outlined type="number"
                         v-model.number="home.meter.demand.count" label="تعداد"/>
                <q-input class="q-mt-sm" dense outlined dir="ltr" type="number" suffix="آمپر"
                         v-model.number="home.meter.demand.amp" label="مقدار آمپر"/>
              </template>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" v-model="home.billId" label="شناسه قبض"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-select outlined emit-value map-options clearable
                        v-model="home.installLocation.type"
                        label="محل نصب دستگاه"
                        :options="installLocationOptions"/>
            </div>
            <div class="col-md-6 col-xs-12" v-if="home.installLocation.type">
              <q-input outlined dir="ltr" type="number" suffix="متر"
                       v-model.number="home.installLocation.distance" label="مقدار فاصله"/>
            </div>

            <div class="col-12">
              <div class="q-mb-xs">نیاز به زیرساخت اضافه دارد؟</div>
              <q-radio v-model="home.needsExtraInfrastructure" :val="true" label="دارد"/>
              <q-radio v-model="home.needsExtraInfrastructure" :val="false" label="ندارد"/>
              <q-input v-if="home.needsExtraInfrastructure" class="q-mt-sm" outlined autogrow type="textarea"
                       v-model="home.extraInfrastructureNote" label="توضیحات زیرساخت اضافه"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <div class="q-mb-xs">تابلو برق داخلی در واحد؟</div>
              <q-radio v-model="home.hasInternalPanel" :val="true" label="دارد"/>
              <q-radio v-model="home.hasInternalPanel" :val="false" label="ندارد"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="home.connectionPoint" label="محل اتصال سیستم به مصرف کننده"
                        :options="['کنتور اصلی', 'تابلو برق واحد']"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" type="number" suffix="متر" v-model.number="home.cableLength"
                       label="مقدار کابل مورد نیاز"/>
            </div>
            <div class="col-md-12 col-xs-12">
              <q-input outlined v-model="home.panelLocationNote" type="textarea" autogrow label="محل نصب پنل ها"/>
            </div>

            <div class="col-12">
              <q-file outlined v-model="home.panelPhotos" label="عکس محل نصب پنل" accept="image/*">
                <template v-slot:prepend>
                  <q-icon name="photo_camera"/>
                </template>
              </q-file>
            </div>


            <div class="col-12">
              <div class="text-subtitle2 q-mb-sm">مصرف کننده ها</div>
              <div class="row q-col-gutter-sm">
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.fridge.selected" label="یخچال و فریزر"/>
                  <q-input v-if="home.consumers.fridge.selected" dense outlined type="number"
                           v-model.number="home.consumers.fridge.count" label="تعداد"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.lighting.selected" label="روشنایی"/>
                  <q-input v-if="home.consumers.lighting.selected" dense outlined type="number"
                           v-model.number="home.consumers.lighting.watt" label="وات"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.tv.selected" label="تلویزیون"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.rollingDoor.selected" label="کرکره برقی و درب اتوماتیک"/>
                  <q-input v-if="home.consumers.rollingDoor.selected" dense outlined type="number"
                           v-model.number="home.consumers.rollingDoor.count" label="تعداد"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.waterPump.selected" label="پمپ آب"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.elevator.selected" label="آسانسور"/>
                  <q-select v-if="home.consumers.elevator.selected" dense outlined
                            v-model="home.consumers.elevator.type" :options="['کششی', 'هیدرولیک']" label="نوع"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-checkbox v-model="home.consumers.cctv.selected" label="دوربین مداربسته"/>
                  <q-input v-if="home.consumers.cctv.selected" dense outlined type="number"
                           v-model.number="home.consumers.cctv.count" label="تعداد دوربین"/>
                </div>
              </div>

              <!-- کولر گازی: چند مورد با ظرفیت/نوع/تعداد -->
              <q-checkbox v-model="home.consumers.gasCooler.selected" label="کولر گازی" class="q-mt-md"/>
              <q-table
                v-if="home.consumers.gasCooler.selected"
                flat bordered dense class="q-mt-sm"
                :rows-per-page-options="[0]"
                :rows="home.consumers.gasCooler.items"
                :columns="gasCoolerColumns"
                no-data-label="آیتمی ثبت نشده">
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="size" :props="props">{{ props.row.size }}</q-td>
                    <q-td key="type" :props="props">{{ props.row.inverter ? 'اینورتر' : 'غیر اینورتر' }}</q-td>
                    <q-td key="count" :props="props">{{ props.row.count }}</q-td>
                    <q-td key="action" :props="props">
                      <q-btn dense round color="negative" icon="delete"
                             @click="home.consumers.gasCooler.items.splice(props.rowIndex, 1)"/>
                    </q-td>
                  </q-tr>
                </template>
                <template v-slot:top-right>
                  <q-btn label="افزودن کولر گازی" color="primary" rounded dense @click="newGasCoolerDlg = true"/>
                </template>
              </q-table>

              <!-- کولر آبی -->
              <q-checkbox v-model="home.consumers.waterCooler.selected" label="کولر آبی" class="q-mt-md"/>
              <div v-if="home.consumers.waterCooler.selected" class="row q-col-gutter-sm q-mt-sm">
                <div class="col-md-4 col-xs-12">
                  <q-select dense outlined v-model="home.consumers.waterCooler.type"
                            :options="['اینورتر', 'غیر اینورتر']" label="نوع"/>
                </div>
                <div class="col-md-4 col-xs-12">
                  <q-input dense outlined type="number" v-model.number="home.consumers.waterCooler.count"
                           label="تعداد"/>
                </div>
              </div>
            </div>

            <div class="col-12">
              <q-select
                multiple use-chips outlined use-input
                v-model="home.outageItems"
                label="اقلام مصرفی در زمان قطعی برق"
                :options="outageItemsFilteredOptions"
                @filter="filterOutageItems">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">ابتدا مصرف کننده ها را انتخاب کنید</q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" type="number" suffix="ساعت" v-model.number="home.nightDuration"
                       label="مدت زمان روشن بودن در شب"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="home.systemType" label="نوع سیستم"
                        :options="['اقتصادی', 'میان رده', 'حرفه ای', 'نامشخص']"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="home.mainDecisionMaker" label="تصمیم گیرنده اصلی"
                        :options="['خود درخواست کننده', 'همسر', 'پدر خانواده', 'مدیر شرکت']"/>
            </div>

            <div class="col-12">
              <div class="q-mb-xs">آیا برای اجرا محدودیت خاصی وجود دارد یا آماده شروع نصب هستید؟</div>
              <q-radio v-model="home.hasLimitation" :val="true" label="محدودیت دارد"/>
              <q-radio v-model="home.hasLimitation" :val="false" label="آماده شروع نصب"/>
            </div>

            <div class="col-12">
              <q-input outlined autogrow v-model="home.description" label="توضیحات"/>
            </div>
          </div>
        </q-card-section>

        <!-- ============ فرم ثبت شده از مشتری ============ -->
        <q-card-section v-if="surveyType === 3">
          <div class="text-caption text-grey-8 q-mb-md">
            همان فرم اولیه‌ای که مشتری از طریق لینک تکمیل می‌کند؛ در صورت نیاز اینجا قابل ویرایش است.
          </div>
          <customer-survey-fields v-model="customerSurvey"/>
        </q-card-section>

        <!-- ============ فرم کارشناسی صنعتی ============ -->
        <q-card-section v-if="surveyType === 2">
          <div class="row q-col-gutter-md">

            <div class="col-12">
              <q-select multiple use-chips outlined v-model="industrial.goals" label="هدف از پروژه"
                        :options="industrialGoalOptions"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="industrial.meterType" label="نوع کنتور"
                        :options="['تک فاز', 'سه فاز', 'دیماندی (عادی)']"/>
            </div>
            <div class="col-md-6 col-xs-12" v-if="industrial.meterType">
              <q-input outlined dir="ltr" type="number" suffix="آمپر" v-model.number="industrial.meterAmp"
                       label="مقدار آمپر"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" type="number" suffix="کیلووات" v-model.number="industrial.branchCapacity"
                       label="قسمت انشعاب"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" v-model="industrial.billId" label="شناسه قبض"/>
            </div>

            <div class="col-12">
              <div class="q-mb-xs">آیا ترانس اختصاصی دارد؟</div>
              <q-radio v-model="industrial.hasDedicatedTransformer" :val="true" label="دارد"/>
              <q-radio v-model="industrial.hasDedicatedTransformer" :val="false" label="ندارد"/>
            </div>

            <div class="col-12">
              <div class="text-subtitle2">قطعی برق</div>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-input outlined type="number" v-model.number="industrial.outagePerWeek" label="چند بار در هفته؟"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-input outlined type="number" suffix="ساعت" v-model.number="industrial.outageHoursEach"
                       label="هر بار چند ساعت؟"/>
            </div>
            <div class="col-md-4 col-xs-12">
              <q-input outlined v-model="industrial.outageTime" label="در چه ساعت هایی؟"/>
            </div>
            <div class="col-12">
              <q-select multiple use-chips outlined v-model="industrial.outageEffects"
                        label="هنگام قطعی برق چه اتفاقی می افتد؟"
                        :options="['خسارت به تجهیزات', 'توقف تولید', 'ضایعات بالا', 'بیکاری کارگران']"/>
            </div>

            <div class="col-12">
              <q-table
                flat bordered title="مصرف کننده های اصلی"
                :rows-per-page-options="[0]"
                :rows="industrial.mainConsumers"
                :columns="mainConsumerColumns"
                no-data-label="آیتمی ثبت نشده">
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="name" :props="props">{{ props.row.name }}</q-td>
                    <q-td key="power" :props="props">{{ props.row.power }}</q-td>
                    <q-td key="type" :props="props">{{ props.row.type }}</q-td>
                    <q-td key="starterType" :props="props">{{ props.row.starterType }}</q-td>
                    <q-td key="action" :props="props">
                      <q-btn dense round color="negative" icon="delete"
                             @click="industrial.mainConsumers.splice(props.rowIndex, 1)"/>
                    </q-td>
                  </q-tr>
                </template>
                <template v-slot:top-right>
                  <q-btn label="افزودن مصرف کننده" color="primary" rounded @click="newMainConsumerDlg = true"/>
                </template>
              </q-table>
            </div>

            <div class="col-12">
              <q-file outlined multiple v-model="industrial.requiredPhotos"
                      label="عکس (پلاک تجهیزات، خط تولید، محل نصب پنل، ژنراتور، ترانس، تابلو اصلی، قبض برق)"
                      accept="image/*"/>
            </div>

            <div class="col-12">
              <q-input outlined autogrow v-model="industrial.mustStayOnEquipment"
                       label="اگر برق قطع شود دقیقاً چه تجهیزاتی باید روشن بماند؟"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" type="number" suffix="تومان" v-model.number="industrial.damageAtMoment"
                       label="برآورد خسارت در لحظه"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-input outlined dir="ltr" type="number" suffix="تومان" v-model.number="industrial.damagePerHour"
                       label="برآورد خسارت در هر ساعت"/>
            </div>

            <div class="col-md-6 col-xs-12">
              <q-input outlined v-model="industrial.nightBackupDuration" label="مدت زمان نیاز پشتیبان در شب"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="industrial.installLocation" label="محل نصب"
                        :options="['پشت بام', 'زمین', 'سقف سوله', 'پارکینگ']"/>
            </div>

            <div class="col-12">
              <div class="q-mb-xs">وضعیت دیزل ژنراتور</div>
              <q-radio v-model="industrial.hasDieselGenerator" :val="true" label="دارد"/>
              <q-radio v-model="industrial.hasDieselGenerator" :val="false" label="ندارد"/>
            </div>
            <template v-if="industrial.hasDieselGenerator">
              <div class="col-md-4 col-xs-12">
                <q-input outlined type="number" v-model.number="industrial.dieselCapacity" label="ظرفیت (اختیاری)"/>
              </div>
              <div class="col-md-4 col-xs-12">
                <q-input outlined type="number" v-model.number="industrial.dieselFuelConsumption"
                         label="مصرف سوخت (اختیاری)"/>
              </div>
              <div class="col-md-4 col-xs-12">
                <q-input outlined type="number" v-model.number="industrial.dieselWorkingHours"
                         label="ساعت کار (اختیاری)"/>
              </div>
            </template>

            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="industrial.systemPreference" label="سیستم اقتصادی یا حداکثر پایداری"
                        :options="['اقتصادی', 'حداکثر پایداری']"/>
            </div>
            <div class="col-md-6 col-xs-12">
              <q-select outlined v-model="industrial.paymentType" label="نقدی یا اقساطی" :options="['نقدی', 'اقساطی']"/>
            </div>
            <div class="col-12">
              <q-select outlined v-model="industrial.finalDecisionMaker" label="تصمیم گیرنده نهایی"
                        :options="['مالک', 'مدیرعامل', 'مدیر فنی', 'مدیر مالی', 'هیئت مدیره']"/>
            </div>

            <div class="col-12">
              <q-input outlined autogrow v-model="industrial.description" label="توضیحات"/>
            </div>
          </div>
        </q-card-section>
        </template>
        <q-card-actions>
          <q-btn type="submit" rounded class="full-width" color="accent"
                 :label="requestMode === 'customer' ? 'ارسال پیامک فرم اولیه و ثبت درخواست' : 'ثبت'"/>
        </q-card-actions>
      </q-card>

    </q-form>

    <q-dialog v-model="sendSmsDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card bordered class="q-pa-lg">
        <q-form @submit.prevent="submitFormFinal()">
          <q-card-section>
            <div class="text-bold">آیا پیامک فرم بازدید ارسال شود؟</div>
            <div class="row items-center q-gutter-md">
              <q-radio v-model="sendSms" :val="true" label="بله"/>
              <q-radio v-model="sendSms" :val="false" label="خیر"/>
            </div>
          </q-card-section>
          <q-card-actions>
            <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت سرنخ"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newCustomerDlg"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-form @submit.prevent="submitNewCustomer()">
          <q-card-section>
            <div class="text-h6">مشتری جدید</div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <div class="q-gutter-md">

              <div>
                <q-radio v-model="newCustomerGender" :val="0" label="آقا"/>
                <q-radio v-model="newCustomerGender" :val="1" label="خانم"/>
              </div>

              <q-input outlined v-model="newCustomerName" label="نام و نام خانوادگی"/>

              <q-input outlined
                       dir="ltr"
                       v-model="newCustomerContactNumber"
                       label="شماره تلفن همراه"/>

            </div>

          </q-card-section>
          <q-separator/>
          <q-card-actions align="center">
            <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
            <q-btn color="accent" rounded label="ثبت" type="submit"/>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>


    <q-dialog v-model="newGasCoolerDlg">
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">افزودن کولر گازی</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-select outlined v-model="newGasCooler.size" :options="['12', '18', '24', '30', '36']"
                    label="ظرفیت (هزار)"/>
          <q-radio v-model="newGasCooler.inverter" :val="true" label="اینورتر"/>
          <q-radio v-model="newGasCooler.inverter" :val="false" label="غیر اینورتر"/>
          <q-input outlined type="number" v-model.number="newGasCooler.count" label="تعداد"/>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded label="افزودن" @click="addGasCooler()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newMainConsumerDlg">
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">افزودن مصرف کننده اصلی</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input outlined v-model="newMainConsumer.name" label="نام"/>
          <q-input outlined type="number" v-model.number="newMainConsumer.power" label="توان"/>
          <q-radio v-model="newMainConsumer.type" val="موتوری" label="موتوری"/>
          <q-radio v-model="newMainConsumer.type" val="غیر موتوری" label="غیر موتوری"/>
          <q-select outlined v-model="newMainConsumer.starterType" :options="['اینورتر', 'ساده', 'سافت استارت']"
                    label="نوع راه انداز"/>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded label="افزودن" @click="addMainConsumer()"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <CustomerInfoDialog v-model="customerInfoDlg" :customer="customerInfoTarget"/>

  </q-page>
</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'
import {VMoney} from 'v-money'
import CustomerInfoDialog from 'components/CustomerInfoDialog.vue'
import CustomerSurveyFields from 'components/CustomerSurveyFields.vue'
// نگاشت کلید مصرف‌کننده به برچسب نمایشی
const consumerLabels = {
  fridge: 'یخچال و فریزر',
  lighting: 'روشنایی',
  tv: 'تلویزیون',
  rollingDoor: 'کرکره برقی و درب اتوماتیک',
  waterPump: 'پمپ آب',
  elevator: 'آسانسور',
  cctv: 'دوربین مداربسته',
  gasCooler: 'کولر گازی',
  waterCooler: 'کولر آبی',
}

const defaultHome = () => ({
  goals: [],
  meter: {
    single: {selected: false, count: null, amp: null},
    three: {selected: false, count: null, amp: null},
    demand: {selected: false, count: null, amp: null}
  },
  billId: '',
  installLocation: {type: null, distance: null},
  needsExtraInfrastructure: null,
  extraInfrastructureNote: '',
  hasInternalPanel: null,
  connectionPoint: '',
  cableLength: null,
  panelLocationNote: '',
  panelPhotos: null,
  consumers: {
    fridge: {selected: false, count: null},
    lighting: {selected: false, watt: null},
    tv: {selected: false},
    rollingDoor: {selected: false, count: null},
    gasCooler: {selected: false, items: []},
    waterCooler: {selected: false, type: null, count: null},
    waterPump: {selected: false},
    elevator: {selected: false, type: null},
    cctv: {selected: false, count: null}
  },
  outageItems: [],
  nightDuration: null,
  systemType: '',
  mainDecisionMaker: '',
  hasLimitation: null,
  description: ''
})

const defaultIndustrial = () => ({
  goals: [],
  meterType: '',
  meterAmp: null,
  billId: '',
  branchCapacity: null,
  hasDedicatedTransformer: null,
  outagePerWeek: null,
  outageHoursEach: null,
  outageTime: '',
  outageEffects: [],
  mainConsumers: [],
  requiredPhotos: [],
  mustStayOnEquipment: '',
  damageAtMoment: null,
  damagePerHour: null,
  nightBackupDuration: '',
  installLocation: '',
  hasDieselGenerator: null,
  dieselCapacity: null,
  dieselFuelConsumption: null,
  dieselWorkingHours: null,
  systemPreference: '',
  paymentType: '',
  finalDecisionMaker: '',
  description: ''
})

export default {

  name: "CreateAutomation",
  components: {CustomerInfoDialog, CustomerSurveyFields},
  directives: {money: VMoney},

  data() {
    return {
      customerInfoDlg: false,
      customerInfoTarget: null,

      visitDate: '',
      customer_id: '',
      introducerPercent: '',
      expert_id: '',
      description: '',
      newCustomerContactNumber: '',
      newCustomerName: '',
      newCustomerGender: 0,
      newCustomerDlg: false,

      sendSmsDlg: false,
      // expert: کارشناس فرم بازدید را تکمیل می‌کند | customer: لینک فرم اولیه برای مشتری ارسال می‌شود
      requestMode: 'expert',
      sendSms: true,

      customersAndLeads: [],
      technicalExperts: [],
      customersAndLeadsOptions: [],
      technicalExpertOptions: [],

      // form bazdid
      surveyType: null,
      surveyTypeOptions: [
        {label: 'کارشناسی خانگی', value: 1},
        {label: 'کارشناسی صنعتی', value: 2},
        {label: 'ثبت شده از مشتری', value: 3}
      ],

      homeGoalOptions: ['احداث نیروگاه','برق پشتیبان', 'کاهش میزان مصرف', 'تامین برق کامل'],
      industrialGoalOptions: ['جبران قطعی برق', 'درآمدزایی', 'جلوگیری از توقف تولید', 'تأمین برق اجسام حساس مثل سرور'],

      outageItemsMasterList: [],
      outageItemsFilteredOptions: [],

      home: defaultHome(),

      installLocationOptions: [
        {label: 'فاصله نیروگاه تا محل نصب اینورتر/سانورتر', value: 'plant_to_inverter'},
        {label: 'فاصله نصب دستگاه تا اینورتر/سانورتر', value: 'device_to_inverter'}
      ],

      newGasCoolerDlg: false,
      newGasCooler: {size: '18', inverter: false, count: 1},
      gasCoolerColumns: [
        {name: 'size', label: 'ظرفیت', field: 'size', align: 'center'},
        {name: 'type', label: 'نوع', field: 'type', align: 'center'},
        {name: 'count', label: 'تعداد', field: 'count', align: 'center'},
        {name: 'action', label: 'عملیات', field: 'action', align: 'center'}
      ],

      industrial: defaultIndustrial(),
      customerSurvey: {},

      newMainConsumerDlg: false,
      newMainConsumer: {name: '', power: null, type: 'موتوری', starterType: 'ساده'},
      mainConsumerColumns: [
        {name: 'name', label: 'نام', field: 'name', align: 'center'},
        {name: 'power', label: 'توان', field: 'power', align: 'center'},
        {name: 'type', label: 'نوع', field: 'type', align: 'center'},
        {name: 'starterType', label: 'نوع راه انداز', field: 'starterType', align: 'center'},
        {name: 'action', label: 'عملیات', field: 'action', align: 'center'}
      ]

    }
  },
  watch: {
    'home.consumers': {
      deep: true,
      immediate: true,
      handler(newVal) {
        const selectedLabels = Object.keys(consumerLabels)
          .filter((key) => newVal[key]?.selected)
          .map((key) => consumerLabels[key])

        this.outageItemsMasterList = selectedLabels
        this.outageItemsFilteredOptions = selectedLabels

        // حذف موارد قبلاً انتخاب‌شده‌ای که دیگه معتبر نیستن
        this.home.outageItems = this.home.outageItems.filter((item) =>
          selectedLabels.includes(item)
        )
      }
    },
    // درصد پیش‌فرض از تعریف مشتری؛ کاربر می‌تواند آن را فقط برای همین پروژه تغییر دهد
    'customer_id': {
      immediate: true,
      handler(newVal) {
        this.introducerPercent = newVal && newVal.referrer_id ? newVal.referrer_percent : ''
      }
    }

  },
  methods: {
    openCustomerInfo(customer) {
      this.customerInfoTarget = customer
      this.customerInfoDlg = true
    },
    addGasCooler() {
      if (!this.newGasCooler.size || !this.newGasCooler.count) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'ظرفیت و تعداد را وارد کنید'})
        return
      }
      this.home.consumers.gasCooler.items.push({...this.newGasCooler})
      this.newGasCoolerDlg = false
      this.newGasCooler = {size: '18', inverter: false, count: 1}
    },

    addMainConsumer() {
      if (!this.newMainConsumer.name) {
        this.$q.notify({type: 'negative', position: 'bottom', message: 'نام مصرف کننده را وارد کنید'})
        return
      }
      this.industrial.mainConsumers.push({...this.newMainConsumer})
      this.newMainConsumerDlg = false
      this.newMainConsumer = {name: '', power: null, type: 'موتوری', starterType: 'ساده'}
    },

    filterOutageItems(val, update) {
      update(() => {
        if (val === '') {
          this.outageItemsFilteredOptions = this.outageItemsMasterList
          return
        }
        const needle = val.toLowerCase()
        this.outageItemsFilteredOptions = this.outageItemsMasterList.filter((v) =>
          v.toLowerCase().includes(needle)
        )
      })
    },

    getCustomersAndLeads() {
      api.get('customers/all')
        .then(response => {
          this.customersAndLeadsOptions = response.data.data
          this.customersAndLeads = response.data.data
        })
    },
    getTechnicalExperts() {
      api.get('technical_experts')
        .then(response => {
          this.technicalExpertOptions = response.data.data
          this.technicalExperts = response.data.data
        })
    },
    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    submitNewCustomer() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {}
      payload.contact_number = this.newCustomerContactNumber
      payload.name = this.newCustomerName
      payload.gender = this.newCustomerGender


      api.post('customers/quick-add', payload)
        .then(response => {


          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.getCustomersAndLeads();
          this.newCustomerContactNumber = ''
          this.newCustomerName = ''
          this.newCustomerGender = 0
          this.newCustomerDlg = false
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });

    },
    filterTechnicalExperts(val, update) {
      if (val === '') {
        update(() => {
          this.technicalExpertOptions = this.technicalExperts

        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.technicalExpertOptions = this.technicalExperts.filter(
          v => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    filterCustomers(val, update) {
      if (val === '') {
        update(() => {
          this.customersAndLeadsOptions = this.customersAndLeads
        })
        return
      }
      update(() => {
        const needle = val.toLowerCase()
        this.customersAndLeadsOptions = this.customersAndLeads.filter(
          v => v.name.toLowerCase().indexOf(needle) > -1
        )
      })
    },
    submitForm() {
      if (this.requestMode === 'customer') {
        this.sendIntakeForm()
        return
      }
      this.sendSmsDlg = true;
    },
    // ارسال لینک فرم اولیه برای مشتری و ثبت درخواست در کارتابل
    sendIntakeForm() {
      if (!this.customer_id) {
        this.$q.notify({type: 'negative', position: 'center', message: 'مشتری را انتخاب نمایید'})
        return
      }

      this.$q.loading.show({spinner: QSpinnerPuff, spinnerSize: 140, message: 'در حال ارسال پیامک', sanitize: true})

      api.post('automation/send-intake-form', {
        customer: this.customer_id.id,
        referrer_percent: this.introducerPercent,
        description: this.description,
      })
        .then(response => {
          const data = response.data.data
          if (data.sms_sent) {
            this.$q.notify({timeout: 3000, position: 'center', type: 'positive', message: response.data.message})
          } else {
            // در صورت خطای پیامک، لینک برای ارسال دستی نمایش داده می‌شود
            this.$q.dialog({title: 'ارسال پیامک ناموفق بود', message: response.data.message + '<br><br><b dir="ltr">' + data.link + '</b>', html: true})
          }
          this.customer_id = ''
          this.introducerPercent = ''
          this.description = ''
        })
        .finally(() => {
          this.$q.loading.hide()
        })
    },
    submitFormFinal() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      const formData = new FormData()

      // فیلدهای ساده
      formData.append('date', this.visitDate)
      formData.append('customer', this.customer_id.id)
      formData.append('referrer_percent', this.introducerPercent)
      formData.append('expert', this.expert_id ? this.expert_id.id : '')
      formData.append('description', this.description)
      formData.append('surveyType', this.surveyType ?? '')

      // آبجکت survey (بدون فایل‌ها) به‌صورت JSON
      const surveyData = this.surveyType === 1
        ? {...this.home}
        : (this.surveyType === 2 ? {...this.industrial} : (this.surveyType === 3 ? {...this.customerSurvey} : null))

      // فایل‌ها رو از آبجکت survey جدا می‌کنیم تا جدا append بشن
      if (this.surveyType === 1) {
        delete surveyData.panelPhotos // چون جدا اضافه میشه
      }
      if (this.surveyType === 2) {
        delete surveyData.requiredPhotos
      }

      formData.append('survey', JSON.stringify(surveyData))

      // آپلود عکس‌های کارشناسی خانگی (تکی)
      if (this.surveyType === 1 && this.home.panelPhotos) {
        formData.append('panel_photo', this.home.panelPhotos)
      }

      // آپلود عکس‌های کارشناسی صنعتی (چندتایی)
      if (this.surveyType === 2 && this.industrial.requiredPhotos?.length) {
        this.industrial.requiredPhotos.forEach((file, index) => {
          formData.append(`required_photos[${index}]`, file)
        })
      }
      formData.append('send_sms', this.sendSms)

      api.post('automation/store', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })

          this.visitDate = ''
          this.customer_id = ''
          this.introducerPercent = ''
          this.expert_id = ''
          this.description = ''
          this.surveyType = null
          this.home = defaultHome()
          this.industrial = defaultIndustrial()
          this.customerSurvey = {}
          this.$q.loading.hide()
        })
        .catch(() => {
          this.$q.loading.hide()
        })
        .finally(() => {
          this.sendSmsDlg = false;
        });
    }
  },
  created() {
    this.getCustomersAndLeads();
    this.getTechnicalExperts();
  }
}
</script>

<style scoped>

</style>
