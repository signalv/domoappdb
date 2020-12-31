# @signalv/domoappdb
`@signalv/domoappdb` is a library that provides convenient usage of the AppDb API for Domo Custom Apps, especially ones that sync collections to the Domo Datacenter.
It has both a simple wrapper around the AppDb API via the [AppDb](./src/appDb.ts) class, and a more opinionated one built off it, [SvDomoAppDb](./src/svDomoAppDb.ts).

## Getting Started

```bash
npm install @signalv/domoappdb
```

## Examples
### Setup
```typescript
export interface ExampleContent {
    // explicitly declaring a domoAppDbDocId property is optional.
    // when using SvDomoAppDb values returned will be type 
    // `{ domoAppDbDocId: string } & T`
    /* domoAppDbDocId?: string; */
    textField: string;
    numberField: number;
    dateField: string | Date; // See Getting records example.
}

const exampleData = {
    textField: "An example data record to save to Domo AppDb",
    numberField: 1,
    dateField: new Date(),
}

// create a new object to interact with a collection named "domoappdbExample"
// that has documents with `content` of type `ExampleDocContent`
const db = new SvDomoAppDb<ExampleDocContent>("domoappdbExample");
```
### Getting records from an AppDb collection
```typescript
const allDocsInCollection = await db.FetchAll();

const docId = "Some Existing Doc Id"
const specificExistingDoc = await db.FetchDoc(docId);

/* 
by default specificExistingDoc.dateField will try to be 
deserialized from JSON as a Date object. It will check to
see if JSON string values are ISO 8601 date strings and if
they are deserialize them as Date obects.
To deserialize as strings set the `ParseDateStringsIntoDate` property on
a SvDomoAppDb instance to false.
*/
db.ParseDateStringsIntoDate = false;
const docWithDatesAsStrings = await db.FetchDoc(docId)
```
### Creating new records
```typescript
// newlyCreatedDoc will be type `{ domoAppDbDocId: string; } & ExampleContent`
// i.e. ExampleContent + a domoAppDbDocId property set to the value from the newly
// created record.
const newlyCreatedDoc = await db.Create(exampleData);
const newDoc2 = await db.Create(exampleData);
```

### Updating existing records
```typescript
await db.Update(exampleData); // ts won't compile and will give an error because ex doesn't have a domoAppDbDocId property.

// make a change and update a record created in the `Creating new records` example
newlyCreatedDoc.textField = "An example of updating an existing record"
await db.Update(newlyCreatedDoc)
```

### Deleting records
```typescript
// Delete one of the records created in the `Creating new records` example
await db.Delete(newDoc2)
```
## Why are two different API wrappers provided in this library?
The [AppDb](./src/appDb.ts) class was created as a very minimal wrapper around the AppDb API, it provides easy usage without deciding too many things for you. The [SvDomoAppDb](./src/svDomoAppDb.ts) class uses the AppDb class internally and has a very similar API. It was built based off of Signal Ventures' experience building Domo apps using the Domo AppDb API and thus is tailored towards Signal Ventures' use case.

## Which one should I use?
For most people the `SvDomoAppDb` class is going to work and be most convenient, so Signalv suggests you start with that and only use the `AppDb` class directly if you want the full AppDb doc info returned (`IAppDbDoc<T>`) instead of just the `content` (`T`) of the document(s) returned. See [here](#whats-the-difference-between-the-SvDomoAppDb-and-AppDb-classes) for a more detailed look into the differences.

## What's the difference between the `SvDomoAppDb` and `AppDb` classes?
There's two main ones:
1) No `collectionName` parameter (set in the class constructor upon instantiation instead of via a parameter on every API call)
1) Return types are unwrapped so only the `content` portion of the AppDb document(s) are returned.

 The AppDb class consists of static functions which comes at the cost of needing to specify things like `collectionName` on every call. While flexible, it has the pitfalls of things that are "stringly typed", i.e. typos leading to bugs, changes to the strings in some places but not all, etc. While there are several strategies to alleviate this, such as creating constants/a constant file à la React Redux, Signalv's approach was to create a stateful version of AppDb that takes `collectionName` as a constructor parameter. This has the advantage of not needing to specify `collectionName` with every call since the majority of calls to the API in the same scope are going to be focused on a single collection anyway. For smaller projects, or projects creating singleton clients per collection this alleviates the need for creating a constants file. For larger projects a constants file can still be used and have the additional benefit of less parameters needed per call to any of the AppDb APIs.

 The second major difference is `AppDb` returns the full AppDb document record(s), where as the default for `SvDomoAppDb` is to unwrap the document and return just the `content` portion of type `{ domoAppDbDocId: string; } & T` (i.e. `T` with `domoAppDbDocId` added). This is the main reason both classes are exposed in the API of this library. While Signalv likes to get the records back unwrapped (99% of all our usage is accessing the `content` property of the Domo AppDb document so getting it unwrapped simplifies access and makes it more consitent with how the apps create new records), it's definitely not the way everyone would prefer it.

 i.e.
 ```typescript
const db = new SvDomoAppDb<ExampleDocContent>("domoappdbExample");
const docId = "Some Existing Doc Id Here"

const svDoc = await db.FetchDoc(docId);
const doc = await AppDb.FetchDoc("domoappdbExample", docId);
/*
svDoc.domoAppDbDocId == doc.id // => true
doc.content.textField == svDoc.textField // => true
doc.content.numberField == svDoc.numberField // => true
doc.content.dateField == svDoc.dateField // => true
*/
 ```
## License
Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

## Contribution
look at some of these issues:

- [Issues labeled "good first issue"][good-first-issue]
- [Issues labeled "help wanted"][help-wanted]

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
