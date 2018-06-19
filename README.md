# fictionpress-scraper

A promise based scraper for [Fictionpress](https://www.fictionpress.com) stories.

## Installation

```shell
npm install fictionpress-scraper --save
```

## Usage

```javascript
const fpScraper = require("fictionpress-scraper");

fpScraper
  .getStory(storyID)
  .then(function(story) {
    console.log(story);
  })
  .catch(function(error) {
    console.log(error);
  });
```

The following properties are available on the returned `story` object:

```javascript
{
  "id": Number,
  "title": String,
  "author": {
    "id": Number,
    "name": String
  },
  "summary": String,
  "noOfChapters": Number,
  "content": []
}
```

`story.content` is an array filled with `chapter` objects with the
following structure:

```javascript
{
  "id": Number,
  "title": String,
  "data": String
}
```

### License

The MIT License (MIT)
