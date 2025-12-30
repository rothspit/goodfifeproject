// 顧客管理システム ユーティリティ関数

// 9時基準で日付を調整
export const adjustDateFor9AM = (date: Date = new Date()): Date => {
  const adjusted = new Date(date);
  adjusted.setHours(adjusted.getHours() - 9);
  return adjusted;
};

// 本日の日付を取得（9時基準）
export const getTodayDate = (): string => {
  const adjusted = adjustDateFor9AM();
  return adjusted.toISOString().split('T')[0];
};

// 日付を yyyy-MM-dd 形式にフォーマット
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

// 日時を yyyy-MM-dd HH:mm:ss 形式にフォーマット
export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().replace('T', ' ').substring(0, 19);
};

// 時刻を HH:mm 形式にフォーマット
export const formatTime = (time: string): string => {
  return time.substring(0, 5);
};

// 電話番号をフォーマット（ハイフン追加）
export const formatPhoneNumber = (phone: string): string => {
  // 090-1234-5678 形式に変換
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 7)}-${cleaned.substring(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  return phone;
};

// 料金をフォーマット（カンマ区切り）
export const formatPrice = (price: number): string => {
  return price.toLocaleString('ja-JP');
};

// ステータスの日本語表示
export const getStatusLabel = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    pending: '未確定',
    confirmed: '確定',
    completed: '完了',
    cancelled: 'キャンセル',
  };
  return statusMap[status] || status;
};

// ステータスの色
export const getStatusColor = (status: string): string => {
  const colorMap: { [key: string]: string } = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

// 場所タイプの日本語表示
export const getLocationTypeLabel = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    hotel: 'ホテル',
    home: '自宅',
    other: 'その他',
  };
  return typeMap[type] || type;
};

// 時間範囲のチェック（重複予約防止）
export const isTimeOverlap = (
  start1: string,
  duration1: number,
  start2: string,
  duration2: number
): boolean => {
  const s1 = new Date(`2000-01-01 ${start1}`);
  const e1 = new Date(s1.getTime() + duration1 * 60000);
  const s2 = new Date(`2000-01-01 ${start2}`);
  const e2 = new Date(s2.getTime() + duration2 * 60000);

  return s1 < e2 && e1 > s2;
};

// キャストの空き時間を計算
export const getAvailableTimeSlots = (
  workStart: string,
  workEnd: string,
  bookings: Array<{ start_time: string; duration: number }>
): Array<{ start: string; end: string }> => {
  const slots: Array<{ start: string; end: string }> = [];
  
  // 予約を開始時刻順にソート
  const sortedBookings = [...bookings].sort((a, b) => 
    a.start_time.localeCompare(b.start_time)
  );

  let currentTime = workStart;

  sortedBookings.forEach(booking => {
    if (currentTime < booking.start_time) {
      slots.push({ start: currentTime, end: booking.start_time });
    }
    const bookingEnd = new Date(`2000-01-01 ${booking.start_time}`);
    bookingEnd.setMinutes(bookingEnd.getMinutes() + booking.duration);
    currentTime = formatTime(bookingEnd.toTimeString());
  });

  if (currentTime < workEnd) {
    slots.push({ start: currentTime, end: workEnd });
  }

  return slots;
};

// 料金計算
export const calculateTotalPrice = (
  basePrice: number,
  nominationFee: number = 0,
  transportationFee: number = 0,
  optionFee: number = 0,
  discount: number = 0
): number => {
  return basePrice + nominationFee + transportationFee + optionFee - discount;
};

// 分を時間:分の形式に変換
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) {
    return `${hours}時間${mins}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${mins}分`;
  }
};
