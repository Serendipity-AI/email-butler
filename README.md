# Email Butler

## Install

```
npm install -save email-butler
```

## API

### Suggest

Suggest email if domain closly matches popular email domains. If no suggestion, returns undefined. Otherwise returns { address, domain, full }, where address is everything before @, domain is everything after, and full is the full suggestion.

```javascript
import { suggest } from "email-butler";

const suggestion = suggest("test@gnail.com");
console.log(suggestion.full); // test@gmail.com
```

### Validate

```javascript
import { validate } from "email-butler";

let isValid = validate("test@gnail.com");
console.log(isValid); // true

isValid = validate("test$gnail.com");
console.log(isValid); // false
```
