"use strict";

import { isMultiChapter, parseChapter } from "./chapter";

// Returns story title
const parseTitle = $ => {
  // First <b> within <div> is almost always title
  const title = $("div#profile_top")
    .children()
    .closest("b")
    .text();

  // Throw error if falsy
  if (!title) {
    throw new Error("Unable to parse story title.");
  }

  return title;
};

// Returns author object (id number & un-slugified name)
const parseAuthor = $ => {
  const author = { id: 0, name: "" };
  // First <a> within <div> is almost always author info
  const authorData = $("div#profile_top")
    .children()
    .closest("a")
    .attr("href")
    .match(/^\/u\/(\d+)\/([\w\d\-]+)$/);

  // Throw error if falsy
  if (!authorData || !authorData[1] || !authorData[2]) {
    throw new Error("Unable to parse author information.");
  }

  author.id = parseInt(authorData[1], 10);
  // Un-slugify the author name
  author.name = authorData[2].replace(/\-/g, " ");

  return author;
};

// Returns story ID
const parseID = $ => {
  // Last child of the div usually contains info (rating, language, genre tags, chapters, words, published, updated, status, id, reviews, favs, follows)
  const storyIDData = $("div#profile_top")
    .children()
    .last()
    .text()
    .match(/id\:\s(\d+)/);
  // Throw error if falsy
  if (!storyIDData || !storyIDData[1]) {
    throw new Error("Unable to parse story ID.");
  }

  return parseInt(storyIDData[1], 10);
};

// Returns story summary
const parseSummary = $ => {
  // <div.xcontrast_txt> with style margin-top:2px. There's only one <div> within the profile section, so this works
  const summary = $("div#profile_top")
    .children("div.xcontrast_txt")
    .html();
  // Throw error if falsy
  if (!summary) {
    throw new Error("Unable to parse story summary.");
  }

  return summary;
};

// Returns number of chapters
const parseNoChapters = $ => {
  // Check if story has multiple chapters
  if (isMultiChapter($)) {
    const chaptersResult = $("div#profile_top")
      .children()
      .last()
      .text()
      .match(/Chapters\:\s(\d+)/);

    // Throw error if falsy
    if (!chaptersResult || !chaptersResult[1]) {
      throw new Error("Unable to parse number of chapters.");
    }
    return parseInt(chaptersResult[1], 10);
  }

  return 1;
};

// Get all story data
const parseStory = $ => {
  // Initialise story object
  const story = {
    id: 0,
    title: "",
    author: { id: 0, name: "" },
    summary: "",
    noOfChapters: 0,
    content: []
  };

  // Scrape page
  story.title = parseTitle($);
  story.id = parseID($);
  story.summary = parseSummary($);
  story.author = parseAuthor($);
  story.noOfChapters = parseNoChapters($);
  story.content.push(parseChapter($));

  return story;
};

export default {
  parseStory
};
