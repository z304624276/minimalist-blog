import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090'
const pbEmail = import.meta.env.VITE_POCKETBASE_EMAIL || '15344458439@163.com'
const pbPassword = import.meta.env.VITE_POCKETBASE_PASSWORD || 'tan@135676'

export const pb = new PocketBase(pbUrl)

// 检查 PocketBase 是否配置
export const isPocketBaseConfigured = () => {
  return Boolean(pbUrl && pbEmail && pbPassword)
}

// 检查管理员是否已登录
export const isAdminLoggedIn = () => {
  const isValid = pb.authStore.isValid
  const hasToken = !!pb.authStore.token
  const hasModel = !!pb.authStore.model
  const emailMatch = pb.authStore.model?.email === pbEmail

  return isValid && hasToken && hasModel && emailMatch
}

// 从 localStorage 恢复认证状态
export const restoreAuth = () => {
  const token = localStorage.getItem('pb_auth_token')
  const model = localStorage.getItem('pb_auth_model')

  if (token && model) {
    try {
      const modelData = JSON.parse(model)
      pb.authStore.save(token, modelData)
    } catch (error) {
      console.error('❌ 恢复认证状态失败:', error)
      clearAuth()
    }
  }
}

// 清除认证
export const clearAuth = () => {
  localStorage.removeItem('pb_auth_token')
  localStorage.removeItem('pb_auth_model')
  pb.authStore.clear()
}

// 管理员登录
export const adminLogin = async (password = pbPassword) => {
  try {
    const authData = await pb.admins.authWithPassword(pbEmail, password)


    // 保存到 localStorage（使用 record 而不是 admin）
    localStorage.setItem('pb_auth_token', authData.token)
    localStorage.setItem('pb_auth_model', JSON.stringify(authData.record))


    return { success: true, data: authData }
  } catch (error) {
    console.error('❌ 登录失败:', error)
    return { success: false, error }
  }
}

// 管理员登出
export const adminLogout = () => {
  clearAuth()
  return { success: true }
}

// 如果需要则重新认证
export const reauthIfNeeded = async () => {
  if (!pb.authStore.isValid || !pb.authStore.token) {
    console.log('⚠️ 需要重新登录...')
    await adminLogin()
  } else {
    console.log('✅ 已登录，无需重新认证')
  }
}

// ==================== Articles API ====================

export const getArticles = async (options = {}) => {
  try {
    const { limit = 50 } = options
    const records = await pb.collection('articles').getList(1, limit)
    return { data: records.items, error: null }
  } catch (error) {
    console.error('getArticles error:', error)
    return { data: null, error }
  }
}

export const getArticleById = async (id) => {
  try {
    const record = await pb.collection('articles').getOne(id)
    return { data: record, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const createArticle = async (article) => {
  try {
    // 确保已登录
    await reauthIfNeeded()

    const record = await pb.collection('articles').create(article)
    return { data: record, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteArticle = async (id) => {
  try {
    await pb.collection('articles').delete(id)
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const updateArticle = async (id, updates) => {
  try {
    // 确保已登录
    await reauthIfNeeded()

    const record = await pb.collection('articles').update(id, updates)
    return { data: record, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const incrementArticleViews = async (id) => {
  try {
    const article = await pb.collection('articles').getOne(id)
    await pb.collection('articles').update(id, {
      views: (article.views || 0) + 1
    })
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// ==================== Moments API ====================

export const getMoments = async (options = {}) => {
  try {
    const { limit = 50 } = options
    const records = await pb.collection('moments').getList(1, limit)
    return { data: records.items, error: null }
  } catch (error) {
    console.error('getMoments error:', error)
    return { data: null, error }
  }
}

export const createMoment = async (moment) => {
  try {
    // 确保已登录
    await reauthIfNeeded()

    const record = await pb.collection('moments').create(moment)
    return { data: record, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const deleteMoment = async (id) => {
  try {
    await pb.collection('moments').delete(id)
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const likeMoment = async (id) => {
  try {
    const moment = await pb.collection('moments').getOne(id)
    await pb.collection('moments').update(id, {
      likes: (moment.likes || 0) + 1
    })
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

// ==================== Storage API ====================

// Markdown 编辑器图片上传（返回单张图片 URL）
export const uploadMarkdownImage = async (file) => {
  return uploadImage(file, 'blog_images')
}

export const uploadImage = async (file, bucket = 'blog_images') => {
  try {

    // 确保已登录
    await reauthIfNeeded()

    // 使用 FormData 直接上传文件
    const formData = new FormData()
    formData.append('file', file)
    
    
    // 尝试直接使用 fetch API
    console.log('尝试使用 fetch API...')
    const url = `${pb.baseURL}/api/collections/${bucket}/records`
    
    // 不设置 Content-Type，让浏览器自动设置 multipart/form-data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${pb.authStore.token}`
        // 不要手动设置 Content-Type，让浏览器自动处理
      },
      body: formData
    })
    
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error('Fetch API 错误:', errorData)
      throw new Error(`上传失败: ${response.status} ${response.statusText}`)
    }
    
    const record = await response.json()
    const fileUrl = pb.files.getUrl(record, record.file)
    
    console.log('图片上传成功:', fileUrl)
    return { data: { path: record.file, url: fileUrl }, error: null }
  } catch (error) {
    console.error('uploadImage error:', error)
    console.error('错误详情:', error.message)
    if (error.data) {
      console.error('错误数据:', error.data)
    }
    
    return { data: null, error }
  }
}

// ==================== Site Settings API ====================

const SITE_SETTINGS_ID = 'z0lbzjrwqp9og9k'  //这是我自己的用户id，请替换成你自己的

// 添加缓存和请求锁
let siteSettingsCache = null
let siteSettingsPromise = null

export const getSiteSettings = async () => {
  try {
    // 如果有缓存，直接返回
    if (siteSettingsCache) {
      return { data: siteSettingsCache, error: null }
    }

    // 如果有正在进行的请求，等待它完成
    if (siteSettingsPromise) {
      return await siteSettingsPromise
    }

    // 创建新的请求
    siteSettingsPromise = (async () => {
      const record = await pb.collection('site_settings').getOne(SITE_SETTINGS_ID)
      siteSettingsCache = record
      siteSettingsPromise = null
      return { data: record, error: null }
    })()

    return await siteSettingsPromise
  } catch (error) {
    console.error('getSiteSettings error:', error)
    siteSettingsPromise = null
    return { data: null, error }
  }
}

// 清除缓存（在更新设置后调用）
export const clearSiteSettingsCache = () => {
  siteSettingsCache = null
  siteSettingsPromise = null
}

export const updateSiteSettings = async (settings) => {
  try {
    // 确保已登录
    await reauthIfNeeded()

    const record = await pb.collection('site_settings').update(SITE_SETTINGS_ID, settings)

    // 更新成功后清除缓存
    clearSiteSettingsCache()

    return { data: record, error: null }
  } catch (error) {
    console.error('updateSiteSettings error:', error)
    return { data: null, error }
  }
}