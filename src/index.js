"use strict";

// Dependencies
import cheerio from "cheerio";
import request from "request-promise-native";
import pMap from "p-map";
import { parseChapter } from "./chapter";
import { parseStory } from "./story";

// Constants
const BASE_URL = "https://www.fictionpress.com";
const CONCURRENCY = 10; // Maximum number of requests at any given time.

// Functions
// Generates story URL from given ID
const generateStoryURL = id => `${BASE_URL}/s/${id}`;

// Assumes first chapter has already been fetched. Returns array of chapter URLs
const generateChapterURLs = story => {
  const chapterURLs = [];
  for (let i = 2; i <= story.noOfChapters; i++) {
    chapterURLs.push(`${generateStoryURL(story.id)}/${i}/`);
  }
  return chapterURLs;
};

const commonRequest = async url =>
  request({
    uri: url,
    resolveWithFullResponse: true,
    transform: (body, response, resolveWithFullResponse) => {
      if (response.statusCode !== 200) {
        throw new Error(`Fictionpress returned a ${response.statusCode}`);
      }
      const $ = cheerio.load(body);
      if (
        /Story Not FoundUnable to locate story./.test(
          $("span.gui_warning").text()
        )
      ) {
        throw new Error("Fictionpress returned a 404");
      }
      return $;
    }
  });

// Initial request. Gets all information & first chapter
const getInfo = async id => {
  const $ = await commonRequest(generateStoryURL(id));

  return parseStory($);
};

// Catch-all. Gets all information & all chapters
const getStory = async id => {
  const story = await getInfo(id);
  if (story.noOfChapters > 1) {
    // get the remaining chapters
    const remainingChapters = await pMap(
      generateChapterURLs(story),
      getChapter,
      { concurrency: CONCURRENCY }
    );

    story.content.push.apply(story.content, remainingChapters);
  }
  return story;
};

// Get a single chapter
const getChapter = async url => {
  const $ = await commonRequest(url);

  return parseChapter($);
};

export default { getInfo, getStory };
