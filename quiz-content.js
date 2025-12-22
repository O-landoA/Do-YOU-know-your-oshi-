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
      question: "What is Ina'nis's favorite food?",
      answers: [
        "Takoyaki",
        "Ramen",
        "Sushi",
        "Tempura"
      ],
      correct: 0, // Index of correct answer (0-based)
      trivia: "Ina'nis absolutely loves takoyaki! She often mentions it during streams and it's become a running gag in the community.",
      videoId: null, // YouTube video ID or null for no video
      clue: {
        filename: "clue-1.pdf",
        thumbnail: "clue-1-thumb.jpg",
        title: "Clue 1: Ina'nis's Origins"
      }
    },
    {
      id: 2,
      question: "When did Ina'nis debut?",
      answers: [
        "September 2020",
        "December 2020",
        "March 2021",
        "June 2021"
      ],
      correct: 0,
      trivia: "Ina'nis debuted on September 12, 2020, as part of Hololive English -Myth-.",
      videoId: "dQw4w9WgXcQ", // Example YouTube ID
      clue: {
        filename: "clue-2.pdf",
        thumbnail: "clue-2-thumb.jpg",
        title: "Clue 2: The Debut"
      }
    },
    {
      id: 3,
      question: "What is the name of Ina'nis's mascot?",
      answers: [
        "Takodachi",
        "Wakko",
        "Ika",
        "Mollusk"
      ],
      correct: 0,
      trivia: "The Takodachi are Ina'nis's loyal followers, often depicted as cute octopus-like creatures!",
      videoId: null,
      clue: {
        filename: "clue-3.pdf",
        thumbnail: "clue-3-thumb.jpg",
        title: "Clue 3: Meet the Takodachi"
      }
    },
    {
      id: 4,
      question: "What is Ina'nis's signature catchphrase?",
      answers: [
        "Wah!",
        "Hello hello!",
        "Tako time!",
        "Ina ina!"
      ],
      correct: 0,
      trivia: "'Wah!' has become Ina'nis's iconic catchphrase, often said when surprised or excited.",
      videoId: null,
      clue: {
        filename: "clue-4.pdf",
        thumbnail: "clue-4-thumb.jpg",
        title: "Clue 4: The Wah Heard 'Round the World"
      }
    },
    {
      id: 5,
      question: "What instrument does Ina'nis play?",
      answers: [
        "Ukulele",
        "Piano",
        "Guitar",
        "Flute"
      ],
      correct: 0,
      trivia: "Ina'nis is known for playing the ukulele during streams and often sings while playing.",
      videoId: null,
      clue: {
        filename: "clue-5.pdf",
        thumbnail: "clue-5-thumb.jpg",
        title: "Clue 5: Musical Talents"
      }
    },
    {
      id: 6,
      question: "What is Ina'nis's favorite color?",
      answers: [
        "Purple",
        "Blue",
        "Pink",
        "Green"
      ],
      correct: 0,
      trivia: "Purple is strongly associated with Ina'nis, featuring prominently in her design and branding.",
      videoId: null,
      clue: {
        filename: "clue-6.pdf",
        thumbnail: "clue-6-thumb.jpg",
        title: "Clue 6: Color Theory"
      }
    },
    {
      id: 7,
      question: "What does Ina'nis call her fans?",
      answers: [
        "Takodachi",
        "Inaniacs",
        "Ninomates",
        "Octofans"
      ],
      correct: 0,
      trivia: "Ina'nis affectionately calls her fans 'Takodachi,' which means octopus friends in Japanese!",
      videoId: null,
      clue: {
        filename: "clue-7.pdf",
        thumbnail: "clue-7-thumb.jpg",
        title: "Clue 7: The Community"
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
