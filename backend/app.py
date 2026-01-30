"""
Flask API 應用程式
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from models import Product, Base
from sqlalchemy import create_engine, or_
from sqlalchemy.orm import sessionmaker
import traceback

app = Flask(__name__)

# CORS 設定 - 允許所有來源（支援 ngrok 分享）
CORS(app, resources={r"/*": {"origins": "*"}})

# 资料库连接 - 支援環境變數（Docker）或使用預設值（本地）
import os
DATABASE_URL = os.getenv('DATABASE_URL', 'mysql+pymysql://fb_user:9298@localhost/fb_products?charset=utf8mb4')

# 🔥 增加连接池大小以支持批量操作
engine = create_engine(
    DATABASE_URL, 
    echo=False, 
    pool_pre_ping=True,
    pool_size=20,           # 增加连接池大小从默认的5到20
    max_overflow=30,        # 增加溢出连接从默认的10到30
    pool_recycle=3600,      # 1小时后回收连接
    pool_timeout=60         # 增加超时时间到60秒
)
SessionLocal = sessionmaker(bind=engine)

# ==========================================
# 商品 API 端點
# ==========================================

@app.route('/api/products', methods=['GET'])
def get_products():
    """取得所有商品"""
    try:
        session = SessionLocal()
        products = session.query(Product).all()
        session.close()
        
        # 預設包含圖片（與原版相容）
        # 如果需要排除圖片可以加上 ?exclude_images=true
        exclude_images = request.args.get('exclude_images', 'false').lower() == 'true'
        
        if exclude_images:
            # 不包含圖片，大幅減少資料量
            return jsonify({'products': [p.to_dict_without_image() for p in products]})
        else:
            return jsonify({'products': [p.to_dict() for p in products]})
    except Exception as e:
        print("=" * 60)
        print("❌ ERROR in get_products:")
        print(str(e))
        import traceback
        traceback.print_exc()
        print("=" * 60)
        return jsonify({'error': str(e)}), 500



@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """取得單一商品"""
    try:
        session = SessionLocal()
        product = session.query(Product).filter(Product.id == product_id).first()
        session.close()
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        return jsonify({'product': product.to_dict()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    """新增商品"""
    try:
        session = SessionLocal()
        data = request.json.get('product')
        
        # 轉換欄位名稱
        if 'customerReserved' in data:
            data['customer_reserved'] = data.pop('customerReserved')
        if 'createdAt' in data:
            data.pop('createdAt')
        if 'updatedAt' in data:
            data.pop('updatedAt')
        
        product = Product(**data)
        session.add(product)
        session.commit()
        product_id = product.id
        session.close()
        
        return jsonify({'id': product_id, 'success': True})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    """更新商品"""
    try:
        session = SessionLocal()
        product = session.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            session.close()
            return jsonify({'error': 'Product not found'}), 404
        
        data = request.json.get('product')
        
        # 轉換欄位名稱
        if 'customerReserved' in data:
            data['customer_reserved'] = data.pop('customerReserved')
        if 'createdAt' in data:
            data.pop('createdAt')
        if 'updatedAt' in data:
            data.pop('updatedAt')
        
        # 更新屬性
        for key, value in data.items():
            if hasattr(product, key):
                setattr(product, key, value)
        
        session.commit()
        session.close()
        
        return jsonify({'success': True})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """刪除商品"""
    try:
        session = SessionLocal()
        product = session.query(Product).filter(Product.id == product_id).first()
        
        if not product:
            session.close()
            return jsonify({'error': 'Product not found'}), 404
        
        session.delete(product)
        session.commit()
        session.close()
        
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/products/batch-update', methods=['POST'])
def batch_update():
    """批量更新商品"""
    try:
        session = SessionLocal()
        products_data = request.json.get('products', [])
        
        for product_data in products_data:
            product_id = product_data.get('id')
            product = session.query(Product).filter(Product.id == product_id).first()
            
            if product:
                # 轉換欄位
                if 'customerReserved' in product_data:
                    product_data['customer_reserved'] = product_data.pop('customerReserved')
                if 'createdAt' in product_data:
                    product_data.pop('createdAt')
                if 'updatedAt' in product_data:
                    product_data.pop('updatedAt')
                
                for key, value in product_data.items():
                    if hasattr(product, key) and key != 'id':
                        setattr(product, key, value)
        
        session.commit()
        session.close()
        
        return jsonify({'success': True})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

# ==========================================
# 啟動應用
# ==========================================

if __name__ == '__main__':
    # 確保資料表存在
    Base.metadata.create_all(engine)
    print("=" * 60)
    print("Flask API Server Starting...")
    print("URL: http://localhost:5000")
    print("=" * 60)
    app.run(host='0.0.0.0', port=5000, debug=True)  # 開啟 debug 模式

