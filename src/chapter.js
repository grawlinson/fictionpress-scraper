"use strict";

// Returns chapter object (chapter id, title & data)
const parseChapter = $ => {
  // Initialise chapter object
  const chapter = { id: 0, title: "", data: "" };

  // Check if story has multiple chapters
  if (isMultiChapter($)) {
    // closest() - There are 2 chapter selectors in the page. Fetch the first, otherwise both chapter selectors are processed.
    const chapterInfo = $("select#chap_select")
      .first()
      .children()
      .closest("option:selected")
      .text()
      .match(/(\d+)\.\s(.+)/);
    // Throw error if falsy
    if (!chapterInfo || !chapterInfo[1] || !chapterInfo[2]) {
      throw new Error("Unable to parse chapter information.");
    }
    chapter.id = parseInt(chapterInfo[1], 10);
    chapter.title = chapterInfo[2];
  } else {
    // Assign generic chapter no. & title
    chapter.id = 1;
    chapter.title = "Chapter 1";
  }

  // Get chapter text
  chapter.data = parseChapterText($);

  return chapter;
};

// Returns chapter text
const parseChapterText = $ => {
  // Get chapter text
  const text = $("div#storytext.storytext.xcontrast_txt.nocopy").html();
  // Throw error if falsy
  if (!text) {
    throw new Error("Unable to parse chapter information.");
  }
  return text;
};

// Check if story has multiple chapters
const isMultiChapter = $ => {
  // If Chapters does not exist in the div#profile_top section, we can assume it is a single chapter story
  if (
    $("div#profile_top")
      .children()
      .last()
      .text()
      .indexOf("Chapters") != -1
  ) {
    return true;
  } else {
    return false;
  }
};

export default {
  parseChapter,
  isMultiChapter
};
