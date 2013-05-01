```javascript
window.bad = function(){ return _undefined; };
```

```javascript 
bad();
```

```javascript
try { bad(); } catch (e) { log(e.message); }
log('here');
```