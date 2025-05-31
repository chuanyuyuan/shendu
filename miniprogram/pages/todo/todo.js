Page({
    data: {
      todos: [],
      newTodo: '',
      activeTab: 'all', // all, active, completed
      filteredTodos: [], // 添加过滤后的待办事项列表
      showTaskDetail: false, // 是否显示任务详情
      currentTask: null, // 当前查看的任务
    },
  
    onLoad() {
      this.loadTodos()
    },
  
    onShow() {
      this.loadTodos()
    },
  
    loadTodos() {
      const app = getApp()
      this.setData({
        todos: app.globalData.todos
      }, () => {
        // 在设置完 todos 后更新 filteredTodos
        this.updateFilteredTodos()
      })
    },
  
    // 输入新待办事项
    onInput(e) {
      this.setData({
        newTodo: e.detail.value
      })
    },
  
    // 添加新待办事项
    addTodo() {
      if (!this.data.newTodo.trim()) return
      
      const app = getApp()
      const todo = {
        id: Date.now(),
        content: this.data.newTodo,
        completed: false
      }
      
      app.globalData.todos.unshift(todo)
      wx.setStorageSync('todos', app.globalData.todos)
      
      this.setData({
        todos: app.globalData.todos,
        newTodo: ''
      }, () => {
        this.updateFilteredTodos()
      })
    },
  
    // 切换任务完成状态
    toggleTaskCompletion(e) {
      const { id } = e.currentTarget.dataset
      const app = getApp()
      const todos = app.globalData.todos.map(todo => {
        if (todo.id === id) {
          return { ...todo, completed: !todo.completed }
        }
        return todo
      })
      
      app.globalData.todos = todos
      wx.setStorageSync('todos', todos)
      this.setData({ todos }, () => {
        // 切换待办事项状态后更新 filteredTodos
        this.updateFilteredTodos()
      })
    },
  
    // 删除待办事项
    deleteTodo(e) {
      const { id } = e.currentTarget.dataset
      const app = getApp()
      const todos = app.globalData.todos.filter(todo => todo.id !== id)
      
      app.globalData.todos = todos
      wx.setStorageSync('todos', todos)
      this.setData({ todos }, () => {
        // 删除待办事项后更新 filteredTodos
        this.updateFilteredTodos()
      })
    },

    // 切换标签页
    switchTab(e) {
        const { tab } = e.currentTarget.dataset
        this.setData({ activeTab: tab }, () => {
          // 切换标签页后更新 filteredTodos
          this.updateFilteredTodos()
        })
    },

    // 更新过滤后的待办事项列表
    updateFilteredTodos() {
      const filteredTodos = this.getFilteredTodos()
      this.setData({ filteredTodos })
    },

    // 获取过滤后的待办事项列表
    getFilteredTodos() {
      const { todos, activeTab } = this.data
      switch (activeTab) {
        case 'active':
          return todos.filter(todo => !todo.completed)
        case 'completed':
          return todos.filter(todo => todo.completed)
        default:
          return todos
      }
    },

    // 查看任务详情
    viewTaskDetail(e) {
      const { id } = e.currentTarget.dataset
      const task = this.data.todos.find(todo => todo.id === id)
      this.setData({
        showTaskDetail: true,
        currentTask: { ...task } // 创建副本，避免直接修改
      })
    },

    // 关闭任务详情
    closeTaskDetail() {
      this.setData({
        showTaskDetail: false,
        currentTask: null
      })
    },

    // 监听任务内容输入
    onTaskContentInput(e) {
      this.setData({
        'currentTask.content': e.detail.value
      })
    },

    // 保存任务详情
    saveTaskDetail() {
      const { currentTask } = this.data
      if (!currentTask.content.trim()) {
        wx.showToast({
          title: '任务内容不能为空',
          icon: 'none'
        })
        return
      }

      const app = getApp()
      const todos = app.globalData.todos.map(todo => {
        if (todo.id === currentTask.id) {
          return { ...todo, content: currentTask.content }
        }
        return todo
      })

      app.globalData.todos = todos
      wx.setStorageSync('todos', todos)
      
      this.setData({
        todos,
        showTaskDetail: false,
        currentTask: null
      }, () => {
        this.updateFilteredTodos()
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
      })
    },

    // 阻止事件冒泡
    stopPropagation(e) {
      // 阻止点击弹窗内容时触发关闭
    },
  })