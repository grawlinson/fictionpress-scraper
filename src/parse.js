'use strict';
/*jslint node: true */

// Dependencies.
var cheerio  = require('cheerio'); // Parse HTML pages.

// Functions
// Returns story title.
function parseTitle($){
	// First <b> within <div> is almost always title.
	var title = $('div#profile_top').children().closest('b').text();
	
	// Throw error if falsy.
	if(!title){
		throw new Error('Unable to parse story title.');
	}else{
		return title;
	}
}

// Returns author object (id number & un-slugified name).
function parseAuthor($){
	var author = { id : '', name : ''};
	// First <a> within <div> is almost always author info.
	var authorData = $('div#profile_top').children().closest('a').attr('href').match(/^\/u\/(\d+)\/([\w\d\-]+)$/);

	// Throw error if falsy. Needs a bit of work.
	if(!authorData || !authorData[1] || !authorData[2]){
		throw new Error('Unable to parse author information.');
	}else{
		author.id = authorData[1];
		author.name = authorData[2].replace(/\-/g, ' '); // Un-slugify the author name. Replaces all dashes with spaces.

		return author;
	}
}

// Returns story ID. Completely unnecessary.
function parseID($){
	// Last child of the div usually contains info (rating, language, genre tags, chapters, words, published, updated, status, id, reviews, favs, follows)
	var storyIDData = $('div#profile_top').children().last().text().match(/id\:\s(\d+)/);
	// Throw error if falsy.
	if(!storyIDData || !storyIDData[1]){
		throw new Error('Unable to parse story ID.');
	}else{
		return storyIDData[1];
	}
}

// Returns story summary.
function parseSummary($){
	// <div.xcontrast_txt> with style margin-top:2px. There's only one <div> within the profile section, so this works.
	var summary = $('div#profile_top').children('div.xcontrast_txt').html();
	// Throw error if falsy.
	if(!summary){
		throw new Error('Unable to parse story summary.');
	}else{
		return summary;
	}
}

// Returns chapter object (chapter id, title & data).
function parseChapter(body){
	var $ = cheerio.load(body);
	// Initialise chapter object.
	var chapter = {
		id: '',
		title: '',
		data: ''
	};

	// Check if story has multiple chapters
	if(isMultiChapter($)){
		// Get chapter no. & title.

		// closest() - There are 2 chapter selectors in the page. Fetch the first, otherwise both chapter selectors are processed.
		var chapterInfo = $('select#chap_select').children().closest('option:selected').text().match(/(\d+)\.\s(.+)/);
		// Throw error if falsy. Needs work.
		if(!chapterInfo || !chapterInfo[1] || !chapterInfo[2]){
			throw new Error('Unable to parse chapter information.');
		}
		// [TODO] : Clean this function up. It's a bit convoluted.
		chapter.id = chapterInfo[1];
		chapter.title = chapterInfo[2];
	}
	else{
		// Assign generic chapter no. & title.
		chapter.id = 1;
		chapter.title = 'Chapter 1';
	}

	// Get chapter text.
	chapter.data = parseChapterText($);

	return chapter;
}

// Returns chapter text.
function parseChapterText($){
	// Get chapter text.
	var text = $('div#storytext.storytext.xcontrast_txt.nocopy').html();
	// Throw error if falsy.
	if(!text){
		throw new Error('Unable to parse chapter information.');
	}
	return text;
}

// Returns number of chapters.
function parseNoChapters($){
	// Check if story has multiple chapters
	if(isMultiChapter($)){
		var chaptersResult = $('div#profile_top').children().last().text().match(/Chapters\:\s(\d+)/);
		// Throw error if falsy.
		if(!chaptersResult || !chaptersResult[1]){
			throw new Error('Unable to parse number of chapters.');
		}
		return chaptersResult[1];
	} else {
		return 1;
	}
}

// Check if the returned story is a 404.
// Rename to storyExists?
function is404($){
	return /Story Not FoundUnable to locate story. Code 1./.test($('span.gui_warning').text());
}

// Check if story has multiple chapters.
function isMultiChapter($){
	// If Chapters does not exist in the div#profile_top section, we can assume it is a single chapter story.
	if($('div#profile_top').children().last().text().indexOf('Chapters') != -1){
		return true;
	}else{
		return false;
	}
}

// Get all data on initial call.
function parseInitialData(body) {
	var $ = cheerio.load(body);
	// Check if story exists
	if (is404($)) throw new Error('Fictionpress returned a 404.');

	// Object to return. I should probably declare these objects somewhere & reference them. Or just clean up this project.
	var result = {
		id : '',
		title : '',
		author : { id : '', name : '' },
		summary : '',
		noOfChapters: '',
		content : []
	};

	// Scrape page
	result.title = parseTitle($);
	result.id = parseID($);
	result.summary = parseSummary($);
	result.author = parseAuthor($);
	result.noOfChapters = parseNoChapters($);
	result.content.push(parseChapter(body));

	return result;
}

// Exported functions.
module.exports = {
	is404,
	initialData: parseInitialData,
	chapter: parseChapter
};