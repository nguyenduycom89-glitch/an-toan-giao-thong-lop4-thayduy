export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export enum GameStage {
  START = 'START',
  PLAYING = 'PLAYING',
  FINISHED = 'FINISHED',
  TEACHER_MODE = 'TEACHER_MODE'
}

export interface TeacherConfig {
  questions: Question[];
  topic: string;
}

export interface AIPraiseResponse {
  message: string;        // Lời nói vui nhộn của Mascot
  teacherComment: string; // Nhận xét theo TT 27/BGDĐT
  assessmentLevel: string; // Hoàn thành tốt / Hoàn thành / Chưa hoàn thành
  rewardEmoji: string;
  rewardName: string;
}