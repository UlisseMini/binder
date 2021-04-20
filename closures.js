// "Objects are a poor man's closure"
// - http://wiki.c2.com/?ClosuresAndObjectsAreEquivalent
// NOTE: Map with refs allows bindElement to pass an element, which allows
//   us to remove bindings without a reference to the closure.
function bind() {
  let value = null
  const hooks = new Map()

  return {
    set: (v, skip) => {
      value = v
      hooks.forEach((f, ref) => {
        if (ref != skip) {f(v)}
      })
    },
    get: () => value,

    addHook: (f, ref) => hooks.set(ref, f),
    delHook: (ref) => hooks.delete(ref)
  }
}

function bindElement(binding, el, attr, event) {
  const hook = (v) => {
    if (el[attr] != v) {el[attr] = v}
  }
  binding.addHook(hook, el)

  if (event) {
    el.addEventListener(event, () => {binding.set(el[attr], el)})
  }

  return binding
}

function bindAll(element, bound) {
  bound = bound || {}

  element.querySelectorAll("[data-bind]").forEach(el => {
    const [name, attr, event] = el.getAttribute("data-bind").split(':')
    if (!bound[name]) {bound[name] = bind()}

    bindElement(bound[name], el, attr, event)
  })

  // Return a static copy of the data in object form
  // TODO: use function prototypes
  bound.data = () => {
    const data = {}
    Object.keys(bound).forEach(name => {
      // check to avoid calling bound.data.get()
      if (bound[name].get) {
        data[name] = bound[name].get()
      }
    })
    return data
  }

  return bound
}

function unbindAll(element, bound) {
  element.querySelectorAll("[data-bind]").forEach(el => {
    const [name] = el.getAttribute("data-bind").split(':')
    if (bound[name]) {
      bound[name].delHook(el)
    }
  })
}

// Populate bound with data
// TODO: Make prototype method on bound.
function populateBound(bound, data) {
  Object.keys(data).forEach(name => {
    if (bound[name]) {
      bound[name].set(data[name])
    }
  })
}
