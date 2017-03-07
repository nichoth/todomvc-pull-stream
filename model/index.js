var xtend = require('xtend')
var localStorage = window.localStorage

function TodosModel () {
    return {
        todos: [],
        filter: 'all',
        hasFetched: false,
        editing: null
    }
}

function Todo (title, id) {
    return {
        completed: false,
        title: title
    }
}

TodosModel.effects = {
    fetch: function (state, msg, ev) {
        if (state.hasFetched) return false
        var storedState = localStorage.getItem('todos-pull-stream')
        return msg.fetch(storedState ? JSON.parse(storedState) : [])
    },

    changeFilter: function (state, msg, ev) {
        return state.filter === ev ?
            false :
            msg.changeFilter(ev)
    },

    addTodo: function (state, msg, ev) {
        var list = [Todo(ev)].concat(state.todos)
        localStorage.setItem('todos-pull-stream', JSON.stringify(list))
        return msg.addTodo(ev)
    },

    saveEdit: function (state, msg, ev) {
        var todo = xtend(state.todos[ev.index], { title: ev.title })
        var todos = state.todos.slice()
        todos[ev.index] = todo
        localStorage.setItem('todos-pull-stream', JSON.stringify(todos))
        return msg.stopEditing(todos)
    },

    deleteTodo: function (state, msg, ev) {
        var list = state.todos.slice()
        list.splice(ev, 1)
        localStorage.setItem('todos-pull-stream', JSON.stringify(list))
        return msg.resetList(list)
    },

    clearCompleted: function (state, msg, ev) {
        var list = state.todos.filter(function (todo) {
            return !todo.completed
        })
        localStorage.setItem('todos-pull-stream', JSON.stringify(list))
        return msg.resetList(list)
    }
}

TodosModel.update = {
    fetch: function (state, ev) {
        return xtend(state, { todos: ev, hasFetched: true })
    },

    resetList: function (state, ev) {
        return xtend(state, { todos: ev })
    },

    changeFilter: function (state, ev) {
        return xtend(state, { filter: ev })
    },

    addTodo: function (state, ev) {
        var list = [Todo(ev)].concat(state.todos)
        return xtend(state, { todos: list })
    },

    toggleComplete: function (state, ev) {
        var todo = state.todos[ev]
        var newTodo = xtend(todo, { completed: !todo.completed })
        var newList = state.todos.slice()
        newList[ev] = newTodo
        return xtend(state, {
            todos: state.todos = newList
        })
    },

    beginEdit: function (state, ev) {
        return xtend(state, { editing: ev })
    },

    stopEditing: function (state, ev) {
        return xtend(state, { todos: ev, editing: null })
    }
}

module.exports = TodosModel
