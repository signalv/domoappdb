# @signalv/domoappdb

`@signalv/domoappdb` is a library that provides convenient usage of the AppDb API for Domo Custom Apps, especially ones that sync collections to the Domo Datacenter.
It has a simple wrapper around the AppDb API via the [AppDb](./src/appDb.ts) class

## Getting Started

```bash
npm install @signalv/domoappdb
```

## Examples

### Getting records from an AppDb collection

```typescript
const allDocsInCollection = await AppDb.FetchAll<SomeTypeForContentProp>("collectionToQuery");

const docId = "Some Existing Doc Id"
const specificExistingDoc = await AppDb.FetchDoc("collectionToQuery", docId);

/* 
by default any Date properties will be 
deserialized from JSON as a string instead of a Date object.

if you pass `true` as the optional last param to the functions
that return values, it will check to see if JSON string values
are ISO 8601 date strings and if they are deserialize them as 
Date obects. This makes the `createdOn` and `updatedOn` doc 
properties Date objects instead of strings in addition to any 
properies in the `content` that are ISO 8601 date strings.

*/
const docWithDatesAsStrings = await AppDb.FetchDoc("collectionToQuery", docId)
const docWithDatesAsDateObj = await AppDb.FetchDoc("collectionToQuery", docId, true)
```

### Creating new records

```typescript
const exampleData = {
    content: {
        someText: 'a',
        someNumber: 1,
        someDate: new Date(),
    }
}
// newlyCreatedDoc will be type AppDbDoc<T> where T is the type of the content property
// i.e. it'll come back with populated `id`, `owner`, `createdOn`, etc.
const newlyCreatedDoc = await AppDb.Create("collectionName", exampleData);
// the `someDate` field, plus the metadata date fields will come back as strings unless
// you set the optional last param to `true`
const newDoc2 = await AppDb.Create("collectionName", exampleData, true);

```

### Updating existing records

```typescript
const exampleContent = {
    someText: 'a',
    someNumber: 1,
    someDate: new Date(),
}
await AppDb.Update("collectionName", exampleContent); // ts won't compile and will give an error because ex doesn't have an id or content property.

// make a change and update a record created in the `Creating new records` example
newlyCreatedDoc.someText = "An example of updating an existing record"
await AppDb.Update("collectionName", newlyCreatedDoc)
```

### Deleting records

```typescript
// Delete one of the records created in the `Creating new records` example
await AppDb.Delete("collectionName", newDoc2.id)
```

### Query records

The Query API works with valid mongodb queries. Here's a few examples:

A simple query searching for documents with a description value of "an example"

```typescript
const query = { "content.description": { $eq: "an example"}}
const recordsMatchingQuery = await AppDb.Query("exampleCollectionName", query)
```

A more complex query example that has multiple conditions

```typescript
// A query that gets all records that:
// have an authorName "Sam" and do not have a description (either description is missing from the document, or the description is null)
// OR
// have an authorName "Sam", a description "very specific" and a category "A"
const query = {
    $or: [
        {
            $and: [
                { "content.authorName": { $eq: "Sam" }},
                { "content.description": { $exists: false }}
            ],
        },
        {
            $and: [
                { "content.authorName": { $eq: "Sam" }},
                { "content.description": { $eq: "very specific" }},
                { "content.category": { $eq: "A" }}
            ]
        }
    ]
}

const recordsThatMatchQuery = await AppDb.Query("exampleCollectionName", query)

```

A query that returns all docs that have a color prop that's in a list.

 ```typescript
 const colorsToInclude = ["red", "green", "blue"]
 // A query that will return any records with `content.color` values of "red" or "green" or "blue"
 const query = {
     "content.color": { $in: colorsToInclude}
 }
 ```

## License

Licensed under either of

- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE) or http://apache.org/licenses/LICENSE-2.0)
- MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

## Contribution

look at some of these issues:

- [Issues labeled "good first issue"](https://github.com/signalv/domoappdb/labels/good%20first%20issue)
- [Issues labeled "help wanted"](https://github.com/signalv/domoappdb/labels/help%20wanted)

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall
be dual licensed as above, without any additional terms or conditions.
