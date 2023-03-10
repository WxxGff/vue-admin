<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from 'vue'
import { DeleteOutlined, EyeOutlined, PlusOutlined } from '@vicons/antd'
import { useDialog, useMessage } from 'naive-ui'
import { basicProps } from './props'
import { ResultEnum } from '@/enums/httpEnum'
import componentSetting from '@/settings/componentSetting'
import { useGlobSetting } from '@/hooks/setting'
import { isString } from '@/utils/is'

const globSetting = useGlobSetting()

export default defineComponent({
  name: 'BasicUpload',

  components: { EyeOutlined, DeleteOutlined, PlusOutlined },
  props: {
    ...basicProps,
  },
  emits: ['uploadChange', 'delete'],
  setup(props, { emit }) {
    const getCSSProperties = computed(() => {
      return {
        width: `${props.width}px`,
        height: `${props.height}px`,
      }
    })

    const message = useMessage()
    const dialog = useDialog()

    const state = reactive({
      showModal: false,
      previewUrl: '',
      originalImgList: [] as string[],
      imgList: [] as string[],
    })

    // 赋值默认图片显示
    watch(
      () => props.value,
      () => {
        state.imgList = props.value.map((item) => {
          return getImgUrl(item)
        })
      },
      { immediate: true },
    )

    // 预览
    function preview(url: string) {
      state.showModal = true
      state.previewUrl = url
    }

    // 删除
    function remove(index: number) {
      dialog.info({
        title: '提示',
        content: '你确定要删除吗？',
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          state.imgList.splice(index, 1)
          state.originalImgList.splice(index, 1)
          emit('uploadChange', state.originalImgList)
          emit('delete', state.originalImgList)
        },
        onNegativeClick: () => {},
      })
    }

    // 组装完整图片地址
    function getImgUrl(url: string): string {
      const { imgUrl } = globSetting
      return /(^http|https:\/\/)/g.test(url) ? url : `${imgUrl}${url}`
    }

    function checkFileType(fileType: string) {
      return componentSetting.upload.fileType.includes(fileType)
    }

    // 上传之前
    function beforeUpload({ file }) {
      const fileInfo = file.file
      const { maxSize, accept } = props
      const acceptRef = (isString(accept) && accept.split(',')) || []

      // 设置最大值，则判断
      if (maxSize && fileInfo.size / 1024 / 1024 >= maxSize) {
        message.error(`上传文件最大值不能超过${maxSize}M`)
        return false
      }

      // 设置类型,则判断
      const fileType = componentSetting.upload.fileType
      if (acceptRef.length > 0 && !checkFileType(fileInfo.type)) {
        message.error(`只能上传文件类型为${fileType.join(',')}`)
        return false
      }

      return true
    }

    // 上传结束
    function finish({ event: Event }) {
      // eslint-disable-next-line no-eval
      const res = eval(`(${Event.target.response})`)
      const infoField = componentSetting.upload.apiSetting.infoField
      const { code } = res
      const message = res.msg || res.message || '上传失败'
      const result = res[infoField]
      // 成功
      if (code === ResultEnum.SUCCESS) {
        const imgUrl: string = getImgUrl(result.photo)
        state.imgList.push(imgUrl)
        state.originalImgList.push(result.photo)
        emit('uploadChange', state.originalImgList)
      }
      else { message.error(message) }
    }

    return {
      ...toRefs(state),
      finish,
      preview,
      remove,
      beforeUpload,
      getCSSProperties,
    }
  },
})
</script>

<template>
  <div class="w-full">
    <div class="upload">
      <div class="upload-card">
        <!-- 图片列表 -->
        <div
          v-for="(item, index) in imgList"
          :key="`img_${index}`"
          class="upload-card-item"
          :style="getCSSProperties"
        >
          <div class="upload-card-item-info">
            <div class="img-box">
              <img :src="item">
            </div>
            <div class="img-box-actions">
              <n-icon size="18" class="mx-2 action-icon" @click="preview(item)">
                <EyeOutlined />
              </n-icon>
              <n-icon size="18" class="mx-2 action-icon" @click="remove(index)">
                <DeleteOutlined />
              </n-icon>
            </div>
          </div>
        </div>

        <!-- 上传图片 -->
        <div
          v-if="imgList.length < maxNumber"
          class="upload-card-item upload-card-item-select-picture"
          :style="getCSSProperties"
        >
          <n-upload
            v-bind="$props"
            :file-list-style="{ display: 'none' }"
            @before-upload="beforeUpload"
            @finish="finish"
          >
            <div class="flex flex-col justify-center">
              <n-icon size="18" class="m-auto">
                <PlusOutlined />
              </n-icon>
              <span class="upload-title">上传图片</span>
            </div>
          </n-upload>
        </div>
      </div>
    </div>

    <!-- 上传图片 -->
    <n-space>
      <n-alert v-if="helpText" title="提示" type="info" class="flex w-full">
        {{ helpText }}
      </n-alert>
    </n-space>
  </div>

  <!-- 预览图片 -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    title="预览"
    :bordered="false"
    :style="{ width: '520px' }"
  >
    <img :src="previewUrl">
  </n-modal>
</template>

<style lang="less">
  .upload {
    width: 100%;
    overflow: hidden;

    &-card {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      width: auto;
      height: auto;

      &-item {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 8px;
        margin: 0 8px 8px 0;
        border: 1px solid #d9d9d9;
        border-radius: 2px;

        &:hover {
          background: 0 0;

          .upload-card-item-info::before {
            opacity: 1;
          }

          &-info::before {
            opacity: 1;
          }
        }

        &-info {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 0;
          overflow: hidden;

          &:hover {
            .img-box-actions {
              opacity: 1;
            }
          }

          &::before {
            position: absolute;
            z-index: 1;
            width: 100%;
            height: 100%;
            content: ' ';
            background-color: rgb(0 0 0 / 50%);
            opacity: 0;
            transition: all 0.3s;
          }

          .img-box {
            position: relative;
            //padding: 8px;
            //border: 1px solid #d9d9d9;
            border-radius: 2px;
          }

          .img-box-actions {
            position: absolute;
            top: 50%;
            left: 50%;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: space-between;
            white-space: nowrap;
            opacity: 0;
            transition: all 0.3s;
            transform: translate(-50%, -50%);

            &:hover {
              background: 0 0;
            }

            .action-icon {
              color: rgb(255 255 255 / 85%);

              &:hover {
                color: #fff;
                cursor: pointer;
              }
            }
          }
        }
      }

      &-item-select-picture {
        color: #666;
        cursor: pointer;
        background: #fafafa;
        border: 1px dashed #d9d9d9;
        border-radius: 2px;

        .upload-title {
          color: #666;
        }
      }
    }
  }
</style>
