Page({
    data: {
      activeCount: 0,
      completedCount: 0
    },
  
    onShow() {
      this.updateCounts()
    },
  
    updateCounts() {
      const todosData = wx.getStorageSync('todos') || [];
      const todos = todosData.map(todo => ({
        ...todo,
        subtasks: todo.subtasks || []
      }));
      
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