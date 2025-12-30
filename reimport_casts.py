#!/usr/bin/env python3
"""
Cast data re-import script
Re-imports all cast data from cityheaven_import_ready.csv
"""

import requests
import csv
import json
import sys

# API configuration
API_BASE_URL = "https://5000-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai"
LOGIN_URL = f"{API_BASE_URL}/api/auth/login"
IMPORT_URL = f"{API_BASE_URL}/api/cast-import/import"

# Login credentials
PHONE_NUMBER = "090-0000-0000"
PASSWORD = "admin123456"

def login():
    """Login and get authentication token"""
    payload = {
        "phone_number": PHONE_NUMBER,
        "password": PASSWORD
    }
    
    print(f"🔐 ログイン中... ({LOGIN_URL})")
    response = requests.post(LOGIN_URL, json=payload)
    
    if response.status_code != 200:
        print(f"❌ ログイン失敗 (Status: {response.status_code})")
        print(f"Response: {response.text}")
        sys.exit(1)
    
    data = response.json()
    token = data.get('token')
    
    if not token:
        print("❌ トークンが取得できませんでした")
        sys.exit(1)
    
    print(f"✅ ログイン成功")
    return token

def read_csv_file(filepath):
    """Read CSV file and return as string"""
    print(f"📄 CSVファイルを読み込み中... ({filepath})")
    
    try:
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            csv_content = f.read()
        
        # Count rows (excluding header)
        rows = csv_content.strip().split('\n')
        row_count = len(rows) - 1  # Exclude header
        
        print(f"✅ CSVファイル読み込み完了 ({row_count}行)")
        return csv_content
    except Exception as e:
        print(f"❌ CSVファイル読み込みエラー: {e}")
        sys.exit(1)

def import_csv(token, csv_data):
    """Import CSV data to server"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "csvData": csv_data
    }
    
    print(f"📤 データをインポート中... ({IMPORT_URL})")
    print(f"📊 データサイズ: {len(csv_data)} bytes")
    
    try:
        response = requests.post(IMPORT_URL, json=payload, headers=headers)
        
        print(f"📥 レスポンス (Status: {response.status_code})")
        
        if response.status_code == 200:
            result = response.json()
            print("\n" + "="*60)
            print("✅ インポート成功!")
            print("="*60)
            
            if result.get('success'):
                summary = result.get('summary', {})
                print(f"\n📊 インポート結果:")
                print(f"  • 合計行数: {summary.get('total', 0)}")
                print(f"  • 成功: {summary.get('success', 0)}")
                print(f"  • 失敗: {summary.get('failed', 0)}")
                print(f"  • 新人キャスト: {summary.get('newCasts', 0)}")
                
                # Show errors if any
                errors = result.get('errors', [])
                if errors:
                    print(f"\n⚠️  エラー詳細 ({len(errors)}件):")
                    for err in errors[:5]:  # Show first 5 errors
                        print(f"  • 行 {err.get('row')}: {err.get('error')}")
                    if len(errors) > 5:
                        print(f"  ... 他 {len(errors) - 5}件")
                
                # Show Twitter results
                twitter_info = result.get('twitter', {})
                if twitter_info.get('attempted', 0) > 0:
                    print(f"\n🐦 X (Twitter) 投稿:")
                    print(f"  • 試行数: {twitter_info.get('attempted', 0)}")
                    
                    twitter_results = twitter_info.get('results', [])
                    success_count = sum(1 for r in twitter_results if r.get('success'))
                    print(f"  • 成功: {success_count}")
                    print(f"  • 失敗: {len(twitter_results) - success_count}")
            else:
                print(f"❌ {result.get('message', 'Unknown error')}")
                
        else:
            print(f"❌ インポート失敗 (Status: {response.status_code})")
            print(f"Response: {response.text}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ リクエストエラー: {e}")
        sys.exit(1)

def main():
    print("\n" + "="*60)
    print("🔄 キャストデータ再インポート")
    print("="*60 + "\n")
    
    # Step 1: Login
    token = login()
    
    # Step 2: Read CSV
    csv_data = read_csv_file('cityheaven_import_ready.csv')
    
    # Step 3: Import
    import_csv(token, csv_data)
    
    print("\n" + "="*60)
    print("✅ 処理完了")
    print("="*60)
    print("\n確認URL:")
    print("  • 管理画面キャスト一覧: https://3002-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai/admin/casts")
    print("  • 公開キャスト一覧: https://3002-iwlhxuzhfaqbr3cqpityv-b32ec7bb.sandbox.novita.ai/casts")
    print()

if __name__ == "__main__":
    main()
