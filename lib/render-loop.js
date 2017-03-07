var update = require('yo-yo').update
var Pushable = require('pull-pushable')
var S = require('pull-stream')

function RenderLoop (root, View) {
    if (!View) return function (View) {
        return RenderLoop(root, View)
    }

    var pushable = Pushable()
    var tree

    return {
        source: pushable,
        sink: S.drain(function onEvent (state) {
            var newTree = View(state, pushable.push)
            if (!tree) {
                tree = newTree
                return root.appendChild(tree)
            }
            update(tree, newTree)
        }, function onEnd (err) {
            if (err) throw err
        })
    }
}

module.exports = RenderLoop
