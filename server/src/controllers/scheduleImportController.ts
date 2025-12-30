import { Request, Response } from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

// CSVファイルアップロード設定
const upload = multer({ dest: 'uploads/' });

interface ScheduleRow {
  castName: string;
  schedules: { [date: string]: string };
}

// 日付文字列から年月日を抽出（例: "2025年12月16(火)" → "2025-12-16"）
function extractDate(dateStr: string): string | null {
  const match = dateStr.match(/(\d{4})年(\d{1,2})月(\d{1,2})/);
  if (match) {
    const year = match[1];
    const month = match[2].padStart(2, '0');
    const day = match[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return null;
}

// 時間文字列をパース（例: "16:00～翌06:00" → {start: "16:00", end: "06:00", nextDay: true}）
function parseTimeRange(timeStr: string): { start: string | null; end: string | null; nextDay: boolean } | null {
  if (!timeStr || timeStr === '休み' || timeStr.trim() === '') {
    return null;
  }

  // "出勤"のみの場合
  if (timeStr === '出勤') {
    return { start: '09:00', end: '23:00', nextDay: false };
  }

  // "16:00～翌06:00" 形式
  const nextDayMatch = timeStr.match(/(\d{1,2}:\d{2})～翌(\d{1,2}:\d{2})/);
  if (nextDayMatch) {
    return {
      start: nextDayMatch[1],
      end: nextDayMatch[2],
      nextDay: true
    };
  }

  // "16:00～23:00" 形式
  const sameDayMatch = timeStr.match(/(\d{1,2}:\d{2})～(\d{1,2}:\d{2})/);
  if (sameDayMatch) {
    return {
      start: sameDayMatch[1],
      end: sameDayMatch[2],
      nextDay: false
    };
  }

  return null;
}

// キャスト名から括弧内のひらがなを抽出（例: "風花（ふうか）" → "風花"）
function extractCastName(fullName: string): string {
  return fullName.replace(/[（(].*?[）)]/g, '').trim();
}

// CSVファイルをパースしてスケジュールデータを抽出
async function parseCSV(filePath: string): Promise<ScheduleRow[]> {
  return new Promise((resolve, reject) => {
    const results: ScheduleRow[] = [];
    const dateColumns: string[] = [];
    let isFirstRow = true;

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('headers', (headers: string[]) => {
        // ヘッダー行から日付列を抽出（1列目はキャスト名なのでスキップ）
        for (let i = 1; i < headers.length; i++) {
          const date = extractDate(headers[i]);
          if (date) {
            dateColumns.push(date);
          }
        }
      })
      .on('data', (row: any) => {
        if (isFirstRow) {
          isFirstRow = false;
          return; // ヘッダー行をスキップ
        }

        const castName = extractCastName(row['女の子の名前'] || Object.values(row)[0]);
        const schedules: { [date: string]: string } = {};

        // 各日付列のスケジュールを取得
        const values = Object.values(row);
        for (let i = 1; i < values.length && i - 1 < dateColumns.length; i++) {
          const timeStr = values[i] as string;
          if (timeStr && timeStr !== '休み' && timeStr.trim() !== '') {
            schedules[dateColumns[i - 1]] = timeStr;
          }
        }

        if (castName && Object.keys(schedules).length > 0) {
          results.push({ castName, schedules });
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

// CSVファイルをアップロードしてパース
export const uploadCSV = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'CSVファイルが必要です' });
    }

    const filePath = req.file.path;
    
    try {
      // CSVをパース
      const scheduleData = await parseCSV(filePath);

      // 一時ファイルを削除
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        data: scheduleData,
        count: scheduleData.length,
      });
    } catch (parseError) {
      // パースエラーの場合も一時ファイルを削除
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error('CSV解析エラー:', error);
    res.status(500).json({ error: 'CSVの解析に失敗しました', details: error.message });
  }
};

// スケジュールデータをインポート
export const importSchedules = async (req: Request, res: Response) => {
  try {
    const { schedules } = req.body;

    if (!schedules || !Array.isArray(schedules)) {
      return res.status(400).json({ error: 'スケジュールデータが必要です' });
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    let importedCount = 0;
    let skippedCount = 0;
    const errors: any[] = [];

    try {
      for (const scheduleRow of schedules) {
        const { castName, schedules: dateSchedules } = scheduleRow;

        // キャスト名でキャストIDを取得
        const [casts]: any = await connection.execute(
          'SELECT id FROM casts WHERE name = ? OR name_hiragana = ?',
          [castName, castName]
        );

        if (casts.length === 0) {
          errors.push({ castName, error: 'キャストが見つかりません' });
          skippedCount++;
          continue;
        }

        const castId = casts[0].id;

        // 各日付のスケジュールを処理
        for (const [dateStr, timeStr] of Object.entries(dateSchedules)) {
          const timeRange = parseTimeRange(timeStr);

          if (!timeRange) {
            continue; // 休みまたはパース不可の場合はスキップ
          }

          // 既存のスケジュールを確認
          const [existing]: any = await connection.execute(
            'SELECT id FROM cast_schedules WHERE cast_id = ? AND date = ?',
            [castId, dateStr]
          );

          if (existing.length > 0) {
            // 既存スケジュールを更新
            await connection.execute(
              `UPDATE cast_schedules 
               SET start_time = ?, end_time = ?, is_available = 1, updated_at = CURRENT_TIMESTAMP
               WHERE cast_id = ? AND date = ?`,
              [timeRange.start, timeRange.end, castId, dateStr]
            );
          } else {
            // 新規スケジュールを登録
            await connection.execute(
              `INSERT INTO cast_schedules (cast_id, date, start_time, end_time, is_available)
               VALUES (?, ?, ?, ?, 1)`,
              [castId, dateStr, timeRange.start, timeRange.end]
            );
          }

          importedCount++;
        }
      }

      await connection.commit();
      connection.release();

      res.json({
        success: true,
        message: `${importedCount}件のスケジュールをインポートしました`,
        imported: importedCount,
        skipped: skippedCount,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error: any) {
    console.error('インポートエラー:', error);
    res.status(500).json({ error: 'スケジュールのインポートに失敗しました', details: error.message });
  }
};

// 特定期間のスケジュールを取得
export const getSchedulesByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: '開始日と終了日が必要です' });
    }

    const [schedules]: any = await pool.execute(
      `SELECT 
        cs.id, cs.cast_id, cs.date, cs.start_time, cs.end_time, cs.is_available,
        c.name as cast_name, c.name_hiragana
       FROM cast_schedules cs
       JOIN casts c ON cs.cast_id = c.id
       WHERE cs.date BETWEEN ? AND ?
       ORDER BY cs.date, c.name`,
      [startDate, endDate]
    );

    res.json({
      success: true,
      schedules,
      count: schedules.length,
    });
  } catch (error: any) {
    console.error('スケジュール取得エラー:', error);
    res.status(500).json({ error: 'スケジュールの取得に失敗しました', details: error.message });
  }
};

// Multerミドルウェアをエクスポート
export const uploadMiddleware = upload.single('csv');
