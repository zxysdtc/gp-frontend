<template>
  <div class="settings-view">
    <h1>个人设置</h1>
    <p>这里可以修改您的个人信息、密码、通知设置等。</p>

    <div class="settings-section card">
        <h3>账户信息</h3>
        <div class="form-group">
            <label for="profile-username">用户名</label>
            <input type="text" id="profile-username" v-model="username" disabled>
        </div>
        <div class="form-group">
            <label for="profile-email">邮箱</label>
            <input type="email" id="profile-email" v-model="email" :disabled="!isEdit">
        </div>
        <button v-if="!isEdit" @click="isEdit = true">编辑邮箱</button>
        <button v-if="isEdit" @click="changeEmail,isEdit = false">保存更改</button>
    </div>

     <div class="settings-section card">
        <h3>修改密码</h3>
        <div class="form-group">
            <label for="current-password">当前密码</label>
            <input type="password" id="current-password">
        </div>
        <div class="form-group">
            <label for="new-password">新密码</label>
            <input type="password" id="new-password">
        </div>
         <div class="form-group">
            <label for="confirm-new-password">确认新密码</label>
            <input type="password" id="confirm-new-password">
        </div>
        <button @click="changePassword">确认修改密码</button>
    </div>
  </div>
</template>

<script setup>
import apiClient from '@/api/axios';
import { onMounted, ref } from 'vue';

const username = ref('');
const email = ref('');
const isEdit = ref(false);
// 设置视图逻辑
const changePassword = () => {
    console.log('changePassword');
    if (oldPassword.value === newPassword.value) {
        alert('新密码不能与旧密码相同');
        return;
    }
    if (newPassword.value !== confirmNewPassword.value) {
        alert('新密码和确认密码不一致');
        return;
    }
    apiClient.post('/auth/change-password', {
        oldPassword: oldPassword.value,
        newPassword: newPassword.value,
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.error('changePassword error:', error);
    });
}
const changeEmail = () => {
    console.log('changeEmail');
    apiClient.post('/auth/change-email', {
        email: email.value,
    }).then(response => {
        console.log(response);
    }).catch(error => {
        console.error('changeEmail error:', error);
    });
}

onMounted(() => {
    apiClient.get('/auth/user').then(response => {
        username.value = response.data.username;
        email.value = response.data.email;
    });
});
</script>

<style scoped>
.settings-view {
  padding: 20px 30px;
}
.settings-view h1 {
  font-size: 20px;
  margin-bottom: 20px;
}
.settings-section {
    margin-bottom: 25px;
}
.card { /* 复用通用卡片样式 */
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0px 1px 3px rgba(0,0,0,0.1);
  padding: 20px;
}
.card h3 {
    font-size: 16px;
    margin-top: 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #E0E0E0;
    padding-bottom: 10px;
}
.form-group {
  margin-bottom: 15px;
  max-width: 400px; /* 限制表单宽度 */
}
.form-group label {
  display: block;
  font-size: 14px;
  color: #5f6368;
  margin-bottom: 5px;
}
.form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #E0E0E0;
  border-radius: 4px;
  font-size: 14px;
}
.form-group input:disabled {
    background-color: #F0F2F5;
    cursor: not-allowed;
}
.card button {
    padding: 8px 15px;
    background-color: #4285F4; /* 主色 */
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
}
.card button:hover {
    background-color: #3367D6;
}
</style>
