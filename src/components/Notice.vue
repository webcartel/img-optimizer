<template>
    <div class="notice mb-[12px]">
        <Icon
            :icon="appearance.icon"
            :fill="appearance.fill"
            class="mr-[10px] w-[30px] h-[30px]"
        />
        <div v-html="message"></div>
    </div>
</template>



<script setup>
import { reactive, onBeforeMount, onMounted } from 'vue'
import { mdiAlertCircle, mdiCheckCircle } from '@mdi/js'
import Icon from '@/components/Icon.vue'
const emit = defineEmits()

const props = defineProps({
    message: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        default: 'message'
    },

    id: {
        type: String,
        default: null
    },

    duration: {
        type: Number,
        default: 10000
    },
})

const appearance = reactive({})

onBeforeMount(() => {
    switch (props.type) {
        case 'message':
            appearance.icon = mdiCheckCircle
            appearance.fill = 'green'
            break;
        case 'warning':
            appearance.icon = mdiAlertCircle
            appearance.fill = '#FF9800'
            break;
        case 'error':
            appearance.icon = mdiAlertCircle
            appearance.fill = 'red'
            break;
    
        default:
            appearance.icon = mdiCheckCircle
            appearance.fill = 'green'
            break;
    }
})

onMounted(() => {
    setTimeout(() => {
        emit('delete', props.id)
    }, props.duration);
})

</script>



<style scoped>
.notice {
    display: flex;
    padding: 12px;
    border-radius: 12px;
    box-shadow: 0 0 16px 6px #ebebeb;
    background: #fff;
}

</style>