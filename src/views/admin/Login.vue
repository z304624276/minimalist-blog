<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2>后台管理</h2>
      <el-form :model="form" @submit.prevent="handleLogin">
        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            type="email"
            placeholder="请输入管理员邮箱"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" style="width: 100%">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { adminLogin, isAdminLoggedIn, restoreAuth } from '@/api/pocketbase'

const router = useRouter()
const loading = ref(false)
const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  if (!form.value.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!form.value.password) {
    ElMessage.warning('请输入密码')
    return
  }

  loading.value = true

  try {
    const result = await adminLogin(form.value.password)
    if (result.success) {
      ElMessage.success('登录成功')
      router.push('/chaosystem/dashboard')
    } else {
      ElMessage.error('登录失败: ' + (result.error?.message || '账号或密码错误'))
    }
  } catch (error) {
    ElMessage.error('登录失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 组件挂载时检查是否已登录
onMounted(() => {
  restoreAuth()
  if (isAdminLoggedIn()) {
    router.push('/chaosystem/dashboard')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 360px;
  padding: 20px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}
</style>