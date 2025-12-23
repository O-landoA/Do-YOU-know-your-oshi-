// Quiz Content - Do you know Your* Oshi?
// All questions, answers, and content in one place
// Edit this file to update quiz content

export const quizContent = {
  // Quiz configuration
  password: "TAKODACHI", // 8-letter password for final screen
  
  // Questions array
  questions: [
    {
      id: 1,
      question: "Arguably her first pun, the kanji for which number is featured in Ina's name?",
      answers: [
        "1",
        "0",
        "2",
        "100"
      ],
      correct: 0, // Index of correct answer (0-based)
      trivia: "Her surname, Ninomae, is simply written with the kanji 一, meaning \"one.\" This is a kanji pun; \"ni no mae\" means \"before two.\" It is an example of nanori, or idiosyncratic readings of kanji which only appear in names.",
      videoId: null, // YouTube video ID or null for no video
      clue: {
        filename: "clue-1.pdf",
        thumbnail: "clue-1-thumb.jpg",
        title: "Clue 1"
      }
    },
    {
      id: 2,
      question: "\"We Are Hype\" represents which of the 10 WAH's of the Tentacult?",
      answers: [
        "2",
        "4",
        "6",
        "8"
      ],
      correct: 0,
      trivia: "First suggested by channel member Rayett Ray in chat of the original Ender Lilies #2 stream, as \"we all HYPE.\"",
      videoId: "yoYaAVixPg8", // Will show at 1h18m12s
      videoId2: "u2IwXhwO4Tc", // Second video for this question
      clue: {
        filename: "clue-2.pdf",
        thumbnail: "clue-2-thumb.jpg",
        title: "Clue 2"
      }
    },
    {
      id: 3,
      question: "The official 8th WAH (We Adore Her), part of the New Generation of WAHs, was canonised by Ina in which Pokémon Violet Stream?",
      answers: [
        "#8",
        "#1",
        "#3",
        "#6"
      ],
      correct: 0,
      trivia: "The 8th WAH (We Adore Her) was officially canonised during Pokémon Violet Stream #8.",
      videoId: "gQoGK9YDcEY", // Will show at 1h3m
      clue: {
        filename: "clue-3.pdf",
        thumbnail: "clue-3-thumb.jpg",
        title: "Clue 3"
      }
    },
    {
      id: 4,
      question: "How many episodes are in the \"TTRPG - Myth Breakers\" playlist?",
      answers: [
        "9",
        "5",
        "7",
        "11"
      ],
      correct: 0,
      trivia: "The TTRPG - Myth Breakers playlist contains 9 episodes of tabletop RPG adventures with the Myth members.",
      playlistId: "PLQZecHYc3j2pIhdKqZwb7Jz73laAsLKYE", // Playlist instead of single video
      clue: {
        filename: "clue-4.pdf",
        thumbnail: "clue-4-thumb.jpg",
        title: "Clue 4"
      }
    },
    {
      id: 5,
      question: "The number of Quotes on Ina's Virtual YouTube Wiki page divided by 4.125 is...",
      answers: [
        "8",
        "9.5",
        "10",
        "12"
      ],
      correct: 0,
      trivia: "Yes, I just wanted an excuse to make you read as many of them as I could. No, I'm not sorry!",
      videoId: null,
      clue: {
        filename: "clue-5.pdf",
        thumbnail: "clue-5-thumb.jpg",
        title: "Clue 5"
      }
    },
    {
      id: 6,
      question: "\"Inanis\" in Latin translates to which of the following:",
      answers: [
        "Empty, 0",
        "Full, 1",
        "Two flat objects, 2",
        "Infinite, √-1"
      ],
      correct: 0,
      trivia: "It appears in the medieval Latin poem O Fortuna, in the line \"Sors immanis et inanis,\" meaning \"monstrous and empty fate.\" It was famously set to music in Carl Orff's Carmina Burana, but this line is perhaps best known to video gamers for its appearance as a lyric in Final Fantasy VII's \"One-Winged Angel.\"",
      videoId: null,
      clue: {
        filename: "clue-6.pdf",
        thumbnail: "clue-6-thumb.jpg",
        title: "Clue 6"
      }
    },
    {
      id: 7,
      question: "According to the official website, how many <span class='glitch-text'>Humans</span> are there in Hololive Myth?",
      questionType: "number-input", // Special question type for typed number entry
      correctAnswer: "1", // The correct number answer
      answers: [], // No multiple choice for this question
      correct: null, // Not applicable for number input
      trivia: "That's right - only one human in Hololive Myth!",
      videoId: null,
      clue: {
        filename: "clue-7.pdf",
        thumbnail: "clue-7-thumb.jpg",
        title: "Clue 7"
      }
    }
  ],
  
  // Final reward content
  finalReward: {
    message: "Congratulations! You've proven yourself a true Takodachi!",
    finalClue: {
      filename: "final-clue.pdf",
      title: "The Location of Ina'nis's Gift"
    },
    location: "Check under your desk - there's a surprise waiting!"
  }
};

// Helper function to get question by ID
export function getQuestion(id) {
  return quizContent.questions.find(q => q.id === id);
}

// Helper function to check if answer is correct
export function checkAnswer(questionId, answerIndex) {
  const question = getQuestion(questionId);
  return question ? question.correct === answerIndex : false;
}

// Helper function to get total questions
export function getTotalQuestions() {
  return quizContent.questions.length;
}
