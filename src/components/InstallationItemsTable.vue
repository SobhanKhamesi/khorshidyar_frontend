<template>
  <div v-if="!items || !items.length" class="text-caption text-grey">{{ emptyText }}</div>
  <q-markup-table v-else flat bordered dense separator="cell">
    <thead>
    <tr>
      <th>محصول</th>
      <th>تعداد / مقدار</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in items" :key="item.id">
      <td class="text-center">{{ item.product ? item.product.name : '-' }}</td>
      <td class="text-center">{{ item.quantity }} {{ item.product && item.product.unit ? item.product.unit.title : '' }}</td>
    </tr>
    </tbody>
  </q-markup-table>
</template>

<script>
export default {
  name: "InstallationItemsTable",
  props: {
    items: Array,
    emptyText: {type: String, default: 'موردی ثبت نشده است'}
  }
}
</script>
