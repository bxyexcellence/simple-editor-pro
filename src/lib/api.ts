const API_BASE_URL = 'http://localhost:4000';

/**
 * 上传图片文件
 * @param file 要上传的文件
 * @param onProgress 进度回调函数
 * @param abortSignal 取消信号
 * @returns 返回上传后的图片 URL
 */
export const uploadImage = async (
  file: File,
  onProgress?: (event: { progress: number }) => void,
  abortSignal?: AbortSignal
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传进度
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress({ progress });
      }
    });

    // 监听取消信号
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        xhr.abort();
        reject(new Error('Upload cancelled'));
      });
    }

    // 监听完成事件
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          // 返回完整的 URL（包含服务器地址）
          const imageUrl = response.url.startsWith('http')
            ? response.url
            : `${API_BASE_URL}${response.url}`;
          resolve(imageUrl);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    // 监听错误事件
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    // 发送请求
    xhr.open('POST', `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
};

/**
 * 保存草稿内容
 * @param content 要保存的内容（HTML 或 JSON）
 * @returns 返回保存结果
 */
export const saveDraft = async (content: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Save draft error:', error);
    throw error;
  }
};

/**
 * 获取 OEmbed 预览信息
 * @param url 要预览的 URL
 * @returns 返回 OEmbed 信息
 */
export const getOEmbed = async (url: string): Promise<{
  title: string;
  description: string;
  url: string;
  image: string | null;
  provider_name: string;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/oembed?url=${encodeURIComponent(url)}`);

    if (!response.ok) {
      throw new Error(`Failed to get oembed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Get oembed error:', error);
    throw error;
  }
};

/**
 * 搜索用户（用于 @mention）
 * @param query 搜索关键词
 * @returns 返回用户列表
 */
export interface MentionUser {
  id: string;
  label: string;
  username?: string;
  avatar?: string;
  email?: string;
}

/**
 * 获取模拟用户数据（用于开发测试）
 */
function getMockUsers(query: string): MentionUser[] {
  const mockUsers: MentionUser[] = [
    { id: '1', label: '张三', username: 'zhangsan', email: 'zhangsan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhangsan' },
    { id: '2', label: '李四', username: 'lisi', email: 'lisi@example.com' },
    { id: '3', label: '王五', username: 'wangwu', email: 'wangwu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangwu' },
    { id: '4', label: '赵六', username: 'zhaoliu', email: 'zhaoliu@example.com' },
    { id: '5', label: '钱七', username: 'qianqi', email: 'qianqi@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=qianqi' },
    { id: '6', label: '孙八', username: 'sunba', email: 'sunba@example.com' },
    { id: '7', label: '周九', username: 'zhoujiu', email: 'zhoujiu@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=zhoujiu' },
    { id: '8', label: '吴十', username: 'wushi', email: 'wushi@example.com' },
    { id: '9', label: '郑十一', username: 'zhengshiyi', email: 'zhengshiyi@example.com' },
    { id: '10', label: '王十二', username: 'wangshier', email: 'wangshier@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wangshier' },
  ];

  if (!query) {
    return mockUsers;
  }

  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(
    (user) =>
      user.label.toLowerCase().includes(lowerQuery) ||
      user.username?.toLowerCase().includes(lowerQuery) ||
      user.email?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * 搜索用户（用于 @mention）
 * 直接返回模拟数据，不调用接口
 * @param query 搜索关键词
 * @returns 返回用户列表
 */
export const searchUsers = async (query: string): Promise<MentionUser[]> => {
  // 模拟异步延迟，让体验更真实
  await new Promise(resolve => setTimeout(resolve, 100));
  return getMockUsers(query);
};

