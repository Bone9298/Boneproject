"""
SQLAlchemy 資料庫模型
"""
from sqlalchemy import Column, String, Boolean, Text, TIMESTAMP, Enum, Integer
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Product(Base):
    """商品資料模型"""
    __tablename__ = 'products'
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    specs = Column(String(500))
    price = Column(String(50), nullable=False)
    quantity = Column(String(50))
    category = Column(Enum('1', '2'), default='1')
    branch = Column(String(50))
    priority = Column(Boolean, default=False)
    image = Column(Text)
    selected = Column(Boolean, default=False)
    pending = Column(Boolean, default=False)
    customer_reserved = Column(Boolean, default=False)
    publish_order = Column(Integer, nullable=True)  # 🔥 發布順序
    created_at = Column(TIMESTAMP, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """轉換為字典格式"""
        return {
            'id': self.id,
            'name': self.name,
            'specs': self.specs,
            'price': self.price,
            'quantity': self.quantity,
            'category': self.category,
            'branch': self.branch,
            'priority': self.priority,
            'image': self.image,
            'selected': self.selected,
            'pending': self.pending,
            'customerReserved': self.customer_reserved,
            'publishOrder': self.publish_order,  # 🔥 發布順序
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def to_dict_without_image(self):
        """轉換為字典格式（不包含圖片，提升效能）"""
        return {
            'id': self.id,
            'name': self.name,
            'specs': self.specs,
            'price': self.price,
            'quantity': self.quantity,
            'category': self.category,
            'branch': self.branch,
            'priority': self.priority,
            'image': None,  # 不包含圖片
            'selected': self.selected,
            'pending': self.pending,
            'customerReserved': self.customer_reserved,
            'publishOrder': self.publish_order,
            'createdAt': self.created_at.isoformat() if self.created_at else None,
            'updatedAt': self.updated_at.isoformat() if self.updated_at else None
        }

