function $(x) {return document.querySelectorAll(x)}
function $0(x) {return document.querySelector(x)}

// TODO: This should be a standard function in binder, a way to
// get elements bound to a guy.
function $b(name) {
  const results = []
  for (let el of $(`[data-bind]`)) {
    const [_name, attr, _event] = el.getAttribute("data-bind").split(":")
    if (name == _name) {results.push(el[attr])}
  }
  return results
}
function $b0(name) {return $b(name)}

function _eq(a, b) {
  if (typeof a == 'object' && typeof b == 'object') {
    return JSON.stringify(a) == JSON.stringify(b)
  } else {
    return a === b
  }
}

function eq(a, b) {
  return {result: _eq(a, b), left: a, right: b, op: '==='}
}

function eqa(as, b) {
  return as.map(a => eq(a, b))
}


function _assertAll(as) {
  return as.map(_assert).filter(x => typeof x == 'string').join("\n")
}

function assertAll(as) {
  const s = _assertAll(as)
  if (typeof s == 'string' && s != "") {throw s}
}

function _assert(a) {
  if (Array.isArray(a)) {
    return assertAll(a)
  }

  if (!a.result) {
    return `${JSON.stringify(a.left)} ${a.op} ${JSON.stringify(a.right)}`
  }
}
function assert(a, b) {
  if (b) alert("I think you mean to use eq or eqa")
  const s = _assert(a)
  if (typeof s == 'string') {throw s}
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const tests = [
  {
    name: 'Bio object change',
    test: async (binder) => {
      const bio = "I like milk"
      binder.set("bio", bio)
      assert(eqa($b("bio"), bio))
    }
  },
  {
    name: "Username change",
    test: async (binder) => {
      const username = "milklover123"
      binder.set("username", username)
      assert(eqa($b("username"), username))
    }
  },

  {
    name: "Bio input",
    test: async (binder) => {
      const el = $("textarea")[0]
      el.value = "I like bunnies"
      el.dispatchEvent(new Event("input"))

      assert(eqa($b("bio"), el.value))
      assert(eq(binder.get("bio"), el.value))
    },
  },
  {
    name: "Populate and Copy",
    test: async (binder) => {
      const obj = {username: "foo", bio: "bar"}
      binder.populate(obj)

      assert(eqa($b("bio"), "bar"))
      assert(eqa($b("username"), "foo"))
      assert(eq(binder.copy(), obj))
    },
  },
]

// document.body.innerHTML = `< pre style = "color: red; font-size: 16px;" > ${msg}</pre > `
async function test() {
  const app = document.getElementById("app")
  const binder = new Binder(app)
  binder.populate({
    username: "catlover123",
    bio: "I like cats"
  })


  const p = (className, text) => {
    const el = document.createElement('p')
    el.className = className
    el.innerText = text
    return el
  }

  for (let {name, test} of tests) {
    try {
      await test(binder)
      document.body.appendChild(p("msg green", `PASS - ${name}`))
    } catch (e) {
      document.body.appendChild(p("msg red", `FAIL - ${name}\n${e}`))
    }
  }
}

document.addEventListener("DOMContentLoaded", () => test())
