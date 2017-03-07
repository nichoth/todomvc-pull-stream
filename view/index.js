var html  = require('bel')
var Event = require('pull-stream-model/message')
var xtend = require('xtend')
var ENTER = 13

function TodoView (state) {
    var cls = state.completed ? 'completed' : 'active'
    cls += state.isEditing ? ' editing' : ''

    function handleBlur (ev) {
        console.log('brabrba', state)
        if (state.isEditing === null) return
        state.onSave(ev.target.value)
    }

    return html`
          <li class="${cls}">
            <div class="view">
              <input class="toggle" type="checkbox"
                  checked=${state.completed}
                  onchange=${state.onToggle}
              />
              <label ondblclick=${state.onEdit}>
                  ${state.title}
              </label>
              <button class="destroy"
                  onclick=${state.onDelete}
              >
              </button>
            </div>
            <input class="edit" value="${state.title}"
                onblur=${handleBlur}>
          </li>
    `
}

var events = [
    'addTodo',
    'toggleComplete',
    'beginEdit',
    'saveEdit',
    'deleteTodo',
    'clearCompleted'
].reduce(function (acc, type) {
    acc[type] = Event(type)
    return acc
}, {})

function AppView (state, push) {
    function handleAdd (ev) {
        if (!(ev.keyCode === ENTER)) return
        if (!ev.target.value) return
        var val = ev.target.value
        ev.target.value = ''
        push(events.addTodo(val))
    }

    var todos = state.todos
        .filter(function (todo) {
            if (state.filter === 'active') return !todo.completed
            if (state.filter === 'completed') return todo.completed
            return true
        })
        .map(function (todo, i) {
            return TodoView(xtend(todo, {
                isEditing: state.editing === i,
                onToggle: function (ev) {
                    push(events.toggleComplete(i))
                },
                onEdit: function (ev) {
                    push(events.beginEdit(i))
                },
                onSave: function (ev) {
                    push(events.saveEdit({ index: i, title: ev }))
                },
                onDelete: function (ev) {
                    push(events.deleteTodo(i))
                }
            }))
        })

    var active = state.todos.filter(todo => !todo.completed)

    function main () {
        return [html`<section class="main">
            <input class="toggle-all" type="checkbox">
            <label for="toggle-all">Mark all as complete</label>

            <ul class="todo-list">
                ${todos}
            </ul>
          </section>`,

            (state.todos.length ?
                 html`<footer class="footer">
                <span class="todo-count">
                    <strong>${active.length}</strong> ${active.length === 1 ? 'item' : 'items'} left
                </span>

                <ul class="filters">
                  <li>
                    <a class="${state.filter == 'all' ? 'selected' : ''}" href="/">All</a>
                  </li>
                  <li>
                    <a class="${state.filter == 'active' ? 'selected' : ''}" href="/active">Active</a>
                  </li>
                  <li>
                    <a class="${state.filter == 'completed' ? 'selected' : ''}" href="/completed">Completed</a>
                  </li>
                </ul>

                <button class="clear-completed"
                    onclick=${handleClear}
                >
                    Clear completed
                </button>
              </footer> ` :
              null)
        ]
    }

    function handleClear (ev) {
        push(events.clearCompleted())
    }

    return html`<section class="todoapp">
      <header class="header">
        <h1>todos</h1>
        <input id="create-todo" class="new-todo"
            placeholder="What needs to be done?"
            onkeydown=${handleAdd}
            autofocus>
      </header>

      ${state.todos.length ?
          main() :
          null
      }
    </section>
    `
}

AppView.manifest = events
module.exports = AppView

