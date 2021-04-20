
class Binding {
  constructor() {
    this.value = null
    this.hooks = new Map()
  }

  set(v, skip) {
    this.value = v
    this.hooks.forEach((f, ref) => {
      if (ref != skip) {f(v)}
    })
  }

  get() {
    return this.value
  }

  addHook(f, ref) {this.hooks.set(ref, f)}
  delHook(ref) {this.hooks.delete(ref)}

  bindElement(el, attr, event) {
    const hook = (v) => {
      if (el[attr] != v) {el[attr] = v}
    }
    this.addHook(hook, el)

    if (event) {
      el.addEventListener(event, () => {this.set(el[attr], el)})
    }
  }
}

// Terms:
//  - Binding: A single binding, such as a username. shared between many elements
//  - Binder: A wrapper around many bindings, able to construct from the DOM.
//  - Bound: The internal (name -> getter/setter) object used by Binder
class Binder {
  constructor(element) {
    this.bound = {}
    if (element) {
      this.bind(element)
    }
  }

  // Bind every data-bind="..." inside element in the binder.
  bind(element) {
    element.querySelectorAll("[data-bind]").forEach(el => {
      const [name, attr, event] = el.getAttribute("data-bind").split(':')
      if (!this.bound[name]) {this.bound[name] = new Binding()}

      this.bound[name].bindElement(el, attr, event)
    })
  }

  // Unbind every data-bind="..." inside element in the binder.
  unbind(element) {
    element.querySelectorAll("[data-bind]").forEach(el => {
      const [name] = el.getAttribute("data-bind").split(':')
      if (this.bound[name]) {
        this.bound[name].delHook(el)
      }
    })
  }

  set(name, value) {this.bound[name].set(value)}
  get(name) {return this.bound[name].get()}

  // Populate the binder with a data object
  populate(data) {
    Object.keys(data).forEach(name => {
      if (this.bound[name]) {
        this.bound[name].set(data[name])
      }
    })
  }

  // Return a static copy of the bound data in object form
  copy() {
    const data = {}
    Object.keys(this.bound).forEach(name => {
      data[name] = this.bound[name].get()
    })
    return data
  }
}

