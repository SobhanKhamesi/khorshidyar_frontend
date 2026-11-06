<template>
  <!-- دستمزد پیش‌فرض: هنگام ارجاع پروژه، برای هر فردی که در آن کار می‌کند به‌طور خودکار
       یک دریافتی (دستمزد) ثبت می‌شود که در سود و زیان پروژه و پروفایل فرد دیده می‌شود -->
  <q-card flat class="border-radius-card">
    <q-card-section class="row items-center">
      <div class="col">
        <div class="text-h6">دستمزد پیش‌فرض</div>
        <div class="text-caption text-grey-8">
          با ارجاع پروژه به نصاب (و ارسال برای کارشناس فنی)، دستمزد تعریف شده برای همان نوع کار به‌طور خودکار
          در دستمزدهای پروژه و دریافتی‌های پروفایل فرد ثبت می‌شود و برای هر پروژه قابل ویرایش و حذف است.
          خالی یا صفر یعنی دستمزد خودکار ثبت نشود.
        </div>
      </div>
      <q-btn rounded color="positive" icon="save" label="ذخیره" :loading="saving" :disable="loading" @click="save"/>
    </q-card-section>
    <q-separator inset/>
    <q-card-section>
      <div v-if="loading" class="text-center q-pa-md"><q-spinner color="primary" size="2em"/></div>
      <div v-else-if="!users.length" class="text-grey text-center q-pa-md">نصاب یا کارشناس فنی فعالی وجود ندارد</div>
      <q-markup-table v-else flat bordered dense>
        <thead>
        <tr>
          <th class="text-center">نام</th>
          <th class="text-center">سمت</th>
          <th v-for="(label, key) in works" :key="key" class="text-center">{{ label }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="text-center">{{ user.name }}</td>
          <td class="text-center">{{ user.role_label }}</td>
          <td v-for="(label, key) in works" :key="key" class="text-center" style="min-width: 150px">
            <q-input dense outlined type="number" dir="ltr" min="0" suffix="تومان"
                     v-model.number="user.default_wages[key]"/>
          </td>
        </tr>
        </tbody>
      </q-markup-table>
    </q-card-section>
  </q-card>
</template>

<script>
import {api} from 'boot/axios'

export default {
  name: 'WageSettingsPanel',
  data() {
    return {
      loading: false,
      saving: false,
      works: {},
      users: [],
    }
  },
  methods: {
    load() {
      this.loading = true
      api.get('wage-settings')
        .then(response => {
          const data = response.data.data
          this.works = data.works
          this.users = data.users.map(u => ({...u, default_wages: {...(u.default_wages || {})}}))
        })
        .finally(() => {
          this.loading = false
        })
    },
    save() {
      this.saving = true
      api.post('wage-settings', {
        users: this.users.map(u => ({
          id: u.id,
          default_wages: Object.fromEntries(Object.entries(u.default_wages)
            .filter(([, amount]) => amount !== '' && amount !== null && amount !== undefined)),
        }))
      })
        .then(response => {
          this.$q.notify({type: 'positive', position: 'center', message: response.data.message})
          this.load()
        })
        .catch(() => {})
        .finally(() => {
          this.saving = false
        })
    }
  },
  created() {
    this.load()
  }
}
</script>
