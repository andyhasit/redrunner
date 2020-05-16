
export const todoService = {
  todos: [
    {id: 1, text: 'Learn RedRunner'},
    {id: 2, text: 'Build awesome apps'},
    {id: 4, text: 'Buy the author a coffee'},
  ],
  getTodo: function(id) {
    return this.todos.find(i => i.id == id)
  }
}