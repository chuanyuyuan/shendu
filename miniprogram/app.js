App({
    globalData: {
      userInfo: null,
      todos: []
    },
    onLaunch() {
      // 获取本地存储的待办事项
      const todos = wx.getStorageSync('todos') || []
      this.globalData.todos = todos
    }
  })