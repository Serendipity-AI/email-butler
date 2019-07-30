# Email Butler

## Install

```
npm install -save email-butler
```

## API

### Suggest

Suggest email if domain closly matches popular email domains. If no suggestion, returns undefined. Otherwise returns { address, domain, full }, where address is everything before @, domain is everything after, and full is the full suggestion. Method accepts an email and an option object, which overrides the default values to compare the email to. The different options are:

- domains: string[], matches email to this list of emails (gmail.com)
- topLevelDomains: string[], matches top level domains to this list of top level domains (com)
- secondLevelDomains: string[], matches domains to this list of domains (gmail)

```javascript
import { suggest } from "email-butler";

const suggestion = suggest("test@gnail.com");
console.log(suggestion.full); // test@gmail.com

const mySuggest = (email: string) => suggest(email, { domains: ["facebook.com"] });
const suggestionOne = mySuggest("test@gnail.com");
console.log(suggestionOne.full); // undefined

const suggestionTwo = mySuggest("test@facbook.com");
console.log(suggestionTwo.full); // facebook.com
```

### Validate

```javascript
import { validate } from "email-butler";

let isValid = validate("test@gnail.com");
console.log(isValid); // true

isValid = validate("test$gnail.com");
console.log(isValid); // false
```
