<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6"> محصولات و خدمات</div>
      </q-card-section>


      <q-separator/>
      <q-card-section>
        <div class=" row">
          <div style="padding: 5px">

            <q-avatar title="افزودن انبار و مکان جدید" size="150px" font-size="30px" color="teal" text-color="white"
                      @click.prevent="inventoryConfirmation()">
              <div style="position: absolute; bottom: 5px; top: 25%; transform: translateX(3%);">
                <span style="font-size: 12px">افزودن انبار و مکان جدید</span>
              </div>
              <div><i class="bi bi-plus-lg"/></div>

            </q-avatar>

          </div>
          <div v-for="row in rows" style="padding: 5px">
            <q-avatar size="150px" font-size="18px" color="teal" text-color="white" style="position: relative;">
              <div v-if="row !== null"><span>{{ row.title }}</span></div>

              <br>
              <div class="row">
                <div>
                  <q-icon title="ایجاد گروهبندی" name="add" size="28px" color="white" class="q-mt-md"
                          style="position: absolute; bottom: 10px; left: 70%; transform: translateX(-50%);"
                          @click.prevent="productCategoriesConfirmation(row.id)"/>
                </div>
                <div class="q-py-lg-md">

                  <q-btn flat round title="ویرایش انبار" name="edit" size="13px" color="white" class="q-mt-md"
                         icon="edit"
                         style="position: absolute; bottom: 5px; left: 50%; transform: translateX(-50%);"
                         v-if="row"
                         :to="getIdRoute(row)"/>
                  <q-btn flat round title="حذف انبار" name="edit" size="13px" color="white" class="q-mt-md"
                         icon="delete"
                         style="position: absolute; bottom: 5px; left: 30%; transform: translateX(-50%);"
                         @click.prevent="deleteInventoryConfirmation(row.id)"/>
                </div>
              </div>
            </q-avatar>
          </div>
        </div>

      </q-card-section>
      <q-separator/>

      <q-card-section>


        <q-table
          flat bordered class="border-radius-table"
          :loading="loading"
          :rows="rowsProductCategory"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[10]"
          title="لیست گروهبندی"
        >


          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="user" :props="props">
                {{ props.row.SabtKonande }}
              </q-td>
              <q-td key="title" :props="props">
                {{ props.row.title }}
              </q-td>
              <q-td key="description" :props="props">
                {{ props.row.description }}
              </q-td>
              <q-td key="anbar" :props="props">
                <q-badge color="teal"> {{ props.row.SabtInventory }}
                </q-badge>
              </q-td>
              <q-td key="action" :props="props">
                <q-btn
                  @click.prevent="showComments(props.row.id)"
                  title="ایجاد محصول" dense round color="blue" icon="forum">
                  <q-badge v-if="props.row.commentsCount > 0" color="negative" style="font-size: 18px;" floating>
                    {{ props.row.commentsCount }}
                  </q-badge>
                </q-btn>
                <q-btn title="ویرایش" dense round color="yellow-9" icon="edit" target="_blank"
                       :to="{ name:'editCategoryProduct',params:{id:props.row.id} }"/>
                <q-btn title="حذف" dense round color="negative" icon="delete"
                       @click.prevent="deleteCategoryConfirmation(props.row.id)"/>
              </q-td>

            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="inventoryConfirmDialog"
              :loading="loading"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">ایجاد انبار و مکان جدید</div>
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
    <q-dialog v-model="inventoryDialogConfirmDialog"
              :loading="loading"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">ویرایش انبار و مکان جدید</div>
        </q-card-section>
        <q-separator inset/>
        <q-form @submit.prevent="editInventory()">
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


    <q-dialog v-model="productCategoriesConfirmDialog"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">ایجاد گروهبندی جدید</div>
        </q-card-section>
        <q-separator inset/>
        <q-form @submit.prevent="submitCategoryForm()">
          <q-card-section>
            <div class="row justify-around q-gutter-md">
              <div class="col-md-11 col-xs-12">
                <q-input outlined v-model="titleCategory" label="عنوان"/>
              </div>
              <div class="col-md-11 col-xs-12">
                <q-input
                  label="توضیحات"
                  v-model="descriptionCategory"
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

    <q-dialog v-model="showCommentsDlg">
      <q-card style="width: 880px; max-width: 90vw;">
        <q-card-section>

          <q-table
            :loading="commentsLoading"
            binary-state-sort
            :rows="commentsRows"
            title="محصولات"

            :columns="commentsColumns"
            :rows-per-page-options="[0]"
          >

            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>

            <template v-slot:top-right>
              <q-btn @click="newCommentDlg = true;" title="محصول جدید" dense color="primary" rounded
                     label="ایجاد محصول جدید"/>
            </template>


            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td key="user" :props="props">
                  {{ props.row.SabtKonande }}
                </q-td>
                <q-td key="picture" :props="props">
                  <img :src="'https://khrshdyar.ir/picture/' + props.row.picture" height="50" width="50"
                       @click.prevent="largeImage('https://khrshdyar.ir/picture/' + props.row.picture)"></q-td>
                <q-td key="code" :props="props">
                  {{ props.row.code }}
                </q-td>
                <q-td key="name" :props="props">
                  {{ props.row.name }}
                </q-td>
                <q-td key="selling_price" :props="props">
                  {{ moneyFormat(props.row.selling_price) }}
                </q-td>
                <q-td key="inventory" :props="props">
                  {{ moneyFormat(props.row.inventory) }}
                </q-td>
                <q-td key="sold_count" :props="props">
                  {{ moneyFormat(props.row.sold_count) }}
                </q-td>
                <q-td key="operation" :props="props">
                  <q-btn title="حذف" dense round color="negative" icon="delete"
                         @click.prevent="deleteCommentConfirmation(props.row.id)"/>
                </q-td>
              </q-tr>
            </template>


          </q-table>

        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="newCommentDlg">
      <q-card style="width:800px; max-width: 190vw;">

        <q-card-section>
          <div class="text-h6 q-mb-lg">محصول جدید</div>
          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="name" label="نام"/>
              <q-input outlined v-model="code" label="کدمحصول"/>
              <q-select
                outlined
                map-options
                emit-value
                option-label="title"
                option-value="id"
                v-model="unitId"
                label="واحد اندازه گیری"
                :options="unitsOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>


              <q-input
                label=" مشخصات فنی"
                v-model="technical"
                outlined
                autogrow
              />


            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">


              <q-input
                min="0"
                suffix="عدد"
                dir="ltr"
                type="number" outlined v-model.number="firstInventory" label="موجودی اولیه"
                input-class="text-right"/>

              <q-field
                dir="ltr"
                suffix="تومان"
                label="قیمت همکاری"
                input-class="text-right"
                outlined
                v-model="purchasePrice">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>
              <q-field
                dir="ltr"
                suffix="تومان"
                label="قیمت فروش"
                input-class="text-right"
                outlined
                v-model="sellingPrice">

                <template v-slot:control="{ id, floatingLabel, modelValue, emitValue }">
                  <input :id="id" class="q-field__input text-right" :value="modelValue"
                         @change="e => emitValue(e.target.value)" v-money="moneyFormatForDirective"
                         v-show="floatingLabel">
                </template>
              </q-field>

              <q-file
                accept=".jpg, .png, .jpeg"
                dir="rtl"
                clearable
                outlined v-model="picture" label="آپلود تصویر ">
                <template v-slot:prepend>
                  <q-icon name="attach_file"/>
                </template>
              </q-file>

            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">


            </div>
            <div class="col-12">
              <q-input
                label="توضیحات بیشتر"
                v-model="productDescription"
                outlined
                autogrow
              />
            </div>

          </div>

        </q-card-section>

        <q-card-actions align="center" class="text-primary">
          <q-btn color="negative" label="لغو" v-close-popup/>
          <q-btn color="teal" @click.prevent="createComment" label="افزودن"/>
        </q-card-actions>

      </q-card>
    </q-dialog>

    <q-dialog v-model="deleteCommentConfirmDialog">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-mr-sm">آیا از حذف این گروه بندی اطمینان دارید؟</span>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="انصراف" color="warning" v-close-popup/>
          <q-btn label="تایید" color="positive" @click.prevent="deleteCommentItem()"/>
        </q-card-actions>

      </q-card>
    </q-dialog>


    <q-dialog v-model="largeImageDialog">
      <q-card>
        <q-card-section class="row items-center">
          <img v-if="largeImageAddress !==null" :src="largeImageAddress" width="500" height="500">

        </q-card-section>

        <q-card-actions align="center">
          <q-btn title="بستن" color="negative" rounded dense icon="eva-close-outline" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
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
          <div class="text-deep-orange-10">با حذف این این گروهبندی تمام محصولات و سفارشات آن محصول حذف میشود.</div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded @click.prevent="deleteItem()" label="تایید"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="deleteInventoryDialog"
              :maximized="!$q.screen.gt.sm"
              :full-width="!$q.screen.gt.sm"
              :full-height="!$q.screen.gt.sm"
              transition-show="slide-up"
              transition-hide="slide-down"
    >
      <q-card class="dialog-card-big">
        <q-card-section>
          <div class="text-h6">آیا از حذف این انبار اطمینان دارید؟</div>
          <div class="text-deep-orange-10">با حذف این این آیتم تمام گروهبندی ها و محصولات آن انبار حذف میشود.</div>
        </q-card-section>

        <q-separator/>
        <q-card-actions align="center" class="q-py-md">
          <q-btn outline rounded color="accent" label="انصراف" v-close-popup/>
          <q-btn color="accent" rounded @click.prevent="deleteItemInventory()" label="تایید"/>
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>

</template>

<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'
import {VMoney} from "v-money";

export default {
  name: "advanceCreate",
  directives: {money: VMoney},
  data() {
    return {
      deleteConfirmDialog: false,
      itemFocusingId: '',
      deleteInventoryDialog: false,
      itemFocusingIdInventory: '',
      largeImageDialog: false,
      largeImageAddress: null,


      name: '',
      code: '',
      unitId: '',
      technical: '',
      purchasePrice: 0,
      firstInventory: 0,
      sellingPrice: 0,
      productDescription: '',
      picture: null,

      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },
      unitsOptions: [],
      commentsRows: [],
      commentsColumns: [
        {name: 'user', field: 'user', align: 'center', label: 'ثبت کننده'},
        {name: 'picture', field: 'picture', align: 'center', label: 'عکس'},
        {name: 'code', field: 'code', align: 'center', label: 'کد'},
        {name: 'name', field: 'name', align: 'center', label: 'نام'},
        {name: 'selling_price', field: 'selling_price', align: 'center', label: 'قیمت (تومان)'},
        {
          name: 'inventory',
          field: 'inventory',
          align: 'center',
          label: 'موجودی',
          sortable: true,
          sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
        },
        {
          name: 'sold_count',
          field: 'sold_count',
          align: 'center',
          label: 'تعداد فروخته شده',
          sortable: true,
          sort: (a, b) => parseInt(a, 10) - parseInt(b, 10)
        },

        {name: 'operation', field: 'operation', align: 'center', label: 'عملیات'},
      ],
      newCommentDlg: false,
      newCommentContent: '',
      commentForUUID: '',

      deleteCommentConfirmDialog: false,
      itemCommentFocusingId: '',
      showCommentsDlg: false,
      commentsLoading: false,

      //_________________________________________


      selectedInventory: null,
      inventoryConfirmDialog: false,
      productCategoriesConfirmDialog: false,
      inventoryDialogConfirmDialog: false,
      title: '',
      description: '',
      titleCategory: '',
      descriptionCategory: '',
      inventoryId: '',
      rows: [],
      rowsProductCategory: [],

      columns: [
        {name: 'user', field: 'user', align: 'center', label: 'ثبت کننده'},
        {name: 'title', field: 'title', align: 'center', label: 'عنوان گروهبندی'},
        {name: 'description', field: 'description', align: 'center', label: ' توضیحات'},
        {name: 'anbar', field: 'anbar', align: 'center', label: ' انبار مربوطه'},
        {name: 'action', field: 'action', align: 'center', label: 'عملیات'},


      ],
      loading: false,

    }
  },
  methods: {
    getIdRoute(row) {
      if(row.id) {
        return { name: 'editInventory', params: { id: row.id } }
      }
      },
    deleteInventoryConfirmation(id) {
      this.deleteInventoryDialog = true;
      this.itemFocusingIdInventory = id;
    },
    deleteItemInventory() {
      this.loading = true;
      let data = new FormData();
      data.append('id', this.itemFocusingIdInventory)
      api.post('inventory/destroy', data)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
          this.deleteInventoryDialog = false;
          this.getData();
          this.getDataProductCategory();
        });
    },
    deleteCategoryConfirmation(id)
    {
      this.deleteConfirmDialog = true;
      this.itemFocusingId = id;
    },
    deleteItem()
    {
      this.loading = true;
      let data = new FormData();
      data.append('id', this.itemFocusingId)
      api.post('ProductCategory/destroy', data)
        .then(response => {
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
          this.deleteConfirmDialog = false;
          this.getDataProductCategory();
        });
    },
    largeImage(image) {
      this.largeImageDialog = true;
      this.largeImageAddress = image;
    },


    moneyFormat(digits) {
      return (("" + digits).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    },
    showCategories(inventory) {
      this.selectedInventory = inventory
    },
    inventoryConfirmation() {
      this.loading = true;
      this.inventoryConfirmDialog = true;
    },
    productCategoriesConfirmation(id) {
      this.productCategoriesConfirmDialog = true;
      this.inventoryId = id;
    },
    inventoryDialogConfirmation(id) {
      this.inventoryDialogConfirmDialog = true;
      this.inventoryId = id;
    },

    getData() {
      api.get('inventory/list')
        .then(response => {
          // دریافت پاسخ موفق از سرور
          this.rows = response.data.data;
          this.loading = false;
        })
        .catch(() => {
          // در صورت بروز خطا
          this.loading = false;
        });
    },


    //____________ایجاد انبارداری____________
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


      api.post('inventory/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.rows.unshift(response.data.data)
          this.getData();

        })
        .then(() => {
          this.title = '';
          this.description = '';
        })
        .finally(() => {
          this.$q.loading.hide();
          this.inventoryConfirmDialog = false;

        });
    },
    //______________________________


    //___________________ایجاد گروهبندی___________________
    submitCategoryForm() {
      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let postData = {};
      postData.title = this.titleCategory
      postData.description = this.descriptionCategory
      postData.inventory = this.inventoryId


      api.post('ProductCategory/store', postData)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.title = '';
          this.description = '';
          this.rowsProductCategory.unshift(response.data.data)
          this.getDataProductCategory();

        })
        .then(() => {


        })
        .finally(() => {
          this.$q.loading.hide();
          this.loading = false
        });
    },
    //_______________________
    getDataProductCategory() {
      api.get('ProductCategory/list')
        .then(response => {
          this.rowsProductCategory = response.data.data
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        });

    },
    getUnits() {
      api.get('units/list')
        .then(response => {
          this.unitsOptions = response.data.data
        })
    },


    createComment() {


      let formData = new FormData();
      formData.append('id', this.commentForUUID);
      formData.append('name', this.name)
      formData.append('code', this.code)
      formData.append('unitId', this.unitId)
      formData.append('technical', this.technical)
      formData.append('purchasePrice', this.purchasePrice)
      formData.append('sellingPrice', this.sellingPrice)
      formData.append('firstInventory', this.firstInventory)
      formData.append('productDescription', this.productDescription)
      formData.append('picture', this.picture)

      api.post('ProductCategory/new-product', formData)
        .then(response => {
          this.showComments(this.commentForUUID)
          this.newCommentDlg = false;
          this.name = ''
          this.code = ''
          this.unitId = ''
          this.technical = ''
          this.purchasePrice = 0
          this.sellingPrice = 0
          this.firstInventory = 0
          this.productDescription = ''
          this.picture = null;
          this.$q.loading.hide();
          this.$q.notify({
            message: 'باموفقیت ایجاد شد',
            type: 'positive'
          })


        })
    },

    showComments(id) {
      this.showCommentsDlg = true;
      this.commentsLoading = true;
      this.commentForUUID = id;


      let formData = new FormData();
      formData.append('id', id);
      api.post('ProductCategory/product', formData)
        .then(response => {
          this.commentsRows = response.data.data
          this.commentsLoading = false
        })
    },

    deleteCommentConfirmation(id) {
      this.deleteCommentConfirmDialog = true;
      this.itemCommentFocusingId = id;
    },
    deleteCommentItem() {
      this.commentsLoading = true;

      let data = new FormData();
      data.append('id', this.itemCommentFocusingId)

      api.post('ProductCategory/product/destroy', data)
        .then(response => {
          this.showComments(this.commentForUUID);
          this.deleteCommentConfirmDialog = false;
          this.$q.notify({
            type: 'positive',
            position: 'center',
            message: response.data.message
          })
        })
    },


  },
  created() {
    this.getData()
    this.getDataProductCategory()
    this.getUnits()
  }
}
</script>

<style scoped>

</style>
