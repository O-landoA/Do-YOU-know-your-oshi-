// Quiz Content - Do you know Your* Oshi?
// All questions, answers, and content in one place
// Edit this file to update quiz content

export const quizContent = {
  // Quiz configuration
  password: "TAKODACHI", // 8-letter password for final screen
  
  // Clue 0 - shown on welcome screen before quiz starts
  welcomeClue: {
    filename: "clue-0.png",
    thumbnail: "clue-0.png",
    title: "Clue 0: The Beginning"
  },
  
  // Questions array
  questions: [
    {
      id: 1,
      question: "Arguably her first pun, the kanji for which number is featured in Ina's name?",
      answers: [
        "0",
        "1",
        "2",
        "100"
      ],
      correct: 1, // Index of correct answer (0-based)
      trivia: "<em>Her surname, Ninomae, is simply written with the kanji 一, meaning \"one.\" This is a kanji pun; \"ni no mae\" means \"before two.\" It is an example of nanori, or idiosyncratic readings of kanji which only appear in names.</em>",
      videoId: null, // YouTube video ID or null for no video
      clue: {
        filename: "clue-1.png",
        thumbnail: "clue-1.png",
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
      trivia: "<em>First suggested by channel member Rayett Ray in chat of the original Ender Lilies #2 stream, as \"we all HYPE.\"</em><br><a href='https://www.youtube.com/watch?v=yoYaAVixPg8&t=4692s' target='_blank' style='color: var(--accent-color);'>Watch at 1h18m12s</a>",
      videoId: "yoYaAVixPg8", // Will show at 1h18m12s
      videoId2: "u2IwXhwO4Tc", // Second video for this question
      clue: {
        filename: "clue-2.png",
        thumbnail: "clue-2.png",
        title: "Clue 2"
      }
    },
    {
      id: 3,
      question: "The official 8th WAH (We Adore Her), part of the New Generation of WAHs, was canonised by Ina in which Pokémon Violet Stream?",
      answers: [
        "#1",
        "#3",
        "#6",
        "#8"
      ],
      correct: 3,
      trivia: "<em>The 8th WAH (We Adore Her) was officially canonised during Pokémon Violet Stream #8.</em><br><a href='https://www.youtube.com/watch?v=gQoGK9YDcEY&t=3780s' target='_blank' style='color: var(--accent-color);'>Watch at 1h3m</a>",
      videoId: "gQoGK9YDcEY", // Will show at 1h3m
      clue: {
        filename: "clue-3.png",
        thumbnail: "clue-3.png",
        title: "Clue 3"
      }
    },
    {
      id: 4,
      question: "How many episodes are in the \"TTRPG - Myth Breakers\" playlist?",
      answers: [
        "5",
        "7",
        "9",
        "11"
      ],
      correct: 2,
      trivia: "<em>\"Banger streams, you might not watch it but it came out during the era when I was really into DnD and actually inspired me to DM for Gates and Rupert while travelling with them!\"</em><br><a href='https://www.youtube.com/playlist?list=PLQZecHYc3j2pIhdKqZwb7Jz73laAsLKYE' target='_blank' style='color: var(--accent-color);'>Watch full playlist</a>",
      playlistId: "PLQZecHYc3j2pIhdKqZwb7Jz73laAsLKYE", // Playlist instead of single video
      clue: {
        filename: "clue-4.png",
        thumbnail: "clue-4.png",
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
      trivia: "<em>Yes, I just wanted an excuse to make you read as many of them as I could. No, I'm not sorry!</em>",
      videoId: null,
      clue: {
        filename: "clue-5.png",
        thumbnail: "clue-5.png",
        title: "Clue 5"
      }
    },
    {
      id: 6,
      question: "\"Inanis\" in Latin translates to which of the following:",
      answers: [
        "Empty, 0",
        "Full, 1",
        "Infinite, ∞",
        "Two flat objects, 2"
      ],
      correct: 0,
      trivia: "<em>It appears in the medieval Latin poem O Fortuna, in the line \"Sors immanis et inanis,\" meaning \"monstrous and empty fate.\" It was famously set to music in Carl Orff's Carmina Burana, but this line is perhaps best known to video gamers for its appearance as a lyric in Final Fantasy VII's \"One-Winged Angel.\"</em>",
      videoId: null,
      clue: {
        filename: "clue-6.png",
        thumbnail: "clue-6.png",
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
      trivia: "<em>\"It claims there's only ONE HUMAN in HoloMyth. Who is it? It's me! Ame... Ame is british\" - Ninomae Ina'nis, circa 2019</em>",
      videoId: null,
      clue: {
        filename: "final-clue.png",
        thumbnail: "final-clue.png",
        title: "Clue 7"
      }
    }
  ],
  
  // Final reward content
  finalReward: {
    message: "Congratulations! You've proven yourself a true Takodachi!",
    finalClue: {
      filename: "final-clue.png",
      title: "The Final Clue"
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
