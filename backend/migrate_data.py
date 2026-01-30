"""
資料遷移工具 - 從 localStorage 匯入到 MariaDB
"""
import json
import sys

# 將此內容貼到瀏覽器 Console 執行，匯出 localStorage 資料：
# copy(localStorage.getItem('fbProducts'))
# 然後將資料貼到 products_backup.json 檔案中

def migrate_localStorage_to_db():
    """從 localStorage JSON 檔案匯入資料到 MariaDB"""
    import pymysql
    
    try:
        # 讀取 localStorage 匯出的 JSON
        print("正在讀取 products_backup.json...")
        try:
            with open('products_backup.json', 'r', encoding='utf-8') as f:
                data = f.read().strip()
                # Remove quotes if copy() added them
                if data.startswith('"') and data.endswith('"'):
                    data = data[1:-1]
                    # Unescape JSON
                    data = data.replace('\\"', '"').replace('\\\\', '\\')
                products = json.loads(data)
        except FileNotFoundError:
            print("[ERROR] 找不到 products_backup.json 檔案！")
            print("\n請執行以下步驟：")
            print("1. 開啟瀏覽器並進入商品管理頁面")
            print("2. 按 F12 打開開發者工具")
            print("3. 切換到 Console 標籤")
            print("4. 輸入: copy(localStorage.getItem('fbProducts'))")
            print("5. 資料已複製到剪貼簿")
            print("6. 建立 products_backup.json 檔案並貼上內容")
            return False
        
        if not products:
            print("[INFO] 沒有要遷移的資料")
            return True
        
        print(f"[OK] 讀取到 {len(products)} 個商品")
        
        # 連接資料庫
        print("\n正在連接資料庫...")
        conn = pymysql.connect(
            host='localhost',
            user='fb_user',
            password='9298',
            database='fb_products',
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        # 插入資料
        success_count = 0
        skip_count = 0
        
        print("\n開始遷移資料...\n")
        for product in products:
            try:
                # 檢查是否已存在
                cursor.execute("SELECT id FROM products WHERE id = %s", (product['id'],))
                if cursor.fetchone():
                    print(f"[SKIP] 商品已存在: {product['name']}")
                    skip_count += 1
                    continue
                
                # 插入商品
                cursor.execute("""
                    INSERT INTO products (
                        id, name, specs, price, quantity, category, branch,
                        priority, image, selected, pending, customer_reserved
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    product.get('id'),
                    product.get('name'),
                    product.get('specs'),
                    product.get('price'),
                    product.get('quantity'),
                    product.get('category', '1'),
                    product.get('branch'),
                    product.get('priority', False),
                    product.get('image'),
                    product.get('selected', False),
                    product.get('pending', False),
                    product.get('customerReserved', False)
                ))
                
                print(f"[OK] 已匯入: {product['name']}")
                success_count += 1
                
            except Exception as e:
                print(f"[ERROR] 匯入失敗: {product.get('name', 'Unknown')} - {str(e)}")
        
        conn.commit()
        cursor.close()
        conn.close()
        
        print("\n" + "="*50)
        print("[SUCCESS] 資料遷移完成！")
        print("="*50)
        print(f"成功匯入: {success_count} 個商品")
        print(f"已跳過: {skip_count} 個商品（已存在）")
        print("="*50)
        return True
        
    except Exception as e:
        print(f"\n[ERROR] 遷移失敗: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    print("="*50)
    print("FB 商品管理系統 - 資料遷移工具")
    print("="*50)
    print()
    migrate_localStorage_to_db()
