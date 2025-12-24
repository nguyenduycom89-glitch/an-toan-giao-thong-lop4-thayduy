
import { Question, AIPraiseResponse } from './types';

export const DEFAULT_TOPIC = "An toàn giao thông khi đi xe đạp";

export const CORRECT_PRAISES = [
  "Giỏi quá xá luôn con ơi! 😍",
  "Đúng bóc luôn nè, thầy khen nhen! 🌟",
  "Chính xác luôn, con xuất sắc quá chừng! 💯",
  "Hoan hô! Làm tốt lắm luôn đó con! 👏",
  "Chuẩn không cần chỉnh luôn nè! ✨"
];

export const INCORRECT_ENCOURAGEMENTS = [
  "Hổng sao đâu, lần sau mình làm lại nhen! 💪",
  "Sai mất tiêu rồi, ráng lên chút xíu nữa nè! 🍀",
  "Suýt soát hà, cố lên nghe con! 🍄",
  "Bình tĩnh nè, đọc kỹ lại chút xíu nhen con! 🌈",
  "Cẩn thận một xíu nữa là đúng rồi đó! 🦉"
];

// Thư viện nhận xét theo TT27
export const TT27_LIBRARY: Record<string, AIPraiseResponse[]> = {
  "Hoàn thành tốt": [
    {
      message: "Xuất sắc quá xá luôn con ơi!",
      teacherComment: "Con nắm bài rất vững, thực hiện các thao tác cực kỳ chuẩn xác. Thầy rất tự hào về sự cẩn thận của con. Tiếp tục phát huy nhen!",
      assessmentLevel: "Hoàn thành tốt",
      rewardEmoji: "🏆",
      rewardName: "Cúp Vàng Thông Thái"
    },
    {
      message: "Đỉnh của chóp luôn nè!",
      teacherComment: "Kiến thức về an toàn giao thông của con thật đáng nể. Con không chỉ làm đúng mà còn làm rất nhanh nữa. Giỏi lắm nhen!",
      assessmentLevel: "Hoàn thành tốt",
      rewardEmoji: "🌟",
      rewardName: "Sao Mai Toả Sáng"
    },
    {
      message: "Dữ dằn chưa, đúng hết trơn luôn!",
      teacherComment: "Con học bài rất kỹ nè. Thầy khen con biết quan sát và chọn đáp án rất thông minh. Ráng giữ vững phong độ này nghe chưa!",
      assessmentLevel: "Hoàn thành tốt",
      rewardEmoji: "🚀",
      rewardName: "Tên Lửa Siêu Tốc"
    }
  ],
  "Hoàn thành": [
    {
      message: "Làm tốt lắm, cố gắng thêm chút nữa nhen!",
      teacherComment: "Con đã nắm được những kiến thức cơ bản rồi đó. Chỉ cần chú ý đọc kỹ câu hỏi hơn một xíu nữa là đạt điểm tối đa luôn nè. Cố lên con!",
      assessmentLevel: "Hoàn thành",
      rewardEmoji: "🚲",
      rewardName: "Tay Lái Vững Vàng"
    },
    {
      message: "Khá lắm, Thầy thấy con rất nỗ lực!",
      teacherComment: "Kết quả này cho thấy con có sự đầu tư học bài nè. Có một vài chỗ nhỏ cần lưu ý thêm, nhưng nhìn chung con làm rất tốt rồi nhen!",
      assessmentLevel: "Hoàn thành",
      rewardEmoji: "🛡️",
      rewardName: "Khiên Bảo Vệ An Toàn"
    }
  ],
  "Chưa hoàn thành": [
    {
      message: "Hổng sao nè, mình cùng ôn lại nha!",
      teacherComment: "Thầy thấy con rất cố gắng nhưng có lẽ chủ đề này hơi mới với con đúng không? Đừng buồn nhen, đọc lại bài một lần nữa rồi thử lại, Thầy tin con sẽ làm tốt hơn!",
      assessmentLevel: "Chưa hoàn thành",
      rewardEmoji: "📚",
      rewardName: "Mầm Nhỏ Chăm Chỉ"
    },
    {
      message: "Cố lên con ơi, Thầy luôn ủng hộ con!",
      teacherComment: "Sai sót là chuyện bình thường mà, quan trọng là mình học được gì sau đó nè. Con hãy xem kỹ các câu sai rồi làm lại lần nữa cho Thầy xem nhen!",
      assessmentLevel: "Chưa hoàn thành",
      rewardEmoji: "🌱",
      rewardName: "Hạt Giống Kiên Trì"
    }
  ]
};

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: '1',
    text: 'Xe đạp có những bộ phận nào cần kiểm tra trước khi đi?',
    options: [
      'Phanh, lốp, yên xe, đèn phản quang',
      'Mũ bảo hiểm, balo, áo mưa',
      'Ghi đông, tay lái, bàn đạp nhưng không cần phanh',
      'Chỉ cần bánh xe và ghi đông'
    ],
    correctAnswerIndex: 0
  },
  {
    id: '2',
    text: 'Khi đi xe đạp, em phải đi ở đâu để đảm bảo an toàn?',
    options: [
      'Bên trái đường',
      'Giữa lòng đường',
      'Bên phải, sát lề đường',
      'Đi chỗ nào cũng được'
    ],
    correctAnswerIndex: 2
  },
  {
    id: '3',
    text: 'Khi sang đường, em cần làm gì đầu tiên?',
    options: [
      'Đạp thật nhanh để qua đường',
      'Không cần nhìn xe vì đường vắng',
      'Quan sát hai bên và dắt xe qua nếu cần',
      'Gọi bạn đi cùng để qua nhanh'
    ],
    correctAnswerIndex: 2
  },
  {
    id: '4',
    text: 'Khi muốn rẽ trái hoặc rẽ phải, em phải làm gì?',
    options: [
      'Rẽ luôn, không cần báo hiệu',
      'Giơ tay xin đường trước khi rẽ',
      'Chạy nhanh để vượt kịp xe khác',
      'Bấm chuông thật to'
    ],
    correctAnswerIndex: 1
  },
  {
    id: '5',
    text: 'Hành vi nào sau đây là an toàn khi đi xe đạp?',
    options: [
      'Đi hàng ba cho vui',
      'Đua xe với bạn để xem ai nhanh hơn',
      'Đi sát lề phải và quan sát khi sang đường',
      'Vừa đi xe vừa nghịch điện thoại'
    ],
    correctAnswerIndex: 2
  }
];
