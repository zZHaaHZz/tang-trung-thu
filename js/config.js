// ========================================================
// 🌕 BẢNG CẤU HÌNH CÁ NHÂN HÓA - TRUNG THU TẶNG NGƯỜI YÊU 🌕
// ========================================================

const CONFIG = {
  // Thông tin ngày sinh & Bản mệnh Ngũ Hành
  // Bạn nam: 17/12/2004 - Giáp Thân (Tuyền Trung Thủy - Nước trong suối nguồn)
  // Bạn nữ: 20/05/2006 - Bính Tuất (Ốc Thượng Thổ - Đất ngói nóc nhà che chở)
  // Cầu nối Tương Sinh: KIM (Thổ sinh Kim ➔ Kim sinh Thủy) - Vàng Ánh Kim & Trắng Bạc
  coupleInfo: {
    male: {
      birth: "17-12-2004",
      lunarYear: "Giáp Thân",
      element: "Tuyền Trung Thủy 💧",
      title: "Chàng trai Mệnh Thủy - Sâu lắng, chân thành & ấm áp"
    },
    female: {
      birth: "20-05-2006",
      lunarYear: "Bính Tuất",
      element: "Ốc Thượng Thổ 🏡",
      title: "Cô gái Mệnh Thổ - Dịu dàng, an yên & luôn chở che"
    },
    fengShuiBlessing: "Thổ sinh Kim ➔ Kim sinh Thủy: Tình yêu bền chặt, gia đạo ấm êm như mái nhà chở che dòng nước nguồn mát lành ✨"
  },

  // Tên của hai bạn
  senderName: "Anh",
  receiverName: "Linh Đan",

  // Tiêu đề chính trang web
  title: "Đêm Rằm Trung Thu - Món Quà Tặng Em Bé",
  subtitle: "Nắm chặt tay nhau đi qua ngàn mùa trăng sáng ✨",

  // Ngày kỷ niệm tình yêu (đã bỏ theo yêu cầu để giao diện tối giản, tập trung vào quà Trung Thu)
  anniversaryDate: null,
  anniversaryText: "bên nhau bình yên",

  // Bức ảnh kỷ niệm của hai bạn & Album ảnh của Linh Đan (assets/images/anh-dao/)
  photoUrl: "assets/images/couple.jpg", // Ảnh chính của Linh Đan trên Đèn Lồng 3D
  handPhotoUrl: "assets/images/couple.jpg", // Ảnh nắm tay
  letterPhotoUrl: "assets/images/bennhau.jpg", // Ảnh Linh Đan trong thư tình

  // 📸 BỘ ALBUM ẢNH THẬT CỦA KHÁCH HÀNG (assets/images/anh-dao/)
  daoPhotos: [
    {
      url: "assets/images/anh-dao/IMG_4421_web.jpg",
      caption: "Bên nhau bình yên từng khoảnh khắc, dù đi đâu cũng có anh bên cạnh ❤️",
      title: "Ánh Mắt Yêu Thương",
      frameStyle: "palace",
      focalPoint: { x: 0.50, y: 0.38 }
    },
    {
      url: "assets/images/anh-dao/IMG_7750.JPG",
      caption: "Tay nắm chặt tay, cùng em ngắm nhìn vầng trăng rằm sáng nhất ✨",
      title: "Chỉ Lối Cung Trăng",
      frameStyle: "moon_gate",
      focalPoint: { x: 0.58, y: 0.35 }
    },
    {
      url: "assets/images/anh-dao/IMG_4336.JPG",
      caption: "Điều ước lớn nhất của anh trong mọi mùa trăng là có em kề bên 🎂🕯️",
      title: "Khoảnh Khắc Ngọt Ngào",
      frameStyle: "heart",
      focalPoint: { x: 0.50, y: 0.45 }
    },
    {
      url: "assets/images/anh-dao/IMG_7875.JPG",
      caption: "Như một giấc mơ cổ tích, nàng công chúa xinh đẹp nhất đời anh 💃🕊️",
      title: "Vũ Điệu Tình Yêu",
      frameStyle: "crown",
      focalPoint: { x: 0.55, y: 0.45 }
    },
    {
      url: "assets/images/anh-dao/IMG_7092.JPG",
      caption: "Cùng em đi khắp thế gian, lưu giữ những ký ức rực rỡ nhất 🏰✈️",
      title: "Chuyến Đi Thanh Xuân",
      frameStyle: "star",
      focalPoint: { x: 0.50, y: 0.50 }
    },
    {
      url: "assets/images/anh-dao/IMG_7882_clean.jpg",
      caption: "Nụ cười của em là ánh sáng ấm áp nhất sưởi ấm trái tim anh 🌸💐",
      title: "Bên Em Bình Yên",
      frameStyle: "lotus",
      focalPoint: { x: 0.50, y: 0.45 }
    },
    {
      url: "assets/images/anh-dao/IMG_8927_web.jpg",
      caption: "Dù trong bất kỳ chặng đường nào, chúng mình vẫn luôn là một đôi ăn ý ✌️🖤",
      title: "Đồng Hành Bền Chặt",
      frameStyle: "palace",
      focalPoint: { x: 0.50, y: 0.40 }
    }
  ],

  // Nhạc nền (BGM) - Chỉ phát duy nhất 1 bài Nơi Này Có Anh theo yêu cầu
  music: {
    volume: 0.28, // Âm lượng êm ái vừa vặn, du dương
    title: "Nơi Này Có Anh - Sơn Tùng M-TP ✨",
    audioUrl: "assets/audio/noi-nay-co-anh.mp3",
    autoPlayPrompt: true,
    playlist: [
      {
        title: "Nơi Này Có Anh - Sơn Tùng M-TP ✨",
        url: "assets/audio/noi-nay-co-anh.mp3"
      }
    ]
  },

  // 🤖 CẤU HÌNH BOT TELEGRAM BÁO TIN BÍ MẬT VỀ ĐIỆN THOẠI CỦA ANH
  // Bảo mật 100%: Token & Chat ID được lưu tại file .env và Vercel Environment Variables
  // Web sẽ gọi qua Serverless API (/api/telegram), hoàn toàn không lộ secret ở client
  telegram: {
    enabled: true,
    apiEndpoint: "/api/telegram",
  },

  // Bức thư tình Cung Trăng (Văn phong mộc mạc, chân thật, tự nhiên từ đáy lòng)
  letter: {
    header: "Gửi Em - LinhDan Của Anh 🌙❤️",
    paragraphs: [
      "Trung thu là Tết thiếu nhi\nThật trùng hợp khi cạnh anh có embe - LinhDan",
      "Nhân dịp các cháu được phá cỗ, được đi chơi, anh muốn bày tỏ 1 chút tình cảm của bản thân với người ấy!",
      "Anh cảm ơn em vì đã xuất hiện trong cuộc đời anh, cảm ơn em vì suốt thời gian qua vẫn luôn ở bên, đồng hành cùng anh qua những ngày vui, những lúc khó khăn và cả những khoảng thời gian chẳng dễ dàng chút nào. Có những lúc anh mệt mỏi, áp lực, có những chuyện tưởng chừng như không thể vượt qua, nhìn lại đằng sau vẫn có em ở đó.",
      "Cảm ơn vì đã đến và cho anh biết thế nào là yêu, thế nào là nhớ, là thương, là luôn muốn dành những điều tốt đẹp nhất cho người mình yêu. Cảm ơn vì đã kiên nhẫn với anh, bao dung với những thiếu sót của anh và cùng anh bước qua từng ngày.",
      "Chỉ mong em luôn giữ được nụ cười thật xinh, luôn vui vẻ, bình an và ngày càng thành công trên con đường mà em chọn. Mong những điều tốt đẹp nhất sẽ luôn tìm đến em, vì em xứng đáng với tất cả những điều đó. Anh không biết tương lai sẽ có những gì, nhưng anh trân trọng từng khoảnh khắc chúng ta đã có cùng nhau.",
      "Cảm ơn em vì đã là một phần thật đặc biệt trong tuổi trẻ của anh. Mãi là embe của anh nhé. ❤️"
    ],
    closing: "Mãi là embe của anh nhé ❤️",
    photoCaption: "Bên nhau bình yên như thế này thôi ❤️"
  },

  // Danh sách các điều ước mẫu ấm áp để Linh Đan chọn nhanh khi thả thiên đăng lên Cung Trăng
  wishPresets: [
    "Mong hai đứa mình luôn bình yên, mỗi ngày mở mắt ra đều thấy nụ cười của nhau ❤️",
    "Mong anh đi làm bớt áp lực, luôn mạnh khỏe để cùng em nấu cơm và về chung một nhà 🍲🏡",
    "Trung Thu này cùng anh ngắm trăng, ăn bánh và nắm tay nhau đi qua thật nhiều mùa trăng nữa 💕",
    "Tối nay đi làm về anh phải ôm em thật chặt và nấu món ngon cho em đấy nha! 🫂",
    "Tối nay hai đứa mình cùng dắt nhau đi dạo phố rước đèn ăn kem nhé 🛵🏮",
    "Chúc anh luôn vui vẻ, nhiều năng lượng và mãi yêu chiều em như ngày đầu 🌙",
    "Cảm ơn anh vì lúc nào cũng dịu dàng, kiên nhẫn và luôn chăm sóc em từng chút một ❤️"
  ],

  // 🎟️ BỘ PHIẾU HẸN ƯỚC TÌNH YÊU (Cam kết thực hiện 100% ngoài đời)
  vouchers: [
    {
      id: "trasua",
      icon: "🧋",
      title: "Ting Ting Trà Sữa / Bữa Ăn Đêm",
      desc: "Anh phải order ngay 1 ly trà sữa / đồ ăn khuya nóng hổi về tận nhà cho Linh Đan!",
      tag: "Thực hiện ngay hôm nay",
      code: "LOVE-TRASUA-LINHDAN",
      commitment: "Anh cam kết sẽ mở app đặt ngay món Linh Đan thèm về nhà ăn cùng nhau không chậm trễ!",
      msgTemplate: "Anh ơiii! Em vừa rút 'Phiếu Trà Sữa / Bữa Đêm', anh mau order về nhà khao em ăn cùng đi nè! 🧋😋"
    },
    {
      id: "xemphim",
      icon: "🎬",
      title: "Cùng Nhau Xem Phim & Ngắm Trăng",
      desc: "Gác lại mọi việc bận rộn, chuẩn bị đồ ăn vặt và cùng Linh Đan cuộn chăn xem phim tới khi ngủ say.",
      tag: "Thực hiện ngay tối nay",
      code: "LOVE-CINEMA-HOME",
      commitment: "Anh cam kết chọn đúng bộ phim Linh Đan thích, ôm em xem phim và dỗ em ngủ ngon!",
      msgTemplate: "Anh ơi! Em vừa kích hoạt 'Phiếu Cùng Nhau Xem Phim', tối nay gác việc lại nằm xem phim cùng em nhé! 🎬🍿"
    },
    {
      id: "omchat",
      icon: "🫂",
      title: "Ôm Thật Chặt 10 Phút & Bế Bổng",
      desc: "Mỗi ngày về nhà: Anh phải ôm Linh Đan thật chặt không buông và bế Linh Đan đi quanh nhà!",
      tag: "Mỗi ngày đi làm về",
      code: "LOVE-OMCHAT-BEBONG",
      commitment: "Cam kết cứ về tới nhà là ôm chặt 10 phút, bế bổng xoay vòng nạp năng lượng cho Linh Đan!",
      msgTemplate: "Em đã lưu lại 'Phiếu Ôm Chặt 10 Phút & Bế Bổng' rồi nhé, về nhà là anh phải thực hiện ngay đấy! 🫂❤️"
    },
    {
      id: "ansap",
      icon: "🍲",
      title: "Bao Trọn Gói Ăn Sập Quán Linh Đan Thích",
      desc: "Cuối tuần dắt Linh Đan đi ăn tất cả món lẩu nướng, kem, bánh ngọt... mà Linh Đan thèm.",
      tag: "Hẹn hò cuối tuần",
      code: "LOVE-ANSAP-TIEM",
      commitment: "Anh tài trợ 100% kinh phí ăn uống, chở Linh Đan đi ăn tất cả các quán trong wish-list của Linh Đan!",
      msgTemplate: "Em đã chọn 'Phiếu Ăn Sập Quán Em Thích', cuối tuần này anh chở em đi ăn no nê nhé! 🍲🥩"
    },
    {
      id: "nuhoang",
      icon: "👑",
      title: "24 Giờ Làm Nữ Hoàng Của Anh",
      desc: "Trong 1 ngày trọn vẹn ở nhà, Linh Đan nói gì anh cũng phải ngoan ngoãn nghe lời 100%, làm hết việc nhà cấm cãi nửa lời!",
      tag: "Hiệu lực 24 giờ",
      code: "LOVE-NUHOANG-24H",
      commitment: "Tuyệt đối phục tùng, nấu cơm dọn dẹp và cưng chiều Linh Đan từ sáng tới tối!",
      msgTemplate: "Lệnh từ Nữ Hoàng Linh Đan: Em vừa kích hoạt 'Phiếu 24 Giờ Làm Nữ Hoàng', hôm nay anh phải nghe lời em răm rắp nha! 👑💅"
    },
    {
      id: "matxa",
      icon: "💆‍♀️",
      title: "Vé Massage Đấm Lưng Bóp Vai Trọn Đời",
      desc: "Mỗi tối sau khi đi làm về mệt, anh tự giác massage xoa bóp cho Linh Đan đến khi em ngủ ngon.",
      tag: "Bản quyền trọn đời",
      code: "LOVE-MASSAGE-VIP",
      commitment: "Bàn tay vàng sẵn sàng phục vụ Linh Đan mỗi tối sau những giờ làm việc mệt mỏi!",
      msgTemplate: "Ting ting! Em vừa rút 'Vé Massage Đấm Lưng Bóp Vai Trọn Đời', tối nay anh nhớ xoa bóp cho em đã đời nhé! 💆‍♀️✨"
    }
  ],

  // Cấu hình hiệu ứng hình ảnh theo phong thủy Thổ - Kim - Thủy
  effects: {
    starCount: 2200,            // Số lượng ngôi sao lấp lánh
    floatingLanterns: 36,       // Số lượng đèn trời bay bổng
    shootingStarFrequency: 3000,// Chu kỳ sao băng vút qua
    fireworksOnClick: false,    // Tắt pháo hoa khi chạm màn hình để tối ưu hiệu năng, chống giật lag
  }
};

// ========================================================
// 📱 NHẬN BIẾT THIẾT BỊ DI ĐỘNG (MOBILE) VS MÁY TÍNH (DESKTOP)
// Chuẩn đoán đa tầng: UserAgent + Touchscreen + Screen Size
// ========================================================
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const hasTouchScreen = (navigator.maxTouchPoints || 0) > 0;
  const isNarrowScreen = window.innerWidth <= 820 || (window.innerHeight <= 820 && hasTouchScreen);

  return isMobileUA || (hasTouchScreen && (isCoarsePointer || isNarrowScreen));
}

CONFIG.isMobile = isMobileDevice();

if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
  window.isMobileDevice = isMobileDevice;
}

export default CONFIG;
export { CONFIG };
