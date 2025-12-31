import { Response } from 'express';
import db from '../config/database';

// キャスト認証用のリクエスト型
interface CastAuthRequest extends Request {
  castId?: number;
}

/**
 * 営業日の開始時刻（8時）を考慮して日付を調整
 * 深夜0時〜8時の予約は前日扱いとする
 */
function getBusinessDate(dateTime: Date): string {
  const hour = dateTime.getHours();
  const adjustedDate = new Date(dateTime);
  
  // 0時〜8時の場合は前日扱い
  if (hour < 8) {
    adjustedDate.setDate(adjustedDate.getDate() - 1);
  }
  
  // YYYY-MM-DD形式で返す
  return adjustedDate.toISOString().split('T')[0];
}

/**
 * 指定日付の精算明細を取得
 */
export const getDailyEarnings = (req: any, res: Response) => {
  const castId = req.castId;
  const { date } = req.query;

  if (!castId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  // 日付が指定されていない場合は今日
  const targetDate = date || new Date().toISOString().split('T')[0];

  // 営業日ベースで予約を取得
  // 指定日の8時〜翌日の7:59までの予約を取得
  const query = `
    SELECT 
      r.id,
      r.reservation_date,
      r.start_time,
      r.duration,
      r.course,
      r.total_price,
      r.status,
      r.created_at,
      c.name as customer_name,
      c.phone_number as customer_phone
    FROM reservations r
    LEFT JOIN users c ON r.user_id = c.id
    WHERE r.cast_id = ?
      AND r.status IN ('completed', 'confirmed')
      AND (
        -- 指定日の8時以降
        (r.reservation_date = ? AND CAST(substr(r.start_time, 1, 2) AS INTEGER) >= 8)
        OR
        -- 翌日の0時〜7:59
        (r.reservation_date = date(?, '+1 day') AND CAST(substr(r.start_time, 1, 2) AS INTEGER) < 8)
      )
    ORDER BY r.reservation_date ASC, r.start_time ASC
  `;

  db.all(query, [castId, targetDate, targetDate], (err, reservations: any[]) => {
    if (err) {
      console.error('精算明細取得エラー:', err);
      return res.status(500).json({ message: 'データベースエラー' });
    }

    // バック率を取得（デフォルト50%）
    db.get(
      'SELECT back_rate FROM casts WHERE id = ?',
      [castId],
      (err, cast: any) => {
        if (err) {
          console.error('キャスト情報取得エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        const backRate = cast?.back_rate || 50; // デフォルト50%

        // 精算明細を計算
        const earnings = reservations.map((reservation) => {
          const totalPrice = reservation.total_price || 0;
          const castEarning = Math.floor(totalPrice * (backRate / 100));

          return {
            id: reservation.id,
            reservation_date: reservation.reservation_date,
            start_time: reservation.start_time,
            duration: reservation.duration,
            course: reservation.course,
            total_price: totalPrice,
            back_rate: backRate,
            cast_earning: castEarning,
            status: reservation.status,
            customer_name: reservation.customer_name || 'ゲスト',
            customer_phone: reservation.customer_phone,
          };
        });

        // 合計を計算
        const totalRevenue = earnings.reduce((sum, e) => sum + e.total_price, 0);
        const totalEarnings = earnings.reduce((sum, e) => sum + e.cast_earning, 0);
        const reservationCount = earnings.length;

        res.json({
          date: targetDate,
          back_rate: backRate,
          summary: {
            total_revenue: totalRevenue,
            total_earnings: totalEarnings,
            reservation_count: reservationCount,
          },
          details: earnings,
        });
      }
    );
  });
};

/**
 * 月間精算サマリーを取得
 */
export const getMonthlyEarnings = (req: any, res: Response) => {
  const castId = req.castId;
  const { year, month } = req.query;

  if (!castId) {
    return res.status(401).json({ message: '認証が必要です' });
  }

  const now = new Date();
  const targetYear = year || now.getFullYear();
  const targetMonth = month || now.getMonth() + 1;

  // 月初と月末を計算
  const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
  const endDate = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0];

  const query = `
    SELECT 
      r.reservation_date,
      COUNT(*) as reservation_count,
      SUM(r.total_price) as total_revenue
    FROM reservations r
    WHERE r.cast_id = ?
      AND r.status IN ('completed', 'confirmed')
      AND r.reservation_date BETWEEN ? AND ?
    GROUP BY r.reservation_date
    ORDER BY r.reservation_date ASC
  `;

  db.all(query, [castId, startDate, endDate], (err, dailySummaries: any[]) => {
    if (err) {
      console.error('月間精算取得エラー:', err);
      return res.status(500).json({ message: 'データベースエラー' });
    }

    // バック率を取得
    db.get(
      'SELECT back_rate FROM casts WHERE id = ?',
      [castId],
      (err, cast: any) => {
        if (err) {
          console.error('キャスト情報取得エラー:', err);
          return res.status(500).json({ message: 'データベースエラー' });
        }

        const backRate = cast?.back_rate || 50;

        // 日別サマリーを計算
        const dailyEarnings = dailySummaries.map((day) => ({
          date: day.reservation_date,
          reservation_count: day.reservation_count,
          total_revenue: day.total_revenue || 0,
          earnings: Math.floor((day.total_revenue || 0) * (backRate / 100)),
        }));

        // 月間合計を計算
        const totalRevenue = dailyEarnings.reduce((sum, d) => sum + d.total_revenue, 0);
        const totalEarnings = dailyEarnings.reduce((sum, d) => sum + d.earnings, 0);
        const totalReservations = dailyEarnings.reduce((sum, d) => sum + d.reservation_count, 0);

        res.json({
          year: targetYear,
          month: targetMonth,
          back_rate: backRate,
          summary: {
            total_revenue: totalRevenue,
            total_earnings: totalEarnings,
            total_reservations: totalReservations,
            working_days: dailyEarnings.length,
          },
          daily_earnings: dailyEarnings,
        });
      }
    );
  });
};
