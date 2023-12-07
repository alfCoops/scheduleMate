const natural = require('natural');
const issues = require('./timeManagementIssues');

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Function to process user input
function processInput(input) {
  const tokens = tokenizer.tokenize(input);
  return tokens.map(token => stemmer.stem(token.toLowerCase()));
}

// Function to find best matching issues based on user input
function findBestMatchingIssues(input) {
  const processedInput = processInput(input);
  const uniqueIssues = new Set(processedInput);
  let bestMatches = [];

  uniqueIssues.forEach((issueWord) => {
    let bestMatch = { index: -1, score: 0 };
    issues.forEach((issue, index) => {
      const processedIssue = processInput(issue.issue);
      const intersection = processedIssue.filter(token => token === issueWord);// Calculate the intersection between the processed issue and the input
      const score = intersection.length / processedIssue.length;
      if (score > bestMatch.score) { // Update the bestMatch object if the current score is higher than the previous best score
        bestMatch = { index, score };
      }
    });
  // Add the best matching issue to the bestMatches array if a match was found
    if (bestMatch.index !== -1) {
      bestMatches.push(issues[bestMatch.index]);
    }
  });

  return bestMatches;
}
module.exports = { findBestMatchingIssues };

