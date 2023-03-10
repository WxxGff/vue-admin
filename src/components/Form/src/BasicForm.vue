<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, unref, watch } from 'vue'
import { DownOutlined, QuestionCircleOutlined, UpOutlined } from '@vicons/antd'
import type { Ref } from 'vue'
import type { GridProps } from 'naive-ui/lib/grid'
import { createPlaceholderMessage } from './helper'
import { useFormEvents } from './hooks/useFormEvents'
import { useFormValues } from './hooks/useFormValues'

import { basicProps } from './props'

import type { FormActionType, FormProps, FormSchema } from './types/form'

import { isArray } from '@/utils/is/index'
import { deepMerge } from '@/utils'

export default defineComponent({
  name: 'BasicUpload',
  components: { DownOutlined, UpOutlined, QuestionCircleOutlined },
  props: {
    ...basicProps,
  },
  emits: ['reset', 'submit', 'register'],
  setup(props, { emit, attrs }) {
    const defaultFormModel = ref<Recordable>({})
    const formModel = reactive<Recordable>({})
    const propsRef = ref<Partial<FormProps>>({})
    const schemaRef = ref<Nullable<FormSchema[]>>(null)
    const formElRef = ref<Nullable<FormActionType>>(null)
    const gridCollapsed = ref(true)
    const loadingSub = ref(false)
    const isUpdateDefaultRef = ref(false)

    const getSubmitBtnOptions = computed(() => {
      return Object.assign(
        {
          size: props.size,
          type: 'primary',
        },
        props.submitButtonOptions,
      )
    })

    const getResetBtnOptions = computed(() => {
      return Object.assign(
        {
          size: props.size,
          type: 'default',
        },
        props.resetButtonOptions,
      )
    })

    function getComponentProps(schema) {
      const compProps = schema.componentProps ?? {}
      const component = schema.component
      return {
        clearable: true,
        placeholder: createPlaceholderMessage(unref(component)),
        ...compProps,
      }
    }

    const getProps = computed((): FormProps => {
      const formProps = { ...props, ...unref(propsRef) } as FormProps
      const rulesObj: any = {
        rules: {},
      }
      const schemas: any = formProps.schemas || []
      schemas.forEach((item) => {
        if (item.rules && isArray(item.rules))
          rulesObj.rules[item.field] = item.rules
      })
      return { ...formProps, ...unref(rulesObj) }
    })

    const isInline = computed(() => {
      const { layout } = unref(getProps)
      return layout === 'inline'
    })

    const getGrid = computed((): GridProps => {
      const { gridProps } = unref(getProps)
      return {
        ...gridProps,
        collapsed: isInline.value ? gridCollapsed.value : false,
        responsive: 'screen',
      }
    })

    const getBindValue = computed(
      () => ({ ...attrs, ...props, ...unref(getProps) } as Recordable),
    )

    const getSchema = computed((): FormSchema[] => {
      const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any)
      for (const schema of schemas) {
        const { defaultValue } = schema
        // handle date type
        // dateItemType.includes(component as string)
        if (defaultValue)
          schema.defaultValue = defaultValue
      }
      return schemas as FormSchema[]
    })

    const { handleFormValues, initDefault } = useFormValues({
      defaultFormModel,
      getSchema,
      formModel,
    })

    const { handleSubmit, validate, resetFields, getFieldsValue, clearValidate, setFieldsValue }
        = useFormEvents({
          emit,
          getProps,
          formModel,
          getSchema,
          formElRef: formElRef as Ref<FormActionType>,
          defaultFormModel,
          loadingSub,
          handleFormValues,
        })

    function unfoldToggle() {
      gridCollapsed.value = !gridCollapsed.value
    }

    async function setProps(formProps: Partial<FormProps>): Promise<void> {
      propsRef.value = deepMerge(unref(propsRef) || {}, formProps)
    }

    const formActionType: Partial<FormActionType> = {
      getFieldsValue,
      setFieldsValue,
      resetFields,
      validate,
      clearValidate,
      setProps,
      submit: handleSubmit,
    }

    watch(
      () => getSchema.value,
      (schema) => {
        if (unref(isUpdateDefaultRef))
          return

        if (schema?.length) {
          initDefault()
          isUpdateDefaultRef.value = true
        }
      },
    )

    onMounted(() => {
      initDefault()
      emit('register', formActionType)
    })

    return {
      formElRef,
      formModel,
      getGrid,
      getProps,
      getBindValue,
      getSchema,
      getSubmitBtnOptions,
      getResetBtnOptions,
      handleSubmit,
      resetFields,
      loadingSub,
      isInline,
      getComponentProps,
      unfoldToggle,
    }
  },
})
</script>

<template>
  <n-form v-bind="getBindValue" ref="formElRef" :model="formModel">
    <n-grid v-bind="getGrid">
      <n-gi v-for="schema in getSchema" v-bind="schema.giProps" :key="schema.field">
        <n-form-item :label="schema.label" :path="schema.field">
          <!-- ??????????????????????????? -->
          <template v-if="schema.labelMessage" #label>
            {{ schema.label }}
            <n-tooltip trigger="hover" :style="schema.labelMessageStyle">
              <template #trigger>
                <n-icon size="18" class="cursor-pointer text-gray-400">
                  <QuestionCircleOutlined />
                </n-icon>
              </template>
              {{ schema.labelMessage }}
            </n-tooltip>
          </template>

          <!-- ???????????? -->
          <template v-if="schema.slot">
            <slot
              :name="schema.slot"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            />
          </template>

          <!-- NCheckbox -->
          <template v-else-if="schema.component === 'NCheckbox'">
            <n-checkbox-group v-model:value="formModel[schema.field]">
              <n-space>
                <n-checkbox
                  v-for="item in schema?.componentProps?.options"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </n-space>
            </n-checkbox-group>
          </template>

          <!-- NRadioGroup -->
          <template v-else-if="schema.component === 'NRadioGroup'">
            <n-radio-group v-model:value="formModel[schema.field]">
              <n-space>
                <n-radio
                  v-for="item in schema.componentProps?.options"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>
          <!-- ???????????????????????? -->
          <component
            v-bind="getComponentProps(schema)"
            :is="schema.component"
            v-else
            v-model:value="formModel[schema.field]"
            :class="{ isFull: schema.isFull !== false && getProps.isFull }"
          />
          <!-- ????????????????????? -->
          <template v-if="schema.suffix">
            <slot
              :name="schema.suffix"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            />
          </template>
        </n-form-item>
      </n-gi>
      <!-- ?????? ?????? ?????? ?????? ?????? -->
      <n-gi
        v-if="getProps.showActionButtonGroup"
        :span="isInline ? undefined : 24"
        :suffix="isInline ? true : false"
        #="{ overflow }"
      >
        <n-space
          align="center"
          :justify="isInline ? 'end' : 'start'"
          :style="{ 'margin-left': `${isInline ? 12 : getProps.labelWidth}px` }"
        >
          <n-button
            v-if="getProps.showSubmitButton"
            v-bind="getSubmitBtnOptions"
            :loading="loadingSub"
            @click="handleSubmit"
          >
            {{ getProps.submitButtonText }}
          </n-button>
          <n-button
            v-if="getProps.showResetButton"
            v-bind="getResetBtnOptions"
            @click="resetFields"
          >
            {{ getProps.resetButtonText }}
          </n-button>
          <n-button
            v-if="isInline && getProps.showAdvancedButton"
            type="primary"
            text
            icon-placement="right"
            @click="unfoldToggle"
          >
            <template #icon>
              <n-icon v-if="overflow" size="14" class="unfold-icon">
                <DownOutlined />
              </n-icon>
              <n-icon v-else size="14" class="unfold-icon">
                <UpOutlined />
              </n-icon>
            </template>
            {{ overflow ? '??????' : '??????' }}
          </n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<style lang="less" scoped>
  .isFull {
    justify-content: flex-start;
    width: 100%;
  }

  .unfold-icon {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: -3px;
  }
</style>
