<template>
  <q-page class="q-pa-md">
    <q-card flat class="border-radius-card">
      <q-card-section>
        <div class="text-h6">ویرایش محصول</div>
      </q-card-section>

      <q-separator/>

      <q-form @submit.prevent="editForm()">
        <q-card-section>

          <div class="row q-col-gutter-md">
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input outlined v-model="name" label="نام"/>


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


            </div>
            <div class="col-md-6 col-xs-12 q-gutter-y-md">

              <q-input
                min="0"
                suffix="عدد"
                dir="ltr"
                type="number" outlined v-model.number="firstInventory" label=" موجودی اولیه"
                input-class="text-right"/>

              <q-select
                outlined
                clearable
                map-options
                emit-value
                option-label="title"
                option-value="id"
                v-model="unitId"
                label="واحد"
                :options="unitsOptions">
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      یافت نشد
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>

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


            </div>

            <div class="col-12">
              <q-input
                label="توضیحات بیشتر"
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
  </q-page>
</template>


<script>
import {QSpinnerPuff} from "quasar";
import {api} from 'boot/axios'
import {VMoney} from 'v-money';


export default {
  name: "ProductEdit",
  directives: {money: VMoney},

  data() {
    return {
      moneyFormatForDirective: {
        decimal: '.',
        thousands: ',',
        precision: 0,
        masked: false
      },
      name: '',
      purchasePrice: 0,
      firstInventory: 0,
      sellingPrice: 0,
      description: '',
      unitId: null,
      unitsOptions: [],
    }
  },
  methods: {
    getUnits() {
      api.get('units/list')
        .then(response => {
          this.unitsOptions = response.data.data
        })
    },
    getData() {

      api.get('products/' + this.$route.params.id)
        .then(response => {
          this.name = response.data.data.name
          this.purchasePrice = response.data.data.purchase_price
          this.firstInventory = response.data.data.first_inventory
          this.sellingPrice = response.data.data.selling_price
          this.description = response.data.data.description
          this.unitId = response.data.data.unit_id
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });
    },
    editForm() {

      this.$q.loading.show({
        spinner: QSpinnerPuff,
        spinnerSize: 140,
        message: 'در حال پردازش اطلاعات',
        sanitize: true
      })

      let payload = {};
      payload.id = this.$route.params.id
      payload.name = this.name
      payload.purchasePrice = this.purchasePrice
      payload.firstInventory = this.firstInventory
      payload.sellingPrice = this.sellingPrice
      payload.description = this.description
      payload.unitId = this.unitId


      api.post('products/update', payload)
        .then(response => {
          this.$q.notify({
            timeout: 3000,
            position: 'center',
            type: 'positive',
            message: response.data.message
          })
          this.$q.loading.hide();
        })
        .catch(() => {
          this.$q.loading.hide();
        });


    },

  },
  created() {


    this.$q.loading.show({
      spinner: QSpinnerPuff,
      spinnerSize: 140,
      message: 'در حال پردازش اطلاعات',
      sanitize: true
    })

    this.getData();
    this.getUnits();

  }
}
</script>

<style scoped>

</style>
