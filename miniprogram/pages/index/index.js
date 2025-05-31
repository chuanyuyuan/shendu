Page({
    data: {
      activeCount: 0,
      completedCount: 0
    },
  
    onShow() {
      this.updateCounts()
    },
  
    updateCounts() {
      const app = getApp()
      const todos = app.globalData.todos
      
      this.setData({
        activeCount: todos.filter(todo => !todo.completed).length,
        completedCount: todos.filter(todo => todo.completed).length
      })
    },
  
    navigateToTodo() {
      wx.navigateTo({
        url: '/pages/todo/todo'
      })
    }
  })