import { Request, Response } from 'express';
import { db } from '../config/database';
import { parse } from 'csv-parse/sync';
import twitterService from '../services/twitterService';

// CSVインポート
export const importCastsFromCSV = async (req: Request, res: Response) => {
  try {
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({
        success: false,
        message: 'CSVデータが必要です',
      });
    }

    // CSVをパース
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const imported: any[] = [];
    const errors: any[] = [];
    const newCasts: any[] = []; // 新人キャストを追跡

    // 各レコードを処理
    for (let i = 0; i < records.length; i++) {
      const record: any = records[i];
      try {
        // 必須フィールドのチェック
        if (!record.name || !record.age) {
          errors.push({
            row: i + 2, // ヘッダー行を考慮
            error: '名前と年齢は必須です',
            data: record,
          });
          continue;
        }

        // ブール値の変換
        const convertBoolean = (value: string): boolean => {
          if (!value) return false;
          const v = value.toLowerCase().trim();
          return v === 'true' || v === '1' || v === 'yes' || v === 'はい' || v === '○';
        };

        // キャストを登録
        const result: any = await db.run(
          `INSERT INTO casts (
            name, age, height, weight, bust, waist, hip, cup_size,
            blood_type, hobby, specialty, profile,
            is_new, smoking_ok, tattoo, has_children,
            threesome_ok, hairless, home_visit_ok, clothing_request_ok,
            overnight_ok, sweet_sadist_ok, anal_ok, sm_ok,
            cosplay_ok, toy_ok, lotion_ok, is_active,
            created_at, updated_at
          ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            ?, ?, ?, ?,
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )`,
          [
            record.name,
            parseInt(record.age) || 0,
            parseInt(record.height) || null,
            parseInt(record.weight) || null,
            parseInt(record.bust) || null,
            parseInt(record.waist) || null,
            parseInt(record.hip) || null,
            record.cup_size || null,
            record.blood_type || null,
            record.hobby || null,
            record.specialty || null,
            record.profile || null,
            convertBoolean(record.is_new),
            convertBoolean(record.smoking_ok),
            convertBoolean(record.tattoo),
            convertBoolean(record.has_children),
            convertBoolean(record.threesome_ok),
            convertBoolean(record.hairless),
            convertBoolean(record.home_visit_ok),
            convertBoolean(record.clothing_request_ok),
            convertBoolean(record.overnight_ok),
            convertBoolean(record.sweet_sadist_ok),
            convertBoolean(record.anal_ok),
            convertBoolean(record.sm_ok),
            convertBoolean(record.cosplay_ok),
            convertBoolean(record.toy_ok),
            convertBoolean(record.lotion_ok),
            true, // is_active
          ]
        );

        const castId = result.lastID;
        imported.push({
          row: i + 2,
          id: castId,
          name: record.name,
        });

        // 新人キャストの場合、X投稿リストに追加
        if (convertBoolean(record.is_new)) {
          newCasts.push({
            id: castId,
            name: record.name,
            age: parseInt(record.age) || 0,
            height: parseInt(record.height) || null,
            bust: parseInt(record.bust) || null,
            waist: parseInt(record.waist) || null,
            hip: parseInt(record.hip) || null,
            cup_size: record.cup_size || null,
            profile: record.profile || null,
          });
        }
      } catch (error: any) {
        errors.push({
          row: i + 2,
          error: error.message,
          data: record,
        });
      }
    }

    // 新人キャストをXに自動投稿
    const twitterResults: any[] = [];
    if (newCasts.length > 0 && twitterService.isConfigured()) {
      console.log(`📢 ${newCasts.length}名の新人キャストをXに投稿中...`);
      for (const cast of newCasts) {
        try {
          const result = await twitterService.tweetNewCast(cast);
          twitterResults.push({
            castId: cast.id,
            name: cast.name,
            success: result.success,
            tweetId: result.tweetId,
            error: result.error,
          });
          if (result.success) {
            console.log(`✓ ${cast.name}さんの投稿成功 (Tweet ID: ${result.tweetId})`);
          } else {
            console.error(`✗ ${cast.name}さんの投稿失敗: ${result.error}`);
          }
        } catch (error: any) {
          console.error(`✗ ${cast.name}さんの投稿エラー:`, error);
          twitterResults.push({
            castId: cast.id,
            name: cast.name,
            success: false,
            error: error.message,
          });
        }
      }
    }

    res.json({
      success: true,
      message: `${imported.length}件のキャストをインポートしました`,
      imported,
      errors,
      summary: {
        total: records.length,
        success: imported.length,
        failed: errors.length,
        newCasts: newCasts.length,
      },
      twitter: {
        attempted: newCasts.length,
        results: twitterResults,
      },
    });
  } catch (error: any) {
    console.error('CSVインポートエラー:', error);
    res.status(500).json({
      success: false,
      message: 'CSVインポートに失敗しました',
      error: error.message,
    });
  }
};

// CSVテンプレート取得
export const getCSVTemplate = async (req: Request, res: Response) => {
  const template = `name,age,height,weight,bust,waist,hip,cup_size,blood_type,hobby,specialty,profile,is_new,smoking_ok,tattoo,has_children,threesome_ok,hairless,home_visit_ok,clothing_request_ok,overnight_ok,sweet_sadist_ok,anal_ok,sm_ok,cosplay_ok,toy_ok,lotion_ok
さくら,28,158,48,88,58,86,D,A型,映画鑑賞,料理,明るく優しい性格です。お客様に癒しの時間を提供します。,true,false,false,true,true,false,true,true,true,false,false,false,true,true,true
みゆき,32,162,52,92,60,88,E,O型,読書,ピアノ,落ち着いた大人の雰囲気を持っています。,false,false,false,true,true,false,true,true,true,true,false,false,true,true,true
あやか,25,155,45,85,56,84,C,B型,旅行,英会話,若々しくエネルギッシュな接客が得意です。,true,false,false,false,true,true,true,true,false,false,false,false,false,true,true`;

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="cast_import_template.csv"');
  res.send('\ufeff' + template); // BOM付きUTF-8
};

// サンプルデータ生成
export const generateSampleData = async (req: Request, res: Response) => {
  try {
    const { count = 10 } = req.body;

    const firstNames = [
      'さくら', 'ゆい', 'あやか', 'まい', 'りな', 'えみ', 'かおり', 'なつき', 'ひろみ', 'ゆか',
      'みゆき', 'さやか', 'あい', 'めぐみ', 'ゆみ', 'けいこ', 'れいな', 'みか', 'さき', 'あすか',
      'まりこ', 'ゆうこ', 'のぞみ', 'まみ', 'ちえ', 'みき', 'みお', 'あかね', 'ひとみ', 'みなみ'
    ];

    const hobbies = ['映画鑑賞', '読書', '料理', '旅行', 'ヨガ', 'ショッピング', '音楽鑑賞', 'カフェ巡り', '温泉', 'ドライブ'];
    const specialties = ['料理', 'ピアノ', '英会話', 'マッサージ', 'ダンス', '歌', 'お菓子作り', 'フラワーアレンジメント', '書道', 'ネイルアート'];
    const bloodTypes = ['A', 'B', 'O', 'AB'];
    const cupSizes = ['B', 'C', 'D', 'E', 'F', 'G'];

    const profiles = [
      '明るく優しい性格です。お客様に癒しの時間を提供します。',
      '落ち着いた大人の雰囲気を持っています。丁寧な接客を心がけています。',
      '若々しくエネルギッシュな接客が得意です。楽しい時間をお約束します。',
      '上品で知的な雰囲気が魅力です。大人の会話も楽しめます。',
      '親しみやすい笑顔が自慢です。リラックスした時間をお過ごしください。',
      '情熱的で積極的なサービスが得意です。忘れられない時間をお届けします。',
      '清楚で可憐な見た目とは裏腹に、大胆なプレイも得意です。',
      '包容力のある温かい雰囲気が魅力です。心身ともにリフレッシュできます。',
    ];

    const csvLines = ['name,age,height,weight,bust,waist,hip,cup_size,blood_type,hobby,specialty,profile,is_new,smoking_ok,tattoo,has_children,threesome_ok,hairless,home_visit_ok,clothing_request_ok,overnight_ok,sweet_sadist_ok,anal_ok,sm_ok,cosplay_ok,toy_ok,lotion_ok'];

    for (let i = 0; i < Math.min(count, 30); i++) {
      const name = firstNames[i % firstNames.length];
      const age = 23 + Math.floor(Math.random() * 17); // 23-39歳
      const height = 150 + Math.floor(Math.random() * 20); // 150-169cm
      const weight = 42 + Math.floor(Math.random() * 18); // 42-59kg
      const bust = 82 + Math.floor(Math.random() * 18); // 82-99
      const waist = 56 + Math.floor(Math.random() * 10); // 56-65
      const hip = 84 + Math.floor(Math.random() * 16); // 84-99
      const cupSize = cupSizes[Math.floor(Math.random() * cupSizes.length)];
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      const hobby = hobbies[Math.floor(Math.random() * hobbies.length)];
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      const profile = profiles[Math.floor(Math.random() * profiles.length)];
      
      const isNew = i < 3 ? 'true' : 'false';
      const smokingOk = 'false';
      const tattoo = 'false';
      const hasChildren = Math.random() > 0.5 ? 'true' : 'false';
      const threesomeOk = Math.random() > 0.6 ? 'true' : 'false';
      const hairless = Math.random() > 0.7 ? 'true' : 'false';
      const homeVisitOk = Math.random() > 0.5 ? 'true' : 'false';
      const clothingRequestOk = Math.random() > 0.5 ? 'true' : 'false';
      const overnightOk = Math.random() > 0.6 ? 'true' : 'false';
      const sweetSadistOk = Math.random() > 0.7 ? 'true' : 'false';
      const analOk = Math.random() > 0.8 ? 'true' : 'false';
      const smOk = Math.random() > 0.9 ? 'true' : 'false';
      const cosplayOk = Math.random() > 0.5 ? 'true' : 'false';
      const toyOk = Math.random() > 0.4 ? 'true' : 'false';
      const lotionOk = Math.random() > 0.3 ? 'true' : 'false';

      const line = `${name},${age},${height},${weight},${bust},${waist},${hip},${cupSize},${bloodType}型,${hobby},${specialty},"${profile}",${isNew},${smokingOk},${tattoo},${hasChildren},${threesomeOk},${hairless},${homeVisitOk},${clothingRequestOk},${overnightOk},${sweetSadistOk},${analOk},${smOk},${cosplayOk},${toyOk},${lotionOk}`;
      csvLines.push(line);
    }

    const csvData = csvLines.join('\n');

    res.json({
      success: true,
      csvData,
      count: Math.min(count, 30),
    });
  } catch (error: any) {
    console.error('サンプルデータ生成エラー:', error);
    res.status(500).json({
      success: false,
      message: 'サンプルデータの生成に失敗しました',
      error: error.message,
    });
  }
};
