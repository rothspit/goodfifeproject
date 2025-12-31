import csv
import sys

def convert_cityheaven_to_system_format(input_file, output_file):
    """
    シティヘブンエクスポートCSVをシステム用CSVに変換
    公開中（公開状態='〇'）のキャストのみ出力
    """
    
    converted_count = 0
    skipped_count = 0
    
    # 出力用カラム定義
    output_columns = [
        'name', 'age', 'height', 'weight', 'bust', 'waist', 'hip', 'cup_size',
        'blood_type', 'hobby', 'specialty', 'profile', 'is_new', 'smoking_ok',
        'tattoo', 'has_children', 'threesome_ok', 'hairless', 'home_visit_ok',
        'clothing_request_ok', 'overnight_ok', 'sweet_sadist_ok', 'anal_ok',
        'sm_ok', 'cosplay_ok', 'toy_ok', 'lotion_ok'
    ]
    
    with open(input_file, 'r', encoding='utf-8') as infile, \
         open(output_file, 'w', newline='', encoding='utf-8-sig') as outfile:
        
        reader = csv.reader(infile)
        writer = csv.DictWriter(outfile, fieldnames=output_columns)
        
        # ヘッダースキップ
        header = next(reader)
        
        # 出力ヘッダー書き込み
        writer.writeheader()
        
        for row_num, row in enumerate(reader, start=2):
            try:
                # 公開状態チェック（44番目）
                if len(row) <= 44 or row[44] != '〇':
                    skipped_count += 1
                    continue
                
                # データ抽出と変換
                name = row[1].strip() if len(row) > 1 else ''
                age = row[16].strip() if len(row) > 16 else ''
                height = row[20].strip() if len(row) > 20 else ''
                bust = row[21].strip() if len(row) > 21 else ''
                cup_size = row[22].strip() if len(row) > 22 else ''
                waist = row[23].strip() if len(row) > 23 else ''
                hip = row[24].strip() if len(row) > 24 else ''
                blood_type = row[18].strip() if len(row) > 18 else ''
                hobby = row[28].strip() if len(row) > 28 else ''
                weight = row[39].strip() if len(row) > 39 else ''
                
                # プロフィール（お店コメント + 女の子コメント）
                shop_comment = row[45].strip() if len(row) > 45 else ''
                girl_comment = row[54].strip() if len(row) > 54 else ''
                
                # プロフィール結合（両方ある場合は区切る）
                if shop_comment and girl_comment:
                    profile = f"{shop_comment}\n\n【本人コメント】\n{girl_comment}"
                elif shop_comment:
                    profile = shop_comment
                elif girl_comment:
                    profile = girl_comment
                else:
                    profile = ''
                
                # 新人フラグ（43番目）
                is_new = 'true' if (len(row) > 43 and row[43] == '〇') else 'false'
                
                # タバコ（42番目）
                smoking_ok = 'true' if (len(row) > 42 and row[42] == '〇') else 'false'
                
                # 名前が空の場合はスキップ
                if not name:
                    skipped_count += 1
                    continue
                
                # 出力行作成
                output_row = {
                    'name': name,
                    'age': age,
                    'height': height,
                    'weight': weight,
                    'bust': bust,
                    'waist': waist,
                    'hip': hip,
                    'cup_size': cup_size,
                    'blood_type': blood_type,
                    'hobby': hobby,
                    'specialty': '',  # シティヘブンCSVには特技フィールドなし
                    'profile': profile,
                    'is_new': is_new,
                    'smoking_ok': smoking_ok,
                    'tattoo': 'false',
                    'has_children': 'true',  # 人妻店なのでデフォルトtrue
                    'threesome_ok': 'false',
                    'hairless': 'false',
                    'home_visit_ok': 'true',
                    'clothing_request_ok': 'true',
                    'overnight_ok': 'true',
                    'sweet_sadist_ok': 'false',
                    'anal_ok': 'false',
                    'sm_ok': 'false',
                    'cosplay_ok': 'false',
                    'toy_ok': 'true',
                    'lotion_ok': 'true'
                }
                
                writer.writerow(output_row)
                converted_count += 1
                
            except Exception as e:
                print(f"警告: {row_num}行目の処理エラー: {e}", file=sys.stderr)
                skipped_count += 1
                continue
    
    return converted_count, skipped_count

if __name__ == '__main__':
    input_file = '/home/user/uploaded_files/girlExport.csv'
    output_file = '/home/user/webapp/cityheaven_import_ready.csv'
    
    print("シティヘブンCSV変換開始...")
    print(f"入力: {input_file}")
    print(f"出力: {output_file}\n")
    
    converted, skipped = convert_cityheaven_to_system_format(input_file, output_file)
    
    print(f"\n✅ 変換完了！")
    print(f"  変換成功: {converted}名（公開中のキャスト）")
    print(f"  スキップ: {skipped}名（非公開または不完全なデータ）")
    print(f"\n出力ファイル: {output_file}")
