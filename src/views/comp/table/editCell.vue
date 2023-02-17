<!-- eslint-disable no-console -->
<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { columns } from './CellColumns'
import { BasicTable } from '@/components/Table'
import { getTableList } from '@/api/table/list'

const actionRef = ref()
const params = reactive({
  pageSize: 5,
  name: 'xiaoMa',
})

function onEditChange({ column, value, record }) {
  if (column.key === 'id')
    record.editValueRefs.name4.value = `${value}`

  console.log(column, value, record)
}

const loadDataTable = async (res) => {
  return await getTableList({ ...params, ...res })
}

function onCheckedRow(rowKeys) {
  console.log(rowKeys)
}

function reloadTable() {
  console.log(actionRef.value)
  actionRef.value.reload()
}

function editEnd({ record, index, key, value }) {
  console.log(record)
  console.log(index)
  console.log(key)
  console.log(value)
}
</script>

<template>
  <n-card :bordered="false" class="proCard">
    <BasicTable
      ref="actionRef"
      title="表格列表"
      title-tooltip="这是一个提示"
      :columns="columns"
      :request="loadDataTable"
      :row-key="(row) => row.id"
      :scroll-x="1360"
      @edit-end="editEnd"
      @edit-change="onEditChange"
      @update:checked-row-keys="onCheckedRow"
    >
      <template #toolbar>
        <n-button type="primary" @click="reloadTable">
          刷新数据
        </n-button>
      </template>
    </BasicTable>
  </n-card>
</template>

<style lang="less" scoped></style>
