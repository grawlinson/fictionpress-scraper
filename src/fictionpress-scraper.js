'use strict';
/*jslint node: true */

// Dependencies.
var bluebird = require('bluebird');                                          // Promises library.
var request  = bluebird.promisifyAll(require('request'), {multiArgs: true}); // Make HTTP requests.
var parse    = require('./parse');                                           // Helper functions for parsing.

// Constants
const BASE_URL = 'https://www.fictionpress.com';
const CONCURRENCY = 10;	// Maximum number of requests at any given time.

// Functions
// Generates story URL from given ID.
function getStoryURL(id){
	return BASE_URL + '/s/' + id;
}

// Assumes first chapter has already been fetched. Returns array of chapter URLs.
function getChapterURLs(story){
	var chapterURLs = [];
	for (var i = 2; i <= story.noOfChapters; i++) {
		chapterURLs.push(getStoryURL(story.id) + '/' + i + '/');
	}
	return chapterURLs;
}

// Initial request. Gets all information & first chapter.
function getInfo(id){
	return request.getAsync(getStoryURL(id)).spread(function(response, body){
			if(response.statusCode != 200){
				throw new Error('Unsuccessful attempt. Code: ' + response.statusCode);
			}else{
				return body;
			}
		}).then(function(body){
			return parse.initialData(body);
		});
}

// Catch-all. Gets all information & all chapters.
// [TODO] : Remove commented out sorting code. Currently assuming bluebird.map returns objects matching order of passed URLs.
function getStory(id){
	return getInfo(id).then(function(story){
		// Check to see if we need to get more chapters (i.e. one-shot or multi-chapter.)
		if(story.noOfChapters > 1){
			return getChapters(getChapterURLs(story))/*
			.call('sort', function(a,b){
				return(a.id - b.id);
			})*/
			.then(function(chapters){
				story.content.push.apply(story.content, chapters);
				//story.content.sort(function(a,b){return(a.id-b.id);});
				return story;
			});
		}else{
			return story;
		}
	});
}

// Get a single chapter.
function getChapter(url){
	return request.getAsync(url).spread(function(response, body){
		if(response.statusCode != 200){
			throw new Error('Fictionpress returned a ' + response.statusCode);
		}else{
			return parse.chapter(body);
		}
	});
}

// Builds upon getChapter(). Pass array of valid chapter URLs, returns array of chapter objects. Also concurrently limited to reduce strain on Fictionpress.
function getChapters(urlList){
	return bluebird.map(urlList, function(url){
		return getChapter(url);
	}, {concurrency: CONCURRENCY});
}

//BELOW FUNCTIONS AREN'T USED.
function getChapterRange(storyID, firstChapter, lastChapter){
	var urlRange = getChapterURLRange(storyID, firstChapter, lastChapter);
	
	if(urlRange === null) throw new Error ('I\'m not too sure how to play this one. We\'ll see.');

	return getChapters(urlRange);
}
function getChapterURLRange(storyID, firstChapter, lastChapter){
	if(firstChapter == lastChapter || firstChapter > lastChapter) return null;
	
	var urlRange = [];

	for (var i = firstChapter; i <= lastChapter; i++) {
		urlRange.push(BASE_URL + '/s/' + storyID + '/' + i + '/');
	}

	return urlRange;

}

// Exported Functions
module.exports = {getInfo, getStory};