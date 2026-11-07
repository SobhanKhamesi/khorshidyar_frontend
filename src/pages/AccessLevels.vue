<template>
  <q-page class="q-pa-lg">
    <q-card bordered>
      <q-card-section class="row items-center q-col-gutter-sm">
        <div class="col-12 col-md">
          <div class="text-h6">سطوح دسترسی نقش‌ها</div>
          <div class="text-caption text-grey-7">
            مشخص کنید هر سمت چه داده‌هایی را ببیند و چه کارهایی انجام دهد. ادمین همیشه همه‌ی دسترسی‌ها را دارد
            و مدیریت کاربران و سطوح دسترسی فقط برای ادمین است.
          </div>
        </div>
        <div class="col-12 col-md-auto row q-gutter-sm justify-end">
          <q-btn outline color="grey-8" icon="arrow_forward" label="کاربران" :to="{ name: 'Users' }"/>
          <q-btn outline color="grey-8" icon="undo" label="لغو تغییرات" :disable="!dirty || saving" @click="discard"/>
          <q-btn color="primary" icon="save" label="ذخیره" :disable="!dirty" :loading="saving" @click="save">
            <q-badge v-if="changedCount" color="orange" floating>{{ changedCount }}</q-badge>
          </q-btn>
        </div>
      </q-card-section>

      <q-separator/>

      <q-card-section class="row items-center q-gutter-sm text-caption">
        <span class="text-grey-7">نوع دسترسی:</span>
        <q-chip v-for="(type, key) in TYPES" :key="key" dense square :color="type.color" text-color="white" :icon="type.icon">
          {{ type.label }}
        </q-chip>
        <q-space/>
        <span class="row items-center"><span class="changed-dot q-mr-xs"/> تغییر ذخیره نشده</span>
      </q-card-section>

      <q-card-section v-if="loading" class="flex flex-center q-pa-xl">
        <q-spinner-puff color="primary" size="60px"/>
      </q-card-section>

      <q-card-section v-else class="q-pt-none">
        <div class="matrix-scroll">
          <q-markup-table flat bordered separator="cell" class="matrix">
            <thead>
            <tr>
              <th class="text-left sticky-col perm-col">دسترسی</th>
              <th v-for="role in roles" :key="role.value" class="role-col">
                <div class="text-weight-bold">{{ role.label }}</div>
                <div class="text-caption text-grey-7">{{ role.users_count }} کاربر</div>
                <div class="q-mt-xs">
                  <q-badge v-if="role.locked" color="grey-7">
                    <q-icon name="lock" size="12px" class="q-mr-xs"/> همه‌ی دسترسی‌ها
                  </q-badge>
                  <template v-else>
                    <q-badge v-if="role.customized" color="indigo-5" label="سفارشی"/>
                    <q-badge v-else outline color="grey-7" label="پیش‌فرض"/>
                    <q-btn flat round dense size="sm" icon="more_vert" class="q-ml-xs">
                      <q-menu auto-close>
                        <q-list dense style="min-width: 200px">
                          <q-item clickable @click="setRoleAll(role.value, true)">
                            <q-item-section avatar><q-icon name="done_all"/></q-item-section>
                            <q-item-section>انتخاب همه</q-item-section>
                          </q-item>
                          <q-item clickable @click="setRoleAll(role.value, false)">
                            <q-item-section avatar><q-icon name="remove_done"/></q-item-section>
                            <q-item-section>حذف همه</q-item-section>
                          </q-item>
                          <q-item clickable @click="applyDefaults(role.value)">
                            <q-item-section avatar><q-icon name="restart_alt"/></q-item-section>
                            <q-item-section>اعمال دسترسی‌های پیش‌فرض</q-item-section>
                          </q-item>
                        </q-list>
                      </q-menu>
                    </q-btn>
                  </template>
                </div>
              </th>
            </tr>
            </thead>

            <tbody>
            <template v-for="group in groups" :key="group.key">
              <tr class="group-row">
                <td class="sticky-col text-left">
                  <q-icon :name="group.icon" size="20px" color="indigo-8" class="q-mr-sm"/>
                  <span class="text-weight-bold text-indigo-9">{{ group.label }}</span>
                </td>
                <td v-for="role in roles" :key="role.value" class="text-center">
                  <q-checkbox v-if="!role.locked" dense size="sm" color="indigo-8"
                              :model-value="groupState(group, role.value)"
                              toggle-indeterminate indeterminate-value="some"
                              @update:model-value="setGroup(group, role.value, groupState(group, role.value) !== true)">
                    <q-tooltip>همه‌ی دسترسی‌های «{{ group.label }}»</q-tooltip>
                  </q-checkbox>
                </td>
              </tr>

              <tr v-for="permission in group.permissions" :key="permission.key">
                <td class="sticky-col perm-col text-left">
                  <div class="row items-center no-wrap">
                    <q-icon :name="TYPES[permission.type].icon" :color="TYPES[permission.type].color" size="18px" class="q-mr-sm">
                      <q-tooltip>{{ TYPES[permission.type].label }}</q-tooltip>
                    </q-icon>
                    <div>
                      <div class="text-weight-medium">{{ permission.label }}</div>
                      <div class="text-caption text-grey-7 perm-desc">{{ permission.description }}</div>
                      <div v-if="permission.requires" class="text-caption text-orange-9">
                        <q-icon name="link" size="14px"/> نیازمند «{{ labelOf(permission.requires) }}»
                      </div>
                    </div>
                  </div>
                </td>
                <td v-for="role in roles" :key="role.value"
                    class="text-center" :class="{ 'changed-cell': isChanged(role.value, permission.key) }">
                  <q-checkbox v-if="role.locked" dense :model-value="true" disable color="grey-6"/>
                  <q-checkbox v-else dense color="positive"
                              :model-value="has(role.value, permission.key)"
                              @update:model-value="toggle(role.value, permission.key, $event)"/>
                </td>
              </tr>
            </template>
            </tbody>
          </q-markup-table>
        </div>

        <q-banner dense rounded class="bg-blue-1 text-blue-10 q-mt-md">
          <template v-slot:avatar>
            <q-icon name="info" color="primary"/>
          </template>
          دسترسی‌های پیش‌نیاز خودکار انتخاب/حذف می‌شوند. تغییرات پس از ذخیره بلافاصله در سرور اعمال می‌شود و منوی
          کاربرانِ وارد شده نیز در به‌روزرسانی بعدی منو (یا با بارگذاری مجدد صفحه) تغییر می‌کند.
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import {api} from 'boot/axios'

// نوع هر دسترسی (برای نمایش)
const TYPES = {
  view: {label: 'مشاهده', icon: 'visibility', color: 'blue-7'},
  action: {label: 'عملیات', icon: 'bolt', color: 'orange-8'},
  delete: {label: 'حذف', icon: 'delete', color: 'negative'},
}

const sorted = list => [...list].sort()

export default {
  name: 'AccessLevels',
  data() {
    return {
      TYPES,
      loading: true,
      saving: false,
      roles: [],
      groups: [],
      // نقش ← دسترسی‌ها (وضعیت در حال ویرایش)
      selected: {},
      // نقش ← دسترسی‌ها (آخرین وضعیت ذخیره شده)
      saved: {},
      defaults: {},
    }
  },
  computed: {
    editableRoles() {
      return this.roles.filter(role => !role.locked).map(role => role.value)
    },
    permissions() {
      return this.groups.flatMap(group => group.permissions)
    },
    changedCount() {
      let count = 0
      for (const role of this.editableRoles)
        for (const permission of this.permissions)
          if (this.isChanged(role, permission.key)) count++
      return count
    },
    dirty() {
      return this.changedCount > 0
    },
  },
  methods: {
    load(data) {
      this.roles = data.roles
      this.groups = data.groups
      this.defaults = data.defaults
      this.saved = {}
      this.selected = {}
      for (const role of data.roles) {
        const permissions = data.matrix[role.value] || []
        this.saved[role.value] = sorted(permissions)
        this.selected[role.value] = sorted(permissions)
      }
    },
    getData() {
      this.loading = true
      api.get('access-levels')
          .then(response => this.load(response.data.data))
          .catch(() => this.$router.push({name: 'Users'}))
          .finally(() => this.loading = false)
    },

    labelOf(key) {
      const permission = this.permissions.find(p => p.key === key)
      return permission ? permission.label : key
    },
    has(role, key) {
      return (this.selected[role] || []).includes(key)
    },
    isChanged(role, key) {
      return (this.selected[role] || []).includes(key) !== (this.saved[role] || []).includes(key)
    },

    // پیش‌نیازها هنگام انتخاب و وابسته‌ها هنگام حذف به‌صورت خودکار اعمال می‌شوند
    toggle(role, key, value) {
      const set = new Set(this.selected[role])
      if (value) {
        let current = this.permissions.find(p => p.key === key)
        while (current) {
          set.add(current.key)
          current = current.requires ? this.permissions.find(p => p.key === current.requires) : null
        }
      } else {
        const remove = k => {
          set.delete(k)
          this.permissions.filter(p => p.requires === k).forEach(p => remove(p.key))
        }
        remove(key)
      }
      this.selected[role] = sorted(set)
    },
    groupState(group, role) {
      const count = group.permissions.filter(p => this.has(role, p.key)).length
      return count === 0 ? false : (count === group.permissions.length ? true : 'some')
    },
    setGroup(group, role, value) {
      group.permissions.forEach(p => this.toggle(role, p.key, value))
    },
    setRoleAll(role, value) {
      this.selected[role] = value ? sorted(this.permissions.map(p => p.key)) : []
    },
    applyDefaults(role) {
      this.selected[role] = sorted(this.defaults[role] || [])
    },
    discard() {
      for (const role of this.roles)
        this.selected[role.value] = [...this.saved[role.value]]
    },

    save() {
      const matrix = {}
      this.editableRoles.forEach(role => matrix[role] = this.selected[role])

      this.saving = true
      api.post('access-levels', {matrix})
          .then(response => {
            this.load(response.data.data)
            this.$q.notify({timeout: 1500, position: 'center', type: 'positive', message: response.data.message})
          })
          .finally(() => this.saving = false)
    },
  },
  beforeRouteLeave(to, from, next) {
    if (!this.dirty)
      return next()

    this.$q.dialog({
      title: 'تغییرات ذخیره نشده',
      message: 'تغییرات سطوح دسترسی ذخیره نشده است. بدون ذخیره خارج می‌شوید؟',
      cancel: {label: 'ماندن', flat: true},
      ok: {label: 'خروج بدون ذخیره', color: 'negative'},
      persistent: true,
    }).onOk(() => next()).onCancel(() => next(false))
  },
  created() {
    this.getData()
  },
}
</script>

<style scoped>
.matrix-scroll {
  overflow-x: auto;
}

.matrix th,
.matrix td {
  white-space: normal;
}

.role-col {
  min-width: 120px;
  vertical-align: top;
}

.perm-col {
  min-width: 280px;
  max-width: 420px;
}

.perm-desc {
  line-height: 1.4;
}

.sticky-col {
  position: sticky;
  right: 0;
  z-index: 1;
  background: #fff;
}

.group-row td {
  background: #eef1fb;
}

.changed-cell {
  background: #fff4d6;
}

.changed-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #fff4d6;
  border: 1px solid #f2c94c;
}
</style>
