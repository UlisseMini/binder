# binder

Data binding with data attributes

## Example

```html
<div id="app">
  <p data-bind="username:innerText"></p>
  <textarea data-bind="bio:value:input"></textarea>
  <p data-bind="bio:innerText">
</div>
```

```javascript
const app = document.getElementById("app")

const binder = new Binder(app)
binder.populate({
  username: "catlover123",
  bio: "I like cats",
})
```
Everything is in sync, changes to the `textarea` by the user will populate to the `<p>` and be recorded in the object.

```javascript
binder.set("bio", "I like mice too")
binder.set("username", "mouselover456")
```
Everything is populated to the elements.

## TODO

- [ ] Don't auto populate, have a `sync()` method. (do this and it be used with a db and api!)
- [ ] Support async/await in `sync()`. make everything async? I don't see a big downside.
- [ ] Support nested data
- [ ] Support arrays
- [x] ~~Add tests~~ too much work, puppeteer is a pain for this usecase.
