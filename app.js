var AppView = require('./view')
var TodosModel = require('./model')
var RenderLoop = require('./lib/render-loop')
var S = require('pull-stream')
var css = require('sheetify')
var Model = require('pull-stream-model')
var router = require('pull-routes')()
var Many = require('pull-many')

css('todomvc-common/base.css')
css('todomvc-app-css/index.css')

var todosModel = Model(TodosModel)

var routes = router([
    ['/:filter?', function (params) {
        if (!params.filter) return todosModel.msg.changeFilter('all')
        return todosModel.msg.changeFilter(params.filter)
    }]
])

var root = document.createElement('div')
document.body.appendChild(root)
var viewStream = RenderLoop(root, AppView)

var source = Many([
    S( routes, S.map(match => match.fn(match.params)) ),
    viewStream.source
])

S(
    source,
    S.through(console.log.bind(console, 'event')),
    todosModel.effects(),
    todosModel.store,
    S.through(console.log.bind(console, 'state')),
    viewStream.sink
)

viewStream.source.push(['fetch', null])
