# fictionpress-scraper

A promise based scraper for [Fictionpress](https://www.fictionpress.com) stories.

## Installation

```
npm install fictionpress-scraper --save
```

## Usage

```javascript
var fpScraper = require('fictionpress-scraper');
```

### fpScraper.getStory(storyId)

Fetches information, along with all chapters of the story.

```javascript
fpScraper.getStory(storyID).then(function(story){
  console.log(story);
}).catch(function(error){
  console.log(error);
});
```

The following properties are available on the returned ```story``` object:

```
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

```story.content``` is an array filled with ```chapter``` objects with the
following structure:

```

{
  "id": Number,
  "title": String,
  "data": String
}

```

### License

The MIT License (MIT)
