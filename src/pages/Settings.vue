<template>
  <q-page class="q-pa-lg">
    <q-card flat class="border-radius-card">
      <q-tabs
        v-model="tab"
        dense
        class="text-blue-grey-10"
        active-color="primary"
        indicator-color="primary"
        align="left"
        narrow-indicator
      >
        <q-tab name="category">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="ti-support"/>
              <span>تنظیمات دسته بندی</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="failure">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="eva-checkmark-outline"/>
              <span>تنظیمات دلایل شکست</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="after_sale">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="eva-shopping-cart-outline"/>
              <span>تنظیمات نوع خدمات پس از فروش</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="source">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="eva-people-outline"/>
              <span>تنظیمات  شیوه آشنایی</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="sms">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="bi-envelope-plus"/>
              <span>تنظیمات پنل پیامک</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="unit">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="straighten"/>
              <span>تنظیمات واحدها</span>
            </div>
          </template>
        </q-tab>
        <q-tab v-if="isAdmin" name="wages">
          <template v-slot:default>
            <div style="display: flex;align-items: center;justify-content: center" class="q-gutter-x-sm">
              <q-icon size="sm" name="payments"/>
              <span>دستمزد پیش‌فرض</span>
            </div>
          </template>
        </q-tab>
      </q-tabs>
      <q-separator inset/>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="category">
          <q-dialog v-model="newOrderDlg">
            <q-card bordered>
              <q-card-section>
                <div class="text-h6">ایجاد دسته بندی جدید</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitForm()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="title" label="عنوان"/>
                    </div>
                    <div class="col-md-11 col-xs-12">
                      <q-input
                        label="توضیحات"
                        v-model="description"
                        outlined
                        autogrow
                      />
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست دسته بندی ها</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rows"
                :filter="filter"
                :columns="columns"
                row-key="id"
                :rows-per-page-options="[10]">

                <template v-slot:top-right>
                  <q-btn label="آیتم جدید" color="primary" rounded @click="newOrderDlg = true"/>
                </template>

                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>

                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>
                    <q-td key="description" :props="props">
                      {{ props.row.description }}
                    </q-td>
                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                             :to="{ name:'CategoryEdit',params:{id:props.row.id} }"/>
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
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItem()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>
        </q-tab-panel>

        <q-tab-panel name="failure">
          <q-dialog v-model="newOrderDlg">
            <q-card flat class="border-radius-card">
              <q-card-section>
                <div class="text-h6">ایجاد دلایل شکست</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormFailure()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="titleFailure" label="عنوان"/>
                    </div>
                    <div class="col-md-11 col-xs-12">

                      <q-input
                        label="توضیحات"
                        v-model="descriptionFailure"
                        outlined
                        autogrow
                      />
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست دلایل شکست</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rowsFailure"
                :filter="filter"
                :columns="columnsFailure"
                row-key="id"
                :rows-per-page-options="[10]">

                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>

                <template v-slot:top-right>
                  <q-btn label="آیتم جدید" color="primary" rounded @click="newOrderDlg = true"/>
                </template>

                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>


                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>
                    <q-td key="description" :props="props">
                      {{ props.row.description }}
                    </q-td>
                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                             :to="{ name:'FailureEdit',params:{id:props.row.id} }"/>
                      <q-btn title="حذف" dense round color="negative" icon="delete"
                             @click.prevent="deleteConfirmationFailure(props.row.id)"/>
                    </q-td>
                  </q-tr>
                </template>


              </q-table>
            </q-card-section>
          </q-card>


          <q-dialog v-model="deleteConfirmDialogFailure">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItemFailure()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>


        </q-tab-panel>

        <q-tab-panel name="after_sale">
          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست انواع خدمات پس از فروش</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rowsAfterSaleTypes"
                :filter="filter"
                :columns="columnsAfterSaleTypes"
                row-key="id"
                :rows-per-page-options="[10]">

                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>

                <template v-slot:top-right>
                  <q-btn label="آیتم جدید" color="primary" rounded @click="newAfterSaleTypesDlg = true"/>
                </template>

                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>


                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>

                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="warning" icon="edit"
                             @click.prevent="editConfirmationAfterSaleTypes(props.row)"/>
                      <q-btn title="حذف" dense round color="negative" icon="delete"
                             @click.prevent="deleteConfirmationAfterSaleTypes(props.row.id)"/>
                    </q-td>
                  </q-tr>
                </template>


              </q-table>
            </q-card-section>
          </q-card>

          <q-dialog v-model="newAfterSaleTypesDlg">
            <q-card flat class="border-radius-card">
              <q-card-section>
                <div class="text-h6">ایجاد نوع خدمات پس از فروش</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormAfterSaleTypes()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="titleAfterSaleTypes" label="عنوان"/>
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editConfirmDialogAfterSaleTypes">
            <q-card flat class="border-radius-card">
              <q-card-section>
                <div class="text-h6">ویرایش نوع خدمات پس از فروش</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormAfterSaleTypesEdit()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="editTitleAfterSaleTypes" label="عنوان"/>
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ویرایش"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-dialog v-model="deleteConfirmDialogAfterSaleTypes">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItemAfterSaleTypes()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>


        </q-tab-panel>

        <q-tab-panel name="source">
          <q-dialog v-model="newOrderDlg">
            <q-card bordered>
              <q-card-section>
                <div class="text-h6">ایجاد شیوه آشنایی</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormSource()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="titleSource" label="عنوان"/>
                    </div>
                    <div class="col-md-11 col-xs-12">
                      <q-input
                        label="توضیحات"
                        v-model="descriptionSource"
                        outlined
                        autogrow
                      />
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" class="full-width" color="primary" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>
          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست شیوه آشنایی</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rowsSource"
                :filter="filter"
                :columns="columnsSource"
                row-key="id"
                :rows-per-page-options="[10]">
                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>
                <template v-slot:top-right>
                  <q-btn label="آیتم جدید" color="primary" rounded @click="newOrderDlg = true"/>
                </template>
                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>
                    <q-td key="description" :props="props">
                      {{ props.row.description }}
                    </q-td>
                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                             :to="{ name:'SourceEdit',params:{id:props.row.id} }"/>
                      <q-btn title="حذف" dense round color="negative" icon="delete"
                             @click.prevent="deleteConfirmationSource(props.row.id)"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>


          <q-dialog v-model="deleteConfirmDialogSource">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItemSource()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>


        </q-tab-panel>

        <q-tab-panel name="sms">
          <q-dialog v-model="newOrderDlg">
            <q-card bordered>
              <q-card-section>
                <div class="text-h6">ایجاد پیامک جدید</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormSms()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="titleSms" label="عنوان"/>
                    </div>
                    <div class="col-md-11 col-xs-12">
                      <q-input
                        label="متن پیامک"
                        type="textarea"
                        v-model="descriptionSms"
                        outlined
                        autogrow
                      />
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" class="full-width" color="primary" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>
          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست پیامک</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rowsSms"
                :filter="filter"
                :columns="columnsSms"
                row-key="id"
                :rows-per-page-options="[10]">
                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>
                <template v-slot:top-right>
                  <q-btn label="آیتم جدید" color="primary" rounded @click="newOrderDlg = true"/>
                </template>
                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>
                    <q-td key="description" :props="props" style="white-space: pre-line;">
                      {{ props.row.description }}
                    </q-td>
                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="yellow-9" icon="edit"
                             :to="{ name:'SmsEdit',params:{id:props.row.id} }"/>
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>


          <q-dialog v-model="deleteConfirmDialogSms">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItemSms()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>


        </q-tab-panel>

        <q-tab-panel name="unit">
          <q-card flat class="border-radius-card">
            <q-card-section>
              <div class="text-h6">لیست واحدها</div>
            </q-card-section>
            <q-separator inset/>
            <q-card-section>
              <q-table
                flat bordered class="border-radius-table"
                :loading="loading"
                :rows="rowsUnit"
                :filter="filter"
                :columns="columnsUnit"
                row-key="id"
                :rows-per-page-options="[10]">

                <template v-slot:loading>
                  <q-inner-loading showing color="primary"/>
                </template>

                <template v-slot:top-right>
                  <q-btn label="واحد جدید" color="primary" rounded @click="newUnitDlg = true"/>
                </template>

                <template v-slot:top-left>
                  <q-input dense debounce="300" v-model="filter" placeholder="جستجو">
                    <template v-slot:append>
                      <q-icon name="search"/>
                    </template>
                  </q-input>
                </template>


                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="title" :props="props">
                      {{ props.row.title }}
                    </q-td>

                    <q-td key="action" :props="props" class="q-gutter-x-sm">
                      <q-btn title="ویرایش" dense round color="warning" icon="edit"
                             @click.prevent="editConfirmationUnit(props.row)"/>
                      <q-btn title="حذف" dense round color="negative" icon="delete"
                             @click.prevent="deleteConfirmationUnit(props.row.id)"/>
                    </q-td>
                  </q-tr>
                </template>


              </q-table>
            </q-card-section>
          </q-card>

          <q-dialog v-model="newUnitDlg">
            <q-card flat class="border-radius-card">
              <q-card-section>
                <div class="text-h6">ایجاد واحد جدید</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormUnit()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="titleUnit" label="عنوان"/>
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ثبت"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-dialog v-model="editConfirmDialogUnit">
            <q-card flat class="border-radius-card">
              <q-card-section>
                <div class="text-h6">ویرایش واحد</div>
              </q-card-section>
              <q-separator inset/>
              <q-form @submit.prevent="submitFormUnitEdit()">
                <q-card-section>
                  <div class="row justify-around q-gutter-md">
                    <div class="col-md-11 col-xs-12">
                      <q-input outlined v-model="editTitleUnit" label="عنوان"/>
                    </div>
                  </div>
                </q-card-section>
                <q-card-actions>
                  <q-btn type="submit" rounded class="full-width" color="accent" label="ویرایش"/>
                </q-card-actions>
              </q-form>
            </q-card>
          </q-dialog>

          <q-dialog v-model="deleteConfirmDialogUnit">
            <q-card>
              <q-card-section class="row items-center">
                <span class="q-mr-sm">آیا از حذف این آیتم اطمینان دارید؟</span>
              </q-card-section>

              <q-card-actions align="center">
                <q-btn label="انصراف" color="warning" v-close-popup/>
                <q-btn label="تایید" color="positive" @click.prevent="deleteItemUnit()"/>
              </q-card-actions>
            </q-card>
          </q-dialog>


        </q-tab-panel>

        <q-tab-panel v-if="isAdmin" name="wages">
          <wage-settings-panel/>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script>
import {exportFile, LocalStorage, QSpinnerPuff} from "quasar";
import WageSettingsPanel from 'components/WageSettingsPanel.vue'
import {api} from 'boot/axios'
import {VMoney} from "v-money";

export default {
  name: "Settings",
  directives: {money: VMoney},
  components: {WageSettingsPanel},
  computed: {
    isAdmin() {
      return Number(LocalStorage.getItem('role')) === 0
    }
  },
  data() {
    return {
      filter: '',
      loading: true,
      deleteConfirmDialog: false,
      deleteConfirmDialogFailure: false,
      deleteConfirmDialogAfterSaleTypes: false,
      deleteConfirmDialogSource: false,
      deleteConfirmDialogSms: false,
      itemFocusingId: '',
      columns: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'description', field: 'description', align: 'center', label: 'توضیحات'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rows: [],
      columnsFailure: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'description', field: 'description', align: 'center', label: 'توضیحات'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      columnsAfterSaleTypes: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rowsFailure: [],
      rowsAfterSaleTypes: [],


      columnsSource: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'description', field: 'description', align: 'center', label: 'توضیحات'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rowsSource: [],

      columnsSms: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'description', field: 'description', align: 'center', label: 'متن پیامک'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rowsSms: [],

      newOrderDlg: false,
      newAfterSaleTypesDlg: false,

      editConfirmDialogAfterSaleTypes: false,
      editTitleAfterSaleTypes: "",

      tab: 'category',


      title: '',
      description: '',
      titleAfterSaleTypes: '',
      titleFailure: '',
      descriptionFailure: '',
      titleSource: '',
      descriptionSource: '',
      titleSms: '',
      descriptionSms: '',

      deleteConfirmDialogUnit: false,
      columnsUnit: [
        {name: 'title', field: 'title', align: 'center', label: 'عنوان'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'}
      ],
      rowsUnit: [],
      newUnitDlg: false,
      editConfirmDialogUnit: false,
      titleUnit: '',
      editTitleUnit: '',
    }
  },
  methods: {
    //____________لیست دسته بندی____________
    deleteConfirmation(id) {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('customers/categories/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategory();
        })
        .finally(() => {
          this.deleteConfirmDialog = false;
        });
    },
    getDataCategory() {
      api.get('customers/categories/list')
        .then(response => {
          this.rows = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    // exportTable() {
    //   const content = [this.columns.map(col => wrapCsvValue(col.label))].concat(
    //     this.rows.map(row => this.columns.map(col => wrapCsvValue(
    //       typeof col.field === 'function'
    //         ? col.field(row)
    //         : row[col.field === void 0 ? col.name : col.field],
    //       col.format
    //     )).join(','))
    //   ).join('\r\n')
    //
    //   const status = exportFile(
    //     'table-export.csv',
    //     "\ufeff" + content,
    //     'text/csv')
    //
    //
    //   if (status !== true) {
    //     this.$q.notify({
    //       message: 'مرورگر دسترسی دانلود فایل را بسته است.',
    //       color: 'negative',
    //       icon: 'warning'
    //     })
    //   }
    // },

    //____________ایجاد دسته بندی____________
    submitForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.title
      postData.description = this.description


      api.post('customers/categories/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rows.unshift(response.data.data)

        })
        .then(() => {
          this.title = '';
          this.description = '';
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },

    //____________ایجاد دلایل شکست____________
    submitFormFailure() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleFailure
      postData.description = this.descriptionFailure


      api.post('failure/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rowsFailure.unshift(response.data.data)
        })
        .then(() => {
          this.titleFailure = '';
          this.descriptionFailure = '';
          this.newOrderDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },

    submitFormAfterSaleTypes() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleAfterSaleTypes

      api.post('service_types/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rowsAfterSaleTypes.unshift(response.data.data)
        })
        .then(() => {
          this.titleAfterSaleTypes = '';
          this.newAfterSaleTypesDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    submitFormAfterSaleTypesEdit() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.editTitleAfterSaleTypes

      api.post('service_types/update/' + this.itemFocusingId , postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .then(() => {
          this.editTitleAfterSaleTypes = '';
          this.editConfirmDialogAfterSaleTypes = false
        })
        .finally(() => {
          this.getDataCategoryAfterSaleTypes()
          this.$q.loading.hide();
        });
    },
    deleteConfirmationAfterSaleTypes(id) {
      this.deleteConfirmDialogAfterSaleTypes = true;
      this.itemFocusingId = id;
    },
    editConfirmationAfterSaleTypes(row) {
      this.editConfirmDialogAfterSaleTypes = true;
      this.editTitleAfterSaleTypes = row.title;
      this.itemFocusingId = row.id;
    },
    //____________لیست دلایل شکست____________
    deleteConfirmationFailure(id) {
      this.deleteConfirmDialogFailure = true;
      this.itemFocusingId = id;
    },
    deleteItemFailure() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('failure/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategoryFailure();
        })
        .finally(() => {
          this.deleteConfirmDialogFailure = false;
        });
    },
    deleteItemAfterSaleTypes() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('service_types/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategoryAfterSaleTypes();
        })
        .finally(() => {
          this.deleteConfirmDialogAfterSaleTypes = false;
        });
    },
    getDataCategoryFailure() {
      api.get('failure/list')
        .then(response => {
          this.rowsFailure = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    getDataCategoryAfterSaleTypes() {
      api.get('service_types/list')
        .then(response => {
          this.rowsAfterSaleTypes = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    //____________ایجاد شیوه آشنایی____________
    submitFormSource() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleSource
      postData.description = this.descriptionSource


      api.post('source/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rowsSource.unshift(response.data.data)
        })

        .then(() => {
          this.titleSource = '';
          this.descriptionSource = '';
          this.newOrderDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    //____________لیست شیوه آشنایی____________
    deleteConfirmationSource(id) {
      this.deleteConfirmDialogSource = true;
      this.itemFocusingId = id;
    },
    deleteItemSource() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('source/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategorySource();
        })
        .finally(() => {
          this.deleteConfirmDialogSource = false;
        });
    },
    getDataCategorySource() {
      api.get('source/list')
        .then(response => {
          this.rowsSource = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    //____________ایجاد پیامک____________
    submitFormSms() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleSms
      postData.description = this.descriptionSms


      api.post('source/sms/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rowsSms.unshift(response.data.data)
        })


        .then(() => {
          this.titleSms = '';
          this.descriptionSms = '';
          this.newOrderDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    //____________لیست پیامک____________
    deleteConfirmationSms(id) {
      this.deleteConfirmDialogSms = true;
      this.itemFocusingId = id;
    },
    deleteItemSms() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('source/sms/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategorySms();
        })
        .finally(() => {
          this.deleteConfirmDialogSms = false;
        });
    },
    getDataCategorySms() {
      api.get('source/sms/list')
        .then(response => {
          this.rowsSms = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
    //____________ایجاد واحد____________
    submitFormUnit() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleUnit

      api.post('units/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rowsUnit.unshift(response.data.data)
        })
        .then(() => {
          this.titleUnit = '';
          this.newUnitDlg = false
        })
        .finally(() => {
          this.$q.loading.hide();
        });
    },
    submitFormUnitEdit() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.id = this.itemFocusingId
      postData.title = this.editTitleUnit

      api.post('units/update', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
        })
        .then(() => {
          this.editTitleUnit = '';
          this.editConfirmDialogUnit = false
        })
        .finally(() => {
          this.getDataCategoryUnit()
          this.$q.loading.hide();
        });
    },
    editConfirmationUnit(row) {
      this.editConfirmDialogUnit = true;
      this.editTitleUnit = row.title;
      this.itemFocusingId = row.id;
    },
    deleteConfirmationUnit(id) {
      this.deleteConfirmDialogUnit = true;
      this.itemFocusingId = id;
    },
    deleteItemUnit() {
      this.loading = true;

      let postData = {};
      postData.id = this.itemFocusingId

      api.post('units/destroy', postData)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
        .then(() => {
          this.getDataCategoryUnit();
        })
        .finally(() => {
          this.deleteConfirmDialogUnit = false;
        });
    },
    getDataCategoryUnit() {
      api.get('units/list')
        .then(response => {
          this.rowsUnit = response.data.data
        })
        .finally(() => {
          this.loading = false
        });
    },
  },
  created() {
    this.getDataCategory();
    this.getDataCategoryFailure();
    this.getDataCategoryAfterSaleTypes();
    this.getDataCategorySource();
    this.getDataCategorySms();
    this.getDataCategoryUnit();


  }
}
</script>

<style scoped>

</style>
