from datetime import datetime
from bson import ObjectId

class InventoryItem:
    def __init__(self, name, category, quantity, reorder_level, supplier_name=None, 
                 purchase_date=None, notes=None, _id=None, created_at=None, last_updated=None):
        self.name = name
        self.category = category
        self.quantity = quantity
        self.reorder_level = reorder_level
        self.supplier_name = supplier_name
        self.purchase_date = purchase_date
        self.notes = notes
        self._id = _id
        self.created_at = created_at or datetime.utcnow()
        self.last_updated = last_updated or datetime.utcnow()

    def needs_reorder(self):
        return self.quantity <= self.reorder_level

    def get_status(self):
        if self.quantity == 0:
            return "Out of Stock"
        elif self.needs_reorder():
            return "Low Stock"
        return "In Stock"

    def to_dict(self):
        return {
            'name': self.name,
            'category': self.category,
            'quantity': self.quantity,
            'reorder_level': self.reorder_level,
            'supplier_name': self.supplier_name,
            'purchase_date': self.purchase_date,
            'notes': self.notes,
            'status': self.get_status(),
            'created_at': self.created_at,
            'last_updated': self.last_updated,
            '_id': str(self._id) if self._id else None
        }

    @classmethod
    def from_dict(cls, data):
        return cls(
            name=data['name'],
            category=data['category'],
            quantity=data['quantity'],
            reorder_level=data['reorder_level'],
            supplier_name=data.get('supplier_name'),
            purchase_date=data.get('purchase_date'),
            notes=data.get('notes'),
            _id=data.get('_id'),
            created_at=data.get('created_at'),
            last_updated=data.get('last_updated')
        )