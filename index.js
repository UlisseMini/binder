// A single Binding, like username or bio.
// Can have many things bound (like elements).
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
    this.addHook((v) => el[attr] = v, el)

    if (event) {
      el.addEventListener(event, () => this.set(el[attr], el))
    }
  }
}

// Binder is basically a map of name -> Binding for many bindings, it can
// create itself from the DOM where data-bind="name:attr:event", for example
// <textarea data-bind="bio:value:input"></textarea>
class Binder {
  constructor(element) {
    this.bound = {} // name -> Binding
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

  // Populate the binder with a data object, for example
  // binder.populate({name: "foo", bio: "bar"})
  populate(data) {
    Object.keys(data).forEach(name => {
      if (this.bound[name]) {
        this.bound[name].set(data[name])
      }
    })
  }

  // Return a static copy of the bound data in object form, for example
  // binder.copy() => {name: "foo", bio: "bar"}
  copy() {
    const data = {}
    Object.keys(this.bound).forEach(name => {
      data[name] = this.bound[name].get()
    })
    return data
  }
}

